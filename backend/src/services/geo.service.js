const cacheService = require('./cache.service');
const { lookupCoordinates, GEOLOCATION_REGISTRY } = require('../mocks/geocoding.mock');

class GeoService {
  /**
   * Extract location name from text description and resolve coordinates
   * @param {string} text - Incident description text
   */
  async resolveLocationFromText(text) {
    if (!text || typeof text !== 'string') {
      return this.getDefaultLocation();
    }

    // Step 1: Extract candidate location from text
    const extractedName = this.extractLocationEntity(text);
    const lookupTarget = extractedName || text;

    // Step 2: Cache Key for location resolution (TTL: 24 Hours)
    const cacheKey = `geocode:${lookupTarget.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Step 3: Execute Cache-Aside pattern
    const result = await cacheService.wrap(cacheKey, 86400, async () => {
      // Resolve coordinates from mock geocoder
      const resolved = lookupCoordinates(lookupTarget);

      if (resolved) {
        return resolved;
      }

      // Fallback matching against known keys directly inside the text
      const lowerText = text.toLowerCase();
      for (const [key, value] of Object.entries(GEOLOCATION_REGISTRY)) {
        if (lowerText.includes(key)) {
          return value;
        }
      }

      // Default safe fallback if unresolvable
      return {
        name: extractedName || 'Manhattan, NYC',
        latitude: 40.7831,
        longitude: -73.9712,
        isFallback: true
      };
    });

    return {
      locationName: result.data.name,
      latitude: result.data.latitude,
      longitude: result.data.longitude,
      cached: result.cached,
      remainingTtl: result.ttlRemaining
    };
  }

  /**
   * Extract location entity using NLP contextual cues
   */
  extractLocationEntity(text) {
    // Look for phrases like "affected Manhattan, NYC", "in Miami Beach", "near Austin, TX"
    const cueRegex = /(?:affected|in|near|across|at|striking|centered near|spreading across)\s+([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2,4})?)/;
    const match = text.match(cueRegex);

    if (match && match[1]) {
      return match[1].trim().replace(/[.,;]$/, '');
    }

    // Direct search for known regions in the text
    const lower = text.toLowerCase();
    for (const key of Object.keys(GEOLOCATION_REGISTRY)) {
      if (lower.includes(key)) {
        return GEOLOCATION_REGISTRY[key].name;
      }
    }

    return null;
  }

  getDefaultLocation() {
    return {
      locationName: 'Manhattan, NYC',
      latitude: 40.7831,
      longitude: -73.9712,
      cached: false
    };
  }
}

module.exports = new GeoService();
