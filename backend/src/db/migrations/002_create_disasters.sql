-- Disasters table with PostGIS GEOGRAPHY point and full metadata
CREATE TABLE IF NOT EXISTS disasters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial GiST index for ultra-fast geospatial calculations
CREATE INDEX IF NOT EXISTS idx_disasters_location ON disasters USING GIST(location);

-- GIN index for high-speed tag filtering (e.g., tag=flood)
CREATE INDEX IF NOT EXISTS idx_disasters_tags ON disasters USING GIN(tags);

-- B-tree index for status and temporal queries
CREATE INDEX IF NOT EXISTS idx_disasters_status ON disasters(status);
CREATE INDEX IF NOT EXISTS idx_disasters_created_at ON disasters(created_at DESC);
