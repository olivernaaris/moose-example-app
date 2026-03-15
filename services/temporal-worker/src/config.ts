export const config = {
  databaseUrl:
    process.env["DATABASE_URL"] ??
    "postgresql://postgres:postgres@localhost:5432/moose_example",
  temporalAddress: process.env["TEMPORAL_ADDRESS"] ?? "localhost:7233",
} as const;
