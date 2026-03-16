import pino from "pino";

const logger = pino({
  name: "api",
  level: "info",
});

/**
 * Create a child logger with additional context bindings.
 *
 * @example
 *   const log = getChildLogger({ script: "db:seed" });
 *   log.info("Starting seed");
 */
export function getChildLogger(bindings: Record<string, string>) {
  return logger.child(bindings);
}

export default logger;
