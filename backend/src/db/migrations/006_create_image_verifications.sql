-- 006_create_image_verifications.sql
-- AI-based damage image verification and visual hazard assessment

CREATE TABLE IF NOT EXISTS disaster_image_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id UUID NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(500),
  is_genuine BOOLEAN DEFAULT true,
  confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 0.950,
  damage_severity VARCHAR(50) NOT NULL CHECK (damage_severity IN ('catastrophic', 'severe', 'moderate', 'minor', 'no_damage')),
  detected_hazards TEXT[] DEFAULT '{}',
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_verifications_disaster_id ON disaster_image_verifications(disaster_id);
CREATE INDEX IF NOT EXISTS idx_image_verifications_damage_severity ON disaster_image_verifications(damage_severity);
