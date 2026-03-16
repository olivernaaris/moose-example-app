import { NativeConnection, Worker, bundleWorkflowCode } from "@temporalio/worker";
import pino from "pino";
import { createRepositories } from "@moose-example/database";
import { ExampleTemporalClient } from "@moose-example/temporal-client";
import { createActivities } from "@moose-example/temporal-worker";
import { config } from "./config.js";
import { getPrisma, disconnectPrisma } from "./lib/prisma.js";

const logger = pino({ name: "temporal-worker" });

const TASK_QUEUE = "example-task-queue";

async function run(): Promise<void> {
  logger.info("Bundling workflow code...");
  const workflowBundle = await bundleWorkflowCode({
    workflowsPath: new URL("./workflows.js", import.meta.url).pathname,
  });

  logger.info({ address: config.temporalAddress }, "Connecting to Temporal server...");
  const connection = await NativeConnection.connect({
    address: config.temporalAddress,
  });

  const prisma = getPrisma();
  const repos = createRepositories(prisma);
  const temporalClient = new ExampleTemporalClient(config.temporalAddress);

  const activities = createActivities({ repos, temporalClient });

  const worker = await Worker.create({
    connection,
    namespace: "default",
    taskQueue: TASK_QUEUE,
    workflowBundle,
    activities,
  });

  logger.info({ taskQueue: TASK_QUEUE }, "Worker created, starting to poll...");

  const shutdown = async (): Promise<void> => {
    logger.info("Shutting down worker...");
    worker.shutdown();
    await temporalClient.close();
    await disconnectPrisma();
    logger.info("Worker shut down gracefully");
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());

  await worker.run();
}

run().catch((err: unknown) => {
  logger.fatal({ err }, "Worker failed to start");
  process.exit(1);
});
