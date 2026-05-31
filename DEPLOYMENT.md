# Deployment Guide

This project runs as a **split deployment**:

- **Frontend** — Vite + React, hosted on **Vercel** (static SPA).
- **Backend** — Express API, hosted on **Render** (Web Service).
- **Database** — PostgreSQL on **Neon**.

Pushing to the default branch auto-deploys both Vercel and Render.

---

## 1. Database — Neon

Create a Postgres database on Neon and copy its pooled connection string. It is
used by Render as `DATABASE_URL` (keep `sslmode=require`).

Push the schema once (locally or from the Render build):

```bash
pnpm run db:push
```

## 2. Backend — Render (Web Service)

Connect the repo and configure:

- **Build Command:** `pnpm install && pnpm run db:push && pnpm run build`
- **Start Command:** `pnpm start`

Environment variables:

```env
NODE_ENV=production
# Render injects PORT automatically — do not hardcode it.

DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require

JWT_SECRET=generate-a-long-random-secret
JWT_REFRESH_SECRET=generate-a-second-long-random-secret
SETUP_SECRET=generate-a-third-long-random-secret

# Comma-separated list of allowed browser origins (added to CORS).
# Must include the production Vercel domain (and any custom domain).
CLIENT_URL=https://your-frontend.vercel.app

# The frontend is served by Vercel, so the API runs API-only.
SERVE_FRONTEND=false

YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-youtube-channel-id
```

Notes:

- `trust proxy` is enabled, so rate limiting and Secure cookies work correctly
  behind Render's TLS termination.
- The API enforces CORS — a request from an origin not in the allow-list
  (`CLIENT_URL` + the built-in localhost / `*.vercel.app` defaults) is rejected.

## 3. Frontend — Vercel

Connect the repo. `vercel.json` already sets:

- **Output:** `dist/public`
- **Build:** `pnpm vite build`
- An SPA rewrite so client-side routes fall back to `index.html`.

Set this environment variable in the Vercel project (Production + Preview):

```env
VITE_API_URL=https://your-api.onrender.com/api
```

`VITE_*` vars are baked in at build time, so changing it requires a redeploy.

---

## First Admin Setup

There is no admin until you create one. Call the one-time setup endpoint against
the **Render API** with your `SETUP_SECRET`. It refuses to run once any admin
exists and requires a password of at least 12 characters:

```bash
curl -X POST https://your-api.onrender.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"a-strong-password-12+chars","secret":"YOUR_SETUP_SECRET"}'
```

## Launch Checklist

1. Neon database created and `DATABASE_URL` set on Render.
2. All Render env vars set (secrets long and random — e.g. `openssl rand -base64 64`).
3. `VITE_API_URL` set on Vercel and pointing at the Render API.
4. Render build + start succeed; `GET /api/health` returns `{"status":"ok"}`.
5. Vercel homepage loads and can reach the API (check the browser network tab).
6. First admin created via `/api/auth/setup`; admin login works.
7. Gallery upload, contact form, and donations submit successfully.
8. Custom domain + SSL active on Vercel (and added to `CLIENT_URL` on Render).
