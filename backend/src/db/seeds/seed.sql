-- Clean existing seed data cleanly (cascading)
TRUNCATE reports, resources, disasters, users CASCADE;

-- ============================================================================
-- 1. SEED USERS (bcrypt passwords via pgcrypto: admin123, contrib123, viewer123)
-- ============================================================================
INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin Officer', 'admin@relief.io', crypt('admin123', gen_salt('bf', 10)), 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Field Coordinator', 'contrib@relief.io', crypt('contrib123', gen_salt('bf', 10)), 'contributor'),
  ('33333333-3333-3333-3333-333333333333', 'Public Observer', 'viewer@relief.io', crypt('viewer123', gen_salt('bf', 10)), 'viewer');

-- ============================================================================
-- 2. SEED DISASTERS (PostGIS Points in Longitude, Latitude order)
-- ============================================================================
INSERT INTO disasters (id, title, description, location_name, latitude, longitude, location, tags, status, created_by) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'Severe Flash Flooding in Manhattan, NYC',
    'Heavy flooding and subway inundation has affected Manhattan, NYC following torrential rainfall.',
    'Manhattan, NYC',
    40.7831,
    -73.9712,
    ST_SetSRID(ST_MakePoint(-73.9712, 40.7831), 4326)::geography,
    ARRAY['flood', 'storm', 'infrastructure', 'subway'],
    'active',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Coastal Storm Surge in Miami Beach',
    'Category 3 hurricane storm surge threatening low-lying coastal avenues and infrastructure in Miami Beach.',
    'Miami Beach, FL',
    25.7907,
    -80.1300,
    ST_SetSRID(ST_MakePoint(-80.1300, 25.7907), 4326)::geography,
    ARRAY['hurricane', 'surge', 'coastal', 'power-outage'],
    'active',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Topanga Canyon Wildfire Evacuation',
    'Fast-moving brush fire spreading across Topanga Canyon with mandatory evacuation orders in effect.',
    'Topanga Canyon, Los Angeles',
    34.0922,
    -118.6019,
    ST_SetSRID(ST_MakePoint(-118.6019, 34.0922), 4326)::geography,
    ARRAY['wildfire', 'smoke', 'evacuation'],
    'monitoring',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'Magnitude 6.2 Structural Damage in San Francisco',
    'Seismic event centered near San Francisco causing localized building collapses and gas pipeline leaks.',
    'San Francisco, CA',
    37.7749,
    -122.4194,
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
    ARRAY['earthquake', 'collapse', 'gas-leak'],
    'active',
    '22222222-2222-2222-2222-222222222222'
  );

-- ============================================================================
-- 3. SEED RESOURCES (Nearby shelters, hospitals, food, water, rescue units)
-- ============================================================================
-- Manhattan, NYC Resources (near lat: 40.7831, lng: -73.9712)
INSERT INTO resources (disaster_id, name, type, location_name, latitude, longitude, location, capacity, available_units, status) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'Mount Sinai Hospital Emergency Center',
    'hospital',
    'Upper East Side, Manhattan',
    40.7900,
    -73.9535,
    ST_SetSRID(ST_MakePoint(-73.9535, 40.7900), 4326)::geography,
    300,
    65,
    'limited'
  ),
  (
    'a1111111-1111-1111-1111-111111111111',
    'Red Cross Emergency Shelter - Central High',
    'shelter',
    'Harlem, Manhattan',
    40.8075,
    -73.9465,
    ST_SetSRID(ST_MakePoint(-73.9465, 40.8075), 4326)::geography,
    500,
    320,
    'available'
  ),
  (
    'a1111111-1111-1111-1111-111111111111',
    'NYC Water Distribution Point #4',
    'water',
    'Midtown West, Manhattan',
    40.7600,
    -73.9900,
    ST_SetSRID(ST_MakePoint(-73.9900, 40.7600), 4326)::geography,
    2000,
    1450,
    'available'
  ),
  (
    'a1111111-1111-1111-1111-111111111111',
    'FEMA Mobile Food Pantry Hub',
    'food',
    'Chelsea, Manhattan',
    40.7465,
    -74.0014,
    ST_SetSRID(ST_MakePoint(-74.0014, 40.7465), 4326)::geography,
    1500,
    980,
    'available'
  ),
  (
    'a1111111-1111-1111-1111-111111111111',
    'FDNY Aquatic & Flood Rescue Unit 8',
    'rescue',
    'Hudson River Pier 84',
    40.7650,
    -74.0020,
    ST_SetSRID(ST_MakePoint(-74.0020, 40.7650), 4326)::geography,
    50,
    12,
    'available'
  );

-- Miami Beach Resources (near lat: 25.7907, lng: -80.1300)
INSERT INTO resources (disaster_id, name, type, location_name, latitude, longitude, location, capacity, available_units, status) VALUES
  (
    'a2222222-2222-2222-2222-222222222222',
    'Mount Sinai Medical Center Miami',
    'hospital',
    'Alton Rd, Miami Beach',
    25.8145,
    -80.1412,
    ST_SetSRID(ST_MakePoint(-80.1412, 25.8145), 4326)::geography,
    250,
    40,
    'limited'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'South Beach Storm Relief Shelter',
    'shelter',
    'Washington Ave, Miami Beach',
    25.7780,
    -80.1320,
    ST_SetSRID(ST_MakePoint(-80.1320, 25.7780), 4326)::geography,
    400,
    110,
    'available'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'US Coast Guard Station Miami Beach',
    'rescue',
    'Causeway Island',
    25.7725,
    -80.1550,
    ST_SetSRID(ST_MakePoint(-80.1550, 25.7725), 4326)::geography,
    80,
    25,
    'available'
  );

-- ============================================================================
-- 4. SEED REPORTS (Initial community reports)
-- ============================================================================
INSERT INTO reports (disaster_id, content, user_handle, source, priority, verified) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'Urgent: Water levels reaching 3 feet on 8th Ave and 28th St. Multiple elderly residents stranded on ground floors.',
    '@ny_citizen_99',
    'mock_social_stream',
    'critical',
    true
  ),
  (
    'a1111111-1111-1111-1111-111111111111',
    'Need clean drinking water near Manhattan Central Park West. Tap water is cloudy and brownish.',
    '@citizen123',
    'mock_social_stream',
    'high',
    true
  ),
  (
    'a1111111-1111-1111-1111-111111111111',
    'Subway stations at 14th street completely sealed off by emergency crews. Safe detours marked on 5th Ave.',
    '@transit_tracker',
    'community_portal',
    'medium',
    false
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Severe wind gusts knocked down power transformers along Collins Ave. Power lines sparking in water.',
    '@miami_resident',
    'mock_social_stream',
    'critical',
    true
  );
