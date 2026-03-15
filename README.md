# Moose Example App

A reference application demonstrating Segmentflow architecture patterns — including Fastify API services, Next.js dashboards, Temporal background jobs, MooseStack analytics, and Prisma data access — wired together in a pnpm monorepo.

## Prerequisites

- Node.js 24+
- pnpm 10+
- Docker

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd moose-example-app

# 2. Start infrastructure services
docker compose up -d

# 3. Install dependencies
pnpm install

# 4. Configure environment
cp .env.example .env

# 5. Push the database schema
pnpm db:push

# 6. Start all services in development mode
pnpm dev
```

## Architecture Overview

The application is organized into three layers:

- **API layer** — Fastify 5 service exposing REST endpoints with Zod-validated routes, Better Auth authentication, and closure-based Prisma repositories.
- **Frontend layer** — Next.js 16 App Router dashboard using React 19, TanStack React Query, and the feature module pattern.
- **Background layer** — Temporal workflows orchestrating long-running tasks with a clean 3-layer separation (workflows, activities, workers).
- **Analytics layer** — MooseStack ingestion pipeline streaming events through Redpanda into ClickHouse for real-time analytics.

```
┌──────────────┐       ┌──────────────┐
│   Dashboard  │──────▶│   API (v1)   │
│  (Next.js)   │  HTTP │  (Fastify)   │
│  :3000       │       │  :3001       │
└──────────────┘       └──────┬───────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
       ┌────────────┐ ┌────────────┐ ┌──────────────┐
       │  Postgres   │ │  Temporal   │ │  Analytics   │
       │  (Prisma)   │ │  (Workers)  │ │  (Moose)     │
       │  :5432      │ │  :7233      │ │              │
       └────────────┘ └────────────┘ └──────┬───────┘
                                            │
                                    ┌───────┴───────┐
                                    │               │
                                    ▼               ▼
                             ┌───────────┐   ┌───────────┐
                             │ Redpanda   │   │ClickHouse │
                             │ :19092     │   │ :18123    │
                             └───────────┘   └───────────┘
```

## Project Structure

```
moose-example-app/
├── docker-compose.yaml
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── services/
│   ├── node/
│   │   ├── api/              # Fastify API service
│   │   ├── analytics/        # MooseStack analytics service
│   │   └── temporal/         # Temporal workers & workflows
│   └── web/
│       └── dashboard/        # Next.js frontend
└── packages/
    └── node/
        ├── config/           # Shared configuration & env parsing
        ├── prisma/           # Prisma schema & repository layer
        ├── temporal/         # Shared Temporal client & types
        └── analytics-client/ # ClickHouse query helpers
```

## Services

| Service       | URL                        | Description                     |
| ------------- | -------------------------- | ------------------------------- |
| Dashboard     | http://localhost:3000       | Next.js frontend                |
| API           | http://localhost:3001       | Fastify REST API                |
| Temporal UI   | http://localhost:8080       | Temporal workflow dashboard     |
| ClickHouse    | http://localhost:18123      | ClickHouse HTTP interface       |
| Redpanda      | localhost:19092             | Kafka-compatible message broker |

## Key Patterns

- **Closure-based repositories** — Prisma data access wrapped in factory functions that accept a `PrismaClient` and return query methods, enabling easy testing and dependency injection.
- **Fastify plugin system** — Services, auth, and database connections registered as Fastify plugins with proper encapsulation and lifecycle hooks.
- **Temporal 3-layer architecture** — Clean separation of workflows (orchestration), activities (side effects), and workers (execution runtime).
- **MooseStack analytics** — Event ingestion through Redpanda into ClickHouse with typed data models serving as the single source of truth.
- **Feature module pattern** — Frontend code organized by feature (components, hooks, queries, types) rather than by file type.
- **Query key factories** — Centralized TanStack Query key definitions per feature for consistent cache management and invalidation.

## Development Commands

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start all services in development mode       |
| `pnpm build`        | Build all packages and services              |
| `pnpm lint`         | Run ESLint across the monorepo               |
| `pnpm typecheck`    | Run TypeScript type checking                 |
| `pnpm test`         | Run tests across all packages                |
| `pnpm db:push`      | Push Prisma schema to the database           |
| `pnpm db:generate`  | Regenerate the Prisma client                 |
| `pnpm db:studio`    | Open Prisma Studio                           |
| `docker compose up` | Start infrastructure services                |
| `docker compose down` | Stop infrastructure services               |
