# HerdShare API — production deploy

Deploy **only** `apps/api` (Express). The Next.js site stays on Vercel.

After the API is live, set this on Vercel:

```text
NEXT_PUBLIC_API_URL=https://YOUR-API-HOST/api/v1
```

---

## Option A — Railway (recommended)

1. Open [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
2. Select `shehrozqureshi11/multivariable`.
3. **Critical settings** (avoids `Cannot find module '@herdshare/shared'`):
   - **Root Directory:** leave empty (repo root) — do **not** set `apps/api`
   - **Settings → Build → Builder:** `Dockerfile`
   - **Dockerfile path:** `apps/api/Dockerfile`
4. Open the service → **Variables** and add:

| Variable | Example / notes |
|----------|-----------------|
| `DATABASE_URL` | Supabase **pooler** URL (`?pgbouncer=true`) |
| `DIRECT_URL` | Supabase **direct** URL |
| `JWT_ACCESS_SECRET` | long random string (32+ chars) |
| `JWT_REFRESH_SECRET` | different long random string |
| `JWT_ACCESS_EXPIRES` | `15m` |
| `JWT_REFRESH_EXPIRES` | `7d` |
| `CORS_ORIGIN` | your Vercel URL, e.g. `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |
| `REDIS_URL` | optional — omit if unused |

5. **Settings → Networking → Generate Domain** → copy the public URL.
6. Confirm health: `https://YOUR-RAILWAY-DOMAIN/health`
7. Confirm docs: `https://YOUR-RAILWAY-DOMAIN/api/docs`
8. On Vercel set:

```text
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-DOMAIN/api/v1
```

9. Redeploy the Vercel project.

### First-time database setup

From your laptop (with `.env` pointed at Supabase):

```bash
npm run db:push
npm run db:seed
```

Or on Railway, add a one-off command / release step after generate:

```bash
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

---

## Option B — Render

1. Open [render.com](https://render.com) → **New** → **Blueprint**.
2. Connect the GitHub repo (uses `render.yaml`).
3. Fill secrets when prompted (`DATABASE_URL`, `DIRECT_URL`, JWTs, `CORS_ORIGIN`).
4. After deploy, copy the service URL (e.g. `https://herdshare-api.onrender.com`).
5. Set Vercel:

```text
NEXT_PUBLIC_API_URL=https://herdshare-api.onrender.com/api/v1
```

Note: free Render services sleep when idle — first request may be slow.

---

## Local Docker check (optional)

```bash
docker build -f apps/api/Dockerfile -t herdshare-api .
docker run --rm -p 4000:4000 --env-file .env herdshare-api
curl http://localhost:4000/health
```

---

## CORS checklist

`CORS_ORIGIN` on the API must match the browser origin of the web app (your Vercel URL). Multiple origins:

```text
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:3000
```
