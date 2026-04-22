export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  requestId?: string;
  route?: string;
  [key: string]: unknown;
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorDetails = error instanceof Error ? {
      errorMessage: error.message,
      stack: error.stack,
    } : { error };
    log("error", message, { ...context, ...errorDetails });
  },
  debug: (message: string, context?: LogContext) => log("debug", message, context),
};

function log(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  
  const payload = {
    timestamp,
    level,
    message,
    ...context,
  };

  // In a real production system, this could be sent to Datadog/CloudWatch etc.
  const formattedMessage = JSON.stringify(payload);

  switch (level) {
    case "info":
      console.info(formattedMessage);
      break;
    case "warn":
      console.warn(formattedMessage);
      break;
    case "error":
      console.error(formattedMessage);
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production") {
        console.debug(formattedMessage);
      }
      break;
  }
}
