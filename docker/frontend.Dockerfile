FROM oven/bun:1.3.2 AS builder

WORKDIR /app

ARG DATABASE_URL
ARG VITE_BACKEND_URL
ARG VITE_WS_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV DATABASE_URL=${DATABASE_URL}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

COPY package.json bun.lock turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages ./packages

# Install build tools for native dependencies
RUN apt-get update && apt-get install -y \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN bun install
RUN bunx --bun prisma generate --schema=packages/db/prisma/schema.prisma

COPY apps/frontend ./apps/frontend

RUN bun run build

FROM nginx:alpine AS runtime

WORKDIR /app

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY conf/frontend-nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]