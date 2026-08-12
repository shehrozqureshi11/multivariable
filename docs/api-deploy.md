# HerdShare API — production deploy

Deploy **only** `apps/api` (Express). The Next.js site stays on Vercel.

The web app already defaults to:

```text
https://herdshareapi-production.up.railway.app/api/v1
```

---

## Railway

1. Connect GitHub repo `shehrozqureshi11/multivariable`.
2. **Root Directory:** empty (repo root).
3. **Builder:** Dockerfile → `apps/api/Dockerfile`.
4. Public networking port should match `PORT` (**8080** in the Dockerfile).
5. Optional: set `DATABASE_URL` (Supabase URI) so marketplace listings load.
6. Health: `https://herdshareapi-production.up.railway.app/health`
7. Animals: `https://herdshareapi-production.up.railway.app/api/v1/animals`

JWT and CORS are baked into the image. `/` returning `Route not found` is expected.

### Seed the database (once)

```bash
cd "/Users/apple/final project multivariable"
# .env DATABASE_URL must be the same Postgres as Railway
npm run db:push
npm run db:seed
```

---

## Local Docker check

```bash
docker build -f apps/api/Dockerfile -t herdshare-api .
docker run --rm -p 8080:8080 --env-file .env herdshare-api
curl http://localhost:8080/health
```
