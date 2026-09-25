-- 005_create_official_updates.sql
-- Official emergency government bulletins & agency advisories (FEMA, NWS, Emergency Management)

CREATE TABLE IF NOT EXISTS official_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id UUID NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
  agency VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('evacuation', 'warning', 'advisory', 'all_clear')),
  headline VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by disaster
CREATE INDEX IF NOT EXISTS idx_official_updates_disaster_id ON official_updates(disaster_id);
CREATE INDEX IF NOT EXISTS idx_official_updates_severity ON official_updates(severity);
