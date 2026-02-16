-- ============================================
-- Amit's Success & Recovery App - SQL Schema
-- Run this in Supabase SQL Editor (supabase.com/dashboard → SQL Editor)
-- ============================================

-- 1. PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  manifestation TEXT DEFAULT 'I am becoming the best version of myself.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HABITS TABLE
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('dsa', 'react_native', 'job_application', 'english', 'other')),
  is_completed_today BOOLEAN DEFAULT FALSE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_completed_date DATE,
  total_completions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HABIT_LOGS TABLE
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- 4. DEBTS TABLE
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lender_name VARCHAR(150) NOT NULL,
  description TEXT,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  paid_amount NUMERIC(12, 2) DEFAULT 0 CHECK (paid_amount >= 0),
  remaining_amount NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  is_cleared BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DEBT_PAYMENTS TABLE
CREATE TABLE debt_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  note TEXT,
  paid_on DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_habits_profile ON habits(profile_id);
CREATE INDEX idx_habits_category ON habits(category);
CREATE INDEX idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(completed_date);
CREATE INDEX idx_debts_profile ON debts(profile_id);
CREATE INDEX idx_debt_payments_debt ON debt_payments(debt_id);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_habits_updated
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_debts_updated
  BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================
-- AUTO-MARK debt as cleared TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION check_debt_cleared()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.paid_amount >= NEW.total_amount THEN
    NEW.is_cleared = TRUE;
  ELSE
    NEW.is_cleared = FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_clear_debt
  BEFORE INSERT OR UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION check_debt_cleared();

-- ============================================
-- INSERT DEFAULT PROFILE (so you can start using the app)
-- ============================================
INSERT INTO profiles (name, email, manifestation)
VALUES ('Amit', 'amit@example.com', 'I will crack my dream job and become debt-free. Every day I am getting closer to success.');
