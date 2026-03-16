/**
 * API database reset script
 *
 * Run with: pnpm db:reset
 *
 * Options:
 *   --force, -f    Skip confirmation prompt (for CI/automation)
 *
 * Truncates all tables in the public schema with CASCADE.
 */

import * as readline from "node:readline/promises";
import { config } from "../src/config.js";
import { getChildLogger } from "../src/lib/logger.js";
import { getPrisma } from "../src/lib/prisma.js";

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const answer = await rl.question(`${message} [y/N] `);
    return answer.trim().toLowerCase() === "y";
  } finally {
    rl.close();
  }
}

async function main() {
  const log = getChildLogger({ script: "db:reset" });
  const force = process.argv.includes("--force") || process.argv.includes("-f");

  if (!force) {
    const confirmed = await confirm(
      "This will DELETE ALL DATA in the database. Are you sure?",
    );
    if (!confirmed) {
      log.info("Reset cancelled");
      process.exit(0);
    }
  }

  log.info("Starting database reset");
  const prisma = getPrisma(config.DATABASE_URL);

  await prisma.$executeRawUnsafe(
    `DO $$ DECLARE
       r RECORD;
     BEGIN
       FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
         EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
       END LOOP;
     END $$;`,
  );

  log.info("Database reset completed — all tables truncated");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Database reset failed:", e);
  process.exit(1);
});
