import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { getPrisma } from "../lib/prisma.js";
import { createRepositories } from "@moose-example/database";
import { config } from "../config.js";

export default fp(
  async function prismaPlugin(fastify: FastifyInstance) {
    const prisma = getPrisma(config.DATABASE_URL);

    await prisma.$connect();
    fastify.log.info("Prisma connected to database");

    const repos = createRepositories(prisma);

    fastify.decorate("db", prisma);
    fastify.decorate("repos", repos);

    fastify.addHook("onClose", async () => {
      await prisma.$disconnect();
      fastify.log.info("Prisma disconnected from database");
    });
  },
  { name: "prisma" },
);
