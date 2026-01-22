import { createRedisClient } from "@delegate/redis";
import appConfig from "@delegate/config";
import WebSocket, { WebSocketServer } from "ws";

export interface WorkflowEvent {
  executionId: string;
  userId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface QueueWorkerConfig {
  redisUrl?: string;
  wsPort?: number;
  server?: any;
}

export class QueueWorker {
  private subscriberRedis;
  private wss: WebSocketServer;
  private executionClients = new Map<string, WebSocket[]>();
  private userClients = new Map<string, WebSocket[]>();

  constructor(config: QueueWorkerConfig = {}) {
    this.subscriberRedis = createRedisClient({ url: config.redisUrl });

    if (config.server) {
      this.wss = new WebSocketServer({ server: config.server });
    } else {
      const wsPort = config.wsPort || appConfig.websocket.port;
      this.wss = new WebSocketServer({ port: wsPort });
    }

    this.setupWebSocket();
    this.setupRedis();
  }

  private setupWebSocket() {
    this.wss.on("connection", (ws, req) => {
      const url = new URL(req.url!, "http://localhost");
      const pathParts = url.pathname.split("/").filter(Boolean);

      if (pathParts[0] === "user" && pathParts[1]) {
        const userId = pathParts[1];
        if (!this.userClients.has(userId)) this.userClients.set(userId, []);
        this.userClients.get(userId)!.push(ws);

        ws.on("close", () => {
          this.userClients.set(
            userId,
            (this.userClients.get(userId) ?? []).filter((c) => c !== ws)
          );
        });
      } else {
        const executionId = pathParts.pop()!;
        if (!this.executionClients.has(executionId)) {
          this.executionClients.set(executionId, []);
        }
        this.executionClients.get(executionId)!.push(ws);

        ws.on("close", () => {
          this.executionClients.set(
            executionId,
            (this.executionClients.get(executionId) ?? []).filter((c) => c !== ws)
          );
        });
      }
    });
  }

  private async setupRedis() {
    try {
      await this.subscriberRedis.connect();
      console.log("Redis connected for queue worker");
      console.log(`WebSocket server running on port ${this.wss.options.port}`);
    } catch (error) {
      console.error("Redis connection error:", error);
    }

    this.subscriberRedis.on("error", (err) => {
      console.error("Redis error:", err);
    });
  }

  async start() {
    await this.subscriberRedis.subscribe("workflow.event", (msg) => {
      const event: WorkflowEvent = JSON.parse(msg);
      const { executionId, userId } = event;

      if (this.executionClients.has(executionId)) {
        for (const ws of this.executionClients.get(executionId)!) {
          ws.send(JSON.stringify(event));
        }
      }

      if (userId && this.userClients.has(userId)) {
        for (const ws of this.userClients.get(userId)!) {
          ws.send(JSON.stringify(event));
        }
      }
    });

    console.log("Queue worker started, listening for workflow events");
  }

  async stop() {
    await this.subscriberRedis.quit();
    this.wss.close();
  }
}
