import { Queue } from "bullmq";
import { getRedisConfig } from "@delegate/redis";

export interface QueueConfig {
  redisUrl?: string;
}

export function createQueue(name: string, config: QueueConfig = {}) {
  const redisConfig = getRedisConfig();

  return new Queue(name, {
    connection: {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      tls: redisConfig.tls,
    },
  });
}

export const workflowQueue = createQueue("workflow-execution");
