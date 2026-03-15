import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { config } from "../config.js";

export default fp(
  async function corsPlugin(fastify: FastifyInstance) {
    await fastify.register(cors, {
      origin: config.DASHBOARD_URL,
      credentials: true,
    });

    fastify.log.info("CORS plugin registered");
  },
  { name: "cors" },
);
