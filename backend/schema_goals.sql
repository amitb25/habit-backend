-- ============================================
-- Goal Setting Module - SQL Schema
-- Run in Supabase SQL Editor
-- ============================================

-- 1. GOALS TABLE
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'career', 'finance', 'health', 'learning', 'personal', 'fitness', 'other'
  )),
  target_value NUMERIC(12, 2), -- optional numeric target (e.g. save 50000, lose 10kg)
  current_value NUMERIC(12, 2) DEFAULT 0,
  unit VARCHAR(30), -- e.g. 'INR', 'kg', 'books', 'apps', 'hours'
  deadline DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MILESTONES TABLE (sub-tasks within a goal)
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_goals_profile ON goals(profile_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_milestones_goal ON milestones(goal_id);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE TRIGGER set_goals_updated
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
