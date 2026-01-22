# nEn

A workflow automation platform built with TypeScript and Turborepo. Create, manage, and execute automated workflows with triggers, actions, and integrations.

## Architecture

```mermaid
flowchart LR
    subgraph Client
        A[User Browser]
    end
    
    subgraph External["External Integrations"]
        H[Google OAuth]
    end
    
    subgraph Frontend["Frontend Layer"]
        B[Nginx]
        C[React App]
    end
    
    subgraph Backend["Backend Layer"]
        D[Express API]
    end
    
    subgraph Storage["Data Storage"]
        F[(PostgreSQL)]
        G[(Redis)]
    end
    
    subgraph Queue["Message Queue"]
        Q[BullMQ/Redis]
    end
    
    subgraph Engine["Workflow Engine"]
        E[Engine Worker]
    end
    
    subgraph Monitoring["Observability Stack"]
        M1[Prometheus<br/>Metrics]
        M2[Grafana<br/>Dashboards]
        M3[Jaeger<br/>Traces]
        M4[Loki<br/>Logs]
    end
    
    subgraph Nodes["Available Nodes"]
        N1[Gmail API]
        N2[Webhooks]
        N3[Telegram API]
        N4[OpenAI API]
        N5[OpenRouter API]
        N6[Resend API]
    end
    
    A -->|HTTPS| B
    B --> C
    C -->|API Requests| D
    D --> F
    D -->|Add Jobs| Q
    D -.->|Authentication| H
    Q -->|Process Jobs| E
    E --> F
    E -->|Execute| N1
    E -->|Execute| N2
    E -->|Execute| N3
    E -->|Execute| N4
    E -->|Execute| N5
    E -->|Execute| N6
    
    D -->|Metrics| M1
    E -->|Metrics| M1
    D -->|Traces| M3
    E -->|Traces| M3
    D -->|Logs| M4
    E -->|Logs| M4
    M1 -->|Query| M2
    M3 -->|Query| M2
    M4 -->|Query| M2
    M3 -->|Traces UI| M2
```

### Monorepo Structure

This project uses Turborepo to manage a monorepo with three main applications:

- **backend** - Express.js REST API server handling authentication, workflow management, and webhook endpoints
- **engine** - Workflow execution engine that processes triggers and executes actions
- **frontend** - React application with Vite for building and managing workflows

### Shared Packages

- **@nen/db** - Prisma-based database client and schema shared across all applications
- **@nen/eslint-config** - Shared ESLint configurations
- **@nen/typescript-config** - Shared TypeScript configurations

### Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Frontend**: React, Vite, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Queue**: Redis with BullMQ
- **Monitoring**: 
  - **Metrics**: Prometheus
  - **Visualization**: Grafana
  - **Tracing**: Jaeger with OpenTelemetry
  - **Logging**: Winston with Loki
- **Deployment**: Docker, Docker Compose, Nginx


## Project Structure

```
nEn/
├── apps/
│   ├── backend/          # Express API server
│   ├── engine/           # Workflow execution engine
│   └── frontend/         # React web application
├── packages/
│   ├── db/              # Prisma schema and database client
│   ├── eslint-config/   # Shared ESLint configurations
│   └── typescript-config/ # Shared TypeScript configurations
├── docker/              # Dockerfiles for each service
├── conf/                # Monetring and Nginx configuration files
└── scripts/             # Utility scripts
```

## Getting Started

### Local Development

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd nEn
bun install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database connection string (PostgreSQL)
- Redis connection URL
- JWT secrets (generate with `openssl rand -base64 32`)
- Google OAuth credentials for Gmail integration
- Frontend and backend URLs

3. Initialize the database:

```bash
bun run db:migrate
```

4. Start the development servers:

```bash
bun run dev
```

This will start all applications concurrently:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Engine: Running in background

### Monitoring Stack

The application includes a complete observability stack with the **three pillars of observability**:

1. **Access Monitoring Dashboards**:

- **Prometheus**: http://localhost:9090 - Metrics collection and querying
- **Grafana**: http://localhost:3001 - Unified visualization (admin/admin)
- **Jaeger**: http://localhost:16686 - Distributed tracing UI
- **Loki**: http://localhost:3100 - Log aggregation (via Grafana)

2. **Metrics Endpoints**:

- Backend: http://localhost:3000/metrics
- Engine: http://localhost:3000/metrics

3. **Available Observability Data**:

**Metrics (Prometheus):**
- Workflow execution counts and durations
- Queue job processing rates
- HTTP request latencies
- Node execution performance
- Error rates by component

**Traces (Jaeger):**
- Distributed request tracing across services
- Workflow execution spans
- API request traces with timing

**Logs (Loki + Winston):**
- Structured JSON logs with correlation IDs
- Workflow execution logs with execution IDs
- Error tracking and stack traces
- Request/response logging

For detailed monitoring setup and usage, see [MONITORING.md](./MONITORING.md).

### Individual Application Commands

Start specific applications:

