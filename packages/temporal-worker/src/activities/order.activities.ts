import type { OrderStatus } from "@moose-example/database";

export interface OrderActivities {
  validateOrder(orderId: string): Promise<void>;
  processPayment(orderId: string): Promise<void>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  sendOrderConfirmation(orderId: string): Promise<void>;
}
