import { prisma } from "@delegate/db";
import { WorkflowSchema } from "@delegate/workflow";
import { createRedisClient } from "@delegate/redis";
import { workflowQueue } from "@delegate/queue";
import { v4 as uuidv4 } from "uuid";
import { createLogger, queueJobsCounter, workflowExecutionCounter } from "@delegate/monitoring";

const logger = createLogger({ serviceName: "nen-backend" });
const publisherRedis = createRedisClient();

const connectRedis = async () => {
  try {
    await publisherRedis.connect();
    logger.info("Redis connected successfully in workflow service");
  } catch (error) {
    logger.error("Redis connection failed", { error });
  }
};
connectRedis();

export class WorkflowService {
  async createWorkflow(userId: string, workflowData: any) {
    const parsed = WorkflowSchema.parse(workflowData);

    const savedWorkflow = await prisma.workflow.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        active: parsed.active,
        nodes: parsed.nodes,
        edges: parsed.edges,
        userId,
        tags: [],
      },
    });

    logger.info("Workflow saved successfully", {
      workflowId: savedWorkflow.id,
      userId,
    });

    try {
      await publisherRedis.publish(
        "workflow:schedule:refresh",
        JSON.stringify({ workflowId: savedWorkflow.id })
      );
    } catch (error) {
      logger.warn("Failed to publish schedule refresh event", {
        error,
        workflowId: savedWorkflow.id,
      });
    }

    return {
      workflowId: savedWorkflow.id,
      name: savedWorkflow.name,
      active: savedWorkflow.active,
      createdAt: savedWorkflow.createdAt,
    };
  }

  async getWorkflowById(workflowId: string, userId: string) {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId,
      },
    });

    if (!workflow) {
      return null;
    }

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      active: workflow.active,
      nodes: workflow.nodes,
      edges: workflow.edges,
      tags: workflow.tags,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };
  }

  async updateWorkflow(workflowId: string, userId: string, workflowData: any) {
    const parsed = WorkflowSchema.parse(workflowData);

    const updatedWorkflow = await prisma.workflow.update({
      where: {
        id: workflowId,
        userId,
      },
      data: {
        name: parsed.name,
        description: parsed.description,
        active: parsed.active,
        nodes: parsed.nodes,
        edges: parsed.edges,
        updatedAt: new Date(),
      },
    });

    logger.info("Workflow updated successfully", { workflowId: updatedWorkflow.id });

    try {
      await publisherRedis.publish(
        "workflow:schedule:refresh",
        JSON.stringify({ workflowId: updatedWorkflow.id })
      );
    } catch (error) {
      logger.warn("Failed to publish schedule refresh event", { error, workflowId });
    }

    return {
      workflowId: updatedWorkflow.id,
      name: updatedWorkflow.name,
      active: updatedWorkflow.active,
      updatedAt: updatedWorkflow.updatedAt,
    };
  }

  async getUserWorkflows(userId: string) {
    const workflows = await prisma.workflow.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        active: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        nodes: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return workflows;
  }

  async executeWorkflow(workflowId: string, userId: string, metadata: any) {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId,
      },
    });

    if (!workflow) {
      throw new Error("Workflow not found");
    }

    const executionId = uuidv4();

    const executionJob = {
      executionId,
      workflowId: workflow.id,
      userId,
      triggeredBy: "manual",
      triggeredAt: new Date().toISOString(),
      workflow: {
        id: workflow.id,
        name: workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
        active: workflow.active,
      },
      status: "queued",
      priority: "normal",
      metadata,
    };

    await workflowQueue.add("execute-workflow", executionJob, {
      jobId: executionId,
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });

    queueJobsCounter.inc({ queue_name: "workflow:execution", status: "queued" });
    workflowExecutionCounter.inc({
      status: "queued",
      workflow_id: workflow.id,
      triggered_by: "manual",
    });

    await publisherRedis.hSet(`execution:${executionId}`, {
      status: "queued",
      createdAt: new Date().toISOString(),
      workflowId,
      userId,
    });

    await publisherRedis.expire(`execution:${executionId}`, 86400);

    logger.info("Workflow queued for execution", { workflowId, executionId });

    return {
      executionId,
      workflowId,
      status: "queued",
      estimatedStartTime: "within 30 seconds",
    };
  }

  async deleteWorkflow(workflowId: string, userId: string) {
    const deletedWorkflow = await prisma.workflow.update({
      where: {
        id: workflowId,
        userId,
      },
      data: {
        deletedAt: new Date(),
        active: false,
      },
    });

    return deletedWorkflow;
  }
}

export const workflowService = new WorkflowService();
