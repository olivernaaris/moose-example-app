import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { createTemporalClient } from "../lib/temporal.js";

export default fp(
  async function temporalPlugin(fastify: FastifyInstance) {
    const temporal = createTemporalClient();

    fastify.decorate("temporal", temporal);
    fastify.log.info("Temporal client plugin registered");

    fastify.addHook("onClose", async () => {
      await temporal.close();
      fastify.log.info("Temporal client disconnected");
    });
  },
  { name: "temporal" },
);
