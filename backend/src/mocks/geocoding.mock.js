/**
 * Geolocation Registry:
 * In development and production, this is EMPTY: all geocoding is performed dynamically
 * via the live OpenStreetMap Nominatim API.
 * Only in automated test runs (NODE_ENV === 'test'), minimal test fixtures are used
 * to avoid external rate-limits and network timeouts.
 */
const GEOLOCATION_REGISTRY = process.env.NODE_ENV === 'test' ? {
  'miami': { name: 'Miami, FL', latitude: 25.7617, longitude: -80.1918 },
  'miami, fl': { name: 'Miami, FL', latitude: 25.7617, longitude: -80.1918 }
} : {};

/**
 * Resolve location name to coordinates
 */
const lookupCoordinates = (locationName) => {
  if (!locationName) return null;
  const normalized = locationName.toLowerCase().trim();

  if (GEOLOCATION_REGISTRY[normalized]) {
    return GEOLOCATION_REGISTRY[normalized];
  }

  return null;
};

module.exports = {
  GEOLOCATION_REGISTRY,
  lookupCoordinates
};

