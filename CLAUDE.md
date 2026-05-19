# Social Media Analytics Dashboard

## Overview
Full-stack Next.js 14 app that pulls metrics from Instagram (Meta Graph API) and YouTube (Data + Analytics APIs), stores them in Supabase Postgres, and displays them in a unified dashboard.

## Commands
- `npm run dev` — start development server (http://localhost:3000)
- `npm run build` — production build
- `npm start` — start production server

## Architecture
- **Framework**: Next.js 14 App Router (frontend + API routes)
- **Database**: Supabase Postgres via `pg` client
- **Auth**: Single admin password + httpOnly JWT cookie (`jose`)
- **Ingestion**: HTTP-triggered (`POST /api/instagram/ingest`, `POST /api/youtube/ingest`)
- **Sentiment**: Claude Haiku via `@anthropic-ai/sdk`, cached in `comment_sentiment` table

## Key Rules
- Never auto-migrate — schema is set up once via `/db/schema.sql`
- All secrets via `process.env` only — never hardcode
- Ingestion is HTTP-triggered only (no `node-cron`)
- API failures must not crash the dashboard — all errors caught and logged
- TypeScript throughout — no `any` unless unavoidable
