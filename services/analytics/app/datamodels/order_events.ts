import { Key, IngestPipeline } from "@514labs/moose-lib";

export interface OrderEvent {
  eventId: Key<string>;
  orderId: string;
  userId: string;
  action: string;
  totalAmount: number;
  itemCount: number;
  timestamp: Date;
}

export const OrderEventPipeline = new IngestPipeline<OrderEvent>("OrderEvent", {
  table: true,
  stream: true,
  ingestApi: true,
});
