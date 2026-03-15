import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes.js";
import { ordersRoutes } from "./orders/orders.routes.js";
import { productsRoutes } from "./products/products.routes.js";

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(healthRoutes, { prefix: "/health" });
  await fastify.register(ordersRoutes, { prefix: "/api/orders" });
  await fastify.register(productsRoutes, { prefix: "/api/products" });
}
