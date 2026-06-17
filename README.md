# PCN First Abuja Parish

The official website of the **Presbyterian Church of Nigeria, First Abuja Parish** — a
content-driven church platform with live sermons, events, gallery, donations, and an
admin console for managing everything without touching the codebase.

Live: [pcn-parish-website.vercel.app](https://pcn-parish-website.vercel.app)

---

## What's in here

A single repo with a React frontend and an Express API:

- **`client/`** — Vite + React + TypeScript SPA, styled with Tailwind. The UI uses a
  custom "liquid-glass" design system with full light/dark theming.
- **`server/`** — Express + Drizzle ORM + PostgreSQL. JWT auth (access in memory,
  refresh in httpOnly cookie), rate limiting, CORS allowlist, input validation via
  Zod, helmet, request logging.
- **`shared/`** — types shared between client and server.
- **`scripts/`** — one-off maintenance scripts (DB backfills, etc.).

### Feature highlights

- **Public site:** Home with hero carousel, Sermons (auto-synced from YouTube), Events,
  Gallery, Donations, Ministries, Staff, Testimonies, Contact, About, Safeguarding,
  Privacy, Terms.
- **Gallery with public submissions:** visitors can send photos for review; admins
  approve before publishing. Images are stored on **Cloudinary** (re-encoded with
  `sharp` to strip metadata first).
- **Admin console (`/admin`):** manage sermons, events, gallery, testimonies, hero
  slides, contacts, donations, and editable site copy. First admin is bootstrapped via
  a one-time setup endpoint protected by `SETUP_SECRET`.
- **Donations:** bank-transfer details for NGN / USD / GBP / EUR, plus a contact path
  for online giving.
- **Hardening:** every upload route uses `multer` memory storage + MIME allowlist +
  magic-byte check + `sharp` re-encode; auth runs before multer on admin routes;
  per-route rate limiting (`uploadLimiter`, `submissionLimiter`, etc.).

---

## Tech stack

| Layer       | Choice                                                   |
|-------------|----------------------------------------------------------|
| Frontend    | React 19, Vite 7, TypeScript, Tailwind v4, Framer Motion |
| Routing     | wouter                                                   |
| UI          | Radix UI primitives + custom liquid-glass theme          |
| API         | Express, Drizzle ORM, Zod                                |
| Database    | PostgreSQL (Neon)                                        |
| Media       | Cloudinary (gallery), YouTube Data API (sermons)         |
| Auth        | JWT access + httpOnly refresh cookie, bcrypt             |
| Hosting     | Vercel (frontend) · Render (API) · Neon (DB)             |
| Package mgr | pnpm                                                     |

---

## Local development

Requires Node 20+ and pnpm.

```bash
pnpm install
cp .env.example .env   # if you have one; otherwise see "Environment" below
pnpm db:push           # sync schema to your Postgres
pnpm dev:server        # API on :4000
pnpm dev               # client on :3000 (in a second terminal)
```

Open <http://localhost:3000>.

### Environment

The API reads from `.env`:

```env
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require

JWT_SECRET=long-random-string
JWT_REFRESH_SECRET=another-long-random-string
SETUP_SECRET=a-third-long-random-string

CLIENT_URL=http://localhost:3000

YOUTUBE_API_KEY=...
YOUTUBE_CHANNEL_ID=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

The client reads `VITE_API_URL` (defaults to `http://localhost:4000/api`).

### First admin

There is no admin until you create one:

```bash
curl -X POST http://localhost:4000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"at-least-12-chars","secret":"YOUR_SETUP_SECRET"}'
```

The endpoint refuses to run once an admin exists.

---

## Useful scripts

| Script                        | What it does                                     |
|-------------------------------|--------------------------------------------------|
| `pnpm dev`                    | Vite dev server (client)                         |
| `pnpm dev:server`             | `tsx watch` for the Express API                  |
| `pnpm build`                  | Build client + API for production                |
| `pnpm start`                  | Run the built API (`NODE_ENV=production`)        |
| `pnpm db:push`                | Sync Drizzle schema to the database              |
| `pnpm db:studio`              | Open Drizzle Studio against `DATABASE_URL`       |
| `pnpm test`                   | Vitest                                           |

---

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full Vercel + Render + Neon setup,
including required env vars, the launch checklist, and the first-admin bootstrap.

The stack is host-agnostic — moving the API to Hostinger or any other Node host
only requires re-setting the same env vars.

---

## Project layout

```
client/
  src/
    components/         shared UI (nav, footer, dialogs, theme primitives)
    pages/              one file per route (Home, Sermons, Gallery, Admin, …)
    lib/                api client, logger, theme helpers
server/
  index.ts              app entry — security, CORS, route mounting
  db/                   Drizzle schema + connection
  routes/               one file per resource (sermons, events, gallery, …)
  middleware/           auth, rate limiters, error handler
  lib/                  shared server utilities
shared/                 types used by both sides
scripts/                one-off maintenance scripts
```

---

## Contributing

This is a parish-specific project, but if you spot a bug or a hardening opportunity,
PRs are welcome. Keep changes surgical, match the existing patterns (Zod-validated
routes, `requireAuth` before multer, `sharp` re-encode on every image, etc.).

---

## License

All rights reserved by Presbyterian Church of Nigeria, First Abuja Parish.
Code may not be reused commercially without written permission.
