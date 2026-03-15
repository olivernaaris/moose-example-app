import { OrderEventPipeline, OrderEvent } from "../datamodels/order_events.js";
import { ProductViewPipeline, ProductView } from "../datamodels/product_views.js";

// Transform order events that are "viewed_product" actions into product view records
OrderEventPipeline.stream!.addTransform(
  ProductViewPipeline.stream!,
  (event: OrderEvent): ProductView | null => {
    if (event.action === "viewed_product") {
      return {
        viewId: event.eventId,
        productId: event.orderId,
        userId: event.userId,
        timestamp: event.timestamp,
      };
    }
    return null;
  },
);
