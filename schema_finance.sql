-- ============================================
-- Income/Expense Tracker - SQL Schema
-- Run in Supabase SQL Editor
-- ============================================

-- 1. TRANSACTIONS TABLE (Income & Expense)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'salary', 'freelance', 'investment', 'gift', 'refund', 'other_income',
    'food', 'transport', 'shopping', 'bills', 'rent', 'entertainment',
    'health', 'education', 'recharge', 'emi', 'other_expense'
  )),
  title VARCHAR(200) NOT NULL,
  note TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MONTHLY BUDGETS TABLE
CREATE TABLE monthly_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  budget_amount NUMERIC(12, 2) NOT NULL CHECK (budget_amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, month)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_transactions_profile ON transactions(profile_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_monthly_budgets_profile ON monthly_budgets(profile_id);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE TRIGGER set_transactions_updated
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_monthly_budgets_updated
  BEFORE UPDATE ON monthly_budgets
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
