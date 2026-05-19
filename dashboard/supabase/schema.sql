-- ============================================================
-- Social Media Content Intelligence Dashboard — DB Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Organizations (clients/brands)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Social accounts connected to organizations
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube')),
  account_id TEXT NOT NULL,
  account_name TEXT,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  followers_count INT DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts (content items from any platform)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform_post_id TEXT NOT NULL,
  title TEXT,
  full_caption TEXT,
  post_type TEXT, -- 'VIDEO', 'CAROUSEL_ALBUM', 'IMAGE', 'YOUTUBE_SHORT', 'YOUTUBE_LONG'
  published_at TIMESTAMPTZ NOT NULL,
  permalink TEXT,
  thumbnail_url TEXT,
  -- AI-extracted metadata
  topic TEXT,
  content_type TEXT,
  hook_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(social_account_id, platform_post_id)
);

-- Post metrics (time-series, updated on each sync)
CREATE TABLE IF NOT EXISTS post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  saves INT DEFAULT 0,
  reach INT DEFAULT 0,
  impressions INT DEFAULT 0,
  avg_watch_time_seconds FLOAT,
  completion_rate FLOAT,
  engagement_score FLOAT,
  UNIQUE(post_id, (recorded_at::date))
);

-- AI generations (saved outputs)
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL,
  input_context JSONB,
  output_content TEXT NOT NULL,
  model TEXT DEFAULT 'claude-sonnet-4-20250514',
  tokens_used INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hindu festival calendar (static, seeded once)
CREATE TABLE IF NOT EXISTS festivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  deity TEXT,
  related_topics TEXT[],
  content_suggestions TEXT[],
  days_before_to_post INT DEFAULT 14
);

-- Sync logs
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  posts_synced INT DEFAULT 0,
  errors_count INT DEFAULT 0,
  status TEXT DEFAULT 'running', -- 'running', 'success', 'error'
  error_message TEXT
);

-- Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- MVP policies: allow all authenticated users to read everything
CREATE POLICY IF NOT EXISTS "Allow authenticated read" ON organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated insert" ON organizations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow service role all" ON organizations FOR ALL TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated read" ON social_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role all" ON social_accounts FOR ALL TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated read" ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role all" ON posts FOR ALL TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated read" ON post_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role all" ON post_metrics FOR ALL TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated read" ON ai_generations FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role all" ON ai_generations FOR ALL TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated read" ON festivals FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role all" ON festivals FOR ALL TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated read" ON sync_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role all" ON sync_logs FOR ALL TO service_role USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_social_account ON posts(social_account_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_topic ON posts(topic);
CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_recorded_at ON post_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_festivals_date ON festivals(date);
