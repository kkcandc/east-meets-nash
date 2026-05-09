-- East Meets Nash initial production schema.
-- Designed for PostgreSQL. ATXP account ids remain external identifiers.

CREATE TABLE IF NOT EXISTS reporters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  beat TEXT NOT NULL,
  tagline TEXT NOT NULL,
  look TEXT NOT NULL,
  voice TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atxp_account_id TEXT UNIQUE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  zones TEXT[] NOT NULL DEFAULT '{}',
  beats TEXT[] NOT NULL DEFAULT '{}',
  reporters TEXT[] NOT NULL DEFAULT '{}',
  email_frequency TEXT NOT NULL DEFAULT 'daily',
  personalization_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  zone TEXT NOT NULL DEFAULT 'East Nashville',
  beat TEXT NOT NULL,
  raw_text TEXT,
  screenshot_asset_id TEXT,
  confidence TEXT NOT NULL,
  risk TEXT NOT NULL DEFAULT 'Low',
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  suggested_reporter_id TEXT REFERENCES reporters(id),
  suggested_label TEXT,
  suggested_angle TEXT,
  publish_format TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  headline TEXT NOT NULL,
  deck TEXT NOT NULL,
  body TEXT NOT NULL,
  zone TEXT NOT NULL DEFAULT 'East Nashville',
  beat TEXT NOT NULL,
  confidence_label TEXT NOT NULL,
  reporter_id TEXT REFERENCES reporters(id),
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  shareability_score INTEGER NOT NULL DEFAULT 0,
  risk_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_sources (
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  source_item_id UUID REFERENCES source_items(id) ON DELETE SET NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  source_note TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (story_id, source_name)
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (story_id, user_id, reaction)
);

CREATE TABLE IF NOT EXISTS sponsor_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL,
  inventory_limit INTEGER,
  deliverables JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS sponsor_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atxp_account_id TEXT,
  product_id TEXT NOT NULL REFERENCES sponsor_products(id),
  amount_usd NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  creative_asset_id TEXT,
  landing_url TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classifieds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  copy TEXT NOT NULL,
  asset_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS video_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  reporter_id TEXT REFERENCES reporters(id),
  prompt TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'higgsfield',
  status TEXT NOT NULL DEFAULT 'queued',
  asset_id TEXT,
  cost_usd NUMERIC(10, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  request_source TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS takedown_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  requester_contact TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_stories_zone ON stories(zone);
CREATE INDEX IF NOT EXISTS idx_stories_beat ON stories(beat);
CREATE INDEX IF NOT EXISTS idx_stories_status_published ON stories(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_source_items_score ON source_items(score DESC);
CREATE INDEX IF NOT EXISTS idx_comments_story ON comments(story_id, created_at DESC);
