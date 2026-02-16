-- ============================================
-- Interview Tracker Table
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company VARCHAR(200) NOT NULL,
  role VARCHAR(200) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'phone_screen', 'technical', 'hr_round', 'offer', 'rejected', 'ghosted')),
  salary VARCHAR(100),
  notes TEXT,
  applied_date DATE DEFAULT CURRENT_DATE,
  next_round_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interviews_profile ON interviews(profile_id);
CREATE INDEX idx_interviews_status ON interviews(status);

CREATE TRIGGER set_interviews_updated
  BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
