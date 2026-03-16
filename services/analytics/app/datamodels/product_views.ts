import { IngestPipeline } from "@514labs/moose-lib";
import { ProductView } from "@moose-example/analytics-client";

export type { ProductView };

export const ProductViewPipeline = new IngestPipeline<ProductView>("ProductView", {
  table: true,
  stream: true,
  ingestApi: false,
});
