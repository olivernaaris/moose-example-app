import type { PrismaClient } from "@prisma/client";
import type { Repositories } from "@moose-example/database";
import type { ExampleTemporalClient } from "@moose-example/temporal-client";

declare module "fastify" {
  interface FastifyInstance {
    db: PrismaClient;
    repos: Repositories;
    temporal: ExampleTemporalClient;
  }
  interface FastifyRequest {
    user?: { id: string; email: string; name?: string | null };
  }
}
