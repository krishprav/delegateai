import { prisma } from "@delegate/db";
import { createLogger } from "@delegate/monitoring";

const logger = createLogger({ serviceName: "nen-backend" });

export class ExecutionService {
  async getUserExecutions(
    userId: string,
    filters: {
      status?: string;
      workflowId?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const { status, workflowId, limit = 50, offset = 0 } = filters;

    const where: any = { userId };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (workflowId) {
      where.workflowId = workflowId;
    }

    const executions = await prisma.workflowExecution.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        workflowId: true,
        workflowName: true,
        status: true,
        triggeredBy: true,
        startedAt: true,
        finishedAt: true,
        duration: true,
        error: true,
        workflow: {
          select: {
            active: true,
          },
        },
      },
    });

    const total = await prisma.workflowExecution.count({ where });

    logger.info("Executions retrieved", {
      userId,
      count: executions.length,
      total,
      filters: { status, workflowId },
    });

    return {
      executions,
      total,
      limit,
      offset,
    };
  }

  async getExecutionDetails(executionId: string, userId: string) {
    const execution = await prisma.workflowExecution.findFirst({
      where: {
        id: executionId,
        userId,
      },
    });

    if (!execution) {
      return null;
    }

    logger.info("Execution details retrieved", { executionId, userId });

    return execution;
  }

  async getExecutionStats(userId: string, filters: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = filters;

    const where: any = { userId };

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = startDate;
      if (endDate) where.startedAt.lte = endDate;
    }

    const totalExecutions = await prisma.workflowExecution.count({ where });

    const statusCounts = await prisma.workflowExecution.groupBy({
      by: ["status"],
      where,
      _count: {
        status: true,
      },
    });

    const avgDuration = await prisma.workflowExecution.aggregate({
      where: {
        ...where,
        status: "SUCCESS",
        duration: { not: null },
      },
      _avg: {
        duration: true,
      },
    });

    const topWorkflows = await prisma.workflowExecution.groupBy({
      by: ["workflowId", "workflowName"],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    });

    logger.info("Execution stats retrieved", { userId, totalExecutions });

    return {
      totalExecutions,
      statusCounts,
      avgDuration: avgDuration._avg.duration,
      topWorkflows,
    };
  }
}

export const executionService = new ExecutionService();
