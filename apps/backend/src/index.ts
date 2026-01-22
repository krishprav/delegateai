import { startTracing, createLogger, httpRequestCounter, httpRequestDuration } from "@delegate/monitoring";
import config from "@delegate/config";
startTracing("nen-backend");

import cookieParser from "cookie-parser";
import express, { urlencoded } from "express";
import cors from "cors";
import { correlationIdMiddleware } from "./middlewares";

const logger = createLogger({ serviceName: "nen-backend" });

const app = express();
const PORT = config.backend.port;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:80",
  "https://delegateai.krishnapraveen.me",
  "https://delegateai.vercel.app",
  config.backend.frontendUrl
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(correlationIdMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestCounter.inc({ method: req.method, route: req.path, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route: req.path }, duration);
  });
  next();
});

import v1 from "./routes"
import metricsRouter from "./routes/metrics.routes";
import { errorHandler } from "./middlewares/index.js";
import { QueueWorker } from "@delegate/queue";

app.use("/api/v1", v1);
app.use("/", metricsRouter);

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Backend server listening on port ${PORT}`);
});

// Initialize and start the real-time event broadcaster (QueueWorker)
const queueWorker = new QueueWorker({ server });
queueWorker.start().catch((err) => {
  logger.error("Failed to start QueueWorker", { error: err });
});
