import { Key } from "@514labs/moose-lib";

export interface OrderEvent {
  eventId: Key<string>;
  orderId: string;
  userId: string;
  action: string; // 'created' | 'updated' | 'cancelled' | 'shipped' | 'delivered'
  totalAmount: number;
  itemCount: number;
  timestamp: Date;
}

export const ORDER_EVENTS_TABLE = "OrderEvent_0_0";

export const ORDER_EVENTS_COLUMNS = [
  "eventId",
  "orderId",
  "userId",
  "action",
  "totalAmount",
  "itemCount",
  "timestamp",
] as const;
