import { ApiResponse, asyncHandler, CustomError } from "@delegate/auth";
import { executionService } from "../services/index.js";

export const getUserExecutions = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status, workflowId, limit = "50", offset = "0" } = req.query;

    if (!userId) {
        throw new CustomError(401, "User not authenticated");
    }

    try {
        const result = await executionService.getUserExecutions(userId, {
            status: status as string,
            workflowId: workflowId as string,
            limit: Number(limit),
            offset: Number(offset),
        });

        res.status(200).json(
            new ApiResponse(200, "Executions retrieved successfully", result)
        );
    } catch (error: any) {
        throw new CustomError(500, "Failed to retrieve executions");
    }
});

export const getExecutionDetails = asyncHandler(async (req, res) => {
    const { executionId } = req.params;
    const userId = req.user.id;

    if (!userId) {
        throw new CustomError(401, "User not authenticated");
    }

    if (!executionId) {
        throw new CustomError(400, "Execution ID is required");
    }

    try {
        const execution = await executionService.getExecutionDetails(executionId, userId);

        if (!execution) {
            return res.status(404).json(
                new ApiResponse(404, "Execution not found", null)
            );
        }

        res.status(200).json(
            new ApiResponse(200, "Execution details retrieved successfully", execution)
        );
    } catch (error: any) {
        throw new CustomError(500, "Failed to retrieve execution details");
    }
});

export const getExecutionStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
        throw new CustomError(401, "User not authenticated");
    }

    try {
        const filters: any = {};
        if (startDate) filters.startDate = new Date(startDate as string);
        if (endDate) filters.endDate = new Date(endDate as string);

        const stats = await executionService.getExecutionStats(userId, filters);

        res.status(200).json(
            new ApiResponse(200, "Execution stats retrieved successfully", stats)
        );
    } catch (error: any) {
        throw new CustomError(500, "Failed to retrieve execution stats");
    }
});
