import { z } from "zod/v4";
import type { FastifyInstance } from "fastify";
import { requireUser } from "../../middleware/auth.middleware.js";
import { ApiError } from "../../middleware/error-handler.js";

const ProductParamsSchema = z.object({
  id: z.string(),
});

const CreateProductBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  sku: z.string().min(1),
  stock: z.number().int().nonnegative().optional(),
});

const UpdateProductBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  sku: z.string().min(1).optional(),
  stock: z.number().int().nonnegative().optional(),
});

const ListProductsQuerySchema = z.object({
  skip: z.coerce.number().int().nonnegative().optional(),
  take: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
});

export async function productsRoutes(fastify: FastifyInstance): Promise<void> {
  // GET / — List products (public)
  fastify.get<{
    Querystring: z.infer<typeof ListProductsQuerySchema>;
  }>("/", {
    schema: {
      querystring: ListProductsQuerySchema,
    },
  }, async (request) => {
    return fastify.repos.product.list({
      skip: request.query.skip,
      take: request.query.take,
      search: request.query.search,
    });
  });

  // GET /:id — Get product (public)
  fastify.get<{
    Params: z.infer<typeof ProductParamsSchema>;
  }>("/:id", {
    schema: {
      params: ProductParamsSchema,
    },
  }, async (request) => {
    const product = await fastify.repos.product.findById(request.params.id);

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    return product;
  });

  // POST / — Create product (authenticated)
  fastify.post<{
    Body: z.infer<typeof CreateProductBodySchema>;
  }>("/", {
    schema: {
      body: CreateProductBodySchema,
    },
    preHandler: requireUser,
  }, async (request, reply) => {
    const product = await fastify.repos.product.create(request.body);
    return reply.status(201).send(product);
  });

  // PATCH /:id — Update product (authenticated)
  fastify.patch<{
    Params: z.infer<typeof ProductParamsSchema>;
    Body: z.infer<typeof UpdateProductBodySchema>;
  }>("/:id", {
    schema: {
      params: ProductParamsSchema,
      body: UpdateProductBodySchema,
    },
    preHandler: requireUser,
  }, async (request) => {
    const product = await fastify.repos.product.findById(request.params.id);

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    return fastify.repos.product.update(request.params.id, request.body);
  });
}
