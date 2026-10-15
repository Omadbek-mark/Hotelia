# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY nest-cli.json tsconfig*.json ./
COPY apps ./apps

# Coolify: hotelia-api (default) or hotelia-batch, as separate applications.
ARG APP_NAME=hotelia-api
RUN case "$APP_NAME" in hotelia-api|hotelia-batch) ;; *) exit 1 ;; esac \
    && npm run build -- "$APP_NAME" \
    && cp "dist/apps/$APP_NAME/main.js" /app/main.js

FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT_API=3001
ENV PORT_BATCH=3001

COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/main.js ./main.js
RUN mkdir -p uploads && chown node:node uploads

USER node
EXPOSE 3001
CMD ["node", "main.js"]