```bash
bun run start:frontend
bun run start:backend
bun run start:engine
```

### Docker Deployment

The application provides a complete Docker Compose setup for production deployment. All services are containerized and orchestrated with health checks and automatic restarts.

#### Quick Start

Deploy the entire stack using Docker Compose:

```bash
docker-compose up -d
```

Access the application at http://localhost:80

#### Monitoring URLs

When using Docker Compose, the complete observability stack is automatically deployed:

- **Application**: http://localhost:80
- **Backend API**: http://localhost:3000
- **Prometheus**: http://localhost:9090 - Metrics
- **Grafana**: http://localhost:3001 (admin/admin) - Dashboards, Logs, Traces
- **Jaeger UI**: http://localhost:16686 - Trace exploration
- **Loki**: http://localhost:3100 - Log aggregation (query via Grafana)

#### Docker Compose Commands

```bash
# Start all services in detached mode
docker-compose up -d

# View logs for all services
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f backend

# Stop all services
docker-compose stop

# Stop and remove containers, networks
docker-compose down

# Stop and remove containers, networks, and volumes
docker-compose down -v

# Rebuild and restart services
docker-compose up -d --build

# Check service status
docker-compose ps

# Execute commands in a running container
docker-compose exec backend sh
```

#### Environment Configuration 

When using Docker Compose, configure these environment variables should be in your `.env` file:

```env
# PostgreSQL Configuration
POSTGRES_USER=nen_user
POSTGRES_PASSWORD=nen_password
POSTGRES_DB=nen_db
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PORT=6379

# Application Ports
BACKEND_PORT=3000
FRONTEND_PORT=80

# Database URL (use service name 'postgres' for Docker network)
DATABASE_URL=postgresql://nen_user:nen_password@postgres:5432/nen_db

# Redis URL (use service name 'redis' for Docker network)
REDIS_URL=redis://redis:6379

# Backend URL for Frontend
VITE_BACKEND_URL=http://localhost:3000

# Observability Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
LOKI_URL=http://localhost:3100
LOG_LEVEL=info
NODE_ENV=production

# Metrics Ports
ENGINE_METRICS_PORT=3000
```

#### Docker Networking

All services communicate through a custom bridge network (`nen-network`). Services can reference each other by their container name:
- Backend connects to database: `postgres:5432`
- Backend connects to Redis: `redis:6379`
- Frontend connects to backend: `backend:3000`

#### Persistent Data

Docker volumes ensure data persistence across container restarts:
- `postgres_data` - Database files
- `redis_data` - Redis persistence files
- `prometheus_data` - Prometheus metrics time-series data
- `grafana_data` - Grafana dashboards and settings
- `loki_data` - Loki log storage

#### Health Checks

PostgreSQL and Redis include health checks that ensure dependent services only start when the database and cache are fully ready:
- PostgreSQL: Checks `pg_isready` every 10 seconds
- Redis: Checks `redis-cli ping` every 10 seconds

#### Building Custom Images

Build images individually:

```bash
# Build backend image
docker build -t nen/backend:latest -f docker/backend.Dockerfile .

# Build engine image
docker build -t nen/engine:latest -f docker/engine.Dockerfile .

# Build frontend image
docker build -t nen/frontend:latest -f docker/frontend.Dockerfile .
```

#### Production Deployment Notes

- All services configured with `restart: unless-stopped`
- Use strong passwords in production (override defaults)
- Configure proper `FRONTEND_URL` and `VITE_BACKEND_URL` for your domain
- Consider using reverse proxy for SSL/TLS termination
- Regular database backups recommended
- Monitor container logs and resource usage

## Available Scripts

### Development

- `bun run dev` - Start all apps in development mode
- `bun run build` - Build all apps and packages
- `bun run lint` - Run ESLint across all packages
- `bun run format` - Format code with Prettier
- `bun run check-types` - Type check all TypeScript code

### Database

- `bun run db:migrate` - Run Prisma migrations and generate client
- `bun run db:generate` - Generate Prisma client only

### Production

- `bun run start` - Start all apps in production mode
- `docker-compose up -d` - Deploy with Docker

## Features

- **Workflow Automation**: Create and manage complex workflows with visual builder
- **Triggers**: Gmail monitoring, webhooks, scheduled tasks
- **Actions**: Multi-step workflow execution with conditional logic
- **Real-time Monitoring**: Live workflow execution tracking via WebSockets
- **Complete Observability**: Full monitoring stack with the three pillars
  - **Metrics**: Prometheus for metrics collection and alerting
  - **Traces**: Jaeger with OpenTelemetry for distributed tracing
  - **Logs**: Winston + Loki for structured logging with correlation IDs
  - **Visualization**: Grafana for unified dashboards
- **Queue Management**: Reliable job processing with BullMQ and Redis
- **Credential Management**: Secure OAuth integration with Google services
- **RESTful API**: Full-featured API with JWT authentication
- **Responsive UI**: Modern React interface with TailwindCSS


## License

This project is private and proprietary.
