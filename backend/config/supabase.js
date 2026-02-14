const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Admin client (SERVICE_ROLE_KEY) — bypasses RLS, use for all DB operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Auth client (ANON_KEY) — for signInWithPassword so it doesn't pollute admin client session
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = { supabase, supabaseAuth };
