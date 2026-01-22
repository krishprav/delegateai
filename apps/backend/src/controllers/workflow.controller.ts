import { ApiResponse, asyncHandler, CustomError } from "@delegate/auth";
import { workflowService } from "../services/index.js";
import { trace, createLogger } from "@delegate/monitoring";

const logger = createLogger({ serviceName: "nen-backend" });

export const createChildLogger = (correlationId: string) => {
  return logger.child({ correlationId });
};

const tracer = trace.getTracer("nen-backend");

export const saveWorkflow = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new CustomError(401, "User not authenticated");

  try {
    const result = await workflowService.createWorkflow(userId, req.body);

    res.status(201).json(
      new ApiResponse(201, "workflow created successfully", result)
    );
  } catch (error) {
    logger.error("Error saving workflow", { error, userId, correlationId: req.correlationId });
    res.status(500).json(new ApiResponse(500, "failed to save workflow", null));
  }
});

export const getWorkflowById = asyncHandler(async (req, res) => {
  const { workflowId } = req.params;
  const userId = req.user?.id;
  if (!userId) throw new CustomError(401, "User not authenticated");
  if (!workflowId) throw new CustomError(400, "Workflow ID is required");

  try {
    const workflow = await workflowService.getWorkflowById(workflowId, userId);

    if (!workflow) {
      return res.status(404).json(new ApiResponse(404, "wf  not found", null));
    }

    res
      .status(200)
      .json(new ApiResponse(200, "wf retrieved successfully", workflow));
  } catch (error) {
    logger.error("Error retrieving wf:", { error });
    res
      .status(500)
      .json(new ApiResponse(500, "Failed to retrieve workflow", null));
  }
});

export const updateWorkflow = asyncHandler(async (req, res) => {
  const { workflowId } = req.params;
  const userId = req.user?.id;
  if (!userId) throw new CustomError(401, "User not authenticated");
  if (!workflowId) throw new CustomError(400, "Workflow ID is required");

  try {
    const result = await workflowService.updateWorkflow(workflowId, userId, req.body);

    res.status(200).json(
      new ApiResponse(200, "Workflow updated successfully", result)
    );
  } catch (error: any) {
    logger.error("Error updating workflow:", { error });

    if (error.code === "P2025") {
      return res
        .status(404)
        .json(new ApiResponse(404, "Workflow not found", null));
    }

    res
      .status(500)
      .json(new ApiResponse(500, "Failed to update workflow", null));
  }
});

export const getUserWorkflows = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new CustomError(401, "User not authenticated");

  try {
    const workflows = await workflowService.getUserWorkflows(userId);

    res
      .status(200)
      .json(
        new ApiResponse(200, "Workflows retrieved successfully", workflows)
      );
  } catch (error) {
    logger.error("Error retrieving workflows:", { error });
    res
      .status(500)
      .json(new ApiResponse(500, "Failed to retrieve workflows", null));
  }
});

export const executeFlow = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId) throw new CustomError(404, "userId Not Found invalid token");

  const { workflowId } = req.params;
  if (!workflowId) throw new CustomError(404, "workflow id not found");

  const span = tracer.startSpan("workflow.queue");

  try {
    const metadata = {
      source: "api",
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    };

    const result = await workflowService.executeWorkflow(workflowId, userId, metadata);

    span.setAttributes({
      "workflow.id": workflowId,
      "execution.id": result.executionId,
      "triggered.by": "manual",
    });

    span.end();

    res.status(200).json(
      new ApiResponse(200, "Workflow queued for execution successfully", result)
    );
  } catch (error) {
    span.end();
    logger.error("Error queuing workflow for execution:", { error });
    throw new CustomError(500, "Failed to queue workflow for execution");
  }
});

export const deleteWorkflow = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { workflowId } = req.params;
  if (!userId) throw new CustomError(404, "userid not found");
  if (!workflowId) throw new CustomError(400, "Workflow ID is required");

  try {
    const deletedWorkflow = await workflowService.deleteWorkflow(workflowId, userId);

    res.status(200).json(new ApiResponse(200, "Workflow deleted successfully", deletedWorkflow));
  } catch (error) {
    throw new CustomError(400, "failed to delete the workflow");
  }
});

