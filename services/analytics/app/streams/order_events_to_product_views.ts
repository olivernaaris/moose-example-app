import { OrderEventPipeline, OrderEvent } from "../datamodels/order_events.js";
import { ProductViewPipeline, ProductView } from "../datamodels/product_views.js";

// Transform order events that are "viewed_product" actions into product view records
OrderEventPipeline.stream!.addTransform(
  ProductViewPipeline.stream!,
  (event: OrderEvent): ProductView | null => {
    if (event.action === "viewed_product") {
      return {
        view_id: event.event_id,
        product_id: event.order_id,
        user_id: event.user_id,
        timestamp: event.timestamp,
      };
    }
    return null;
  },
);
