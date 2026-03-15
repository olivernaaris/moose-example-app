# Moose Example App — Implementation Plan

A minimal, fully-runnable monorepo demonstrating the Segmentflow architecture patterns with an **Orders/Products e-commerce domain**.

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Monorepo | pnpm + Turborepo | pnpm@10, turbo@^2.8 |
| Runtime | Node.js | >= 24 |
| Language | TypeScript | 5.9.x |
| API | Fastify 5 + Zod type provider | ^5.5.0 |
| Auth | Better Auth | ^1.4.18 |
| Database | Prisma 7 + PostgreSQL (driver adapter) | 7.2.0 |
| Background Jobs | Temporal.io | ^1.14.1 |
| Analytics | MooseStack (ClickHouse + Redpanda) | @514labs/moose-lib@0.6.439 |
| Frontend | Next.js 16 + React 19 | ^16.0.10, ^19.2.1 |
| State | TanStack React Query v5 | ^5.x |
| Validation | Zod 4 | ^4.x |
| Styling | Tailwind CSS v4 + shadcn/ui | ^4.1.18 |
| Infra | Docker Compose | — |

---

## Directory Structure

```
moose-example-app/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
├── .npmrc
├── .nvmrc
├── .gitignore
├── .env.example                     # Root env vars (shared across services)
├── docker-compose.yaml
├── README.md
│
├── packages/
│   ├── database/                    # Prisma 7 + repository pattern
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma.config.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── index.ts             # Re-exports client, repos, types
│   │       ├── constants.ts         # UUIDv7 generator, shared constants
│   │       └── repositories/
│   │           ├── index.ts         # createRepositories() convenience fn
│   │           ├── order.repository.ts
│   │           └── product.repository.ts
│   │
│   ├── analytics-client/            # ClickHouse model types + query client
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── client.ts            # ClickHouse singleton client
│   │       └── models/
│   │           ├── index.ts
│   │           ├── order-event.ts   # Interface + TABLE + COLUMNS constants
│   │           └── product-view.ts
│   │
│   ├── temporal-client/             # Client wrapper class
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       └── client.ts            # ExampleTemporalClient class
│   │
│   ├── temporal-worker/             # Workflows + activities (business logic)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── workflows/
│   │       │   ├── index.ts
│   │       │   └── process-order.workflow.ts
│   │       └── activities/
│   │           ├── index.ts
│   │           ├── create-activities.ts  # DI factory
│   │           └── order.activities.ts
│   │
│   └── api-clients/                 # Fetch client + React Query hooks
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── fetch-client.ts      # client() wrapper with credentials
│           ├── errors.ts            # ApiError, NetworkError classes
│           ├── moose-client.ts      # Server-side Moose ingest client
│           ├── query-keys.ts        # Query key factories
│           └── hooks/
│               ├── index.ts
│               ├── use-orders.ts
│               └── use-products.ts
│
├── services/
│   ├── api/                         # Fastify 5 backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── server.ts            # Entry point
│   │       ├── bootstrap.ts         # App factory
│   │       ├── config.ts            # Env config with Zod validation
│   │       ├── types/
│   │       │   └── index.ts         # Fastify type augmentations
│   │       ├── lib/
│   │       │   ├── auth.ts          # Better Auth instance
│   │       │   ├── prisma.ts        # Proxy-based lazy PrismaClient
│   │       │   └── temporal.ts      # Temporal client instance
│   │       ├── plugins/
│   │       │   ├── index.ts         # Plugin aggregator
│   │       │   ├── prisma.plugin.ts # Decorate with db + repos
│   │       │   ├── auth.plugin.ts   # Mount Better Auth handler
│   │       │   ├── temporal.plugin.ts
│   │       │   └── cors.plugin.ts
│   │       ├── middleware/
│   │       │   ├── auth.middleware.ts    # requireUser, requireSession
│   │       │   └── error-handler.ts
│   │       └── routes/
│   │           ├── index.ts         # Route aggregator with prefixes
│   │           ├── health.routes.ts
│   │           ├── orders/
│   │           │   └── orders.routes.ts
│   │           └── products/
│   │               └── products.routes.ts
│   │
│   ├── temporal-worker/             # Deployable worker service
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── worker.ts            # Entry point — connects, bundles, runs
│   │       ├── workflows.ts         # Re-exports for bundling
│   │       ├── config.ts            # Worker config from env
│   │       └── lib/
│   │           └── prisma.ts        # Worker's own Prisma instance
│   │
│   ├── analytics/                   # MooseStack service
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── moose.config.toml
│   │   └── app/
│   │       ├── index.ts             # App entry — registers datamodels, pipelines, streams
│   │       ├── datamodels/
│   │       │   ├── order_events.ts
│   │       │   └── product_views.ts
│   │       ├── pipelines/
│   │       │   ├── order_events.ts  # Ingest endpoint config
│   │       │   └── product_views.ts
│   │       └── streams/
│   │           └── order_events_to_product_views.ts
│   │
│   └── dashboard/                   # Next.js 16 frontend
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.example
│       ├── next.config.ts
│       ├── postcss.config.js
│       └── src/
│           ├── app/
│           │   ├── layout.tsx       # Root layout with providers
│           │   ├── globals.css      # Tailwind v4 CSS-based config
│           │   ├── (public)/
│           │   │   ├── layout.tsx
│           │   │   ├── login/
│           │   │   │   └── page.tsx
│           │   │   └── signup/
│           │   │       └── page.tsx # Email/password registration
│           │   └── (protected)/
│           │       ├── layout.tsx   # Server-side auth check
│           │       ├── page.tsx     # Dashboard home
│           │       ├── orders/
│           │       │   └── page.tsx
│           │       └── products/
│           │           └── page.tsx
│           ├── providers/
│           │   └── app-providers.tsx # QueryClientProvider wrapper
│           ├── contexts/
│           │   └── auth-context.tsx
│           ├── lib/
│           │   ├── auth-client.ts   # Better Auth client instance
│           │   └── query-client.ts
│           ├── features/
│           │   ├── auth/
│           │   │   ├── components/
│           │   │   │   ├── login-form.tsx
│           │   │   │   └── signup-form.tsx
│           │   │   └── index.ts
│           │   ├── orders/
│           │   │   ├── components/
│           │   │   │   ├── order-list.tsx
│           │   │   │   └── create-order-form.tsx
│           │   │   └── index.ts
│           │   └── products/
│           │       ├── components/
│           │       │   ├── product-list.tsx
│           │       │   └── create-product-form.tsx
│           │       └── index.ts
│           ├── components/
│           │   └── ui/
│           │       ├── button.tsx
│           │       ├── input.tsx
│           │       ├── card.tsx
│           │       └── sidebar.tsx
│           └── utils/
│               └── cn.ts            # clsx + twMerge utility
│
└── docker-compose.yaml              # Postgres, Temporal, ClickHouse, Redpanda
```

