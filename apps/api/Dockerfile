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
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
  npm run build -w @herdshare/shared \
  && DATABASE_URL="postgresql://build:build@localhost:5432/build" \
  npx prisma generate --schema=apps/api/prisma/schema.prisma \
  && DATABASE_URL="postgresql://build:build@localhost:5432/build" \
  npm run build -w @herdshare/api

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV JWT_ACCESS_SECRET=herdshare-prod-access-secret-change-when-possible-32
ENV JWT_REFRESH_SECRET=herdshare-prod-refresh-secret-change-when-possible-32
ENV JWT_ACCESS_EXPIRES=15m
ENV JWT_REFRESH_EXPIRES=7d
ENV CORS_ORIGIN=http://localhost:3000,https://multivariable-api-git-main-sheriii.vercel.app
RUN apk add --no-cache wget
COPY --from=build /app /app
WORKDIR /app/apps/api
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-8080}/health || exit 1
CMD ["node", "dist/index.js"]
