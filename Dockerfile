# install dependencies
FROM node:18 AS deps

WORKDIR /app

RUN mkdir -p apps/api
RUN mkdir -p packages/tsconfig

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY --chown=node:node apps/api/package.json ./apps/api/
COPY --chown=node:node packages/tsconfig/package.json ./packages/tsconfig/

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile


# generate prisma client and build api
FROM node:18 AS builder

WORKDIR /app

COPY --chown=node:node apps/api/ ./apps/api/
COPY --chown=node:node packages/tsconfig/base.json ./packages/tsconfig/
COPY --chown=node:node packages/tsconfig/nestjs.json ./packages/tsconfig/
COPY --from=deps /app/node_modules/ ./node_modules
COPY --from=deps /app/apps/api/node_modules/ ./apps/api/node_modules

RUN npm install -g pnpm
RUN cd apps/api && pnpm exec prisma generate && pnpm run build


# runner image
FROM node:18-alpine AS runner

WORKDIR /app

ARG DATABASE_URL
ARG JWT_SECRET
ARG JWT_EXPIRES_IN
ARG PORT

ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_EXPIRES_IN=$JWT_EXPIRES_IN
ENV PORT=$PORT
ENV NODE_ENV=production

# needed for argon2 dependency
RUN apk --no-cache --virtual build-dependencies add g++

COPY --from=builder /app/node_modules/ ./node_modules
COPY --from=builder /app/apps/api/node_modules/ ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma/ ./apps/api/prisma
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist

EXPOSE $PORT

WORKDIR /app/apps/api

CMD ["npx", "prisma", "migrate", "deploy", "&&", "node", "dist/main"]
