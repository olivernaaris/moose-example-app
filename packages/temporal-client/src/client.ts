import { Client, Connection } from "@temporalio/client";
import { uuidv7 } from "uuidv7";

const TASK_QUEUE = "example-task-queue";

export class ExampleTemporalClient {
  private client: Client | null = null;
  private connection: Connection | null = null;

  constructor(private readonly address: string) {}

  private async getClient(): Promise<Client> {
    if (!this.client) {
      this.connection = await Connection.connect({ address: this.address });
      this.client = new Client({ connection: this.connection });
    }
    return this.client;
  }

  async startProcessOrder(orderId: string): Promise<string> {
    const client = await this.getClient();
    const workflowId = `process-order-${uuidv7()}`;
    await client.workflow.start("processOrder", {
      taskQueue: TASK_QUEUE,
      workflowId,
      args: [{ orderId }],
    });
    return workflowId;
  }

  async close(): Promise<void> {
    this.connection?.close();
  }
}