**Total: ~116 files, ~4,500 lines of code**

---

## Phases

### Phase 0 — Root Configuration (~8 files, ~120 lines)

Root monorepo config files that mirror the Segmentflow setup.

| File | Purpose |
|------|---------|
| `package.json` | Workspace root with turbo scripts, `packageManager: pnpm@10.x` |
| `pnpm-workspace.yaml` | Declares `packages/*` and `services/*` as workspace members |
| `turbo.json` | Pipeline config: `build`, `dev`, `lint`, `typecheck` tasks with proper dependency graph |
| `tsconfig.json` | Base tsconfig with `strict`, `ESNext` module, path aliases |
| `.npmrc` | `shamefully-hoist=false`, `strict-peer-dependencies=false` |
| `.nvmrc` | `24` |
| `.gitignore` | node_modules, dist, .env, .turbo, .next, prisma generated |
| `.env.example` | Root env template — documents all required env vars with defaults |

**Key patterns:**
- `turbo.json` uses `dependsOn: ["^build"]` for packages, `persistent: true` for dev tasks
- Root `package.json` has no direct dependencies, only `devDependencies` for turbo + typescript
- Scripts: `"dev": "turbo dev"`, `"build": "turbo build"`, `"typecheck": "turbo typecheck"`

**`.env.example` contents:**
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/moose_example

# Temporal
TEMPORAL_ADDRESS=localhost:7233

# ClickHouse
CLICKHOUSE_URL=http://localhost:18123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=default

# Redpanda
REDPANDA_BROKERS=localhost:19092

