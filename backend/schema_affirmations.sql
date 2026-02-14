-- ============================================
-- Custom Affirmations - SQL Schema
-- Run in Supabase SQL Editor
-- ============================================

CREATE TABLE custom_affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'personal' CHECK (category IN (
    'confidence', 'career', 'wealth', 'health', 'gratitude', 'discipline', 'desi', 'personal'
  )),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_custom_affirmations_profile ON custom_affirmations(profile_id);
CREATE INDEX idx_custom_affirmations_category ON custom_affirmations(category);
