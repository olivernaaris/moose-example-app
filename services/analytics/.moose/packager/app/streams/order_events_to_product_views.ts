import { StreamFunction } from "@514labs/moose-lib";

interface OrderEvent {
  eventId: string;
  orderId: string;
  userId: string;
  action: string;
  totalAmount: number;
  itemCount: number;
  timestamp: Date;
}

interface ProductView {
  viewId: string;
  productId: string;
  userId: string;
  timestamp: Date;
}

const stream: StreamFunction<OrderEvent, ProductView> = (event) => {
  if (event.action === "viewed_product") {
    return {
      viewId: event.eventId,
      productId: event.orderId,
      userId: event.userId,
      timestamp: event.timestamp,
    };
  }
  return null;
};

export default stream;
