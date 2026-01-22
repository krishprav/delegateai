# @nen/config

Centralized configuration management for the nEn monorepo.

## Features

- Single source of truth for all environment variables
- Type-safe configuration access
- Improved performance by caching environment variables
- Easy to test and mock

## Usage

```typescript
import config from "@nen/config";

// Access configuration
const port = config.backend.port;
const redisUrl = config.redis.url;
const isProduction = config.nodeEnv === "production";
```

## Configuration Structure

- `backend`: Backend server configuration
- `engine`: Engine service configuration
- `auth`: Authentication and JWT settings
- `redis`: Redis connection settings
- `database`: Database connection settings
- `monitoring`: Observability configuration (OpenTelemetry, Loki, logging)
- `websocket`: WebSocket server configuration
- `nodeEnv`: Current environment (development/production)
