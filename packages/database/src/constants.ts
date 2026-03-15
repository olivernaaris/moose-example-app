import { uuidv7 } from "uuidv7";

/**
 * Generate a UUIDv7 identifier.
 * All IDs in the application are generated in application code (repository layer),
 * never by the database.
 */
export function generateId(): string {
  return uuidv7();
}
