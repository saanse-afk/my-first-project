# Social Media Analytics Dashboard

A full-stack dashboard for Instagram and YouTube analytics, built with Next.js 14, Supabase Postgres, and the Meta Graph API + YouTube Data/Analytics APIs.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- Meta Developer App with Instagram Graph API access
- Google Cloud project with YouTube Data API v3 + YouTube Analytics API enabled
- Anthropic API key (for sentiment analysis)

---

## 1. Supabase Setup (one-time)

1. Create a new Supabase project
2. Go to **SQL Editor** in your Supabase dashboard
3. Paste the contents of `/db/schema.sql` and run it
4. Copy your connection string from **Settings → Database → Connection string (URI)**

---

## 2. Meta / Instagram Tokens

You need one long-lived access token per Instagram account:

1. Create a Meta App at [developers.facebook.com](https://developers.facebook.com)
2. Add the **Instagram Graph API** product
3. Get a short-lived user access token via the Graph API Explorer
4. Exchange it for a long-lived token (valid 60 days):
   ```
   GET https://graph.instagram.com/access_token
     ?grant_type=ig_exchange_token
     &client_id={app-id}
     &client_secret={app-secret}
     &access_token={short-lived-token}
   ```
5. Get each account's Instagram Business Account ID:
   ```
   GET https://graph.instagram.com/me?fields=id,username&access_token={token}
   ```

Tokens are refreshed automatically before each ingestion when they're within 10 days of expiry.

---

## 3. YouTube OAuth Tokens

You need one refresh token per YouTube channel:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable **YouTube Data API v3** and **YouTube Analytics API**
3. Create OAuth 2.0 credentials (Desktop app type)
4. Use the [OAuth Playground](https://developers.google.com/oauthplayground) to get refresh tokens:
   - Scope: `https://www.googleapis.com/auth/youtube.readonly` + `https://www.googleapis.com/auth/yt-analytics.readonly`
   - Exchange the auth code for tokens and copy the refresh token

Access tokens are refreshed automatically before each API call when they're within 5 minutes of expiry.

---

## 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Dashboard login password |
| `SESSION_SECRET` | Random 32+ char string for signing cookies |
| `DATABASE_URL` | Supabase connection string |
| `META_APP_ID` | Meta app ID |
| `META_APP_SECRET` | Meta app secret |
| `INSTAGRAM_ACCESS_TOKENS` | Comma-separated long-lived tokens (5 accounts) |
| `INSTAGRAM_ACCOUNT_IDS` | Comma-separated Instagram Business Account IDs |
| `YOUTUBE_CLIENT_ID` | Google OAuth client ID |
| `YOUTUBE_CLIENT_SECRET` | Google OAuth client secret |
| `YOUTUBE_REFRESH_TOKENS` | Comma-separated OAuth refresh tokens (5 channels) |
| `YOUTUBE_CHANNEL_IDS` | Comma-separated YouTube channel IDs |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Haiku sentiment |
| `NEXT_PUBLIC_APP_URL` | App URL (e.g. `http://localhost:3000`) |

---

## 5. Seed Account Data (one-time)

After running the schema, insert your accounts into the database via Supabase SQL Editor:

```sql
-- Instagram accounts
INSERT INTO instagram_accounts (id, username, name, access_token, token_expires_at)
VALUES ('YOUR_IG_ACCOUNT_ID', 'username', 'Display Name', 'YOUR_TOKEN', NOW() + INTERVAL '60 days');

-- YouTube channels
INSERT INTO youtube_channels (id, channel_id, name, refresh_token)
VALUES ('channel-slug', 'UC...ACTUAL_CHANNEL_ID', 'Channel Name', 'YOUR_REFRESH_TOKEN');
```

The `id` column in `youtube_channels` is your internal identifier (can match `channel_id`).

---

## 6. Running the App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

Enter your `ADMIN_PASSWORD` to access the dashboard.

---

## 7. Triggering Data Ingestion

Data is fetched via HTTP POST — there is no automatic background job.

```bash
# Ingest all Instagram accounts
curl -X POST http://localhost:3000/api/instagram/ingest \
  -H "Cookie: ds_session=YOUR_SESSION_COOKIE"

# Ingest all YouTube channels
curl -X POST http://localhost:3000/api/youtube/ingest \
  -H "Cookie: ds_session=YOUR_SESSION_COOKIE"

# Ingest a single account
curl -X POST http://localhost:3000/api/instagram/ingest \
  -H "Content-Type: application/json" \
  -H "Cookie: ds_session=YOUR_SESSION_COOKIE" \
  -d '{"accountId": "YOUR_IG_ACCOUNT_ID"}'
```

Or use the **Refresh** buttons in the dashboard.

For automated ingestion, set up an external cron job (e.g. GitHub Actions, cron-job.org) to hit these endpoints daily.

---

## 8. Manual Steps Before Data Appears

1. Run `/db/schema.sql` in Supabase SQL Editor
2. Insert account rows (see step 5)
3. Fill in `.env.local`
4. Run `npm run dev`
5. Log in and click **Refresh All** on the dashboard home page
