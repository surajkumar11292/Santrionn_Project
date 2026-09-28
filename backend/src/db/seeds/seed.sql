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
-- 2. SEED DISASTERS (Diverse locations, hazards, tags, and operational statuses)
-- ============================================================================
INSERT INTO disasters (id, title, description, location_name, latitude, longitude, location, tags, status, created_by) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'Severe Flash Flooding in Manhattan, NYC',
    'Heavy flooding and subway inundation has affected Manhattan, NYC following torrential rainfall and sewer system overflow.',
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
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'Severe Cyclone & Coastal Inundation in Mumbai',
    'Intense cyclonic storm hitting Mumbai shoreline with continuous rainfall, high tide breaches, and suburban waterlogging.',
    'Mumbai, Maharashtra',
    19.0760,
    72.8777,
    ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography,
    ARRAY['cyclone', 'flood', 'hurricane', 'urgent', 'coastal'],
    'active',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'Himalayan Cloudburst & Flash Landslide in Uttarakhand',
    'Sudden cloudburst causing heavy debris flow and road blockages across Chamoli district, stranding mountain pilgrims.',
    'Chamoli, Uttarakhand',
    30.2937,
    79.5603,
    ST_SetSRID(ST_MakePoint(79.5603, 30.2937), 4326)::geography,
    ARRAY['landslide', 'flood', 'rescue', 'urgent'],
    'active',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'a7777777-7777-7777-7777-777777777777',
    'Extreme Monsoon Riverine Overflow in Kochi',
    'Periyar river basin overflow triggering low-lying residential inundation and relief camp mobilizations.',
    'Kochi, Kerala',
    9.9312,
    76.2673,
    ST_SetSRID(ST_MakePoint(76.2673, 9.9312), 4326)::geography,
    ARRAY['flood', 'monsoon', 'medical', 'shelter'],
    'monitoring',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    'Magnitude 7.1 Seismic Tremor in Tokyo Bay',
    'Strong offshore seismic activity shaking Greater Tokyo with bullet train halts and structural inspection alerts.',
    'Tokyo Bay, Japan',
    35.6762,
    139.6503,
    ST_SetSRID(ST_MakePoint(139.6503, 35.6762), 4326)::geography,
    ARRAY['earthquake', 'tsunami', 'infrastructure', 'metro'],
    'active',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'a9999999-9999-9999-9999-999999999999',
    'Thames Barrier Tidal Surge & Flood Warning',
    'High spring tides combined with North Sea gale storm surge triggering Thames flood barrier deployment in London.',
    'London, United Kingdom',
    51.5074,
    -0.1278,
    ST_SetSRID(ST_MakePoint(-0.1278, 51.5074), 4326)::geography,
    ARRAY['flood', 'tidal', 'storm', 'infrastructure'],
    'monitoring',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Blue Mountains Bushfire Perimeter Breach',
    'Intense summer heatwave driving uncontrolled bushfires toward residential perimeters in the Blue Mountains.',
    'Sydney, Australia',
    -33.8688,
    151.2093,
    ST_SetSRID(ST_MakePoint(151.2093, -33.8688), 4326)::geography,
    ARRAY['wildfire', 'heatwave', 'evacuation', 'fire'],
    'active',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Industrial Chemical Vapor Containment in New Delhi',
    'Ammonia and chemical vapor leak from an industrial zone contained and neutralized by hazardous materials squads.',
    'New Delhi, NCR',
    28.6139,
    77.2090,
    ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography,
    ARRAY['chemical', 'hazmat', 'air-quality', 'medical'],
    'resolved',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Kilauea Volcanic Ash & Lava Corridor Hazard',
    'Volcanic fissure eruption emitting toxic sulfur dioxide plumes and basaltic lava towards uninhabited coastal sector.',
    'Kilauea, Hawaii',
    19.4069,
    -155.2834,
    ST_SetSRID(ST_MakePoint(-155.2834, 19.4069), 4326)::geography,
    ARRAY['volcano', 'ash', 'evacuation'],
    'resolved',
    '22222222-2222-2222-2222-222222222222'
  );

-- ============================================================================
-- 3. SEED RESOURCES (Proximity-searchable shelters, hospitals, food, water, rescue units)
-- ============================================================================
-- Manhattan, NYC Resources
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

-- Miami Beach Resources
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

