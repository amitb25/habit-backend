const { Pool } = require("pg");
require("dotenv").config();

// ── Profile column additions ─────────────────────────────────────────
const PROFILE_COLUMNS = [
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS app_streak INT DEFAULT 0",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_app_streak INT DEFAULT 0",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_date DATE",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INT DEFAULT 1",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freezes_available INT DEFAULT 1",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_freeze_granted_week DATE",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reminder_time VARCHAR(5) DEFAULT '08:00'",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true",
];

// ── Table creation (all IF NOT EXISTS) ───────────────────────────────
const TABLES = [
  // Phase 1 tables
  `CREATE TABLE IF NOT EXISTS daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    habits_completed INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, checkin_date)
  )`,
  `CREATE TABLE IF NOT EXISTS xp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    reason VARCHAR(100) NOT NULL,
    reference_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS streak_freezes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
    freeze_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, freeze_date)
  )`,

  // Custom affirmations
  `CREATE TABLE IF NOT EXISTS custom_affirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'personal' CHECK (category IN (
      'confidence', 'career', 'wealth', 'health', 'gratitude', 'discipline', 'desi', 'personal'
    )),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Finance tables
  `CREATE TABLE IF NOT EXISTS transactions (
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
  )`,
  `CREATE TABLE IF NOT EXISTS monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL,
    budget_amount NUMERIC(12, 2) NOT NULL CHECK (budget_amount > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, month)
  )`,

  // Goal tables
  `CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN (
      'career', 'finance', 'health', 'learning', 'personal', 'fitness', 'other'
    )),
    target_value NUMERIC(12, 2),
    current_value NUMERIC(12, 2) DEFAULT 0,
    unit VARCHAR(30),
    deadline DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
];

// ── Indexes (IF NOT EXISTS) ──────────────────────────────────────────
const INDEXES = [
  "CREATE INDEX IF NOT EXISTS idx_custom_affirmations_profile ON custom_affirmations(profile_id)",
  "CREATE INDEX IF NOT EXISTS idx_custom_affirmations_category ON custom_affirmations(category)",
  "CREATE INDEX IF NOT EXISTS idx_transactions_profile ON transactions(profile_id)",
  "CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)",
  "CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date)",
  "CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category)",
  "CREATE INDEX IF NOT EXISTS idx_monthly_budgets_profile ON monthly_budgets(profile_id)",
  "CREATE INDEX IF NOT EXISTS idx_goals_profile ON goals(profile_id)",
  "CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status)",
  "CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(category)",
  "CREATE INDEX IF NOT EXISTS idx_milestones_goal ON milestones(goal_id)",
];

// ── update_modified_column function + triggers ───────────────────────
const TRIGGERS = [
  `CREATE OR REPLACE FUNCTION update_modified_column()
   RETURNS TRIGGER AS $$
   BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
   $$ LANGUAGE plpgsql`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_transactions_updated') THEN
      CREATE TRIGGER set_transactions_updated BEFORE UPDATE ON transactions
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_monthly_budgets_updated') THEN
      CREATE TRIGGER set_monthly_budgets_updated BEFORE UPDATE ON monthly_budgets
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_goals_updated') THEN
      CREATE TRIGGER set_goals_updated BEFORE UPDATE ON goals
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
  END $$`,
];

// ── Runner ───────────────────────────────────────────────────────────
async function runPhase1Migration() {
  if (!process.env.DATABASE_URL) {
    console.log("[Migration] DATABASE_URL not set, skipping migration.");
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  let successCount = 0;
  let skipCount = 0;
  const allStatements = [
    ...PROFILE_COLUMNS,
    ...TABLES,
    ...INDEXES,
    ...TRIGGERS,
  ];

  try {
    for (const sql of allStatements) {
      try {
        await pool.query(sql);
        successCount++;
      } catch (e) {
        // "already exists" errors are fine — skip silently
        if (
          e.message.includes("already exists") ||
          e.message.includes("duplicate")
        ) {
          skipCount++;
        } else {
          console.warn("[Migration] Warning:", e.message.slice(0, 120));
          skipCount++;
        }
      }
    }
    console.log(
      `[Migration] Done — ${successCount} applied, ${skipCount} skipped/existing.`
    );
  } catch (err) {
    console.error("[Migration] Fatal:", err.message);
  } finally {
    await pool.end();
  }
}

module.exports = { runPhase1Migration };
