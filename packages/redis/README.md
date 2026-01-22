# @nen/redis

Shared Redis client utilities for the nEn platform.

## Features

- **Client Creation**: Factory function for creating Redis clients
- **Connection Helpers**: Connect/disconnect utilities
- **Configuration**: Centralized Redis configuration

## Usage

### Basic Client

```typescript
import { createRedisClient, connectRedis } from "@nen/redis";

const client = createRedisClient();
await connectRedis(client);

// Use client
await client.set("key", "value");
const value = await client.get("key");

// Cleanup
await client.quit();
```

### With Custom URL

```typescript
import { createRedisClient } from "@nen/redis";

const client = createRedisClient({
  url: "redis://custom-host:6379"
});

await client.connect();
```

### Get Redis Configuration

```typescript
import { getRedisConfig } from "@nen/redis";

const config = getRedisConfig();
// Returns: { url, host, port }

// Use with BullMQ
import { Queue } from "bullmq";

const queue = new Queue("my-queue", {
  connection: {
    host: config.host,
    port: config.port,
  },
});
```

### Connection Management

```typescript
import { createRedisClient, connectRedis, disconnectRedis } from "@nen/redis";

const client = createRedisClient();

// Safe connect (checks if already connected)
await connectRedis(client);

// Safe disconnect (checks if connected)
await disconnectRedis(client);
```
