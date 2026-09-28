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
        const regex = new RegExp(`\\b${key}\\b`, 'i');
        if (regex.test(lowerText)) {
          return value;
        }
      }

      // Online geocoding attempt (OpenStreetMap Nominatim) with 1.5s timeout
      try {
        const searchTarget = extractedName || text;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTarget)}&limit=1`,
          {
            signal: controller.signal,
            headers: { 'User-Agent': 'DisasterResponseCoordination/1.0' }
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const items = await response.json();
          if (Array.isArray(items) && items.length > 0) {
            const hit = items[0];
            const cleanName = hit.display_name.split(',').slice(0, 2).join(',').trim();
            return {
              name: cleanName,
              latitude: parseFloat(hit.lat),
              longitude: parseFloat(hit.lon)
            };
          }
        }
      } catch (err) {
        // Network unavailable or timeout; proceed to safe fallback
      }

      // Default safe fallback if unresolvable
      return {
        name: extractedName || 'Mumbai, Maharashtra',
        latitude: 19.0760,
        longitude: 72.8777,
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
    if (!text || typeof text !== 'string') return null;

    // 1. Direct search for known regions in the text
    const lower = text.toLowerCase();
    for (const [key, value] of Object.entries(GEOLOCATION_REGISTRY)) {
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(lower)) {
        return value.name;
      }
    }

    // 2. Look for phrases like "affected Manhattan, NYC", "in Miami Beach", "Flood at Mumbai"
    const cueRegex = /(?:affected|in|near|across|at|striking|centered near|spreading across)\s+([A-Za-z\s]+(?:,\s*[A-Za-z\s]{2,4})?)/i;
    const match = text.match(cueRegex);

    if (match && match[1]) {
      const candidate = match[1].trim().replace(/[.,;]$/, '');
      const coord = lookupCoordinates(candidate);
      if (coord) return coord.name;
      return candidate;
    }

    return null;
  }

  getDefaultLocation() {
    return {
      locationName: 'Mumbai, Maharashtra',
      latitude: 19.0760,
      longitude: 72.8777,
      cached: false
    };
  }
}

module.exports = new GeoService();
