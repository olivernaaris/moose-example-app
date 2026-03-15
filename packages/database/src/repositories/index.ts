import type { PrismaClient } from "@prisma/client";
import { createOrderRepository } from "./order.repository.js";
import { createProductRepository } from "./product.repository.js";

export { createOrderRepository } from "./order.repository.js";
export { createProductRepository } from "./product.repository.js";

export type { CreateOrderInput, CreateOrderItemInput, UpdateOrderInput, ListOrdersOptions } from "./order.repository.js";
export type { CreateProductInput, UpdateProductInput, ListProductsOptions } from "./product.repository.js";

export function createRepositories(prisma: PrismaClient) {
  return {
    order: createOrderRepository(prisma),
    product: createProductRepository(prisma),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;
