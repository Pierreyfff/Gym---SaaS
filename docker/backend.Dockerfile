FROM node:22-slim AS build
ARG PNPM_VERSION=9.15.0
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates curl postgresql-client && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/api-client/package.json packages/api-client/package.json
RUN pnpm install --frozen-lockfile

COPY packages/database/prisma ./packages/database/prisma
RUN pnpm --filter @gym-saas/database generate

COPY packages/shared ./packages/shared
COPY packages/database/src ./packages/database/src
COPY packages/database/tsconfig.json ./packages/database/tsconfig.json
COPY packages/api-client ./packages/api-client
COPY packages/backend ./packages/backend
RUN pnpm exec tsc --project packages/shared
RUN pnpm exec tsc --project packages/database
RUN pnpm exec tsc --project packages/api-client
RUN cd packages/backend && ../../node_modules/.bin/nest build

RUN CI=true pnpm prune --prod

FROM node:22-slim
ARG PNPM_VERSION=9.15.0
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates postgresql-client && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY --from=build /app/packages/backend/package.json ./packages/backend/package.json
COPY --from=build /app/packages/database/dist ./packages/database/dist
COPY --from=build /app/packages/database/package.json ./packages/database/package.json
COPY --from=build /app/packages/database/prisma ./packages/database/prisma
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/api-client/dist ./packages/api-client/dist
COPY --from=build /app/packages/api-client/package.json ./packages/api-client/package.json

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "packages/backend/dist/main"]
