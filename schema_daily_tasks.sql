-- ============================================
-- Daily Tasks Table
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  task_time VARCHAR(5),  -- e.g. "09:00", "14:00"
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  category VARCHAR(30) NOT NULL DEFAULT 'other' CHECK (category IN ('dsa', 'react_native', 'job_hunt', 'personal', 'health', 'other')),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_daily_tasks_profile ON daily_tasks(profile_id);
CREATE INDEX idx_daily_tasks_date ON daily_tasks(task_date);
CREATE INDEX idx_daily_tasks_profile_date ON daily_tasks(profile_id, task_date);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- (reuses existing update_modified_column function)
-- ============================================
CREATE TRIGGER set_daily_tasks_updated
  BEFORE UPDATE ON daily_tasks
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
