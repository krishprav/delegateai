# @nen/queue

Shared queue infrastructure for the nEn platform using BullMQ and Redis.

## Features

- **Queue Management**: Create and manage BullMQ queues
- **WebSocket Server**: Real-time event broadcasting via WebSocket
- **Redis Pub/Sub**: Subscribe to workflow events and broadcast to connected clients

## Usage

### Queue

```typescript
import { createQueue, workflowQueue } from "@nen/queue";

// Use the default workflow queue
await workflowQueue.add("execute-workflow", {
  workflowId: "123",
  userId: "user-456",
});

// Or create a custom queue
const myQueue = createQueue("my-custom-queue", {
  redisUrl: "redis://localhost:6379",
});
```

### Queue Worker

```typescript
import { QueueWorker } from "@nen/queue";

const worker = new QueueWorker({
  redisUrl: "redis://localhost:6379",
  wsPort: 3002,
});

await worker.start();

// Later, to stop
await worker.stop();
```

### WebSocket Client Connection

```typescript
// Connect to specific execution
const ws = new WebSocket("ws://localhost:3002/execution-id");

// Connect to user channel
const ws = new WebSocket("ws://localhost:3002/user/user-id");

ws.on("message", (data) => {
  const event = JSON.parse(data);
  console.log("Received event:", event);
});
```
