const { Pool } = require("pg");
require("dotenv").config();

// ── Profile column additions ─────────────────────────────────────────
const PROFILE_COLUMNS = [
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE",
];

// ── New tables ───────────────────────────────────────────────────────
const TABLES = [
  // Admins table
  `CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'viewer')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Exercise categories
  `CREATE TABLE IF NOT EXISTS exercise_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(10) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Exercises
  `CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES exercise_categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    sets INT NOT NULL DEFAULT 3,
    reps VARCHAR(30) NOT NULL,
    rest VARCHAR(20) NOT NULL,
    tip TEXT,
    video_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Workout plans
  `CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration VARCHAR(30) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(10) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Workout plan exercises
  `CREATE TABLE IF NOT EXISTS workout_plan_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    exercise_name VARCHAR(200) NOT NULL,
    sets INT NOT NULL DEFAULT 3,
    reps VARCHAR(30) NOT NULL,
    rest VARCHAR(20) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // App settings
  `CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
];

// ── Indexes ──────────────────────────────────────────────────────────
const INDEXES = [
  "CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email)",
  "CREATE INDEX IF NOT EXISTS idx_exercise_categories_order ON exercise_categories(sort_order)",
  "CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category_id)",
  "CREATE INDEX IF NOT EXISTS idx_exercises_level ON exercises(level)",
  "CREATE INDEX IF NOT EXISTS idx_exercises_order ON exercises(category_id, sort_order)",
  "CREATE INDEX IF NOT EXISTS idx_workout_plans_level ON workout_plans(level)",
  "CREATE INDEX IF NOT EXISTS idx_workout_plans_order ON workout_plans(sort_order)",
  "CREATE INDEX IF NOT EXISTS idx_wpe_plan ON workout_plan_exercises(plan_id)",
  "CREATE INDEX IF NOT EXISTS idx_wpe_order ON workout_plan_exercises(plan_id, sort_order)",
];

