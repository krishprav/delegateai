FROM oven/bun:1.3.2

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN apt-get update && apt-get install -y \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock turbo.json ./
COPY apps/engine/package.json ./apps/engine/package.json
COPY packages ./packages

RUN bun install
RUN bunx --bun prisma generate --schema=packages/db/prisma/schema.prisma

COPY apps/engine ./apps/engine

CMD ["bun", "start:engine"]