-- Mumbai Emergency Resources (near 19.0760, 72.8777)
INSERT INTO resources (disaster_id, name, type, location_name, latitude, longitude, location, capacity, available_units, status) VALUES
  (
    'a5555555-5555-5555-5555-555555555555',
    'KEM Hospital Emergency Trauma Center',
    'hospital',
    'Parel, Mumbai',
    19.0022,
    72.8427,
    ST_SetSRID(ST_MakePoint(72.8427, 19.0022), 4326)::geography,
    450,
    110,
    'available'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'Lilavati Hospital Disaster Response Wing',
    'hospital',
    'Bandra West, Mumbai',
    19.0520,
    72.8290,
    ST_SetSRID(ST_MakePoint(72.8290, 19.0520), 4326)::geography,
    300,
    65,
    'limited'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'BMC Central Flood Relief Shelter',
    'shelter',
    'Dadar, Mumbai',
    19.0178,
    72.8478,
    ST_SetSRID(ST_MakePoint(72.8478, 19.0178), 4326)::geography,
    1000,
    680,
    'available'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'NDRF Flood & Aquatic Rescue Unit 5',
    'rescue',
    'Worli Sea Face, Mumbai',
    19.0176,
    72.8152,
    ST_SetSRID(ST_MakePoint(72.8152, 19.0176), 4326)::geography,
    120,
    45,
    'available'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'BMC Potable Water Tanker Fleet #7',
    'water',
    'Kurla West, Mumbai',
    19.0726,
    72.8845,
    ST_SetSRID(ST_MakePoint(72.8845, 19.0726), 4326)::geography,
    3500,
    2800,
    'available'
  );

-- Uttarakhand Resources (near 30.2937, 79.5603)
INSERT INTO resources (disaster_id, name, type, location_name, latitude, longitude, location, capacity, available_units, status) VALUES
  (
    'a6666666-6666-6666-6666-666666666666',
    'AIIMS Rishikesh High-Altitude Emergency Ward',
    'hospital',
    'Rishikesh Base Camp',
    30.0869,
    78.2676,
    ST_SetSRID(ST_MakePoint(78.2676, 30.0869), 4326)::geography,
    250,
    80,
    'available'
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'ITBP Mountain Rescue & Air Evac Depot',
    'rescue',
    'Joshimath, Chamoli',
    30.5564,
    79.5647,
    ST_SetSRID(ST_MakePoint(79.5647, 30.5564), 4326)::geography,
    150,
    60,
    'available'
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'Chamoli Emergency Rations Distribution Point',
    'food',
    'Gopeshwar Hub',
    30.4140,
    79.3240,
    ST_SetSRID(ST_MakePoint(79.3240, 30.4140), 4326)::geography,
    1200,
    850,
    'available'
  );

-- Tokyo Bay Resources (near 35.6762, 139.6503)
INSERT INTO resources (disaster_id, name, type, location_name, latitude, longitude, location, capacity, available_units, status) VALUES
  (
    'a8888888-8888-8888-8888-888888888888',
    'Tokyo Metropolitan Emergency Medical Center',
    'hospital',
    'Shinjuku, Tokyo',
    35.6900,
    139.7000,
    ST_SetSRID(ST_MakePoint(139.7000, 35.6900), 4326)::geography,
    600,
    190,
    'available'
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    'Minato Earthquake Tsunami Evacuation Tower',
    'shelter',
    'Minato Ward, Tokyo',
    35.6580,
    139.7510,
    ST_SetSRID(ST_MakePoint(139.7510, 35.6580), 4326)::geography,
    1800,
    1200,
    'available'
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    'Tokyo Fire Dept Hyper Rescue Unit',
    'rescue',
    'Koto Ward, Tokyo',
    35.6720,
    139.8170,
    ST_SetSRID(ST_MakePoint(139.8170, 35.6720), 4326)::geography,
    200,
    75,
    'available'
  );

-- London Resources (near 51.5074, -0.1278)
INSERT INTO resources (disaster_id, name, type, location_name, latitude, longitude, location, capacity, available_units, status) VALUES
  (
    'a9999999-9999-9999-9999-999999999999',
    'St Thomas Hospital Emergency Unit',
    'hospital',
    'Westminster, London',
    51.4988,
    -0.1190,
    ST_SetSRID(ST_MakePoint(-0.1190, 51.4988), 4326)::geography,
    400,
    95,
    'available'
  ),
  (
    'a9999999-9999-9999-9999-999999999999',
    'Southwark Thames Flood Relief Base',
    'shelter',
    'Bermondsey, London',
    51.4980,
    -0.0630,
    ST_SetSRID(ST_MakePoint(-0.0630, 51.4980), 4326)::geography,
    800,
    550,
    'available'
  );

