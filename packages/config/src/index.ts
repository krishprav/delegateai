import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../..", ".env") });

export interface AppConfig {
  backend: {
    port: number;
    frontendUrl: string;
    publicApiUrl: string;
  };
  engine: {
    metricsPort: number;
  };
  auth: {
    accessTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenSecret: string;
    refreshTokenExpiry: string;
    googleClientId: string;
    googleClientSecret: string;
  };
  redis: {
    url: string;
  };
  database: {
    url: string;
  };
  monitoring: {
    otelEndpoint: string;
    lokiUrl?: string;
    logLevel: string;
  };
  websocket: {
    port: number;
  };
  nodeEnv: string;
}

const config: AppConfig = {
  backend: {
    port: parseInt(process.env.PORT || process.env.BACKEND_PORT || "3000", 10),
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    publicApiUrl: process.env.PUBLIC_API_URL || "http://localhost:8080",
  },
  engine: {
    metricsPort: parseInt(process.env.ENGINE_METRICS_PORT || "3001", 10),
  },
  auth: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "",
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  database: {
    url: process.env.DATABASE_URL || "postgresql://nen_user:nen_password@localhost:5432/nen_db",
  },
  monitoring: {
    otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
    lokiUrl: process.env.LOKI_URL,
    logLevel: process.env.LOG_LEVEL || "info",
  },
  websocket: {
    port: parseInt(process.env.WS_PORT || "3002", 10),
  },
  nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
