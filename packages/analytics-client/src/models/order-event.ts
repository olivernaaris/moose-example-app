import type {
  Key,
  LowCardinality,
  DateTime64,
  Float64,
  UInt32,
} from "@514labs/moose-lib";
import type { tags } from "typia";

/**
 * Order Events Data Model
 *
 * Captures lifecycle events for orders: creation, updates, cancellation,
 * shipment, and delivery. Each row represents a single state transition
 * for one order.
 */
export interface OrderEvent {
  /**
   * Primary key. UUIDv4 uniquely identifying this order event. Generated
   * at the source and used for deduplication across at-least-once delivery.
   */
  event_id: Key<string> & tags.Format<"uuid">;
  /**
   * Order identifier this event belongs to. All events for the same order
   * share this value, enabling order-level aggregation and timeline queries.
   */
  order_id: string;
  /**
   * User who placed or interacted with the order. Links to the user
   * dimension for join-based enrichment.
   */
  user_id: string;
  /**
   * Order lifecycle action. Stored as LowCardinality for fast GROUP BY
   * and WHERE filtering across the bounded set of possible values:
   * 'created', 'updated', 'cancelled', 'shipped', 'delivered', 'viewed_product'.
   */
  action: string & LowCardinality;
  /**
   * Total monetary amount of the order in the base currency. Stored as
   * Float64 for standard analytics aggregations (sum, avg).
   */
  total_amount: Float64;
  /**
   * Number of line items in the order. Stored as UInt32 to minimize
   * storage overhead for a non-negative count that fits within 4 bytes.
   */
  item_count: UInt32;
  /**
   * Timestamp of when the event occurred, with millisecond precision.
   * Use for time-series bucketing, funnel analysis, and event ordering.
   */
  timestamp: DateTime64<3>;
}

// Table name constant for queries
export const ORDER_EVENTS_TABLE = "OrderEvent_0_0" as const;

// Column name constants for type-safe queries
// TypeScript ensures all interface keys are present and no extra keys exist
export const ORDER_EVENTS_COLUMNS = {
  event_id: "event_id",
  order_id: "order_id",
  user_id: "user_id",
  action: "action",
  total_amount: "total_amount",
  item_count: "item_count",
  timestamp: "timestamp",
} as const satisfies Record<keyof OrderEvent, string>;
