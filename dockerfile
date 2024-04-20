# Base server
FROM node:21-alpine as base

RUN apk add --no-cache libc6-compat && \
    corepack enable pnpm

USER node
WORKDIR /app

COPY --chown=node:node package*.json .

ENV PORT $NODE_PORT
EXPOSE $NODE_PORT

HEALTHCHECK --interval=5s --timeout=1s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${NODE_PORT}/health || exit 1

# Development
FROM base as dev
ENV NODE_ENV=development
RUN pnpm fetch && \
    pnpm install
COPY --chown=node:node . .
CMD ["pnpm", "run", "dev"]


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
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/prisma ./prisma
CMD ["node", "dist/app.js"]
