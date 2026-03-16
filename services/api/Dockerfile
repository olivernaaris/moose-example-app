# Stage 1: Base image with pnpm
FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV COREPACK_ENABLE_STRICT=1

WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    corepack enable && \
    corepack prepare pnpm@10.32.1 --activate


# Stage 2: Prune monorepo to only include api and its dependencies
FROM base AS builder

WORKDIR /app

COPY . .

RUN pnpm dlx turbo@2.8.17 prune @moose-example/api --docker


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

# Build all packages that api depends on, then api itself
RUN pnpm --filter @moose-example/api... build


# Stage 4: Deploy — flatten into a self-contained directory
FROM base AS deployer

WORKDIR /app

COPY --from=installer /app ./

RUN pnpm --filter=@moose-example/api --prod deploy /app/deployed


# Stage 5: Production image
FROM node:24-slim AS runner

RUN groupadd --gid 3000 app && \
    useradd --uid 10001 --gid 3000 --create-home app

WORKDIR /app

# Copy the self-contained deployed directory (includes dist/, package.json,
# and node_modules/ with real files for all production dependencies)
COPY --from=deployer --chown=app:app /app/deployed ./

# Copy Prisma schema files (needed for Prisma client at runtime)
# These live in a different workspace package, so pnpm deploy doesn't include them.
COPY --from=installer --chown=app:app /app/packages/database/prisma ./prisma

USER app

EXPOSE 3001

CMD ["node", "dist/server.js"]
