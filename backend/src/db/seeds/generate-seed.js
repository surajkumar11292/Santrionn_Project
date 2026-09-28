const fs = require('fs');
const path = require('path');

const disasters = [
  // 1-10: Metro & Major Coastal/Riverine Disasters
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    title: 'Severe Cyclone & Coastal Inundation in Mumbai',
    description: 'Intense cyclonic storm hitting Mumbai shoreline with continuous rainfall, high tide breaches, and suburban waterlogging.',
    loc: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777,
    tags: ['flood', 'cyclone', 'urgent', 'coastal'], status: 'active'
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    title: 'Himalayan Cloudburst & Flash Landslide in Chamoli',
    description: 'Sudden cloudburst causing heavy debris flow and road blockages across Chamoli district, stranding mountain pilgrims.',
    loc: 'Chamoli, Uttarakhand', lat: 30.2937, lng: 79.5603,
    tags: ['landslide', 'flood', 'rescue', 'urgent'], status: 'active'
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    title: 'Monsoon Debris Flow & Riverine Inundation in Wayanad',
    description: 'Torrential southwest monsoon rains triggering localized hillside debris flow and overflowing river tributaries in Wayanad.',
    loc: 'Wayanad, Kerala', lat: 11.6854, lng: 76.1320,
    tags: ['flood', 'monsoon', 'landslide', 'shelter'], status: 'active'
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    title: 'Coastal Storm Surge & Urban Flooding in Chennai',
    description: 'Bay of Bengal cyclonic depression causing severe waterlogging across Velachery and low-lying coastal corridors.',
    loc: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707,
    tags: ['cyclone', 'flood', 'surge', 'coastal'], status: 'active'
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    title: 'Brahmaputra River Basin Overflow in Guwahati',
    description: 'Brahmaputra river flowing above danger levels inundating riparian villages, agricultural plains, and low-lying sectors.',
    loc: 'Guwahati, Assam', lat: 26.1445, lng: 91.7362,
    tags: ['flood', 'riverine', 'evacuation', 'monsoon'], status: 'monitoring'
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    title: 'Tropical Cyclonic Storm Depressive Surge in Puri',
    description: 'Deep depression over the Bay of Bengal making landfall near Puri coast with high winds and tidal ingress.',
    loc: 'Puri, Odisha', lat: 19.8135, lng: 85.8312,
    tags: ['cyclone', 'storm', 'surge', 'coastal'], status: 'active'
  },
  {
    id: 'a7777777-7777-7777-7777-777777777777',
    title: 'Hillside Subsidence & Highway Landslip in Shimla',
    description: 'Heavy monsoon precipitation causing slope destabilization and national highway blockages near Shimla ridges.',
    loc: 'Shimla, Himachal Pradesh', lat: 31.1048, lng: 77.1734,
    tags: ['landslide', 'monsoon', 'infrastructure', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'a8888888-8888-8888-8888-888888888888',
    title: 'Magnitude 5.8 Seismic Tremor in Kutch & Bhuj',
    description: 'Moderate intraplate seismic tremor shaking Kutch district with wall cracks and precautionary evacuation protocols.',
    loc: 'Bhuj, Gujarat', lat: 23.2420, lng: 69.6669,
    tags: ['earthquake', 'seismic', 'medical', 'structural'], status: 'monitoring'
  },
  {
    id: 'a9999999-9999-9999-9999-999999999999',
    title: 'Yamuna River High Water Level Overflow in Delhi',
    description: 'Monsoon discharge from upstream barrages causing water levels to cross evacuation thresholds along Yamuna floodplains.',
    loc: 'New Delhi, NCR', lat: 28.6139, lng: 77.2090,
    tags: ['flood', 'river', 'evacuation', 'monsoon'], status: 'monitoring'
  },
  {
    id: 'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Tapi River Dam Discharge Inundation in Surat',
    description: 'Regulated water discharge from Ukai reservoir successfully channelled with floodwaters fully receding.',
    loc: 'Surat, Gujarat', lat: 21.1702, lng: 72.8311,
    tags: ['flood', 'water', 'resolved'], status: 'resolved'
  },

  // 11-20: Northern States (Uttarakhand, Himachal, Punjab, Kashmir, UP)
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    title: 'Torrential Rain & Canal Overflow in Haldwani',
    description: 'Heavy precipitation over Kumaon foothills overwhelming local stormwater canals and inundating residential sectors in Haldwani.',
    loc: 'Haldwani, Uttarakhand', lat: 29.2183, lng: 79.5130,
    tags: ['flood', 'monsoon', 'rescue'], status: 'active'
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    title: 'Slope Erosion & Highway Collapse near Joshimath',
    description: 'Structural land sinking along the Badrinath route near Joshimath requiring vehicular diversions and geological surveys.',
    loc: 'Joshimath, Uttarakhand', lat: 30.5564, lng: 79.5647,
    tags: ['landslide', 'infrastructure', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    title: 'Glacial Outflow & Flash Flood in Kedarnath Valley',
    description: 'Mandakini river basin swelling following intense alpine rainfall; SDRF teams monitoring upper pilgrim bridges.',
    loc: 'Kedarnath, Uttarakhand', lat: 30.7352, lng: 79.0669,
    tags: ['flood', 'glacial', 'urgent'], status: 'active'
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    title: 'Ganga River High Gauge Flow in Haridwar',
    description: 'Water discharge at Bhimgoda barrage crossing warning line; ghat bathing suspended under safety directives.',
    loc: 'Haridwar, Uttarakhand', lat: 29.9457, lng: 78.1642,
    tags: ['flood', 'riverine', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    title: 'Flash Mudflow on Manali Highway in Kullu Valley',
    description: 'Beas river tributary mudflow blocking vehicular transit along the Chandigarh-Manali national highway corridor.',
    loc: 'Kullu, Himachal Pradesh', lat: 31.9579, lng: 77.1095,
    tags: ['landslide', 'storm', 'infrastructure'], status: 'active'
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    title: 'Beas River Water Surge in Mandi',
    description: 'Torrential downpour in catchment hills raising water level near Victoria bridge; relief squads on high alert.',
    loc: 'Mandi, Himachal Pradesh', lat: 31.7087, lng: 76.9320,
    tags: ['flood', 'river', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'c7777777-7777-7777-7777-777777777777',
    title: 'Jhelum River Gauge Spillover in Srinagar',
    description: 'Continuous precipitation across Kashmir valley causing Jhelum river to flow near alert levels around Ram Munshi Bagh.',
    loc: 'Srinagar, Jammu & Kashmir', lat: 34.0837, lng: 74.7973,
    tags: ['flood', 'riverine', 'evacuation'], status: 'active'
  },
  {
    id: 'c8888888-8888-8888-8888-888888888888',
    title: 'Ghaggar River Embankment Breach in Patiala',
    description: 'Sustained monsoon flow causing embankment seepage across rural farmland; irrigation units reinforcing bunds.',
    loc: 'Patiala, Punjab', lat: 30.3398, lng: 76.3869,
    tags: ['flood', 'agriculture', 'resolved'], status: 'resolved'
  },
  {
    id: 'c9999999-9999-9999-9999-999999999999',
    title: 'Ganga & Varuna Confluence Inundation in Varanasi',
    description: 'Floodwaters submerging lower steps of historical ghats; river navigation boats grounded temporarily.',
    loc: 'Varanasi, Uttar Pradesh', lat: 25.3176, lng: 82.9739,
    tags: ['flood', 'riverine', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    title: 'Sangam Lowland Inundation in Prayagraj',
    description: 'Combined flow from Ganga and Yamuna inundating low-lying agricultural floodplains in Daraganj.',
    loc: 'Prayagraj, Uttar Pradesh', lat: 25.4358, lng: 81.8463,
    tags: ['flood', 'riverine', 'monitoring'], status: 'monitoring'
  },

  // 21-30: Eastern & North-Eastern States
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    title: 'Rapti River Flood Overflow in Gorakhpur',
    description: 'Rapti river rising above danger level affecting peri-urban rural wards with relief boats mobilized.',
    loc: 'Gorakhpur, Uttar Pradesh', lat: 26.7606, lng: 83.3732,
    tags: ['flood', 'river', 'active'], status: 'active'
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    title: 'Kosi River High Discharge Surge in Supaul',
    description: 'Over 2.5 lakh cusecs water release from Kosi barrage inundating sandbar settlements across Supaul.',
    loc: 'Supaul, Bihar', lat: 26.1260, lng: 86.6053,
    tags: ['flood', 'evacuation', 'urgent'], status: 'active'
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    title: 'Bagmati River Embankment Pressure in Darbhanga',
    description: 'Catchment runoff creating pressure along Kusheshwar Asthan ring bund; SDRF inspecting reinforcement work.',
    loc: 'Darbhanga, Bihar', lat: 26.1542, lng: 85.8918,
    tags: ['flood', 'riverine', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    title: 'Kaziranga National Park Wetland Flooding',
    description: 'Seasonal Brahmaputra overflow inundating highlands; wildlife corridors monitored along National Highway 715.',
    loc: 'Kaziranga, Assam', lat: 26.5775, lng: 93.1711,
    tags: ['flood', 'wildlife', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'd6666666-6666-6666-6666-666666666666',
    title: 'Barak River Flash Inundation in Silchar',
    description: 'Unprecedented rainfall in adjoining hills causing urban waterlogging and power substation shutdowns in Silchar.',
    loc: 'Silchar, Assam', lat: 24.8170, lng: 92.7937,
    tags: ['flood', 'storm', 'power-outage'], status: 'active'
  },
  {
    id: 'd7777777-7777-7777-7777-777777777777',
    title: 'Mahanadi River Basin Discharge in Cuttack',
    description: 'Over 30 gates opened at Hirakud reservoir causing heavy water volume flow through Mundali barrage near Cuttack.',
    loc: 'Cuttack, Odisha', lat: 20.4625, lng: 85.8828,
    tags: ['flood', 'river', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'd8888888-8888-8888-8888-888888888888',
    title: 'Coastal Tidal Ingress & Surge in Balasore',
    description: 'High tidal swells combined with deep sea depression breaching mud embankments in Chandipur coastal belt.',
    loc: 'Balasore, Odisha', lat: 21.4934, lng: 86.9135,
    tags: ['cyclone', 'surge', 'coastal'], status: 'active'
  },
  {
    id: 'd9999999-9999-9999-9999-999999999999',
    title: 'Teesta River Flash Surge & GLOF in North Sikkim',
    description: 'High-altitude lake outburst resulting in rapid water level surge along Chungthang dam basin.',
    loc: 'Gangtok, Sikkim', lat: 27.3389, lng: 88.6065,
    tags: ['flood', 'glacial', 'urgent'], status: 'active'
  },
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    title: 'Torrential Cloudburst Inundation in Cherrapunji',
    description: 'Record single-day rainfall causing flash torrents across Southern Meghalaya gorges and plateau roads.',
    loc: 'Shillong, Meghalaya', lat: 25.5788, lng: 91.8933,
    tags: ['flood', 'storm', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    title: 'Imphal River Embankment Overflow in Manipur',
    description: 'Heavy precipitation causing river water to spill onto adjoining roads and residential sectors in Imphal West.',
    loc: 'Imphal, Manipur', lat: 24.8170, lng: 93.9368,
    tags: ['flood', 'evacuation', 'shelter'], status: 'active'
  },

  // 31-40: Western States (Maharashtra, Gujarat, Rajasthan, Goa)
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    title: 'Mula-Mutha River Swelling in Pune',
    description: 'Khadakwasla dam water release raising river water level across low-lying riverside causeways in Pune.',
    loc: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567,
    tags: ['flood', 'riverine', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'e4444444-4444-4444-4444-444444444444',
    title: 'Panchganga River Flood Stage in Kolhapur',
    description: 'Water level crossing alert threshold at Rajaram barrage; NDRF teams stationed at vulnerable riverine bends.',
    loc: 'Kolhapur, Maharashtra', lat: 16.7050, lng: 74.2433,
    tags: ['flood', 'rescue', 'active'], status: 'active'
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    title: 'Western Ghats Ridge Landslip in Raigad',
    description: 'Continuous hillside monsoon downpour triggering earth slippage along the Mumbai-Goa highway section.',
    loc: 'Thane, Maharashtra', lat: 19.2183, lng: 72.9781,
    tags: ['landslide', 'monsoon', 'active'], status: 'active'
  },
  {
    id: 'e6666666-6666-6666-6666-666666666666',
    title: 'Godavari River High Level Flow in Nashik',
    description: 'Gangapur dam release leading to submergence of small temples near Ramkund; situation under control.',
    loc: 'Nashik, Maharashtra', lat: 19.9975, lng: 73.7898,
    tags: ['flood', 'river', 'resolved'], status: 'resolved'
  },
  {
    id: 'e7777777-7777-7777-7777-777777777777',
    title: 'Sabarmati Riverfront Overflow in Ahmedabad',
    description: 'Heavy discharge from Dharoi dam raising river levels across lower promenade; pedestrian access restricted.',
    loc: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714,
    tags: ['flood', 'riverine', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'e8888888-8888-8888-8888-888888888888',
    title: 'Vishwamitri River Spate in Vadodara',
    description: 'Heavy rainfall in Pavagadh hills causing Vishwamitri river to overflow into central lowlands of Vadodara.',
    loc: 'Vadodara, Gujarat', lat: 22.3072, lng: 73.1812,
    tags: ['flood', 'urban', 'active'], status: 'active'
  },
  {
    id: 'e9999999-9999-9999-9999-999999999999',
    title: 'Aji River Reservoir Overflow in Rajkot',
    description: 'Precautionary discharge into Aji river channel with drainage channels effectively operating.',
    loc: 'Rajkot, Gujarat', lat: 22.3039, lng: 70.8022,
    tags: ['flood', 'water', 'resolved'], status: 'resolved'
  },
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    title: 'Desert Flash Inundation in Barmer',
    description: 'Rare depression over Thar desert dumping intense rainfall; temporary drainage pumps deployed in sandy depressions.',
    loc: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873,
    tags: ['flood', 'storm', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    title: 'Mandovi River Estuarine Storm Surge in Goa',
    description: 'Spring high tides coupled with Arabian Sea squalls inundating low-lying ferry ramps along Panaji shoreline.',
    loc: 'Panaji, Goa', lat: 15.4909, lng: 73.8278,
    tags: ['coastal', 'storm', 'surge'], status: 'active'
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    title: 'Nag River Overflow in Central Nagpur',
    description: 'Monsoon cloudburst overloading stormwater channels in Nagpur; civic teams clearing debris culverts.',
    loc: 'Nagpur, Maharashtra', lat: 21.1458, lng: 79.0882,
    tags: ['flood', 'urban', 'resolved'], status: 'resolved'
  },

  // 41-55: Southern States (Karnataka, Tamil Nadu, Kerala, AP, Telangana)
  {
    id: 'f4444444-4444-4444-4444-444444444444',
    title: 'Urban Flash Flooding & Lake Inundation in Bengaluru',
    description: 'Sudden cloudburst overwhelming stormwater drains near Bellandur lake basin with drainage pumps deployed.',
    loc: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946,
    tags: ['flood', 'storm', 'infrastructure', 'drainage'], status: 'resolved'
  },
  {
    id: 'f5555555-5555-5555-5555-555555555555',
    title: 'Hillside Slope Landslip in Kodagu (Coorg)',
    description: 'Western Ghats slope displacement along Madikeri road; emergency transit restoration in progress.',
    loc: 'Bengaluru, Karnataka', lat: 12.4244, lng: 75.7382,
    tags: ['landslide', 'monsoon', 'monitoring'], status: 'monitoring'
  },
  {
    id: 'f6666666-6666-6666-6666-666666666666',
    title: 'Netravati River Basin Spate in Mangaluru',
    description: 'Sustained coastal rains causing Netravati river to rise above warning gauge in Bantwal near Mangaluru.',
    loc: 'Mangaluru, Karnataka', lat: 12.9141, lng: 74.8560,
    tags: ['flood', 'coastal', 'active'], status: 'active'
  },
  {
    id: 'f7777777-7777-7777-7777-777777777777',
    title: 'Krishna River Dam Discharge Flood in Belagavi',
    description: 'Water discharge from upstream Maharashtra reservoirs inundating low-level causeways across Chikodi belt.',
    loc: 'Bengaluru, Karnataka', lat: 15.8497, lng: 74.4977,
    tags: ['flood', 'riverine', 'active'], status: 'active'
  },
  {
    id: 'f8888888-8888-8888-8888-888888888888',
    title: 'Kuttanad Below-Sea-Level Inundation in Alappuzha',
    description: 'Pamba and Achankovil river floods entering agricultural lowlands; traditional snake boat rescue squads mobilized.',
    loc: 'Alappuzha, Kerala', lat: 9.4981, lng: 76.3388,
    tags: ['flood', 'monsoon', 'shelter'], status: 'active'
  },
  {
    id: 'f9999999-9999-9999-9999-999999999999',
    title: 'Idukki Reservoir Blue Alert Water Release',
    description: 'Periyar river volume regulated smoothly through Cheruthoni dam gates; downstream settlements safe.',
    loc: 'Idukki, Kerala', lat: 9.8494, lng: 76.9804,
    tags: ['flood', 'dam', 'resolved'], status: 'resolved'
  },
  {
    id: '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a',
    title: 'Karamana River Basin Overflow in Thiruvananthapuram',
    description: 'Heavy precipitation over Peppara catchment causing river flow to submerge riverbank footpaths.',
    loc: 'Thiruvananthapuram, Kerala', lat: 8.5241, lng: 76.9366,
    tags: ['flood', 'river', 'monitoring'], status: 'monitoring'
  },
  {
    id: '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b',
    title: 'Nilgiris Mountain Ghat Landslide near Ooty',
    description: 'Slumping of soil along Coonoor ghat road stranding vehicular convoys; highway dozers clearing debris.',
    loc: 'Coimbatore, Tamil Nadu', lat: 11.4102, lng: 76.6950,
    tags: ['landslide', 'mountain', 'active'], status: 'active'
  },
  {
    id: '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c',
    title: 'Noyyal River Overflow in Coimbatore',
    description: 'Flash monsoon flow filling check dams; precautionary warnings issued for riparian slum settlements.',
    loc: 'Coimbatore, Tamil Nadu', lat: 11.0168, lng: 76.9558,
    tags: ['flood', 'river', 'monitoring'], status: 'monitoring'
  },
  {
    id: '4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d',
    title: 'Vaigai River Spillway Discharge in Madurai',
    description: 'Controlled release from Vaigai dam safely channelled through historical riverbeds of temple city Madurai.',
    loc: 'Madurai, Tamil Nadu', lat: 9.9252, lng: 78.1198,
    tags: ['flood', 'water', 'resolved'], status: 'resolved'
  },
  {
    id: '5e5e5e5e-5e5e-5e5e-5e5e-5e5e5e5e5e5e',
    title: 'Cuddalore Coastal Storm Breach & Sea Ingress',
    description: 'Bay of Bengal gale waves penetrating coastal fishing hamlets; NDRF operating inflatable rescue boats.',
    loc: 'Chennai, Tamil Nadu', lat: 11.7480, lng: 79.7714,
    tags: ['cyclone', 'coastal', 'active'], status: 'active'
  },
  {
    id: '6f6f6f6f-6f6f-6f6f-6f6f-6f6f6f6f6f6f',
    title: 'Musi River Floodwater Surge in Hyderabad',
    description: 'Himayat Sagar gates opened releasing excess inflow into Musi river; bridges barricaded for public safety.',
    loc: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867,
    tags: ['flood', 'riverine', 'active'], status: 'active'
  },
  {
    id: '7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a',
    title: 'Krishna River Flood Inundation in Vijayawada',
    description: 'Prakasam barrage discharging over 4 lakh cusecs; low-lying Bhavani Island and river ghats temporarily closed.',
    loc: 'Vijayawada, Andhra Pradesh', lat: 16.5062, lng: 80.6480,
    tags: ['flood', 'riverine', 'active'], status: 'active'
  },
  {
    id: '8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b',
    title: 'Cyclone Michaung Coastal Surge in Visakhapatnam',
    description: 'High storm waves causing beach erosion near RK Beach; port operations secured under cautionary flag 4.',
    loc: 'Visakhapatnam, Andhra Pradesh', lat: 17.6868, lng: 83.2185,
    tags: ['cyclone', 'surge', 'coastal'], status: 'monitoring'
  },
  {
    id: '9c9c9c9c-9c9c-9c9c-9c9c-9c9c9c9c9c9c',
    title: 'Subarnarekha River Flood Containment in Jamshedpur',
    description: 'Monsoon water discharge flowing smoothly past industrial embankments with all safety bunds intact.',
    loc: 'Jamshedpur, Jharkhand', lat: 22.8046, lng: 86.2029,
    tags: ['flood', 'river', 'resolved'], status: 'resolved'
  }
];

let sql = '-- Clean existing seed data cleanly (cascading)\n';
sql += 'TRUNCATE reports, resources, disasters, users, official_updates, disaster_image_verifications CASCADE;\n\n';

sql += '-- 1. SEED USERS\n';
sql += "INSERT INTO users (id, name, email, password_hash, role) VALUES\n";
sql += "  ('11111111-1111-1111-1111-111111111111', 'Admin Officer', 'admin@relief.io', crypt('admin123', gen_salt('bf', 10)), 'admin'),\n";
sql += "  ('22222222-2222-2222-2222-222222222222', 'Field Coordinator', 'contrib@relief.io', crypt('contrib123', gen_salt('bf', 10)), 'contributor'),\n";
sql += "  ('33333333-3333-3333-3333-333333333333', 'Public Observer', 'viewer@relief.io', crypt('viewer123', gen_salt('bf', 10)), 'viewer');\n\n";

sql += '-- 2. SEED DISASTERS (55 Diverse Indian Incidents)\n';
sql += "INSERT INTO disasters (id, title, description, location_name, latitude, longitude, location, tags, status, created_by) VALUES\n";
const disasterRows = disasters.map((d, i) => {
  const tagsStr = "ARRAY[" + d.tags.map(t => "'" + t + "'").join(', ') + "]";
  const creator = (i % 2 === 0) ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222';
  return `  ('${d.id}', '${d.title.replace(/'/g, "''")}', '${d.description.replace(/'/g, "''")}', '${d.loc}', ${d.lat}, ${d.lng}, ST_SetSRID(ST_MakePoint(${d.lng}, ${d.lat}), 4326)::geography, ${tagsStr}, '${d.status}', '${creator}')`;
});
sql += disasterRows.join(',\n') + ';\n\n';

sql += '-- 3. SEED RESOURCES\n';
const resourceTemplates = [
  { name: 'Hospital & Emergency Trauma Ward', type: 'hospital', cap: 400, avail: 120, status: 'available' },
  { name: 'Civil Defense Flood Relief Shelter', type: 'shelter', cap: 1000, avail: 650, status: 'available' },
  { name: 'NDRF Aquatic & Quick Rescue Squad', type: 'rescue', cap: 150, avail: 50, status: 'available' },
  { name: 'Clean Potable Water Tanker Fleet', type: 'water', cap: 3000, avail: 2200, status: 'available' },
  { name: 'Community Emergency Food Kitchen', type: 'food', cap: 2000, avail: 1400, status: 'available' }
];

const resRows = [];
disasters.forEach((d, idx) => {
  const t1 = resourceTemplates[idx % resourceTemplates.length];
  resRows.push(`  ('${d.id}', '${d.loc.split(',')[0]} ${t1.name}', '${t1.type}', '${d.loc}', ${d.lat + 0.005}, ${d.lng + 0.005}, ST_SetSRID(ST_MakePoint(${d.lng + 0.005}, ${d.lat + 0.005}), 4326)::geography, ${t1.cap}, ${t1.avail}, '${t1.status}')`);
  if (idx < 25) {
    const t2 = resourceTemplates[(idx + 2) % resourceTemplates.length];
    resRows.push(`  ('${d.id}', '${d.loc.split(',')[0]} ${t2.name}', '${t2.type}', '${d.loc}', ${d.lat - 0.006}, ${d.lng - 0.004}, ST_SetSRID(ST_MakePoint(${d.lng - 0.004}, ${d.lat - 0.006}), 4326)::geography, ${t2.cap}, ${t2.avail}, '${t2.status}')`);
  }
});
sql += 'INSERT INTO resources (disaster_id, name, type, location_name, latitude, longitude, location, capacity, available_units, status) VALUES\n';
sql += resRows.join(',\n') + ';\n\n';

sql += '-- 4. SEED REPORTS (Field community intelligence across past 7 days)\n';
const scoutHandles = ['@mumbai_citizen_ravi', '@himalayan_scout', '@kerala_relief_net', '@chennai_weather_watch', '@assam_ground_intel', '@odisha_cyclone_alert', '@delhi_flood_watch', '@pahadi_volunteer', '@punjab_aid_worker', '@bengaluru_ward_scout'];
const reportRows = [];
const priorities = ['critical', 'high', 'medium', 'low'];
for (let i = 0; i < 40; i++) {
  const d = disasters[i % disasters.length];
  const handle = scoutHandles[i % scoutHandles.length];
  const prio = priorities[i % priorities.length];
  const hourOffset = (i * 3.5) + 1; // spans ~140 hours (past 6 days)
  const reportText = `Field Update from ${d.loc}: Relief supplies arriving at local nodal center. Volunteers assisting residents in low-lying pockets.`;
  reportRows.push(`  ('${d.id}', '${reportText}', '${handle}', 'community_portal', '${prio}', true, NOW() - INTERVAL '${hourOffset} hours')`);
}
sql += 'INSERT INTO reports (disaster_id, content, user_handle, source, priority, verified, created_at) VALUES\n';
sql += reportRows.join(',\n') + ';\n\n';

sql += '-- 5. SEED OFFICIAL BULLETINS (Past 7 days)\n';
const agencies = [
  'National Disaster Management Authority (NDMA)',
  'India Meteorological Department (IMD)',
  'State Disaster Management Authority (SDMA)',
  'National Disaster Response Force (NDRF)',
  'Central Water Commission (CWC)'
];
const severities = ['warning', 'advisory', 'evacuation', 'all_clear'];
const bulletinRows = [];
for (let i = 0; i < 28; i++) {
  const d = disasters[i % disasters.length];
  const agency = agencies[i % agencies.length];
  const sev = severities[i % severities.length];
  const hourOffset = (i * 5) + 2; // spans ~140 hours (past 6 days)
  const headline = `Emergency Alert for ${d.loc.split(',')[0]} Region`;
  const body = `Advisory issued by ${agency}. Citizens are instructed to remain alert, avoid floodplains, and follow instructions from local disaster coordination cells.`;
  bulletinRows.push(`  ('${d.id}', '${agency}', '${sev}', '${headline}', '${body}', NOW() - INTERVAL '${hourOffset} hours')`);
}
sql += 'INSERT INTO official_updates (disaster_id, agency, severity, headline, body, issued_at) VALUES\n';
sql += bulletinRows.join(',\n') + ';\n\n';

sql += '-- 6. SEED VERIFIED DAMAGE IMAGES\n';
sql += `INSERT INTO disaster_image_verifications (
  disaster_id, image_url, caption, is_genuine, confidence_score, damage_severity, detected_hazards, ai_analysis
) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80', 'Waterlogged arterial road in Mumbai with rescue teams deploying inflatable boats.', true, 0.952, 'severe', ARRAY['high_water_level', 'traffic_gridlock', 'submerged_roadway'], '{\"structuralIntegrity\": \"sound\", \"waterLevelEstMeters\": 0.8, \"detectedObjects\": [\"boat\", \"water\", \"debris\"], \"manipulationArtifactsDetected\": false}'::jsonb),
  ('a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80', 'Himalayan riverine flow and landslide debris clearance by disaster management crews near Chamoli.', true, 0.965, 'severe', ARRAY['floodwater_depth_high', 'submerged_vehicles', 'electrical_conduit_risk'], '{\"structuralIntegrity\": \"compromised_subsurface\", \"waterLevelEstMeters\": 0.9, \"detectedObjects\": [\"vehicle\", \"water\", \"debris\"], \"manipulationArtifactsDetected\": false}'::jsonb);\n`;

const targetFile = path.join(__dirname, 'seed.sql');
fs.writeFileSync(targetFile, sql, 'utf8');
console.log('Successfully wrote 55 disasters and comprehensive Indian seed dataset to seed.sql!');
