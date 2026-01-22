import { ApiResponse, asyncHandler, CustomError } from "@delegate/auth";
import { workflowService } from "../services/index.js";
import { createLogger } from "@delegate/monitoring";
import { PromptService } from "../services/prompt.service.js";

const logger = createLogger({ serviceName: "nen-backend" });

export const generateWorkflowFromPrompt = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new CustomError(401, "User not authenticated");

    const { prompt, template, mode } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        throw new CustomError(400, "Prompt is required and must be a non-empty string");
    }

    logger.info("Generating workflow from prompt", {
        userId,
        promptLength: prompt.length,
        template,
        correlationId: req.correlationId,
    });

    try {
        const promptService = new PromptService();
        const workflowData = await promptService.generateWorkflow(prompt, template);

        const result = await workflowService.createWorkflow(userId, workflowData);

        logger.info("Workflow generated and saved successfully", {
            workflowId: result.workflowId,
            userId,
            correlationId: req.correlationId,
        });

        res.status(201).json(
            new ApiResponse(201, "Workflow generated successfully", {
                workflowId: result.workflowId,
                name: result.name,
                active: result.active,
                createdAt: result.createdAt,
            })
        );
    } catch (error: any) {
        logger.error("Error generating workflow from prompt", {
            error: error.message,
            userId,
            correlationId: req.correlationId,
        });

        if (error instanceof CustomError) {
            throw error;
        }

        throw new CustomError(500, "Failed to generate workflow from prompt");
    }
});
