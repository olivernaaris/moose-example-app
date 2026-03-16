import { IngestPipeline } from "@514labs/moose-lib";
import { OrderEvent } from "@moose-example/analytics-client";

export type { OrderEvent };

export const OrderEventPipeline = new IngestPipeline<OrderEvent>("OrderEvent", {
  table: true,
  stream: true,
  ingestApi: true,
});
