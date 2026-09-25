/**
 * Mock Geocoding Database for Location Resolution
 */

const GEOLOCATION_REGISTRY = {
  // New York City & Boroughs
  'manhattan, nyc': { name: 'Manhattan, NYC', latitude: 40.7831, longitude: -73.9712 },
  'manhattan': { name: 'Manhattan, NYC', latitude: 40.7831, longitude: -73.9712 },
  'brooklyn, nyc': { name: 'Brooklyn, NYC', latitude: 40.6782, longitude: -73.9442 },
  'brooklyn': { name: 'Brooklyn, NYC', latitude: 40.6782, longitude: -73.9442 },
  'queens, nyc': { name: 'Queens, NYC', latitude: 40.7282, longitude: -73.7949 },
  'new york': { name: 'New York City, NY', latitude: 40.7128, longitude: -74.0060 },
  'nyc': { name: 'New York City, NY', latitude: 40.7128, longitude: -74.0060 },

  // Florida
  'miami beach, fl': { name: 'Miami Beach, FL', latitude: 25.7907, longitude: -80.1300 },
  'miami beach': { name: 'Miami Beach, FL', latitude: 25.7907, longitude: -80.1300 },
  'miami': { name: 'Miami, FL', latitude: 25.7617, longitude: -80.1918 },
  'tampa': { name: 'Tampa, FL', latitude: 27.9506, longitude: -82.4572 },
  'orlando': { name: 'Orlando, FL', latitude: 28.5383, longitude: -81.3792 },

  // California
  'topanga canyon, los angeles': { name: 'Topanga Canyon, Los Angeles', latitude: 34.0922, longitude: -118.6019 },
  'topanga canyon': { name: 'Topanga Canyon, CA', latitude: 34.0922, longitude: -118.6019 },
  'los angeles, ca': { name: 'Los Angeles, CA', latitude: 34.0522, longitude: -118.2437 },
  'los angeles': { name: 'Los Angeles, CA', latitude: 34.0522, longitude: -118.2437 },
  'san francisco, ca': { name: 'San Francisco, CA', latitude: 37.7749, longitude: -122.4194 },
  'san francisco': { name: 'San Francisco, CA', latitude: 37.7749, longitude: -122.4194 },
  'san diego': { name: 'San Diego, CA', latitude: 32.7157, longitude: -117.1611 },

  // Texas
  'austin, tx': { name: 'Austin, TX', latitude: 30.2672, longitude: -97.7431 },
  'austin': { name: 'Austin, TX', latitude: 30.2672, longitude: -97.7431 },
  'houston, tx': { name: 'Houston, TX', latitude: 29.7604, longitude: -95.3698 },
  'houston': { name: 'Houston, TX', latitude: 29.7604, longitude: -95.3698 },
  'dallas': { name: 'Dallas, TX', latitude: 32.7767, longitude: -96.7970 },

  // Louisiana
  'new orleans, la': { name: 'New Orleans, LA', latitude: 29.9511, longitude: -90.0715 },
  'new orleans': { name: 'New Orleans, LA', latitude: 29.9511, longitude: -90.0715 },

  // Other Major US Hubs
  'chicago, il': { name: 'Chicago, IL', latitude: 41.8781, longitude: -87.6298 },
  'chicago': { name: 'Chicago, IL', latitude: 41.8781, longitude: -87.6298 },
  'seattle, wa': { name: 'Seattle, WA', latitude: 47.6062, longitude: -122.3321 },
  'seattle': { name: 'Seattle, WA', latitude: 47.6062, longitude: -122.3321 },
  'denver, co': { name: 'Denver, CO', latitude: 39.7392, longitude: -104.9903 },
  'denver': { name: 'Denver, CO', latitude: 39.7392, longitude: -104.9903 },
  'atlanta': { name: 'Atlanta, GA', latitude: 33.7490, longitude: -84.3880 },
  'boston': { name: 'Boston, MA', latitude: 42.3601, longitude: -71.0589 }
};

/**
 * Resolve location name to coordinates
 */
const lookupCoordinates = (locationName) => {
  if (!locationName) return null;
  const normalized = locationName.toLowerCase().trim();

  // 1. Direct match
  if (GEOLOCATION_REGISTRY[normalized]) {
    return GEOLOCATION_REGISTRY[normalized];
  }

  // 2. Substring matching
  for (const [key, value] of Object.entries(GEOLOCATION_REGISTRY)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
};

module.exports = {
  GEOLOCATION_REGISTRY,
  lookupCoordinates
};
