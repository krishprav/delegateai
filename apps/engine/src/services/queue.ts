import { Queue } from "bullmq";
import { getRedisConfig } from "@delegate/redis";

const redisConfig = getRedisConfig();

export const workflowQueue = new Queue("workflow-execution", {
  connection: {
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    tls: redisConfig.tls,
  },
});
