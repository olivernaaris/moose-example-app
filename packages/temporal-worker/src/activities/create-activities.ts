import type { Repositories, OrderStatus } from "@moose-example/database";
import type { ExampleTemporalClient } from "@moose-example/temporal-client";
import type { OrderActivities } from "./order.activities.js";

interface ActivityDeps {
  repos: Repositories;
  temporalClient: ExampleTemporalClient;
}

export function createActivities(deps: ActivityDeps): OrderActivities {
  return {
    async validateOrder(orderId: string): Promise<void> {
      const order = await deps.repos.order.findById(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }
      if (order.items.length === 0) {
        throw new Error("Order has no items");
      }
    },

    async processPayment(orderId: string): Promise<void> {
      // Simulate payment processing
      const order = await deps.repos.order.findById(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }
      // In a real app, this would call a payment gateway
      await new Promise((resolve) => setTimeout(resolve, 100));
    },

    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
      await deps.repos.order.update(orderId, { status });
    },

    async sendOrderConfirmation(orderId: string): Promise<void> {
      // Simulate sending an email/notification
      const order = await deps.repos.order.findById(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }
      // In a real app, this would send an email
      await new Promise((resolve) => setTimeout(resolve, 50));
    },
  };
}
