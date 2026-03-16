# Stage 1: Base image with pnpm and native build dependencies
# build-essential and libatomic1 are required for Temporal's native addon (@temporalio/core-bridge)
FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV COREPACK_ENABLE_STRICT=1

WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends build-essential libatomic1 openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    corepack enable && \
    corepack prepare pnpm@10.32.1 --activate


# Stage 2: Prune monorepo to only include temporal-worker and its dependencies
FROM base AS builder

WORKDIR /app

COPY . .

RUN pnpm dlx turbo@2.8.17 prune @moose-example/temporal-worker-service --docker


# Stage 3: Install dependencies and build
FROM base AS installer

WORKDIR /app

# Copy pruned package.json files and install dependencies
COPY --from=builder /app/out/json/ ./
RUN pnpm install --frozen-lockfile

# Copy full source code
COPY --from=builder /app/out/full/ ./

# Generate Prisma client for database access
RUN pnpm --filter @moose-example/database db:generate

# Build all packages that temporal-worker depends on, then the service itself
RUN pnpm --filter @moose-example/temporal-worker-service... build


# Stage 4: Deploy — flatten into a self-contained directory
# Note: devDependencies are included (no --prod flag) because bundleWorkflowCode()
# runs at worker startup and uses Temporal's internal webpack, which requires
# devDependencies of @temporalio/worker to be available.
FROM base AS deployer

WORKDIR /app

COPY --from=installer /app ./

RUN pnpm --filter=@moose-example/temporal-worker-service deploy /app/deployed


# Stage 5: Production image
# libatomic1 is needed at runtime for Temporal's native addon
FROM node:24-slim AS runner

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends libatomic1 && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 3000 app && \
    useradd --uid 10001 --gid 3000 --create-home app

WORKDIR /app

# Copy the self-contained deployed directory
COPY --from=deployer --chown=app:app /app/deployed ./

# Copy Prisma schema files (needed for Prisma client at runtime)
COPY --from=installer --chown=app:app /app/packages/database/prisma ./prisma

USER app

# No port exposed — the worker has no HTTP server
CMD ["node", "dist/worker.js"]
