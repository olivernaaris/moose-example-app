export { PrismaClient } from "@prisma/client";
export type { Order, OrderItem, Product, User, Session, Account, Verification, OrderStatus } from "@prisma/client";

export { generateId } from "./constants.js";
export {
  createRepositories,
  createOrderRepository,
  createProductRepository,
} from "./repositories/index.js";

export type {
  Repositories,
  CreateOrderInput,
  CreateOrderItemInput,
  UpdateOrderInput,
  ListOrdersOptions,
  CreateProductInput,
  UpdateProductInput,
  ListProductsOptions,
} from "./repositories/index.js";
