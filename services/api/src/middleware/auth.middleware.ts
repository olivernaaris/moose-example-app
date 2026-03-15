import type { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../plugins/auth.plugin.js";

export async function requireUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
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
    method: "GET",
    headers,
  });

  const session = await auth.api.getSession({
    headers: webRequest.headers,
  });

  if (!session?.user) {
    reply.status(401).send({ message: "Unauthorized", statusCode: 401 });
    return;
  }

  request.user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
