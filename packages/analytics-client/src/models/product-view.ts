import type { Key, DateTime64 } from "@514labs/moose-lib";
import type { tags } from "typia";

/**
 * Product Views Data Model
 *
 * Records individual product view events. Derived from order events via
 * a stream transform that filters for 'viewed_product' actions and maps
 * them into this schema for dedicated product analytics.
 */
export interface ProductView {
  /**
   * Primary key. UUIDv4 uniquely identifying this product view event.
   * Sourced from the originating order event's event_id.
   */
  view_id: Key<string> & tags.Format<"uuid">;
  /**
   * Product that was viewed. Links to the product dimension for
   * join-based enrichment (name, category, price).
   */
  product_id: string;
  /**
   * User who viewed the product. Links to the user dimension for
   * user-level product affinity analysis.
   */
  user_id: string;
  /**
   * Timestamp of when the product was viewed, with millisecond precision.
   * Use for time-series bucketing, recency scoring, and session analysis.
   */
  timestamp: DateTime64<3>;
}

// Table name constant for queries
export const PRODUCT_VIEWS_TABLE = "ProductView_0_0" as const;

// Column name constants for type-safe queries
// TypeScript ensures all interface keys are present and no extra keys exist
export const PRODUCT_VIEWS_COLUMNS = {
  view_id: "view_id",
  product_id: "product_id",
  user_id: "user_id",
  timestamp: "timestamp",
} as const satisfies Record<keyof ProductView, string>;
