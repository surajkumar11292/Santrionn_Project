-- Resources table for emergency relief assets (shelters, hospitals, food, water, rescue)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL CHECK (type IN ('shelter', 'hospital', 'food', 'water', 'rescue')),
  location GEOGRAPHY(Point, 4326) NOT NULL,
  location_name VARCHAR(255),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  capacity INTEGER DEFAULT 100,
  available_units INTEGER DEFAULT 100,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'limited', 'full')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial GiST index for fast radius search (ST_DWithin)
CREATE INDEX IF NOT EXISTS idx_resources_location ON resources USING GIST(location);

-- Compound and foreign key indexes
CREATE INDEX IF NOT EXISTS idx_resources_disaster_id ON resources(disaster_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
