# nEn Monitoring Setup

Complete monitoring stack with **Prometheus**, **Grafana**, **Jaeger**, and **OpenTelemetry**.

## Services

### 1. **Prometheus** (Metrics Collection)
- **URL**: http://localhost:9090
- Scrapes metrics from backend and engine every 15s
- Stores time-series data for visualization

### 2. **Grafana** (Visualization)
- **URL**: http://localhost:3001
- **Username**: `admin`
- **Password**: `admin`
- Pre-configured dashboards for workflow metrics

### 3. **Jaeger** (Distributed Tracing)
- **UI**: http://localhost:16686
- Collects traces via OpenTelemetry (OTLP)
- Shows request flows across services

## Quick Start

```bash
# Start all services including monitoring stack
docker-compose up -d

# View logs
docker-compose logs -f prometheus grafana jaeger
```

## Accessing Dashboards

### Prometheus
1. Go to http://localhost:9090
2. Query examples:
   - `workflow_executions_total` - Total workflow executions
   - `rate(http_requests_total[5m])` - HTTP request rate

### Grafana
1. Go to http://localhost:3001
2. Login with `admin/admin`
3. Navigate to **Dashboards** → **nEn Workflow Metrics**

### Jaeger
1. Go to http://localhost:16686
2. Select service: `nen-backend` or `nen-engine`
3. Click **Find Traces** to view distributed traces

## Metrics Available

### Workflow Metrics
- `workflow_executions_total` - Total executions by status
- `workflow_execution_duration_seconds` - Execution duration histogram
- `active_workflows_count` - Currently running workflows

### Queue Metrics
- `queue_jobs_total` - Jobs processed by status
- `queue_processing_duration_seconds` - Processing time

### HTTP Metrics
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request latency

### Node Metrics
- `node_executions_total` - Node executions by type
- `node_execution_duration_seconds` - Node execution time

### Error Metrics
- `errors_total` - Total errors by type and component

## Environment Variables

Add to your `.env`:

```env
# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Metrics ports
ENGINE_METRICS_PORT=3000
BACKEND_PORT=3000
```

## Development

### Local Testing (without Docker)
```bash
# Terminal 1: Start Jaeger
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest

# Terminal 2: Start Prometheus
docker run -d --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/conf/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# Terminal 3: Start Grafana
docker run -d --name grafana \
  -p 3001:3000 \
  grafana/grafana

# Terminal 4: Start backend
bun run start:backend

# Terminal 5: Start engine
bun run start:engine
```

## Troubleshooting

### Metrics not showing in Prometheus
1. Check if services are exposing `/metrics`:
   - Backend: http://localhost:3000/metrics
   - Engine: http://localhost:3000/metrics (separate port if needed)
2. Verify Prometheus targets: http://localhost:9090/targets

### Traces not appearing in Jaeger
1. Check OTLP endpoint: `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces`
2. Verify Jaeger is receiving data: http://localhost:16686

### Grafana dashboards empty
1. Check Prometheus datasource connection
2. Verify metrics are being scraped by Prometheus
3. Wait 15-30 seconds for initial data collection
