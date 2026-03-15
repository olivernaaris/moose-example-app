import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

let instance: PrismaClient | null = null;

export function getPrisma(databaseUrl: string): PrismaClient {
  if (!instance) {
    const pool = new Pool({ connectionString: databaseUrl });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaPg(pool as any);
    instance = new PrismaClient({ adapter });
  }
  return instance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    if (!instance) {
      throw new Error("Prisma not initialized. Call getPrisma() first.");
    }
    return instance[prop as keyof PrismaClient];
  },
});
