FROM node:22-alpine AS base

ARG PNPM_VERSION=9.15.0

WORKDIR /app

RUN corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

COPY packages/backend/package.json packages/backend/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/web/package.json packages/web/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared/src ./packages/shared/src
COPY packages/api-client/src ./packages/api-client/src

EXPOSE 5173
