import { Key } from "@514labs/moose-lib";

export interface ProductView {
  viewId: Key<string>;
  productId: string;
  userId: string;
  timestamp: Date;
}

export const PRODUCT_VIEWS_TABLE = "ProductView_0_0";

export const PRODUCT_VIEWS_COLUMNS = [
  "viewId",
  "productId",
  "userId",
  "timestamp",
] as const;
