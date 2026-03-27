# Deployment Guide

This project is a full-stack app:

- Frontend: Vite + React
- Backend: Express
- Database: PostgreSQL

It can be deployed on `Render`, `Railway`, or a `VPS`.

## Production Env Vars

Set these on your host:

```env
NODE_ENV=production
PORT=10000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

JWT_SECRET=generate-a-long-random-secret
JWT_REFRESH_SECRET=generate-a-second-long-random-secret
SETUP_SECRET=generate-a-third-long-random-secret

CLIENT_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api

YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-youtube-channel-id

VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
VITE_APP_ID=
```

Notes:

- `CLIENT_URL` can contain more than one URL separated by commas if needed.
- `VITE_API_URL` should point to the public API base.
- If frontend and backend are served from the same domain, use `https://yourdomain.com/api`.
- Keep all secrets long and random.

## Build And Start

Install dependencies:

```bash
npm install
```

Push database schema:

```bash
npm run db:push
```

Build the app:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

## Render

Use a `Web Service`.

Settings:

- Build Command: `npm install && npm run db:push && npm run build`
- Start Command: `npm run start`

Also create a PostgreSQL database on Render and copy its connection string into `DATABASE_URL`.

After deployment:

1. Point your domain DNS to Render.
2. Add your custom domain in the Render dashboard.
3. Update:
   - `CLIENT_URL=https://yourdomain.com`
   - `VITE_API_URL=https://yourdomain.com/api`

## Railway

Use one service for the app and one PostgreSQL plugin/service.

Commands:

- Build: `npm install && npm run db:push && npm run build`
- Start: `npm run start`

After attaching your domain:

- set `CLIENT_URL` to your live domain
- set `VITE_API_URL` to `https://yourdomain.com/api`

## VPS

Recommended stack:

- Ubuntu server
- Node 20+
- PostgreSQL
- Nginx
- PM2

Basic flow:

```bash
npm install
npm run db:push
npm run build
pm2 start npm --name pcn-parish -- start
```

Then configure Nginx to reverse proxy to your Node app port.

Example Nginx site:

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:10000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then enable SSL with Let’s Encrypt.

## Domain Setup

After buying your domain:

1. Deploy the app first.
2. Add the custom domain in Render/Railway/Nginx.
3. Point DNS:
   - `A` record to your VPS IP, or
   - `CNAME`/provider-specific target for Render or Railway
4. Wait for SSL to issue.
5. Update `CLIENT_URL` and `VITE_API_URL`.

## First Admin Setup

The app requires:

- a valid database
- env secrets
- at least one admin account in the database

If you want, add the first admin before launch using your existing auth setup or a seed script.

## Recommended Launch Checklist

1. Set production env vars
2. Create production database
3. Run `npm run db:push`
4. Build and start successfully
5. Confirm `/api/health` works
6. Confirm homepage loads
7. Confirm admin login works
8. Confirm uploads and gallery work
9. Confirm contact form submits
10. Confirm custom domain and SSL are active
