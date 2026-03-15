import type { Prisma, PrismaClient } from "@prisma/client";
import { generateId } from "../constants.js";

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  stock?: number;
}

export interface ListProductsOptions {
  skip?: number;
  take?: number;
  search?: string;
}

export function createProductRepository(prisma: PrismaClient) {
  return {
    async findById(id: string) {
      return prisma.product.findUnique({ where: { id } });
    },

    async findBySku(sku: string) {
      return prisma.product.findUnique({ where: { sku } });
    },

    async list(options: ListProductsOptions = {}) {
      const { skip = 0, take = 50, search } = options;

      const where: Prisma.ProductWhereInput = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
      ]);

      return { items, total };
    },

    async create(data: CreateProductInput) {
      return prisma.product.create({
        data: {
          id: generateId(),
          name: data.name,
          description: data.description,
          price: data.price,
          sku: data.sku,
          stock: data.stock ?? 0,
        },
      });
    },

    async update(id: string, data: UpdateProductInput) {
      return prisma.product.update({
        where: { id },
        data,
      });
    },

    async delete(id: string) {
      return prisma.product.delete({ where: { id } });
    },
  };
}
