const MOOSE_INGEST_URL =
  process.env.MOOSE_INGEST_URL ?? "http://localhost:4000";

export async function ingestEvent<T>(
  endpoint: string,
  data: T,
): Promise<void> {
  const res = await fetch(`${MOOSE_INGEST_URL}/ingest/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to ingest event to ${endpoint}: ${res.status} ${res.statusText}`,
    );
  }
}
