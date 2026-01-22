import { Worker, Job } from "bullmq";
import { trace } from "@delegate/monitoring";
import { createLogger, queueJobsCounter, queueProcessingDuration } from "@delegate/monitoring";

const logger = createLogger({ serviceName: "nen-engine" });

export const createChildLogger = (executionId: string) => {
    return logger.child({ executionId });
};
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const tracer = trace.getTracer("nen-engine");

interface AITaskPayload {
    taskId: string;
    prompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
    tools: any[];
    apiKey: string;
    context: any;
    timestamp: string;
    provider?: string;
    baseUrl?: string;
    httpReferer?: string;
    xTitle?: string;
}

interface LLMResponse {
    success: boolean;
    content: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    model: string;
    error?: string;
}

async function callOpenAI(payload: AITaskPayload): Promise<LLMResponse> {
    const openai = createOpenAI({
        apiKey: payload.apiKey,
    });

    const { text, usage } = await generateText({
        model: openai(payload.model),
        prompt: payload.prompt,
        temperature: payload.temperature,
    });

    return {
        success: true,
        content: text,
        usage: {
            inputTokens: usage.inputTokens ?? 0,
            outputTokens: usage.outputTokens ?? 0,
            totalTokens: usage.totalTokens ?? 0,
        },
        model: payload.model,
    };
}

async function callOpenRouter(payload: AITaskPayload): Promise<LLMResponse> {
    const openrouter = createOpenAI({
        apiKey: payload.apiKey,
        baseURL: payload.baseUrl || "https://openrouter.ai/api/v1",
        headers: {
            "HTTP-Referer": payload.httpReferer || "",
            "X-Title": payload.xTitle || "",
        },
    });

    const { text, usage } = await generateText({
        model: openrouter(payload.model),
        prompt: payload.prompt,
        temperature: payload.temperature,
    });

    return {
        success: true,
        content: text,
        usage: {
            inputTokens: usage.inputTokens ?? 0,
            outputTokens: usage.outputTokens ?? 0,
            totalTokens: usage.totalTokens ?? 0,
        },
        model: payload.model,
    };
}

async function processAITask(payload: AITaskPayload): Promise<LLMResponse> {
    if (payload.provider === "openrouter") {
        return await callOpenRouter(payload);
    } else {
        return await callOpenAI(payload);
    }
}

export function createAIWorker(redisConfig: {
    host: string;
    port: number;
    password?: string;
    tls?: any;
}) {
    const aiWorker = new Worker<AITaskPayload, LLMResponse>(
        "ai-tasks",
        async (job: Job<AITaskPayload>) => {
            const span = tracer.startSpan("ai-task.execute");
            const start = Date.now();
            const jobLogger = createChildLogger(job.data.taskId);

            try {
                jobLogger.info("Processing AI task", {
                    taskId: job.data.taskId,
                    model: job.data.model,
                    provider: job.data.provider || "openai",
                });

                span.setAttributes({
                    "ai.task_id": job.data.taskId,
                    "ai.model": job.data.model,
                    "ai.provider": job.data.provider || "openai",
                });

                const result = await processAITask(job.data);

                const duration = (Date.now() - start) / 1000;
                queueProcessingDuration.observe({ queue_name: "ai-tasks" }, duration);
                queueJobsCounter.inc({ queue_name: "ai-tasks", status: "completed" });

                jobLogger.info("AI task completed", {
                    taskId: job.data.taskId,
                    duration,
                    tokensUsed: result.usage?.totalTokens,
                });

                span.setStatus({ code: 1 });
                span.end();

                return result;
            } catch (error: any) {
                jobLogger.error("AI task failed", {
                    taskId: job.data.taskId,
                    error: error.message,
                    stack: error.stack,
                });

                span.recordException(error);
                span.setStatus({ code: 2, message: error.message });
                span.end();

                queueJobsCounter.inc({ queue_name: "ai-tasks", status: "failed" });

                return {
                    success: false,
                    content: "",
                    error: error.message,
                    model: job.data.model,
                };
            }
        },
        {
            connection: redisConfig,
            concurrency: 5,
        }
    );

    aiWorker.on("completed", (job) => {
        logger.info("AI job completed", {
            jobId: job.id,
            taskId: job.data.taskId,
        });
    });

    aiWorker.on("failed", (job, err) => {
        logger.error("AI job failed", {
            jobId: job?.id,
            taskId: job?.data?.taskId,
            error: err.message,
        });
    });

    return aiWorker;
}
