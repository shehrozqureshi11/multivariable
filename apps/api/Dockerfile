FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN npm install --workspace=@herdshare/shared --workspace=@herdshare/api

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json* ./
COPY packages/shared packages/shared
COPY apps/api apps/api
# Build shared first so @herdshare/shared resolves, then API (api build also builds shared)
RUN npm run build -w @herdshare/shared \
  && npx prisma generate --schema=apps/api/prisma/schema.prisma \
  && npm run build -w @herdshare/api

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
RUN apk add --no-cache wget
COPY --from=build /app /app
WORKDIR /app/apps/api
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1
CMD ["node", "dist/index.js"]
