import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  request.log.error(error, "Request error");

  if (error instanceof z.ZodError) {
    reply.status(400).send({
      message: "Validation error",
      statusCode: 400,
      issues: error.issues,
    });
    return;
  }

  if (error instanceof ApiError) {
    reply.status(error.statusCode).send({
      message: error.message,
      statusCode: error.statusCode,
    });
    return;
  }

  if (error.validation) {
    reply.status(400).send({
      message: "Validation error",
      statusCode: 400,
      issues: error.validation,
    });
    return;
  }

  const statusCode = error.statusCode ?? 500;
  reply.status(statusCode).send({
    message: statusCode >= 500 ? "Internal server error" : error.message,
    statusCode,
  });
}
