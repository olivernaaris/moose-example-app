import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { registerPlugins } from "./plugins/index.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import "./types/index.js";

export async function createApp() {
  const fastify = Fastify({
    logger: true,
  });

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await registerPlugins(fastify);

  fastify.setErrorHandler(errorHandler);

  await registerRoutes(fastify);

  return fastify;
}
