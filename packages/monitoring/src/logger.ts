import winston from "winston";
import LokiTransport from "winston-loki";
import appConfig from "@delegate/config";

export interface LoggerConfig {
  serviceName: string;
  lokiUrl?: string;
  environment?: string;
  logLevel?: string;
}

const isDevelopment = appConfig.nodeEnv !== "production";

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, service, correlationId, ...meta }) => {
    let log = `${timestamp} [${service}] ${level}: ${message}`;
    if (correlationId) {
      log += ` [CID: ${correlationId}]`;
    }
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

const lokiFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

export function createLogger(config: LoggerConfig) {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: consoleFormat,
      level: isDevelopment ? "debug" : "info",
    }),
  ];

  const lokiUrl = config.lokiUrl || appConfig.monitoring.lokiUrl;
  if (lokiUrl) {
    transports.push(
      new LokiTransport({
        host: lokiUrl,
        labels: { 
          app: config.serviceName, 
          environment: config.environment || appConfig.nodeEnv
        },
        format: lokiFormat,
        json: true,
        batching: true,
        interval: 5,
      })
    );
  }

  return winston.createLogger({
    level: config.logLevel || appConfig.monitoring.logLevel,
    defaultMeta: { service: config.serviceName },
    transports,
  });
}
