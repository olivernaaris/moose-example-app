import { Key, OlapTable } from "@514labs/moose-lib";

interface OrderEvent {
  eventId: Key<string>;
  orderId: string;
  userId: string;
  action: string;
  totalAmount: number;
  itemCount: number;
  timestamp: Date;
}

export default OlapTable<OrderEvent>("OrderEvent", {
  orderByFields: ["eventId"],
});