# Auth
BETTER_AUTH_SECRET=your-secret-key-change-in-production
BETTER_AUTH_URL=http://localhost:3001

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001
```

---

### Phase 1 — `packages/database` (~9 files, ~400 lines)

Prisma 7 with driver adapter pattern and closure-based repository factories.

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: `prisma@7.2.0`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `uuidv7` |
| `tsconfig.json` | Extends root, `outDir: "./dist"`, composite project references |
| `prisma.config.ts` | Prisma 7 config — `defineConfig()` with `provider: "postgresql"` |
| `prisma/schema.prisma` | Better Auth models (`User`, `Session`, `Account`, `Verification`) + domain models (`Product`, `Order`, `OrderItem`) |
| `src/index.ts` | Re-exports: PrismaClient, repositories, types, constants |
| `src/constants.ts` | `generateId()` using UUIDv7, shared constants |
| `src/repositories/index.ts` | `createRepositories(prisma)` — creates all repos from a single client |
| `src/repositories/order.repository.ts` | `createOrderRepository(prisma)` — CRUD + list with pagination/filtering |
| `src/repositories/product.repository.ts` | `createProductRepository(prisma)` — CRUD + list with pagination/filtering |

**Key patterns:**
```typescript
// Closure-based repository factory (NOT classes)
export function createOrderRepository(prisma: PrismaClient) {
  return {
    async findById(id: string) {
      return prisma.order.findUnique({ where: { id }, include: { items: true } });
    },
    async create(data: CreateOrderInput) {
      return prisma.order.create({ data: { id: generateId(), ...data } });
    },
    // ... list, update, delete
  };
}

// Convenience function
export function createRepositories(prisma: PrismaClient) {
  return {
    order: createOrderRepository(prisma),
    product: createProductRepository(prisma),
  };
}
```

**Schema — Better Auth models (explicitly defined, Prisma-managed):**

All IDs are application-generated UUIDs (via `generateId()` / UUIDv7) — **no `@default(uuid())`** on any ID field. This matches the Segmentflow pattern where IDs are always generated in application code, not by the database.

```prisma
// ──────────────────────────────────────────────
// Better Auth core models
// These are required for Better Auth with Prisma adapter.
// Defined explicitly so Prisma manages migrations.
// ──────────────────────────────────────────────

model User {
  id            String    @id @db.Uuid
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false) @map("email_verified")
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  accounts Account[]
  sessions Session[]
  orders   Order[]

  @@map("auth_user")
}

model Session {
  id        String   @id @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("auth_session")
}

model Account {
  id                    String    @id @db.Uuid
  userId                String    @map("user_id") @db.Uuid
  accountId             String    @map("account_id")
  providerId            String    @map("provider_id")
  accessToken           String?   @map("access_token")
  refreshToken          String?   @map("refresh_token")
  accessTokenExpiresAt  DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope                 String?
  idToken               String?   @map("id_token")
  password              String?
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("auth_account")
}

model Verification {
  id         String   @id @db.Uuid
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("auth_verification")
}
```

**Schema — Domain models:**
```prisma
// ──────────────────────────────────────────────
// Domain models — Orders/Products e-commerce
// ──────────────────────────────────────────────

model Product {
  id          String   @id @db.Uuid
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  sku         String   @unique
  stock       Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  orderItems  OrderItem[]

  @@map("products")
}

model Order {
  id         String      @id @db.Uuid
  userId     String      @map("user_id") @db.Uuid
  status     OrderStatus @default(PENDING)
  total      Decimal     @db.Decimal(10, 2)
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt @map("updated_at")
  user       User        @relation(fields: [userId], references: [id])
  items      OrderItem[]

  @@map("orders")
}

