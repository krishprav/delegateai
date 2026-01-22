# @nen/monitoring

Shared monitoring, observability, and logging utilities for the nEn platform.

## Features

- **Metrics**: Prometheus metrics for workflows, queue jobs, HTTP requests, and actions
- **Tracing**: OpenTelemetry distributed tracing
- **Logging**: Winston logger with Loki integration

## Usage

### Metrics

```typescript
import { 
  workflowExecutionCounter, 
  workflowExecutionDuration,
  register 
} from "@nen/monitoring";

// Increment counter
workflowExecutionCounter.inc({ status: "success", workflow_id: "123", triggered_by: "manual" });

// Record duration
const timer = workflowExecutionDuration.startTimer();
// ... do work
timer({ workflow_id: "123", status: "success" });

// Expose metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
```

### Tracing

```typescript
import { startTracing } from "@nen/monitoring";

// Start tracing for your service
startTracing("nen-backend");
```

### Logging

```typescript
import { createLogger } from "@nen/monitoring";

const logger = createLogger({
  serviceName: "nen-backend",
  environment: "production",
  logLevel: "info",
});

logger.info("Service started", { port: 3000 });
logger.error("Error occurred", { error: err.message });
```
