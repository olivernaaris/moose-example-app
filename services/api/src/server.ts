import { config } from "./config.js";
import { createApp } from "./bootstrap.js";

async function main() {
  const app = await createApp();

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  try {
    await app.listen({ host: config.HOST, port: config.PORT });
    app.log.info(
      `Server listening on http://${config.HOST}:${config.PORT}`,
    );
  } catch (err) {
    app.log.error(err, "Failed to start server");
    process.exit(1);
  }
}

main();