-- Sydney Resources (near -33.8688, 151.2093)
INSERT INTO resources (disaster_id, name, type, location_name, latitude, longitude, location, capacity, available_units, status) VALUES
  (
    'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Westmead Hospital Trauma & Burns Center',
    'hospital',
    'Westmead, Sydney',
    -33.8055,
    150.9880,
    ST_SetSRID(ST_MakePoint(150.9880, -33.8055), 4326)::geography,
    350,
    110,
    'available'
  ),
  (
    'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Penrith Bushfire Evacuation Center',
    'shelter',
    'Penrith, Sydney',
    -33.7510,
    150.6940,
    ST_SetSRID(ST_MakePoint(150.6940, -33.7510), 4326)::geography,
    1200,
    820,
    'available'
  );

-- ============================================================================
-- 4. SEED REPORTS (Initial community field reports)
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
    'a5555555-5555-5555-5555-555555555555',
    'Urgent! Need drinking water and baby formula near Kurla West. Roads blocked by debris and floodwater.',
    '@citizen_sarah_99',
    'community_portal',
    'high',
    false
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'Family trapped on second floor due to rapid water rise near Dadar TT circle. Urgent boat rescue needed!',
    '@mike_rescue_volunteer',
    'community_portal',
    'critical',
    true
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'Massive rockfall blocking Badrinath National Highway near Joshimath. Approximately 40 vehicles queued.',
    '@himalayan_scout',
    'mock_social_stream',
    'high',
    true
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    'Tokyo Metro lines temporarily halted for seismic track clearance. No power outage reported in Ginza.',
    '@tokyo_transit',
    'mock_social_stream',
    'medium',
    true
  );

-- ============================================================================
-- 5. SEED OFFICIAL BULLETINS
-- ============================================================================
INSERT INTO official_updates (disaster_id, agency, severity, headline, body) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'NYC Emergency Management',
    'evacuation',
    'MANDATORY EVACUATION: Zone A Ground Floors & Basements',
    'Due to unprecedented storm surge reaching 4 feet above ground level, all residents in Zone A ground floors must immediately evacuate to higher elevations or designated emergency shelters.'
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'Brihanmumbai Municipal Corporation (BMC)',
    'warning',
    'Red Alert: Severe Cyclone Approaching North Konkan Coast',
    'Citizens are advised to remain indoors. Coastal roads closed. Emergency relief shelters open across all municipal wards with food and medical supplies.'
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'Uttarakhand Disaster Management Authority',
    'warning',
    'Cloudburst Alert & Highway Movement Suspension in Chamoli',
    'National Highway 7 closed due to flash mudslides. NDRF and SDRF teams mobilized for airlift operations and highway clearance.'
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    'Japan Meteorological Agency (JMA)',
    'warning',
    'Tsunami Advisory Lifted for Tokyo Bay Coastal Districts',
    'Seismic shaking subsided. All coastal flood gates engaged. Bullet train operations resuming under safety speed protocols.'
  );

-- ============================================================================
-- 6. SEED VERIFIED DAMAGE IMAGES & HAZARD ASSESSMENTS
-- ============================================================================
INSERT INTO disaster_image_verifications (
  disaster_id,
  image_url,
  caption,
  is_genuine,
  confidence_score,
  damage_severity,
  detected_hazards,
  ai_analysis
) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    'Severe street submergence along 8th Avenue with abandoned vehicles submerged past wheel wells.',
    true,
    0.965,
    'severe',
    ARRAY['floodwater_depth_high', 'submerged_vehicles', 'electrical_conduit_risk'],
    '{"structuralIntegrity": "compromised_subsurface", "waterLevelEstMeters": 0.9, "detectedObjects": ["vehicle", "water", "debris"], "manipulationArtifactsDetected": false}'::jsonb
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    'Waterlogged arterial road in Mumbai with rescue teams deploying inflatable boats.',
    true,
    0.952,
    'severe',
    ARRAY['high_water_level', 'traffic_gridlock', 'submerged_roadway'],
    '{"structuralIntegrity": "sound", "waterLevelEstMeters": 0.8, "detectedObjects": ["boat", "water", "debris"], "manipulationArtifactsDetected": false}'::jsonb
  );
