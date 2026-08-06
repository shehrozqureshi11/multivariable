# HerdShare — Livestock Investment Platform (Web MVP)

Transparent livestock investment platform connecting investors with verified farms in Pakistan.

## Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 15 (App Router) — SSR/SSG, SEO, Core Web Vitals |
| API | Node.js + Express — JWT, RBAC, `/api/v1` |
| DB | **Supabase PostgreSQL** via Prisma |
| Cache | Redis (optional) |
| Media | Supabase Storage (or image URLs) |
| Edge | Nginx (Docker profile `full`) |

## Quick start

### 1. Supabase database

1. Create a project at [supabase.com](https://supabase.com)
2. Copy **Session/Transaction pooler** URL → `DATABASE_URL`
3. Copy **Direct** connection URL → `DIRECT_URL`
4. Copy `.env.example` → `.env` and fill values

```bash
cp .env.example .env
```

### 2. Install & migrate

```bash
npm install
npm run db:generate
npm run db:push          # or: npm run db:migrate
npm run db:seed
```

### 3. Run locally

```bash
# optional Redis
docker compose up -d redis

npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:3000
```

API docs (OpenAPI / Swagger): http://localhost:4000/api/docs

### Local Postgres fallback (no Supabase)

```bash
docker compose --profile local-db up -d postgres
# set DATABASE_URL and DIRECT_URL to local connection in .env
```

## Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@herdshare.pk | Password123! |
| Investor | investor@herdshare.pk | Password123! |
| Farm owner | farm@herdshare.pk | Password123! |

## Monorepo layout

```
apps/api          Express + Prisma
apps/web          Next.js marketing + dashboards
packages/shared   Zod schemas + API helpers
nginx/            Reverse proxy config
```

## API surface (Flutter-ready)

- `POST /api/v1/auth/register|login|refresh`
- `GET/POST /api/v1/farms`, `GET /api/v1/farms/:slug`
- `GET/POST /api/v1/animals`
- `POST /api/v1/investments` (mock payment + agreement)
- `GET /api/v1/wallet`, `POST /api/v1/wallet/deposit`
- `GET /api/v1/notifications`
- `GET /api/v1/admin/*` (RBAC admin)

Full OpenAPI: `GET /api/docs.json`

## SEO & performance

- SSR/SSG for home, marketplace, farms, animal pages
- `sitemap.xml`, `robots.txt`, JSON-LD (`Organization`, `Product`, `LocalBusiness`)
- `generateMetadata` + Open Graph on detail pages
- Next.js Image (AVIF/WebP), font subsetting, Redis-cached public lists
- Dashboards are `noindex`

## Docker (full stack)

```bash
docker compose --profile full up --build
```

Requires a valid `.env` with Supabase (or local-db profile) credentials.

## Legal note

Platform terms and privacy pages are placeholders. Obtain independent legal and Shariah review before production launch.
