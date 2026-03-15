import { ExampleTemporalClient } from "@moose-example/temporal-client";
import { config } from "../config.js";

export function createTemporalClient(): ExampleTemporalClient {
  return new ExampleTemporalClient(config.TEMPORAL_ADDRESS);
}
