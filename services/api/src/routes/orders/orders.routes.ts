import { z } from "zod/v4";
import type { FastifyInstance } from "fastify";
import { requireUser } from "../../middleware/auth.middleware.js";
import { ApiError } from "../../middleware/error-handler.js";

const CreateOrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const CreateOrderBodySchema = z.object({
  items: z.array(CreateOrderItemSchema).min(1),
});

const OrderParamsSchema = z.object({
  id: z.string(),
});

const UpdateOrderBodySchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

const ListOrdersQuerySchema = z.object({
  skip: z.coerce.number().int().nonnegative().optional(),
  take: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
});

export async function ordersRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("preHandler", requireUser);

  // POST / — Create order
  fastify.post<{
    Body: z.infer<typeof CreateOrderBodySchema>;
  }>("/", {
    schema: {
      body: CreateOrderBodySchema,
    },
  }, async (request, reply) => {
    const userId = request.user!.id;
    const { items } = request.body;

    // Look up product prices and calculate total
    const productIds = items.map((item) => item.productId);
    const products = await Promise.all(
      productIds.map((id) => fastify.repos.product.findById(id)),
    );

    const orderItems = items.map((item, index) => {
      const product = products[index];
      if (!product) {
        throw new ApiError(`Product not found: ${item.productId}`, 404);
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price.toNumber(),
      };
    });

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await fastify.repos.order.create({
      userId,
      total,
      items: orderItems,
    });

    // Trigger order processing workflow
    try {
      await fastify.temporal.startProcessOrder(order.id);
      request.log.info({ orderId: order.id }, "Order processing workflow started");
    } catch (err) {
      request.log.error(err, "Failed to start order processing workflow");
    }

    return reply.status(201).send(order);
  });

  // GET / — List user's orders
  fastify.get<{
    Querystring: z.infer<typeof ListOrdersQuerySchema>;
  }>("/", {
    schema: {
      querystring: ListOrdersQuerySchema,
    },
  }, async (request) => {
    const userId = request.user!.id;
    return fastify.repos.order.list({
      userId,
      skip: request.query.skip,
      take: request.query.take,
      status: request.query.status,
    });
  });

  // GET /:id — Get single order
  fastify.get<{
    Params: z.infer<typeof OrderParamsSchema>;
  }>("/:id", {
    schema: {
      params: OrderParamsSchema,
    },
  }, async (request) => {
    const order = await fastify.repos.order.findById(request.params.id);

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    if (order.userId !== request.user!.id) {
      throw new ApiError("Forbidden", 403);
    }

    return order;
  });

  // PATCH /:id — Update order status
  fastify.patch<{
    Params: z.infer<typeof OrderParamsSchema>;
    Body: z.infer<typeof UpdateOrderBodySchema>;
  }>("/:id", {
    schema: {
      params: OrderParamsSchema,
      body: UpdateOrderBodySchema,
    },
  }, async (request) => {
    const order = await fastify.repos.order.findById(request.params.id);

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    if (order.userId !== request.user!.id) {
      throw new ApiError("Forbidden", 403);
    }

    return fastify.repos.order.update(request.params.id, {
      status: request.body.status,
    });
  });
}
