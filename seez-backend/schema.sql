-- SEEZ Database Schema
-- Run this in your Supabase SQL editor

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  language TEXT DEFAULT 'english',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active'
);

-- SEEZ Cards (FIFA-style stat card)
CREATE TABLE IF NOT EXISTS seez_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  opening_stat INTEGER DEFAULT 50,
  rapport_stat INTEGER DEFAULT 50,
  discovery_stat INTEGER DEFAULT 50,
  objection_stat INTEGER DEFAULT 50,
  closing_stat INTEGER DEFAULT 50,
  adaptability_stat INTEGER DEFAULT 50,
  overall_rating INTEGER GENERATED ALWAYS AS (
    (opening_stat * 15 + rapport_stat * 15 + discovery_stat * 20 +
     objection_stat * 20 + closing_stat * 20 + adaptability_stat * 10) / 100
  ) STORED,
  elo INTEGER DEFAULT 0,
  rank_tier TEXT DEFAULT 'Bronze',
  rank_title TEXT DEFAULT 'Cold Caller',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_call_date DATE,
  total_calls INTEGER DEFAULT 0,
  calls_graded_b_or_above INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenarios
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  personality_type TEXT NOT NULL,
  call_stage TEXT NOT NULL,
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  prospect_name TEXT,
  prospect_role TEXT,
  prospect_company TEXT,
  prospect_backstory TEXT,
  prospect_system_prompt TEXT,
  default_product TEXT,
  is_random_eligible BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'both',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id),
  mode TEXT NOT NULL,
  language TEXT NOT NULL,
  product_sold TEXT,
  retell_call_id TEXT,
  duration_seconds INTEGER,
  ended_by TEXT,
  score_opening INTEGER,
  score_rapport INTEGER,
  score_discovery INTEGER,
  score_objection INTEGER,
  score_closing INTEGER,
  score_adaptability INTEGER,
  score_overall INTEGER,
  grade TEXT,
  strengths JSONB,
  improvements JSONB,
  kb_tips_surfaced JSONB,
  psychological_insights JSONB,
  transcript TEXT,
  elo_change INTEGER,
  hints_used INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Knowledge Base
CREATE TABLE IF NOT EXISTS kb_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_content TEXT NOT NULL,
  example_script TEXT,
  source TEXT,
  topic TEXT,
  skill_level TEXT,
  call_stages TEXT[],
  industries TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Products
CREATE TABLE IF NOT EXISTS user_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  key_value_props TEXT[],
  target_industries TEXT[],
  price_range TEXT,
  raw_file_url TEXT,
  processed_content TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarked KB
CREATE TABLE IF NOT EXISTS bookmarked_kb (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  kb_entry_id UUID REFERENCES kb_entries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, kb_entry_id)
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seez_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_kb ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first so re-running is safe)
DROP POLICY IF EXISTS "Users see own profile" ON users;
DROP POLICY IF EXISTS "Users see own card" ON seez_cards;
DROP POLICY IF EXISTS "Users see own calls" ON calls;
DROP POLICY IF EXISTS "Scenarios are public" ON scenarios;
DROP POLICY IF EXISTS "KB is public" ON kb_entries;
DROP POLICY IF EXISTS "Users see own products" ON user_products;
DROP POLICY IF EXISTS "Users see own bookmarks" ON bookmarked_kb;

CREATE POLICY "Users see own profile" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users see own card" ON seez_cards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own calls" ON calls FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Scenarios are public" ON scenarios FOR SELECT USING (true);
CREATE POLICY "KB is public" ON kb_entries FOR SELECT USING (true);
CREATE POLICY "Users see own products" ON user_products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own bookmarks" ON bookmarked_kb FOR ALL USING (auth.uid() = user_id);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO seez_cards (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
