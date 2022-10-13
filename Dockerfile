FROM node:18

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /usr/src/app

COPY --chown=node:node .npmrc ./
COPY --chown=node:node package.json ./
COPY --chown=node:node pnpm-lock.yaml ./
COPY --chown=node:node pnpm-workspace.yaml ./

RUN mkdir -p apps/api
COPY --chown=node:node apps/api/package.json ./apps/api

RUN mkdir -p packages/tsconfig
COPY --chown=node:node packages/tsconfig/ ./packages/tsconfig/

RUN pnpm install

COPY --chown=node:node apps/api/ ./apps/api/

RUN cd apps/api && pnpm exec prisma generate

USER node

CMD ["pnpm", "run", "start:prod"]
