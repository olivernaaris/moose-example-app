import { ApiError, NetworkError } from "./errors.js";

export async function client<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const baseUrl =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001")
      : (process.env.API_URL ?? "http://localhost:3001");

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        res.status,
        (body as Record<string, string>).message ?? "Request failed",
        body,
      );
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new NetworkError("Network request failed", error);
  }
}
