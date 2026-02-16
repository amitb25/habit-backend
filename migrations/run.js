const { Client } = require("pg");
require("dotenv").config();

// Extract project ref from SUPABASE_URL
const SUPABASE_URL = process.env.SUPABASE_URL;
const ref = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");
const DB_PASSWORD = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error("DATABASE_PASSWORD not found in .env");
  console.error("Add this to backend/.env:");
  console.error("  DATABASE_PASSWORD=your_password_here");
  process.exit(1);
}

const SQL_STATEMENTS = [
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS app_streak INT DEFAULT 0`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_app_streak INT DEFAULT 0`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_date DATE`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INT DEFAULT 1`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freezes_available INT DEFAULT 1`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_freeze_granted_week DATE`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reminder_time VARCHAR(5) DEFAULT '08:00'`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true`,
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
];

async function run() {
  const host = `aws-0-ap-south-1.pooler.supabase.com`;
  const user = `postgres.${ref}`;

  console.log(`Connecting to ${host} as ${user}...`);

  const client = new Client({
    user,
    password: DB_PASSWORD,
    host,
    port: 6543,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected! Running migration...\n");

    let success = 0;
    for (let i = 0; i < SQL_STATEMENTS.length; i++) {
      const sql = SQL_STATEMENTS[i];
      const label = sql.trim().substring(0, 60) + "...";
      try {
        await client.query(sql);
        console.log(`  ${i + 1}/${SQL_STATEMENTS.length} ${label}`);
        success++;
      } catch (err) {
        console.error(`  ${i + 1}/${SQL_STATEMENTS.length} FAILED: ${err.message}`);
      }
    }

    console.log(`\nDone! ${success}/${SQL_STATEMENTS.length} succeeded.`);
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

run();
