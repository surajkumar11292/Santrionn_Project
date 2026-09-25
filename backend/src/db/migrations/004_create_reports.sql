-- Reports table for community feedback, crowd reports, and external social media streams
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id UUID NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_handle VARCHAR(255) NOT NULL,
  source VARCHAR(100) DEFAULT 'mock_social_stream',
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  verified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast retrieval by disaster, priority, and date
CREATE INDEX IF NOT EXISTS idx_reports_disaster_id ON reports(disaster_id);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