model OrderItem {
  id        String  @id @db.Uuid
  orderId   String  @map("order_id") @db.Uuid
  productId String  @map("product_id") @db.Uuid
  quantity  Int
  price     Decimal @db.Decimal(10, 2)

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

---

### Phase 2 — `packages/analytics-client` (~5 files, ~200 lines)

Shared ClickHouse model types and singleton query client.

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: `@clickhouse/client` |
| `tsconfig.json` | Extends root |
| `src/index.ts` | Re-exports client + all models |
| `src/client.ts` | `getClickHouseClient()` singleton with lazy init |
| `src/models/order-event.ts` | `OrderEvent` interface + `ORDER_EVENTS_TABLE` + `ORDER_EVENTS_COLUMNS` constants |
| `src/models/product-view.ts` | `ProductView` interface + `PRODUCT_VIEWS_TABLE` + `PRODUCT_VIEWS_COLUMNS` constants |

**Key patterns:**
```typescript
// Model file structure: interface + TABLE + COLUMNS constants
export interface OrderEvent {
  eventId: string;
  orderId: string;
  userId: string;
  action: string; // 'created' | 'updated' | 'cancelled' | 'shipped' | 'delivered'
  totalAmount: number;
  itemCount: number;
  timestamp: string; // DateTime64(3)
}

export const ORDER_EVENTS_TABLE = "OrderEvent_0_0";
export const ORDER_EVENTS_COLUMNS = [
  "eventId", "orderId", "userId", "action",
  "totalAmount", "itemCount", "timestamp",
] as const;

// Singleton client
let client: ClickHouseClient | null = null;
export function getClickHouseClient(): ClickHouseClient {
  if (!client) {
    client = createClient({
      url: process.env.CLICKHOUSE_URL ?? "http://localhost:18123",
      username: process.env.CLICKHOUSE_USER ?? "panda",
      password: process.env.CLICKHOUSE_PASSWORD ?? "pandapass",
      database: process.env.CLICKHOUSE_DATABASE ?? "local",
    });
  }
  return client;
}
```

---

### Phase 3 — `packages/temporal-client` (~3 files, ~120 lines)

Client wrapper class with lazy connection and typed workflow methods.

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: `@temporalio/client`, `uuidv7` |
| `tsconfig.json` | Extends root |
| `src/index.ts` | Re-exports client class |
| `src/client.ts` | `ExampleTemporalClient` class |

**Key patterns:**
```typescript
export class ExampleTemporalClient {
  private client: Client | null = null;
  private connection: Connection | null = null;

  constructor(private readonly address: string) {}

  private async getClient(): Promise<Client> {
    if (!this.client) {
      this.connection = await Connection.connect({ address: this.address });
      this.client = new Client({ connection: this.connection });
    }
    return this.client;
  }

  async startProcessOrder(orderId: string): Promise<string> {
    const client = await this.getClient();
    const workflowId = `process-order-${uuidv7()}`;
    await client.workflow.start("processOrder", {
      taskQueue: "example-task-queue",
      workflowId,
      args: [{ orderId }],
    });
    return workflowId;
  }

  async close(): Promise<void> {
    this.connection?.close();
  }
}
```

---

### Phase 4 — `packages/temporal-worker` (~7 files, ~200 lines)

Business logic layer: workflows with `proxyActivities` and activities with DI factory.

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: `@temporalio/workflow`, `@temporalio/activity` |
| `tsconfig.json` | Extends root |
| `src/index.ts` | Re-exports workflows + activities |
| `src/workflows/index.ts` | Re-exports all workflows |
| `src/workflows/process-order.workflow.ts` | Order processing workflow |
| `src/activities/index.ts` | Re-exports activity types |
| `src/activities/create-activities.ts` | `createActivities(deps)` DI factory |
| `src/activities/order.activities.ts` | Order activity implementations |

**Key patterns:**
```typescript
// Workflow — uses proxyActivities, NOT direct imports
import { proxyActivities } from "@temporalio/workflow";
import type { OrderActivities } from "../activities/order.activities";

const { validateOrder, processPayment, updateOrderStatus, sendOrderConfirmation } =
  proxyActivities<OrderActivities>({
    startToCloseTimeout: "30 seconds",
    retry: { maximumAttempts: 3 },
  });

export async function processOrder(input: { orderId: string }): Promise<void> {
  await validateOrder(input.orderId);
  await processPayment(input.orderId);
  await updateOrderStatus(input.orderId, "PROCESSING");
  await sendOrderConfirmation(input.orderId);
  await updateOrderStatus(input.orderId, "SHIPPED");
}

// Activity factory — DI pattern
export function createActivities(deps: {
  repos: Repositories;
  temporalClient: ExampleTemporalClient;
}): OrderActivities {
  return {
    async validateOrder(orderId: string) {
      const order = await deps.repos.order.findById(orderId);
      if (!order) throw new Error(`Order ${orderId} not found`);
      if (order.items.length === 0) throw new Error("Order has no items");
    },
    async processPayment(orderId: string) { /* ... */ },
    async updateOrderStatus(orderId: string, status: OrderStatus) {
      await deps.repos.order.update(orderId, { status });
    },
    async sendOrderConfirmation(orderId: string) { /* ... */ },
  };
}
```

---

### Phase 5 — `packages/api-clients` (~8 files, ~500 lines)

Custom fetch client, error classes, Moose ingest client, query key factories, and React Query hooks.

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: `@tanstack/react-query` |
| `tsconfig.json` | Extends root |
| `src/index.ts` | Re-exports everything |
| `src/fetch-client.ts` | `client()` wrapper with `credentials: "include"` |
| `src/errors.ts` | `ApiError` and `NetworkError` classes |
| `src/moose-client.ts` | Server-side Moose HTTP ingest client |
| `src/query-keys.ts` | Query key factory pattern |
| `src/hooks/use-orders.ts` | `useOrders()`, `useOrder()`, `useCreateOrder()`, `useUpdateOrder()` |
| `src/hooks/use-products.ts` | `useProducts()`, `useProduct()`, `useCreateProduct()` |

**Key patterns:**
```typescript
// Fetch client
export function client(path: string, options?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  return fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.message ?? "Request failed", body);
    }
    return res.json();
  });
}

// Query key factory
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Hook with cache invalidation
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderInput) =>
      client("/api/orders", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
```

---

### Phase 6 — `services/api` (~21 files, ~920 lines)

Fastify 5 backend with plugin system, route aggregator, auth middleware, and typed Zod routes.

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: fastify, better-auth, prisma, zod, etc. |
| `tsconfig.json` | Extends root |
| `.env.example` | API-specific env vars (DATABASE_URL, TEMPORAL_ADDRESS, auth secrets, etc.) |
| `src/server.ts` | Entry point — loads config, calls bootstrap, starts listening |
| `src/bootstrap.ts` | App factory — creates Fastify, registers plugins, registers routes |
| `src/config.ts` | Zod-validated env config |
| `src/types/index.ts` | Fastify type augmentations (decorators) |
| `src/lib/auth.ts` | Better Auth instance with email/password + session |
| `src/lib/prisma.ts` | Proxy-based lazy PrismaClient singleton |
| `src/lib/temporal.ts` | Temporal client instance |
| `src/plugins/index.ts` | Plugin aggregator — registers all plugins in order |
| `src/plugins/prisma.plugin.ts` | Decorates Fastify with `db` (PrismaClient) and `repos` |
| `src/plugins/auth.plugin.ts` | Mounts Better Auth handler at `/api/auth/*` |
| `src/plugins/temporal.plugin.ts` | Decorates Fastify with `temporal` client |
| `src/plugins/cors.plugin.ts` | CORS configuration |
| `src/middleware/auth.middleware.ts` | `requireUser` preHandler hook |
| `src/middleware/error-handler.ts` | Global error handler |
| `src/routes/index.ts` | Route aggregator — registers all route modules with prefixes |
| `src/routes/health.routes.ts` | `GET /health` |
| `src/routes/orders/orders.routes.ts` | CRUD routes for orders |
| `src/routes/products/products.routes.ts` | CRUD routes for products |

**Key patterns:**
```typescript
// Plugin — encapsulated with fastify-plugin
import fp from "fastify-plugin";

export const prismaPlugin = fp(async (fastify) => {
  const prisma = getPrisma();
  const repos = createRepositories(prisma);
  fastify.decorate("db", prisma);
  fastify.decorate("repos", repos);
  fastify.addHook("onClose", async () => { await prisma.$disconnect(); });
}, { name: "prisma" });

// Route — Zod type provider
import { z } from "zod/v4";

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.int().min(1),
  })),
});

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.post("/", {
    schema: {
      body: CreateOrderSchema,
      response: { 201: OrderResponseSchema },
    },
    preHandler: [requireUser],
    handler: async (request, reply) => {
      const order = await fastify.repos.order.create({
        userId: request.user.id,
        items: request.body.items,
      });
      await fastify.temporal.startProcessOrder(order.id);
      return reply.status(201).send(order);
    },
  });
}

// Route aggregator
export async function registerRoutes(fastify: FastifyInstance) {
  fastify.register(healthRoutes, { prefix: "/health" });
  fastify.register(orderRoutes, { prefix: "/api/orders" });
  fastify.register(productRoutes, { prefix: "/api/products" });
}

// Proxy-based lazy PrismaClient
let prisma: PrismaClient;
export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (!prisma.__actual) {
          const pg = new Pool({ connectionString: config.DATABASE_URL });
          const adapter = new PrismaPg(pg);
          prisma.__actual = new PrismaClient({ adapter });
        }
        return Reflect.get(prisma.__actual, prop);
      },
    });
  }
  return prisma;
}

// Better Auth config
export const auth = betterAuth({
  database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  session: { cookieCache: { enabled: true, maxAge: 60 * 5 } },
  trustedOrigins: [config.DASHBOARD_URL],
});
```

---

### Phase 7 — `services/temporal-worker` (~7 files, ~260 lines)

Deployable worker service that connects to Temporal, bundles workflows, and runs.

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: `@temporalio/worker`, `@temporalio/workflow`, workspace packages |
| `tsconfig.json` | Extends root |
| `.env.example` | Worker-specific env vars (DATABASE_URL, TEMPORAL_ADDRESS) |
| `src/worker.ts` | Entry point — connects, creates worker, starts |
| `src/workflows.ts` | Re-exports workflows for bundling |
| `src/config.ts` | Worker config from env |
| `src/lib/prisma.ts` | Worker's own PrismaClient instance |

**Key patterns:**
```typescript
// Worker entry point
import { NativeConnection, Worker, bundleWorkflowCode } from "@temporalio/worker";
import { createActivities } from "@moose-example/temporal-worker";
import { createRepositories } from "@moose-example/database";

async function run() {
  const connection = await NativeConnection.connect({
    address: config.TEMPORAL_ADDRESS,
  });

  // Bundle workflows (pre-built in prod for faster startup)
  const workflowBundle = await bundleWorkflowCode({
    workflowsPath: require.resolve("./workflows"),
  });

  const prisma = getPrisma();
  const repos = createRepositories(prisma);
  const temporalClient = new ExampleTemporalClient(config.TEMPORAL_ADDRESS);

  const activities = createActivities({ repos, temporalClient });

  const worker = await Worker.create({
    connection,
    taskQueue: "example-task-queue",
    workflowBundle,
    activities,
  });

  await worker.run();
}

run().catch((err) => {
  console.error("Worker failed", err);
  process.exit(1);
});
```

---

### Phase 8 — `services/analytics` (~9 files, ~180 lines)

MooseStack service with data models, pipelines, and streams.

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: `@514labs/moose-lib@0.6.439` |
| `tsconfig.json` | Extends root (NOTE: Moose owns this — do not modify) |
| `.env.example` | ClickHouse, Redpanda, and Moose env vars |
| `moose.config.toml` | MooseStack configuration (matches real Segmentflow format) |
| `app/index.ts` | App entry — registers datamodels, pipelines, streams |
| `app/datamodels/order_events.ts` | OrderEvent data model with ClickHouse types |
| `app/datamodels/product_views.ts` | ProductView data model with ClickHouse types |
| `app/pipelines/order_events.ts` | HTTP ingest endpoint for order events |
| `app/pipelines/product_views.ts` | HTTP ingest endpoint for product views |
| `app/streams/order_events_to_product_views.ts` | Stream transform |

**Key patterns:**
```typescript
// Data model — ClickHouse type annotations
import { Key, DataModelConfig } from "@514labs/moose-lib";

export interface OrderEvent {
  eventId: Key<string>;
  orderId: string;
  userId: string;
  action: string; // LowCardinality(String) via config
  totalAmount: number; // Float64
  itemCount: number; // Int32
  timestamp: Date; // DateTime64(3)
}

export const config: DataModelConfig<OrderEvent> = {
  storage: {
    enabled: true,
    order_by_fields: ["timestamp", "orderId"],
  },
};

// Pipeline — HTTP ingest endpoint
export default function pipeline(event: OrderEvent): OrderEvent {
  return event; // Pass-through, or add validation/enrichment
}

// Stream transform
import { OrderEvent } from "../datamodels/order_events";
import { ProductView } from "../datamodels/product_views";

export default function transform(event: OrderEvent): ProductView | null {
  if (event.action !== "viewed_product") return null;
  return {
    viewId: event.eventId,
    productId: event.orderId, // reused field for demo
    userId: event.userId,
    timestamp: event.timestamp,
  };
}
```

**moose.config.toml** (matches real Segmentflow config format):
```toml
language = "Typescript"

[typescript_config]
package_manager = "pnpm"

[redpanda_config]
broker = "localhost:19092"
message_timeout_ms = 1000
retention_ms = 30000
replication_factor = 1

[clickhouse_config]
db_name = "local"
user = "default"
password = ""
use_ssl = false
host = "localhost"
host_port = 18123
native_port = 19000

[http_server_config]
host = "localhost"
port = 4000
management_port = 5001

[telemetry]
enabled = false

[features]
streaming_engine = true
data_model_v2 = true
apis = true
olap = true
```

---

### Phase 9 — `services/dashboard` (~34 files, ~1,400 lines)

Next.js 16 App Router frontend with feature module pattern, login + signup forms.

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: next, react, tailwindcss, shadcn/ui, etc. |
| `tsconfig.json` | Next.js tsconfig |
| `.env.example` | Dashboard-specific env vars |
| `next.config.ts` | Minimal Next.js config |
| `postcss.config.js` | PostCSS with Tailwind |
| `src/app/layout.tsx` | Root layout with AppProviders |
| `src/app/globals.css` | Tailwind v4 CSS-based config with `@theme` |
| `src/app/(public)/layout.tsx` | Public layout (no auth required) |
| `src/app/(public)/login/page.tsx` | Login page — delegates to LoginForm |
| `src/app/(public)/signup/page.tsx` | Signup page — delegates to SignupForm |
| `src/app/(protected)/layout.tsx` | Protected layout — server-side auth check |
| `src/app/(protected)/page.tsx` | Dashboard home page |
| `src/app/(protected)/orders/page.tsx` | Orders page (thin — delegates to feature) |
| `src/app/(protected)/products/page.tsx` | Products page (thin — delegates to feature) |
| `src/providers/app-providers.tsx` | QueryClientProvider + AuthProvider composition |
| `src/contexts/auth-context.tsx` | Auth context with Better Auth client |
| `src/lib/auth-client.ts` | Better Auth client instance |
| `src/lib/query-client.ts` | QueryClient factory |
| `src/features/auth/components/login-form.tsx` | Email/password sign-in form using Better Auth client |
| `src/features/auth/components/signup-form.tsx` | Email/password registration form using Better Auth client |
| `src/features/auth/index.ts` | Auth feature barrel export |
| `src/features/orders/components/order-list.tsx` | Order list component with useOrders hook |
| `src/features/orders/components/create-order-form.tsx` | Create order form with useCreateOrder |
| `src/features/orders/index.ts` | Feature barrel export |
| `src/features/products/components/product-list.tsx` | Product list with useProducts hook |
| `src/features/products/components/create-product-form.tsx` | Create product form |
| `src/features/products/index.ts` | Feature barrel export |
| `src/components/ui/button.tsx` | shadcn/ui Button with CVA |
| `src/components/ui/input.tsx` | shadcn/ui Input |
| `src/components/ui/card.tsx` | shadcn/ui Card |
| `src/components/ui/label.tsx` | shadcn/ui Label |
| `src/components/ui/sidebar.tsx` | App sidebar navigation |
| `src/utils/cn.ts` | `cn()` — clsx + twMerge |

**Per-service `.env.example`:**
```env
# services/dashboard/.env.example
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001
```

```env
# services/api/.env.example
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/moose_example
TEMPORAL_ADDRESS=localhost:7233
BETTER_AUTH_SECRET=your-secret-key-change-in-production
BETTER_AUTH_URL=http://localhost:3001
DASHBOARD_URL=http://localhost:3000
PORT=3001
HOST=0.0.0.0
```

```env
# services/temporal-worker/.env.example
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/moose_example
TEMPORAL_ADDRESS=localhost:7233
```

```env
# services/analytics/.env.example
CLICKHOUSE_URL=http://localhost:18123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=local
REDPANDA_BROKERS=localhost:19092
```

**Key patterns:**
```tsx
// Protected layout — server-side auth check
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function ProtectedLayout({ children }) {
  const headersList = await headers();
  const res = await fetch(`${process.env.API_URL}/api/auth/get-session`, {
    headers: { cookie: headersList.get("cookie") ?? "" },
  });
  if (!res.ok) redirect("/login");
  return <>{children}</>;
}

// Login form — uses Better Auth client
"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
    }
  }
  // ... render form with email, password inputs + submit button
}

// Signup form — uses Better Auth client
"use client";
import { authClient } from "@/lib/auth-client";

export function SignupForm() {
  // Similar to LoginForm but calls authClient.signUp.email({ email, password, name })
  // On success, redirects to login or auto-signs in
}

// Thin page — delegates to feature component
import { OrderList, CreateOrderForm } from "@/features/orders";

export default function OrdersPage() {
  return (
    <div>
      <h1>Orders</h1>
      <CreateOrderForm />
      <OrderList />
    </div>
  );
}

// Feature component — uses React Query hooks from api-clients
"use client";
import { useOrders } from "@moose-example/api-clients";

export function OrderList() {
  const { data: orders, isLoading, error } = useOrders();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div>
      {orders?.map((order) => (
        <Card key={order.id}>
          <p>Order #{order.id}</p>
          <p>Status: {order.status}</p>
          <p>Total: ${order.total}</p>
        </Card>
      ))}
    </div>
  );
}

// Tailwind v4 CSS-based config (no tailwind.config.js)
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.55 0.2 250);
  --color-primary-foreground: oklch(0.98 0 0);
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.15 0 0);
  --color-muted: oklch(0.96 0 0);
  --color-muted-foreground: oklch(0.55 0 0);
  --color-border: oklch(0.9 0 0);
  --color-destructive: oklch(0.55 0.2 25);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}
```

---

### Phase 10 — Docker Compose + README (~2 files, ~150 lines)

| File | Purpose |
|------|---------|
| `docker-compose.yaml` | Postgres, Temporal (+ temporal-admin-tools, temporal-ui), ClickHouse, Redpanda |
| `README.md` | Setup instructions, architecture overview, dev commands |

**docker-compose.yaml services:**

| Service | Image | Ports |
|---------|-------|-------|
| `postgres` | `postgres:16` | 5432 |
| `temporal` | `temporalio/auto-setup:latest` | 7233 |
| `temporal-ui` | `temporalio/ui:latest` | 8080 |
| `clickhouse` | `clickhouse/clickhouse-server:latest` | 18123, 19000 |
| `redpanda` | `redpandadata/redpanda:latest` | 19092 |

**README sections:**
1. Prerequisites (Node 24, pnpm 10, Docker)
2. Getting Started (`docker compose up -d`, `pnpm install`, `pnpm db:push`, `pnpm dev`)
3. Architecture Overview (diagram of service interactions)
4. Project Structure (directory tree with descriptions)
5. Development Commands (build, dev, typecheck, lint, db:push, db:studio)
6. Key Patterns (links to relevant code for each pattern)

---

## Dependency Graph

```
dashboard ──► api-clients ──► (fetch client, React Query hooks)
    │
    ▼
   api ──────► database ──────► Prisma 7 + PostgreSQL
    │              │
    │              ▼
    ├──► temporal-client ──► Temporal Server
    │
    ├──► analytics-client ──► ClickHouse
    │
    └──► better-auth ──► PostgreSQL (same DB)

temporal-worker (service) ──► temporal-worker (package) ──► database
                                    │
                                    ▼
                              temporal-client

analytics (service) ──► MooseStack ──► ClickHouse + Redpanda
```

---

## Running the Example

```bash
# 1. Start infrastructure
cd moose-example-app
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Push database schema
pnpm db:push

# 4. Run all services in dev mode
pnpm dev
```

This starts:
- **API** at `http://localhost:3001`
- **Dashboard** at `http://localhost:3000`
- **Temporal UI** at `http://localhost:8080`
- **ClickHouse** at `http://localhost:18123`
- **Redpanda Console** at `http://localhost:8081` (if enabled)

---

## Implementation Notes

1. **Import extensions**: Use `.js` extensions in all TypeScript imports for ESM compatibility (except in MooseStack `services/analytics/` where Moose handles bundling — no extensions there).

2. **No `console.log`**: Use Pino logger via Fastify's built-in `request.log` / `fastify.log` in the API, and Pino directly in the temporal-worker service.

3. **UUIDv7 for all IDs**: Use `uuidv7()` from the `uuidv7` package for all generated IDs (orders, events, workflow IDs). No `@default(uuid())` in the Prisma schema — IDs are always generated in application code (repository layer).

4. **Zod 4**: Use `import { z } from "zod/v4"` (not `"zod"`) for Zod v4 syntax.

5. **Package naming**: All packages use `@moose-example/` scope (e.g., `@moose-example/database`, `@moose-example/api-clients`).

6. **Workspace protocol**: All workspace dependencies use `"workspace:*"` in package.json.

7. **Better Auth models**: Defined explicitly in the Prisma schema (not auto-migrated). Prisma manages all migrations. Simplified versions without organization/admin/impersonation fields.

8. **Auth flow**: Full login + signup forms using Better Auth's `signIn.email()` and `signUp.email()` client methods.

9. **Environment variables**: Each service has its own `.env.example` file. A root `.env.example` documents all vars across the project.

10. **No tests**: This is a pattern demonstration, not a production codebase. Tests can be added later following the same patterns as Segmentflow.

---

## Decisions Log

| # | Question | Decision |
|---|---------|----------|
| 1 | Standalone vs nested repo | Standalone repo, temporarily created inside Segmentflow, will be moved out later |
| 2 | `@default(uuid())` on IDs | Removed — use `generateId()` (UUIDv7) in repository layer only |
| 3 | Better Auth schema models | Defined explicitly in Prisma schema (Prisma-managed migrations) |
| 4 | MooseStack directory convention | Confirmed: `pipelines/` + `streams/` + `datamodels/` (not `flows/`) |
| 5 | Analytics in pnpm workspace | Yes, included in `pnpm-workspace.yaml` and managed by Turborepo |
| 6 | `.env.example` files | Yes, one per service + root |
| 7 | `Worker.create` missing `await` | Fixed |
| 8 | Login flow completeness | Full login + signup forms |
| 9 | Package scope | `@moose-example/` |
| 10 | Testing | No tests — strictly production code |
