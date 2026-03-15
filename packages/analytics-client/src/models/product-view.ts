export interface ProductView {
  viewId: string;
  productId: string;
  userId: string;
  timestamp: string; // DateTime64(3)
}

export const PRODUCT_VIEWS_TABLE = "ProductView_0_0";

export const PRODUCT_VIEWS_COLUMNS = [
  "viewId",
  "productId",
  "userId",
  "timestamp",
] as const;
