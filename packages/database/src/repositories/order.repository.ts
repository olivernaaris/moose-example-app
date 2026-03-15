import type { OrderStatus, Prisma, PrismaClient } from "@prisma/client";
import { generateId } from "../constants.js";

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderInput {
  userId: string;
  total: number;
  items: CreateOrderItemInput[];
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  total?: number;
}

export interface ListOrdersOptions {
  skip?: number;
  take?: number;
  userId?: string;
  status?: OrderStatus;
}

export function createOrderRepository(prisma: PrismaClient) {
  return {
    async findById(id: string) {
      return prisma.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });
    },

    async list(options: ListOrdersOptions = {}) {
      const { skip = 0, take = 50, userId, status } = options;

      const where: Prisma.OrderWhereInput = {};
      if (userId) where.userId = userId;
      if (status) where.status = status;

      const [items, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: { items: true },
        }),
        prisma.order.count({ where }),
      ]);

      return { items, total };
    },

    async create(data: CreateOrderInput) {
      const orderId = generateId();

      return prisma.order.create({
        data: {
          id: orderId,
          userId: data.userId,
          total: data.total,
          items: {
            create: data.items.map((item) => ({
              id: generateId(),
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });
    },

    async update(id: string, data: UpdateOrderInput) {
      return prisma.order.update({
        where: { id },
        data,
        include: { items: true },
      });
    },

    async delete(id: string) {
      return prisma.order.delete({ where: { id } });
    },
  };
}