// ── Triggers ─────────────────────────────────────────────────────────
const TRIGGERS = [
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_admins_updated') THEN
      CREATE TRIGGER set_admins_updated BEFORE UPDATE ON admins
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_exercise_categories_updated') THEN
      CREATE TRIGGER set_exercise_categories_updated BEFORE UPDATE ON exercise_categories
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_exercises_updated') THEN
      CREATE TRIGGER set_exercises_updated BEFORE UPDATE ON exercises
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_workout_plans_updated') THEN
      CREATE TRIGGER set_workout_plans_updated BEFORE UPDATE ON workout_plans
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
  END $$`,
];

// ── Seed data ────────────────────────────────────────────────────────
const SEED_CATEGORIES = [
  { name: "Chest", icon: "\u{1F4AA}", color: "#e05555", sort_order: 1 },
  { name: "Back", icon: "\u{1F9BE}", color: "#2bb883", sort_order: 2 },
  { name: "Legs", icon: "\u{1F9B5}", color: "#2bb883", sort_order: 3 },
  { name: "Shoulders", icon: "\u{1F3CB}", color: "#e0a820", sort_order: 4 },
  { name: "Arms", icon: "\u{270A}", color: "#e0a820", sort_order: 5 },
  { name: "Core / Abs", icon: "\u{1F525}", color: "#e06612", sort_order: 6 },
  { name: "Full Body", icon: "\u{1F3C3}", color: "#1eac50", sort_order: 7 },
];

const SEED_EXERCISES = {
  Chest: [
    { level: "beginner", name: "Wall Push-ups", sets: 3, reps: "12-15", rest: "30s", tip: "Haath shoulder-width rakh, chest ko wall tak lao", sort_order: 1 },
    { level: "beginner", name: "Knee Push-ups", sets: 3, reps: "10-12", rest: "30s", tip: "Back straight rakho, slowly neeche jao", sort_order: 2, video_url: "https://res.cloudinary.com/dju2e6ctq/video/upload/v1771237433/exercises/knee-pushup.mp4" },
    { level: "beginner", name: "Incline Push-ups", sets: 3, reps: "10-12", rest: "45s", tip: "Bench ya chair pe haath rakh ke karo", sort_order: 3 },
    { level: "intermediate", name: "Standard Push-ups", sets: 4, reps: "12-15", rest: "45s", tip: "Full range of motion, chest touch the floor", sort_order: 4, video_url: "https://res.cloudinary.com/dju2e6ctq/video/upload/v1771237419/exercises/chest-pushup.mp4" },
    { level: "intermediate", name: "Wide Push-ups", sets: 3, reps: "12", rest: "45s", tip: "Haath wide rakh \u2014 outer chest target hoga", sort_order: 5 },
    { level: "intermediate", name: "Diamond Push-ups", sets: 3, reps: "10", rest: "60s", tip: "Haath diamond shape mein \u2014 inner chest + triceps", sort_order: 6 },
    { level: "advanced", name: "Decline Push-ups", sets: 4, reps: "12-15", rest: "45s", tip: "Pair upar rakh \u2014 upper chest hit hoga", sort_order: 7 },
    { level: "advanced", name: "Archer Push-ups", sets: 3, reps: "8 each", rest: "60s", tip: "Ek haath se push karo, dusra side extend", sort_order: 8 },
    { level: "advanced", name: "Clap Push-ups", sets: 3, reps: "8-10", rest: "60s", tip: "Explosive push + clap \u2014 power build hoga", sort_order: 9 },
  ],
  Back: [
    { level: "beginner", name: "Superman Hold", sets: 3, reps: "15s hold", rest: "30s", tip: "Pet ke bal let ke haath-pair upar uthao", sort_order: 1 },
    { level: "beginner", name: "Reverse Snow Angels", sets: 3, reps: "12", rest: "30s", tip: "Slowly arms move karo floor pe \u2014 back activate", sort_order: 2 },
    { level: "beginner", name: "Prone Y Raises", sets: 3, reps: "12", rest: "30s", tip: "Y shape mein arms upar uthao \u2014 upper back", sort_order: 3 },
    { level: "intermediate", name: "Doorway Rows", sets: 3, reps: "12", rest: "45s", tip: "Door frame pakad ke body pull karo", sort_order: 4 },
    { level: "intermediate", name: "Towel Rows", sets: 4, reps: "12", rest: "45s", tip: "Towel ko door handle pe dal ke pull", sort_order: 5 },
    { level: "intermediate", name: "Superman Pulses", sets: 3, reps: "20", rest: "45s", tip: "Superman position mein pulse karo", sort_order: 6 },
    { level: "advanced", name: "Pull-ups", sets: 4, reps: "8-10", rest: "60s", tip: "Bar pakad ke body upar pull \u2014 king of back exercises", sort_order: 7 },
    { level: "advanced", name: "Chin-ups", sets: 4, reps: "8-10", rest: "60s", tip: "Underhand grip \u2014 biceps bhi lagenge", sort_order: 8 },
    { level: "advanced", name: "Australian Pull-ups", sets: 3, reps: "12", rest: "60s", tip: "Low bar ke neeche let ke pull karo", sort_order: 9 },
  ],
  Legs: [
    { level: "beginner", name: "Bodyweight Squats", sets: 3, reps: "15", rest: "30s", tip: "Knees toes ke peeche, chest up, deep jao", sort_order: 1 },
    { level: "beginner", name: "Wall Sit", sets: 3, reps: "20-30s", rest: "30s", tip: "Wall pe back laga ke 90\u00B0 pe baitho", sort_order: 2 },
    { level: "beginner", name: "Calf Raises", sets: 3, reps: "20", rest: "30s", tip: "Pair ki ungli pe upar uthao \u2014 calves burn karengi", sort_order: 3 },
    { level: "intermediate", name: "Lunges", sets: 3, reps: "12 each", rest: "45s", tip: "Aage step karo, 90\u00B0 pe neeche jao", sort_order: 4 },
    { level: "intermediate", name: "Sumo Squats", sets: 4, reps: "15", rest: "45s", tip: "Wide stance \u2014 inner thighs target", sort_order: 5 },
    { level: "intermediate", name: "Step-ups", sets: 3, reps: "12 each", rest: "45s", tip: "Chair pe step up karo \u2014 glutes fire karengi", sort_order: 6 },
    { level: "advanced", name: "Jump Squats", sets: 4, reps: "12", rest: "60s", tip: "Squat + explosive jump \u2014 power legs", sort_order: 7 },
    { level: "advanced", name: "Bulgarian Split Squats", sets: 3, reps: "10 each", rest: "60s", tip: "Peeche pair bench pe \u2014 single leg killer", sort_order: 8 },
    { level: "advanced", name: "Pistol Squats", sets: 3, reps: "5 each", rest: "90s", tip: "One leg squat \u2014 ultimate leg strength", sort_order: 9 },
  ],
  Shoulders: [
    { level: "beginner", name: "Arm Circles", sets: 3, reps: "20 each", rest: "20s", tip: "Small circles \u2014 shoulder warmup", sort_order: 1 },
    { level: "beginner", name: "Pike Push-up (easy)", sets: 3, reps: "8-10", rest: "30s", tip: "Hips upar, haath close \u2014 shoulder press feel", sort_order: 2 },
    { level: "beginner", name: "Lateral Raises (no weight)", sets: 3, reps: "15", rest: "30s", tip: "Arms side mein uthao, slow karo", sort_order: 3 },
    { level: "intermediate", name: "Pike Push-ups", sets: 4, reps: "10-12", rest: "45s", tip: "Higher hips = more shoulder activation", sort_order: 4 },
    { level: "intermediate", name: "Shoulder Tap Push-ups", sets: 3, reps: "12", rest: "45s", tip: "Push-up + tap opposite shoulder \u2014 stability", sort_order: 5 },
    { level: "intermediate", name: "Wall Walks", sets: 3, reps: "5", rest: "60s", tip: "Floor se wall tak haath se walk karo", sort_order: 6 },
    { level: "advanced", name: "Handstand Hold (wall)", sets: 3, reps: "15-20s", rest: "60s", tip: "Wall support mein handstand \u2014 shoulders on fire", sort_order: 7 },
    { level: "advanced", name: "Handstand Push-ups", sets: 3, reps: "5-8", rest: "90s", tip: "Wall handstand mein push-up \u2014 beast mode", sort_order: 8 },
    { level: "advanced", name: "Pseudo Planche Push-ups", sets: 3, reps: "8", rest: "60s", tip: "Haath peeche rakh ke push-up \u2014 front delt killer", sort_order: 9 },
  ],
  Arms: [
    { level: "beginner", name: "Bicep Curls (water bottle)", sets: 3, reps: "15", rest: "30s", tip: "Paani ki bottle se curl karo \u2014 light but effective", sort_order: 1 },
    { level: "beginner", name: "Tricep Dips (chair)", sets: 3, reps: "10", rest: "30s", tip: "Chair pe haath rakh, neeche jao \u2014 triceps burn", sort_order: 2 },
    { level: "beginner", name: "Wrist Curls", sets: 3, reps: "20", rest: "20s", tip: "Forearms ke liye \u2014 bottle se karo", sort_order: 3 },
    { level: "intermediate", name: "Close-grip Push-ups", sets: 4, reps: "12", rest: "45s", tip: "Haath close rakh \u2014 triceps main target", sort_order: 4 },
    { level: "intermediate", name: "Chin-up Holds", sets: 3, reps: "15-20s", rest: "45s", tip: "Chin-up position mein hold \u2014 biceps isometric", sort_order: 5 },
    { level: "intermediate", name: "Bench Dips (legs straight)", sets: 3, reps: "12", rest: "45s", tip: "Legs straight = harder tricep dips", sort_order: 6 },
    { level: "advanced", name: "Chin-ups (slow negative)", sets: 4, reps: "6-8", rest: "60s", tip: "Upar jao fast, neeche aao 4 seconds mein", sort_order: 7 },
    { level: "advanced", name: "Tiger Bend Push-ups", sets: 3, reps: "6-8", rest: "60s", tip: "Forearm to hand push-up \u2014 arm destroyer", sort_order: 8 },
    { level: "advanced", name: "Muscle-ups", sets: 3, reps: "3-5", rest: "90s", tip: "Pull-up + dip combo \u2014 ultimate arm exercise", sort_order: 9 },
  ],
  "Core / Abs": [
    { level: "beginner", name: "Dead Bug", sets: 3, reps: "10 each", rest: "30s", tip: "Back flat on floor, opposite arm-leg extend", sort_order: 1 },
    { level: "beginner", name: "Plank", sets: 3, reps: "20-30s", rest: "30s", tip: "Body straight, core tight \u2014 basics ka king", sort_order: 2 },
    { level: "beginner", name: "Crunches", sets: 3, reps: "15", rest: "30s", tip: "Shoulders uthao, lower back floor pe", sort_order: 3 },
    { level: "intermediate", name: "Bicycle Crunches", sets: 3, reps: "20", rest: "45s", tip: "Elbow to opposite knee \u2014 obliques target", sort_order: 4 },
    { level: "intermediate", name: "Mountain Climbers", sets: 3, reps: "20", rest: "45s", tip: "Fast pace \u2014 cardio + core combo", sort_order: 5 },
    { level: "intermediate", name: "Leg Raises", sets: 3, reps: "12", rest: "45s", tip: "Pair seedhe upar uthao \u2014 lower abs fire", sort_order: 6 },
    { level: "advanced", name: "Dragon Flags", sets: 3, reps: "6-8", rest: "60s", tip: "Bruce Lee ka favourite \u2014 full core destroyer", sort_order: 7 },
    { level: "advanced", name: "L-Sit Hold", sets: 3, reps: "15-20s", rest: "60s", tip: "Pair seedhe rakh ke body uthao \u2014 abs + hip flexors", sort_order: 8 },
    { level: "advanced", name: "Ab Wheel Rollouts", sets: 3, reps: "10", rest: "60s", tip: "Full extension \u2014 advanced core strength", sort_order: 9 },
  ],
  "Full Body": [
    { level: "beginner", name: "Jumping Jacks", sets: 3, reps: "20", rest: "30s", tip: "Classic warmup \u2014 pura body involve", sort_order: 1 },
    { level: "beginner", name: "Bear Crawl", sets: 3, reps: "10m", rest: "30s", tip: "Haath-pair pe crawl \u2014 coordination build", sort_order: 2 },
    { level: "beginner", name: "Inchworm", sets: 3, reps: "8", rest: "30s", tip: "Standing se plank tak walk karo", sort_order: 3 },
    { level: "intermediate", name: "Burpees", sets: 4, reps: "10", rest: "60s", tip: "Squat + push-up + jump \u2014 fat killer", sort_order: 4 },
    { level: "intermediate", name: "Squat to Press", sets: 3, reps: "12", rest: "45s", tip: "Squat + overhead press \u2014 legs + shoulders", sort_order: 5 },
    { level: "intermediate", name: "Plank to Push-up", sets: 3, reps: "10", rest: "45s", tip: "Forearm plank se full plank \u2014 core + arms", sort_order: 6 },
    { level: "advanced", name: "Burpee Pull-ups", sets: 4, reps: "8", rest: "90s", tip: "Burpee + pull-up \u2014 ultimate full body", sort_order: 7 },
    { level: "advanced", name: "Hindu Push-ups", sets: 3, reps: "12", rest: "60s", tip: "Dive bomber motion \u2014 chest + shoulders + flexibility", sort_order: 8 },
    { level: "advanced", name: "Sprawls", sets: 4, reps: "12", rest: "60s", tip: "Fast burpee variation \u2014 cardio beast mode", sort_order: 9 },
  ],
};

const SEED_WORKOUT_PLANS = [
  {
    name: "Beginner Full Body", level: "beginner", duration: "20 min", icon: "\u{1F331}", color: "#2bb883", sort_order: 1,
    exercises: [
      { name: "Jumping Jacks", sets: 3, reps: "20", rest: "30s", sort_order: 1 },
      { name: "Bodyweight Squats", sets: 3, reps: "12", rest: "30s", sort_order: 2 },
      { name: "Knee Push-ups", sets: 3, reps: "10", rest: "30s", sort_order: 3 },
      { name: "Superman Hold", sets: 3, reps: "15s", rest: "30s", sort_order: 4 },
      { name: "Plank", sets: 3, reps: "20s", rest: "30s", sort_order: 5 },
      { name: "Calf Raises", sets: 3, reps: "15", rest: "20s", sort_order: 6 },
    ],
  },
  {
    name: "Intermediate Full Body", level: "intermediate", duration: "30 min", icon: "\u{1F4AA}", color: "#2bb883", sort_order: 2,
    exercises: [
      { name: "Burpees", sets: 3, reps: "10", rest: "60s", sort_order: 1 },
      { name: "Lunges", sets: 3, reps: "12 each", rest: "45s", sort_order: 2 },
      { name: "Standard Push-ups", sets: 4, reps: "12", rest: "45s", sort_order: 3 },
      { name: "Towel Rows", sets: 3, reps: "12", rest: "45s", sort_order: 4 },
      { name: "Pike Push-ups", sets: 3, reps: "10", rest: "45s", sort_order: 5 },
      { name: "Mountain Climbers", sets: 3, reps: "20", rest: "45s", sort_order: 6 },
      { name: "Bicycle Crunches", sets: 3, reps: "20", rest: "30s", sort_order: 7 },
    ],
  },
  {
    name: "Advanced Full Body", level: "advanced", duration: "40 min", icon: "\u{1F525}", color: "#e05555", sort_order: 3,
    exercises: [
      { name: "Burpee Pull-ups", sets: 4, reps: "8", rest: "90s", sort_order: 1 },
      { name: "Pistol Squats", sets: 3, reps: "5 each", rest: "60s", sort_order: 2 },
      { name: "Archer Push-ups", sets: 3, reps: "8 each", rest: "60s", sort_order: 3 },
      { name: "Pull-ups", sets: 4, reps: "10", rest: "60s", sort_order: 4 },
      { name: "Handstand Push-ups", sets: 3, reps: "6", rest: "90s", sort_order: 5 },
      { name: "Dragon Flags", sets: 3, reps: "8", rest: "60s", sort_order: 6 },
      { name: "Jump Squats", sets: 4, reps: "12", rest: "60s", sort_order: 7 },
      { name: "L-Sit Hold", sets: 3, reps: "15s", rest: "60s", sort_order: 8 },
    ],
  },
  {
    name: "Push Day", level: "intermediate", duration: "25 min", icon: "\u{1F44A}", color: "#e0a820", sort_order: 4,
    exercises: [
      { name: "Standard Push-ups", sets: 4, reps: "15", rest: "45s", sort_order: 1 },
      { name: "Wide Push-ups", sets: 3, reps: "12", rest: "45s", sort_order: 2 },
      { name: "Diamond Push-ups", sets: 3, reps: "10", rest: "45s", sort_order: 3 },
      { name: "Pike Push-ups", sets: 3, reps: "10", rest: "45s", sort_order: 4 },
      { name: "Tricep Dips (chair)", sets: 3, reps: "12", rest: "45s", sort_order: 5 },
      { name: "Plank", sets: 3, reps: "30s", rest: "30s", sort_order: 6 },
    ],
  },
  {
    name: "Pull Day", level: "intermediate", duration: "25 min", icon: "\u{1F9BE}", color: "#e0a820", sort_order: 5,
    exercises: [
      { name: "Australian Pull-ups", sets: 4, reps: "12", rest: "45s", sort_order: 1 },
      { name: "Chin-ups", sets: 3, reps: "8", rest: "60s", sort_order: 2 },
      { name: "Towel Rows", sets: 3, reps: "12", rest: "45s", sort_order: 3 },
      { name: "Superman Pulses", sets: 3, reps: "20", rest: "30s", sort_order: 4 },
      { name: "Bicep Curls (water bottle)", sets: 3, reps: "15", rest: "30s", sort_order: 5 },
      { name: "Dead Bug", sets: 3, reps: "10 each", rest: "30s", sort_order: 6 },
    ],
  },
  {
    name: "Leg Day", level: "intermediate", duration: "25 min", icon: "\u{1F9B5}", color: "#1eac50", sort_order: 6,
    exercises: [
      { name: "Sumo Squats", sets: 4, reps: "15", rest: "45s", sort_order: 1 },
      { name: "Lunges", sets: 3, reps: "12 each", rest: "45s", sort_order: 2 },
      { name: "Step-ups", sets: 3, reps: "12 each", rest: "45s", sort_order: 3 },
      { name: "Wall Sit", sets: 3, reps: "30s", rest: "30s", sort_order: 4 },
      { name: "Calf Raises", sets: 4, reps: "20", rest: "30s", sort_order: 5 },
      { name: "Jump Squats", sets: 3, reps: "10", rest: "60s", sort_order: 6 },
    ],
  },
];

// ── Seed runner ──────────────────────────────────────────────────────
async function seedExerciseData(pool) {
  // Check if data already seeded
  const { rows } = await pool.query("SELECT COUNT(*) FROM exercise_categories");
  if (parseInt(rows[0].count) > 0) {
    console.log("[Phase2 Seed] Exercise data already seeded, skipping.");
    return;
  }

  console.log("[Phase2 Seed] Seeding exercise categories and exercises...");

  // Insert categories and get their IDs
  const categoryMap = {};
  for (const cat of SEED_CATEGORIES) {
    const result = await pool.query(
      `INSERT INTO exercise_categories (name, icon, color, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
      [cat.name, cat.icon, cat.color, cat.sort_order]
    );
    categoryMap[cat.name] = result.rows[0].id;
  }

  // Insert exercises
  for (const [catName, exercises] of Object.entries(SEED_EXERCISES)) {
    const categoryId = categoryMap[catName];
    for (const ex of exercises) {
      await pool.query(
        `INSERT INTO exercises (category_id, name, level, sets, reps, rest, tip, video_url, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [categoryId, ex.name, ex.level, ex.sets, ex.reps, ex.rest, ex.tip, ex.video_url || null, ex.sort_order]
      );
    }
  }

  // Insert workout plans
  for (const plan of SEED_WORKOUT_PLANS) {
    const result = await pool.query(
      `INSERT INTO workout_plans (name, level, duration, icon, color, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [plan.name, plan.level, plan.duration, plan.icon, plan.color, plan.sort_order]
    );
    const planId = result.rows[0].id;

    for (const ex of plan.exercises) {
      await pool.query(
        `INSERT INTO workout_plan_exercises (plan_id, exercise_name, sets, reps, rest, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [planId, ex.name, ex.sets, ex.reps, ex.rest, ex.sort_order]
      );
    }
  }

  console.log("[Phase2 Seed] Exercise data seeded successfully.");
}

// ── Seed default admin ───────────────────────────────────────────────
async function seedDefaultAdmin(pool) {
  const { rows } = await pool.query("SELECT COUNT(*) FROM admins");
  if (parseInt(rows[0].count) > 0) {
    console.log("[Phase2 Seed] Admin already exists, skipping.");
    return;
  }

  const bcrypt = require("bcryptjs");
  const hash = await bcrypt.hash("admin123", 10);
  await pool.query(
    `INSERT INTO admins (email, password_hash, name, role) VALUES ($1, $2, $3, $4)`,
    ["admin@hustlekit.com", hash, "Super Admin", "super_admin"]
  );
  console.log("[Phase2 Seed] Default admin created: admin@hustlekit.com / admin123");
}

// ── Runner ───────────────────────────────────────────────────────────
async function runPhase2Migration() {
  if (!process.env.DATABASE_URL) {
    console.log("[Phase2] DATABASE_URL not set, skipping migration.");
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
        if (
          e.message.includes("already exists") ||
          e.message.includes("duplicate")
        ) {
          skipCount++;
        } else {
          console.warn("[Phase2] Warning:", e.message.slice(0, 120));
          skipCount++;
        }
      }
    }
    console.log(
      `[Phase2] Schema \u2014 ${successCount} applied, ${skipCount} skipped/existing.`
    );

    // Seed data
    await seedExerciseData(pool);
    await seedDefaultAdmin(pool);
  } catch (err) {
    console.error("[Phase2] Fatal:", err.message);
  } finally {
    await pool.end();
  }
}

module.exports = { runPhase2Migration };
