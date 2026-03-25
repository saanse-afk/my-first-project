-- Social Media Analytics Dashboard Schema
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_post_id TEXT UNIQUE NOT NULL,
  title TEXT,
  full_caption TEXT,
  post_type TEXT, -- VIDEO, CAROUSEL_ALBUM
  published_at DATE,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  saves INT DEFAULT 0,
  engagement_score FLOAT,
  topic TEXT,
  content_type TEXT,
  hook_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- script, caption, hooks
  input JSONB,
  output TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS festivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  deity TEXT,
  related_topics TEXT[],
  days_before INT DEFAULT 14
);

-- Seed festival data for 2025-2026
INSERT INTO festivals (name, date, deity, related_topics, days_before) VALUES
  ('Mahashivratri', '2026-02-26', 'Shiva', ARRAY['Shiva', 'Vedas/Philosophy'], 14),
  ('Holi', '2026-03-13', NULL, ARRAY['Krishna/Vishnu', 'General'], 14),
  ('Ram Navami', '2026-03-29', 'Vishnu', ARRAY['Ramayana', 'Krishna/Vishnu'], 14),
  ('Hanuman Jayanti', '2026-04-12', NULL, ARRAY['Ramayana'], 14),
  ('Akshaya Tritiya', '2026-04-29', NULL, ARRAY['General', 'Vedas/Philosophy'], 7),
  ('Rath Yatra', '2026-07-02', 'Vishnu', ARRAY['Krishna/Vishnu'], 14),
  ('Nag Panchami', '2026-07-27', NULL, ARRAY['Shiva', 'General'], 7),
  ('Raksha Bandhan', '2026-08-09', NULL, ARRAY['General'], 7),
  ('Janmashtami', '2026-08-21', 'Krishna', ARRAY['Krishna/Vishnu'], 14),
  ('Ganesh Chaturthi', '2026-09-10', NULL, ARRAY['General', 'Vedas/Philosophy'], 14),
  ('Navratri', '2026-09-25', 'Devi', ARRAY['Devi/Shakti'], 14),
  ('Dussehra', '2026-10-05', NULL, ARRAY['Ramayana', 'Devi/Shakti'], 14),
  ('Diwali', '2026-10-20', NULL, ARRAY['Ramayana', 'General'], 14),
  ('Kartik Purnima', '2026-11-04', 'Vishnu', ARRAY['Krishna/Vishnu', 'General'], 7)
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_topic ON posts(topic);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_engagement_score ON posts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_hook_type ON posts(hook_type);
CREATE INDEX IF NOT EXISTS idx_festivals_date ON festivals(date);
