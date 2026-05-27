FROM node:22-slim AS base

ARG PNPM_VERSION=9.15.0

WORKDIR /app

RUN corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
       openssl \
       ca-certificates \
       curl \
       postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

COPY packages/backend/package.json packages/backend/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/api-client/package.json packages/api-client/package.json

RUN pnpm install --frozen-lockfile

COPY packages/database/prisma ./packages/database/prisma

RUN pnpm --filter @gym-saas/database generate

COPY packages/shared/src ./packages/shared/src
COPY packages/database/src ./packages/database/src
COPY packages/api-client/src ./packages/api-client/src

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY packages/backend/src ./packages/backend/src
COPY packages/backend/tsconfig.json ./packages/backend/tsconfig.json
COPY packages/backend/nest-cli.json ./packages/backend/nest-cli.json

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
