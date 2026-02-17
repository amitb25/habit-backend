-- ===================================================
-- Phase 3: Water Intake, Sleep Logs, Notification Prefs
-- Run this in Supabase SQL Editor
-- ===================================================

-- 1. Water Intake - one row per user per day
CREATE TABLE IF NOT EXISTS water_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  glasses INT NOT NULL DEFAULT 0,
  goal INT NOT NULL DEFAULT 8,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, log_date)
);

-- 2. Sleep Logs
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sleep_date DATE NOT NULL,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  duration_hours NUMERIC(4, 2),
  quality VARCHAR(20) CHECK (quality IN ('poor', 'fair', 'good', 'excellent')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Notification Preferences - one row per user
CREATE TABLE IF NOT EXISTS notification_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  water_enabled BOOLEAN DEFAULT true,
  water_interval_hrs INT DEFAULT 2,
  sleep_enabled BOOLEAN DEFAULT true,
  sleep_bedtime TIME DEFAULT '22:00',
  habit_enabled BOOLEAN DEFAULT true,
  habit_time TIME DEFAULT '08:00',
  daily_task_enabled BOOLEAN DEFAULT true,
  daily_task_time TIME DEFAULT '09:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- Indexes
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_water_intakes_profile ON water_intakes(profile_id);
CREATE INDEX IF NOT EXISTS idx_water_intakes_date ON water_intakes(log_date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_profile ON sleep_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_date ON sleep_logs(sleep_date);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_profile ON notification_prefs(profile_id);

-- ===================================================
-- Triggers (auto-update updated_at)
-- ===================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_water_intakes_updated') THEN
    CREATE TRIGGER set_water_intakes_updated BEFORE UPDATE ON water_intakes
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_sleep_logs_updated') THEN
    CREATE TRIGGER set_sleep_logs_updated BEFORE UPDATE ON sleep_logs
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_notification_prefs_updated') THEN
    CREATE TRIGGER set_notification_prefs_updated BEFORE UPDATE ON notification_prefs
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- ===================================================
-- RLS Policies (Row Level Security)
-- ===================================================
ALTER TABLE water_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role (backend uses service key)
CREATE POLICY "Allow all for service role" ON water_intakes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON sleep_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON notification_prefs FOR ALL USING (true) WITH CHECK (true);
