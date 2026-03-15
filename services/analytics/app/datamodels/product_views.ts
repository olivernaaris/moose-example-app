import { Key, IngestPipeline } from "@514labs/moose-lib";

export interface ProductView {
  viewId: Key<string>;
  productId: string;
  userId: string;
  timestamp: Date;
}

export const ProductViewPipeline = new IngestPipeline<ProductView>("ProductView", {
  table: true,
  stream: true,
  ingestApi: false,
});
