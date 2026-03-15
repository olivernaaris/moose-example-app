import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createAuth } from "../lib/auth.js";

export let auth: ReturnType<typeof createAuth>;

export default fp(
  async function authPlugin(fastify: FastifyInstance) {
    auth = createAuth(fastify.db);

    fastify.route({
      method: ["GET", "POST"],
      url: "/api/auth/*",
      handler: async (request: FastifyRequest, reply: FastifyReply) => {
        const url = new URL(
          request.url,
          `${request.protocol}://${request.hostname}`,
        );

        const headers = new Headers();
        for (const [key, value] of Object.entries(request.headers)) {
          if (value) {
            if (Array.isArray(value)) {
              for (const v of value) {
                headers.append(key, v);
              }
            } else {
              headers.set(key, value);
            }
          }
        }

        const webRequest = new Request(url.toString(), {
          method: request.method,
          headers,
          body:
            request.method !== "GET" && request.method !== "HEAD"
              ? JSON.stringify(request.body)
              : undefined,
        });

        const response = await auth.handler(webRequest);

        reply.status(response.status);

        response.headers.forEach((value, key) => {
          reply.header(key, value);
        });

        const body = await response.text();
        return reply.send(body);
      },
    });

    fastify.log.info("Better Auth plugin registered at /api/auth/*");
  },
  {
    name: "auth",
    dependencies: ["prisma"],
  },
);
