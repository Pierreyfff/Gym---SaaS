FROM node:22-alpine AS build
ARG PNPM_VERSION=9.15.0
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/web/package.json packages/web/package.json
RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY packages/api-client ./packages/api-client
COPY packages/web ./packages/web
RUN pnpm exec tsc --project packages/shared
RUN pnpm exec tsc --project packages/api-client
RUN pnpm exec tsc -b packages/web/tsconfig.json
RUN cd packages/web && ../../node_modules/.bin/vite build

FROM nginx:1.27-alpine
COPY docker/nginx-web.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
