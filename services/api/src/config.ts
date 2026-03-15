import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  TEMPORAL_ADDRESS: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().url(),
  DASHBOARD_URL: z.string().url(),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("0.0.0.0"),
});

export type Config = z.infer<typeof envSchema>;

export const config: Config = envSchema.parse(process.env);
