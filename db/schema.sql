-- Accounts
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  name TEXT,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS youtube_channels (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  name TEXT,
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingestion job tracking
CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube')),
  account_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed')),
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Instagram metrics (daily snapshots)
CREATE TABLE IF NOT EXISTS instagram_metrics (
  id SERIAL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES instagram_accounts(id),
  date DATE NOT NULL,
  followers INTEGER,
  following INTEGER,
  posts_count INTEGER,
  reach INTEGER,
  impressions INTEGER,
  profile_visits INTEGER,
  website_clicks INTEGER,
  engagement_rate NUMERIC(5,2),
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, date)
);

-- Instagram top posts
CREATE TABLE IF NOT EXISTS instagram_top_posts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES instagram_accounts(id),
  media_type TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  likes INTEGER,
  comments INTEGER,
  saves INTEGER,
  reach INTEGER,
  timestamp TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube metrics (daily snapshots)
CREATE TABLE IF NOT EXISTS youtube_metrics (
  id SERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES youtube_channels(id),
  date DATE NOT NULL,
  subscribers INTEGER,
  total_views INTEGER,
  watch_time_hours NUMERIC(10,2),
  avg_view_duration INTEGER,
  engagement_rate NUMERIC(5,2),
  impressions INTEGER,
  ctr NUMERIC(5,2),
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, date)
);

-- YouTube top videos
CREATE TABLE IF NOT EXISTS youtube_top_videos (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES youtube_channels(id),
  title TEXT,
  thumbnail_url TEXT,
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  watch_time_hours NUMERIC(10,2),
  avg_view_duration INTEGER,
  ctr NUMERIC(5,2),
  published_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sentiment cache (keyed by video_id, reuse if analysed_at < 7 days ago)
CREATE TABLE IF NOT EXISTS comment_sentiment (
  id SERIAL PRIMARY KEY,
  video_id TEXT NOT NULL UNIQUE,
  analysed_at TIMESTAMPTZ DEFAULT NOW(),
  positive_pct NUMERIC(5,2),
  neutral_pct NUMERIC(5,2),
  negative_pct NUMERIC(5,2),
  sample_size INTEGER,
  summary TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ig_metrics_account_date ON instagram_metrics(account_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_yt_metrics_channel_date ON youtube_metrics(channel_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_account ON ingestion_jobs(account_id, started_at DESC);
