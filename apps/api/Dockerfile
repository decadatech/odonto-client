FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

RUN pnpm install --filter @odonto/api... --frozen-lockfile

COPY apps/api ./apps/api

WORKDIR /app/apps/api

RUN pnpm build

EXPOSE 3333

CMD ["node", "dist/server.js"]
