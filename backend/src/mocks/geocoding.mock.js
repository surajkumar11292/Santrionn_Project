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
  // Major Indian Cities & States
  'mumbai': { name: 'Mumbai, Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  'bombay': { name: 'Mumbai, Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  'delhi': { name: 'New Delhi, Delhi', latitude: 28.6139, longitude: 77.2090 },
  'new delhi': { name: 'New Delhi, Delhi', latitude: 28.6139, longitude: 77.2090 },
  'bangalore': { name: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946 },
  'bengaluru': { name: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946 },
  'chennai': { name: 'Chennai, Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  'madras': { name: 'Chennai, Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  'kolkata': { name: 'Kolkata, West Bengal', latitude: 22.5726, longitude: 88.3639 },
  'calcutta': { name: 'Kolkata, West Bengal', latitude: 22.5726, longitude: 88.3639 },
  'hyderabad': { name: 'Hyderabad, Telangana', latitude: 17.3850, longitude: 78.4867 },
  'pune': { name: 'Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  'ahmedabad': { name: 'Ahmedabad, Gujarat', latitude: 23.0225, longitude: 72.5714 },
  'jaipur': { name: 'Jaipur, Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  'kerala': { name: 'Kochi, Kerala', latitude: 9.9312, longitude: 76.2673 },
  'kochi': { name: 'Kochi, Kerala', latitude: 9.9312, longitude: 76.2673 },
  'wayanad': { name: 'Wayanad, Kerala', latitude: 11.6854, longitude: 76.1320 },
  'uttarakhand': { name: 'Dehradun, Uttarakhand', latitude: 30.3165, longitude: 78.0322 },
  'uttrakhand': { name: 'Dehradun, Uttarakhand', latitude: 30.3165, longitude: 78.0322 },
  'dehradun': { name: 'Dehradun, Uttarakhand', latitude: 30.3165, longitude: 78.0322 },
  'shimla': { name: 'Shimla, Himachal Pradesh', latitude: 31.1048, longitude: 77.1734 },
  'himachal': { name: 'Shimla, Himachal Pradesh', latitude: 31.1048, longitude: 77.1734 },
  'kashmir': { name: 'Srinagar, Jammu & Kashmir', latitude: 34.0837, longitude: 74.7973 },
  'srinagar': { name: 'Srinagar, Jammu & Kashmir', latitude: 34.0837, longitude: 74.7973 },
  'assam': { name: 'Guwahati, Assam', latitude: 26.1445, longitude: 91.7362 },
  'guwahati': { name: 'Guwahati, Assam', latitude: 26.1445, longitude: 91.7362 },
  'patna': { name: 'Patna, Bihar', latitude: 25.5941, longitude: 85.1376 },
  'lucknow': { name: 'Lucknow, Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
  'bhopal': { name: 'Bhopal, Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  'bhubaneswar': { name: 'Bhubaneswar, Odisha', latitude: 20.2961, longitude: 85.8245 },
  'odisha': { name: 'Bhubaneswar, Odisha', latitude: 20.2961, longitude: 85.8245 },

  // International Metros
  'london': { name: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  'paris': { name: 'Paris, France', latitude: 48.8566, longitude: 2.3522 },
  'tokyo': { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
  'sydney': { name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093 },
  'valencia': { name: 'Valencia, Spain', latitude: 39.4699, longitude: -0.3763 },
  'toronto': { name: 'Toronto, Canada', latitude: 43.6532, longitude: -79.3832 },
  'singapore': { name: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  'dubai': { name: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708 }
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

  // 3. Word token matching (e.g., "Flood at Mumbai", "Mumbai Flood" -> matches "mumbai")
  const words = normalized.split(/[\s,.-]+/);
  for (const word of words) {
    if (word.length > 2 && GEOLOCATION_REGISTRY[word]) {
      return GEOLOCATION_REGISTRY[word];
    }
  }

  return null;
};

module.exports = {
  GEOLOCATION_REGISTRY,
  lookupCoordinates
};
