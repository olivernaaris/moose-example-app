import { Key, OlapTable } from "@514labs/moose-lib";

interface ProductView {
  viewId: Key<string>;
  productId: string;
  userId: string;
  timestamp: Date;
}

export default OlapTable<ProductView>("ProductView", {
  orderByFields: ["viewId"],
});
