import { getMooseUtils, type MooseClient } from "@514labs/moose-lib";

let clientPromise: Promise<MooseClient> | null = null;

/**
 * Returns a MooseClient singleton for type-safe ClickHouse queries.
 *
 * Uses the MooseStack runtime to resolve connection configuration
 * automatically. The client is lazily initialized on first call
 * and cached for subsequent calls.
 *
 * @example
 * ```typescript
 * import { getMooseClient } from "@moose-example/analytics-client";
 * import { sql } from "@514labs/moose-lib";
 *
 * const client = await getMooseClient();
 * const result = await client.query.execute(
 *   sql.statement`SELECT * FROM ${ORDER_EVENTS_TABLE} LIMIT 10`
 * );
 * ```
 */
export async function getMooseClient(): Promise<MooseClient> {
  if (!clientPromise) {
    clientPromise = getMooseUtils().then(({ client }) => client);
  }
  return clientPromise;
}
