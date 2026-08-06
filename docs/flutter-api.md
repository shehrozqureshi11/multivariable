# Flutter / mobile client handoff

HerdShare exposes a versioned REST API designed for a future Flutter app.

## Base URL

- Local: `http://localhost:4000/api/v1`
- Docs UI: `http://localhost:4000/api/docs`
- Spec JSON: `http://localhost:4000/api/docs.json`

## Auth

1. `POST /auth/register` or `POST /auth/login`
2. Store `accessToken` + `refreshToken`
3. Send `Authorization: Bearer <accessToken>` on protected routes
4. Refresh via `POST /auth/refresh` with `{ "refreshToken": "..." }`

## Roles

`INVESTOR` | `FARM_OWNER` | `ADMIN` — enforced by RBAC middleware.

## Priority endpoints for mobile

| Method | Path | Role |
|--------|------|------|
| GET | /animals | public |
| GET | /animals/:slug | public |
| GET | /farms | public |
| POST | /investments | investor |
| GET | /investments/mine | investor |
| GET | /wallet | auth |
| GET | /notifications | auth |
| POST | /animals | farm_owner |
| GET | /admin/stats | admin |

Envelope: `{ "success": true, "data": ..., "meta": { "page", "limit", "total" } }`
