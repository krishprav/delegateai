import { Registry, Counter, Histogram, Gauge } from "prom-client";

export const register = new Registry();

export const workflowExecutionCounter = new Counter({
  name: "workflow_executions_total",
  help: "Total number of workflow executions",
  labelNames: ["status", "workflow_id", "triggered_by"],
  registers: [register],
});

export const workflowExecutionDuration = new Histogram({
  name: "workflow_execution_duration_seconds",
  help: "Duration of workflow executions in seconds",
  labelNames: ["workflow_id", "status"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120],
  registers: [register],
});

export const activeWorkflowsGauge = new Gauge({
  name: "active_workflows_count",
  help: "Number of currently active workflows",
  registers: [register],
});

export const queueJobsCounter = new Counter({
  name: "queue_jobs_total",
  help: "Total number of jobs added to queue",
  labelNames: ["queue_name", "status"],
  registers: [register],
});

export const queueProcessingDuration = new Histogram({
  name: "queue_processing_duration_seconds",
  help: "Time taken to process queue jobs",
  labelNames: ["queue_name"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

export const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const actionExecutionCounter = new Counter({
  name: "action_executions_total",
  help: "Total number of action executions",
  labelNames: ["action_type", "status"],
  registers: [register],
});

export const actionExecutionDuration = new Histogram({
  name: "action_execution_duration_seconds",
  help: "Duration of action executions in seconds",
  labelNames: ["action_type"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

export const eventPublishCounter = new Counter({
  name: "events_published_total",
  help: "Total number of events published",
  labelNames: ["event_type"],
  registers: [register],
});
