import { PrismaClient } from "@moose-example/database";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { config } from "../config.js";

let prismaInstance: PrismaClient | null = null;
let pool: pg.Pool | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    pool = new pg.Pool({ connectionString: config.databaseUrl });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaPg(pool as any);
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
  if (pool) {
    await pool.end();
    pool = null;
  }
}
