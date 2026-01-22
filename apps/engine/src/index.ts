import { startTracing, createLogger, queueJobsCounter, queueProcessingDuration, activeWorkflowsGauge } from "@delegate/monitoring";
import config from "@delegate/config";
startTracing("nen-engine");

import "./config/metricsServer";

import { Workflow } from "./workers/workflow";
import { Worker } from "bullmq";
import { trace } from "@delegate/monitoring";

const logger = createLogger({ serviceName: "nen-engine" });

export const createChildLogger = (executionId: string) => {
  return logger.child({ executionId });
};
import { scheduleService } from "./services/scheduleService";
import { createAIWorker } from "./workers/ai-worker";
import { prisma } from "@delegate/db";

const tracer = trace.getTracer("nen-engine");

import { getRedisConfig } from "@delegate/redis";
const redisConfig = getRedisConfig();

const worker = new Worker(
  "workflow-execution",
  async (job) => {
    const span = tracer.startSpan("workflow.execute");
    const start = Date.now();
    activeWorkflowsGauge.inc();
    const exectionData = job.data;
    const jobLogger = createChildLogger(exectionData.executionId);

    try {
      await prisma.workflowExecution.create({
        data: {
          id: exectionData.executionId,
          workflowId: exectionData.workflow.id,
          workflowName: exectionData.workflow.name,
          userId: exectionData.userId,
          status: "RUNNING",
          triggeredBy: exectionData.triggeredBy,
          metadata: exectionData.metadata || {},
          nodeResults: [],
        },
      });

      jobLogger.info("Starting workflow execution", {
        workflowId: exectionData.workflow.id,
        workflowName: exectionData.workflow.name,
        triggeredBy: exectionData.triggeredBy,
      });

      span.setAttributes({
        "workflow.id": exectionData.workflow.id,
        "workflow.name": exectionData.workflow.name,
        "execution.id": exectionData.executionId,
      });

      const workflowObj = new Workflow(exectionData);

      workflowObj.buildGraph();
      if (workflowObj.detectCycle()) {
        jobLogger.error("Cycle detected in workflow", { workflowId: exectionData.workflow.id });
        span.recordException(new Error("Cycle detected"));
        span.end();
        queueJobsCounter.inc({ queue_name: "workflow:execution", status: "failed" });
        activeWorkflowsGauge.dec();
        return;
      }
      workflowObj.getExecutionOrder();

      jobLogger.info("Executing workflow", { workflowId: exectionData.workflow.id });
      await workflowObj.execute();

      const duration = Date.now() - start;

      await prisma.workflowExecution.update({
        where: { id: exectionData.executionId },
        data: {
          status: "COMPLETED",
          finishedAt: new Date(),
          duration: duration,
          nodeResults: Array.from(workflowObj.nodeOutputs.entries()).map(([nodeId, output]) => ({
            nodeId,
            status: "completed",
            output,
            executedAt: new Date(),
          })),
        },
      });

      queueProcessingDuration.observe({ queue_name: "workflow:execution" }, duration / 1000);
      queueJobsCounter.inc({ queue_name: "workflow:execution", status: "completed" });
      jobLogger.info("Workflow execution completed", {
        workflowId: exectionData.workflow.id,
        duration: duration / 1000
      });
      span.setStatus({ code: 1 });
      span.end();
    } catch (error: any) {
      try {
        await prisma.workflowExecution.update({
          where: { id: exectionData.executionId },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            duration: Date.now() - start,
            error: error.message || String(error),
          },
        });
      } catch (dbError) {
        jobLogger.error("Failed to update execution record", { error: dbError });
      }

      jobLogger.error("Workflow execution failed", {
        workflowId: exectionData.workflow.id,
        error: error.message,
        stack: error.stack
      });
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      span.end();
      queueJobsCounter.inc({ queue_name: "workflow:execution", status: "failed" });
      throw error;
    } finally {
      activeWorkflowsGauge.dec();
    }
  },
  {
    connection: {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      tls: redisConfig.tls,
    },
  }
);

worker.on("completed", (job) => {
  logger.info("Job completed", { jobId: job.id });
});

worker.on("failed", (job, err) => {
  logger.error("Job failed", { jobId: job?.id, error: err.message });
});

const aiWorker = createAIWorker({
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password,
  tls: redisConfig.tls,
});

logger.info("AI worker started");

scheduleService.initialize().catch((error) => {
  logger.error("Failed to initialize schedule service:", error);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  scheduleService.shutdown();
  worker.close();
  aiWorker.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  scheduleService.shutdown();
  worker.close();
  aiWorker.close();
  process.exit(0);
});

logger.info("Workflow engine worker started");
