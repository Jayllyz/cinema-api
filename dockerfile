# Base server
FROM node:22-alpine as base

# hadolint ignore=DL3018
RUN apk add --no-cache gcompat && \
    corepack enable pnpm

USER node
WORKDIR /app

COPY --chown=node:node package*.json .

ENV PORT $PORT
EXPOSE $PORT

HEALTHCHECK --interval=5s --timeout=1s \
    CMD wget -qO- http://0.0.0.0:${PORT}/health || exit 1

# Development
FROM base as dev
ENV NODE_ENV=development
RUN pnpm fetch && \
    pnpm install
COPY --chown=node:node . .
CMD ["node", "--run", "dev"]


# Build
FROM base as build
RUN pnpm fetch && \
    pnpm install
COPY --chown=node:node . .
RUN npx prisma generate && \
    pnpm run build && \
    pnpm prune --prod

# Production
FROM base as prod
ENV NODE_ENV production
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/prisma ./prisma
CMD ["node", "dist/src/app.js"]
