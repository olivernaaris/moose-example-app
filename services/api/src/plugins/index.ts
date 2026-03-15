import type { FastifyInstance } from "fastify";
import corsPlugin from "./cors.plugin.js";
import prismaPlugin from "./prisma.plugin.js";
import authPlugin from "./auth.plugin.js";
import temporalPlugin from "./temporal.plugin.js";

export async function registerPlugins(fastify: FastifyInstance): Promise<void> {
  await fastify.register(corsPlugin);
  await fastify.register(prismaPlugin);
  await fastify.register(authPlugin);
  await fastify.register(temporalPlugin);
}
