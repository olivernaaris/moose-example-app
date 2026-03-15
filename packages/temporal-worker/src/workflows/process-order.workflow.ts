import { proxyActivities } from "@temporalio/workflow";
import type { OrderActivities } from "../activities/order.activities.js";

const { validateOrder, processPayment, updateOrderStatus, sendOrderConfirmation } =
  proxyActivities<OrderActivities>({
    startToCloseTimeout: "30 seconds",
    retry: { maximumAttempts: 3 },
  });

interface ProcessOrderInput {
  orderId: string;
}

export async function processOrder(input: ProcessOrderInput): Promise<void> {
  await validateOrder(input.orderId);
  await updateOrderStatus(input.orderId, "PROCESSING");
  await processPayment(input.orderId);
  await sendOrderConfirmation(input.orderId);
  await updateOrderStatus(input.orderId, "SHIPPED");
}
