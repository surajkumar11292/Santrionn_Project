const cacheService = require('./cache.service');
const logger = require('../utils/logger');
const { lookupCoordinates, GEOLOCATION_REGISTRY } = require('../mocks/geocoding.mock');

// Institutional, facility, transition, and generic stop-words to prevent false-positive geocoding matches
const AMENITY_STOP_WORDS = new Set([
  'army', 'public', 'school', 'college', 'hospital', 'station', 'police',
  'vidyalaya', 'university', 'office', 'center', 'centre', 'hall', 'hotel',
  'restaurant', 'mandir', 'temple', 'masjid', 'church', 'mosque', 'park',
  'gate', 'road', 'street', 'gali', 'near', 'opp', 'opposite', 'beside',
  'behind', 'next', 'to', 'front', 'of', 'flat', 'house', 'ward', 'block',
  'sector', 'lane', 'heavy', 'rain', 'flood', 'at', 'in', 'near', 'the',
  'and', 'for', 'from', 'cantt', 'cantonment'
]);

class GeoService {
  /**
   * Query OpenStreetMap Nominatim with timeout (Prioritizes Indian results, falls back globally)
   */
  async queryOsm(query) {
    if (!query || query.length < 3) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      // 1. First attempt: India country scope (for domestic cities, towns, blocks, and cantonments)
      const inResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`,
        {
          signal: controller.signal,
          headers: { 'User-Agent': 'DisasterResponseCoordination/1.0' }
        }
      );

      if (inResponse.ok) {
        const inItems = await inResponse.json();
        if (Array.isArray(inItems) && inItems.length > 0) {
          clearTimeout(timeoutId);
          const hit = inItems[0];
          const cleanName = hit.display_name.split(',').slice(0, 3).join(',').trim();
          return {
            name: cleanName,
            latitude: parseFloat(hit.lat),
            longitude: parseFloat(hit.lon)
          };
        }
      }

      // 2. Second attempt: Global scope (for international metros or overseas testing)
      const globalResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          signal: controller.signal,
          headers: { 'User-Agent': 'DisasterResponseCoordination/1.0' }
        }
      );
      clearTimeout(timeoutId);

      if (globalResponse.ok) {
        const globalItems = await globalResponse.json();
        if (Array.isArray(globalItems) && globalItems.length > 0) {
          const hit = globalItems[0];
          const cleanName = hit.display_name.split(',').slice(0, 3).join(',').trim();
          return {
            name: cleanName,
            latitude: parseFloat(hit.lat),
            longitude: parseFloat(hit.lon)
          };
        }
      }
    } catch (err) {
      // Timeout or offline
    }
    return null;
  }

  /**
   * Build progressive search candidates from specific to broad
   * Handles multi-part comma strings (urjanagar, khagual, patna, bihar) and
   * unpunctuated/facility strings (Army public school danapur cantt)
   */
  buildSearchCandidates(text) {
    const trimmed = text.trim();
    const candidates = [];
    const seen = new Set();

    const add = (q) => {
      if (!q) return;
      const clean = q.replace(/^[,.\s]+|[,.\s]+$/g, '').trim();
      if (clean.length >= 3 && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        candidates.push(clean);
      }
    };

    // 1. Full trimmed query
    add(trimmed);

    // 2. Comma-delimited progressive suffixes (specific to broad)
    // e.g. "urjanagar, khagual, patna, bihar" -> "khagual, patna, bihar" -> "patna, bihar" -> "bihar"
    const segments = trimmed.split(/[,;|\/]+/).map((s) => s.trim()).filter((s) => s.length > 1);
    if (segments.length > 1) {
      for (let i = 0; i < segments.length; i++) {
        add(segments.slice(i).join(', '));
      }
    }

    // 3. Suffix after stripping leading amenity/stop words
    // e.g. "Army public school danapur cantt" -> "danapur cantt"
    const words = trimmed.split(/\s+/).filter(Boolean);
    let firstGeoIdx = -1;
    for (let i = 0; i < words.length; i++) {
      const w = words[i].toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!AMENITY_STOP_WORDS.has(w)) {
        firstGeoIdx = i;
        break;
      }
    }
    if (firstGeoIdx > 0) {
      add(words.slice(firstGeoIdx).join(' '));
    }

    // 4. Significant individual segments (e.g. "khagual", "patna")
    for (const seg of segments) {
      add(seg);
      const segWords = seg.split(/\s+/).filter((w) => !AMENITY_STOP_WORDS.has(w.toLowerCase().replace(/[^a-z0-9]/g, '')));
      if (segWords.length > 0) {
        add(segWords.join(' '));
      }
    }

    // 5. Sliding 2-word pairs (SKIP pairs where BOTH words are stop words to prevent false matches like "army public")
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i].toLowerCase().replace(/[^a-z0-9]/g, '');
      const w2 = words[i + 1].toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!AMENITY_STOP_WORDS.has(w1) || !AMENITY_STOP_WORDS.has(w2)) {
        add(`${words[i]} ${words[i + 1]}`);
      }
    }

    // 6. Significant single words (excluding amenity/stop words)
    for (const w of words) {
      const cleanWord = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanWord.length >= 3 && !AMENITY_STOP_WORDS.has(cleanWord)) {
        add(w);
      }
    }

    return candidates;
  }

  /**
   * Extract location name and resolve coordinates using hierarchical specific-to-broad resolution
   * e.g. "Army public school danapur cantt" -> resolves Danapur coordinates while preserving the school name
   * e.g. "urjanagar, khagual, patna, bihar" -> resolves Khagaul/Patna while preserving full user text
   * @param {string} text - Incident description or location string
   */
  async resolveLocationFromText(text, isExplicit = false) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    const trimmed = text.trim();
    if (!trimmed) return null;

    // Use explicit location directly; only extract preposition cues from long narrative descriptions
    const extracted = (!isExplicit && trimmed.length > 25) ? this.extractLocationEntity(trimmed) : null;
    const lookupTarget = (extracted || trimmed).trim();

    // Cache Key for location resolution (TTL: 24 Hours)
    const cacheKey = `geocode:${lookupTarget.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Execute Cache-Aside pattern
    const result = await cacheService.wrap(cacheKey, 86400, async () => {
      // 1. Direct match on complete phrase (if static override exists)
      const direct = lookupCoordinates(lookupTarget);
      if (direct) {
        logger.info(`[GeoService] Direct registry match for "${lookupTarget}": [${direct.latitude}, ${direct.longitude}]`);
        return { ...direct, name: lookupTarget };
      }

      // 2. Generate progressive candidates from specific to broad
      const candidates = this.buildSearchCandidates(lookupTarget);
      logger.info(`[GeoService] Resolving location for "${lookupTarget}". Candidate evaluation pipeline: ${candidates.slice(0, 5).join(' -> ')}`);

      for (const candidate of candidates) {
        // Check test mock registry first
        const mockHit = lookupCoordinates(candidate);
        if (mockHit) {
          logger.info(`[GeoService] Mock registry match for candidate "${candidate}": [${mockHit.latitude}, ${mockHit.longitude}]`);
          return {
            name: lookupTarget, // Preserves the user's full original input
            latitude: mockHit.latitude,
            longitude: mockHit.longitude,
            resolvedAnchor: mockHit.name
          };
        }

        // Live OpenStreetMap Nominatim query
        const osmHit = await this.queryOsm(candidate);
        if (osmHit) {
          logger.info(`[GeoService] Successfully resolved "${lookupTarget}" via anchor "${candidate}" -> [${osmHit.latitude}, ${osmHit.longitude}] (${osmHit.name})`);
          return {
            name: lookupTarget, // Preserves the user's full original input
            latitude: osmHit.latitude,
            longitude: osmHit.longitude,
            resolvedAnchor: osmHit.name
          };
        }
      }

      // 3. If unresolvable across all candidate tiers, return null
      logger.warn(`[GeoService] Failed to resolve geographic location for "${lookupTarget}" across all candidates`);
      return null;
    });

    if (!result?.data) {
      return null;
    }

    return {
      locationName: result.data.name,
      latitude: result.data.latitude,
      longitude: result.data.longitude,
      resolvedAnchor: result.data.resolvedAnchor,
      cached: result.cached,
      remainingTtl: result.ttlRemaining
    };
  }

  /**
   * Extract location entity using NLP contextual cues from narrative text
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

    // 2. Look for phrases like "heavy rain at urjanagar, khagual, patna, bihar", "Flood at Mumbai", "in Miami Beach"
    const cueRegex = /\b(?:affected|in|near|across|at|striking|centered near|spreading across)\b\s+([^.!?\n\r]+)/i;
    const match = text.match(cueRegex);

    if (match && match[1]) {
      let candidate = match[1].trim();
      // Cut off trailing narrative / consequence clauses (e.g. "causing...", "leading to...")
      const cutoffRegex = /\b(?:causing|leaving|leading to|due to|with|affecting|reported|stranded)\b/i;
      const cutoffMatch = candidate.search(cutoffRegex);
      if (cutoffMatch > 0) {
        candidate = candidate.substring(0, cutoffMatch).trim();
      }
      candidate = candidate.replace(/[.,;]+$/, '').trim();
      const coord = lookupCoordinates(candidate);
      if (coord) return coord.name;
      return candidate;
    }

    return null;
  }
}

module.exports = new GeoService();
