const officialUpdateRepo = require('../repositories/officialUpdate.repo');
const disasterRepo = require('../repositories/disaster.repo');
 const cacheService = require('./cache.service');
 const { emitOfficialUpdate } = require('../socket/events');
 const { NotFoundError } = require('../utils/errors');

class OfficialUpdateService {
  constructor() {
    this.CACHE_TTL_SECONDS = 180; // 3-minute TTL for official bulletins
  }

  /**
   * Retrieve official agency bulletins for a disaster (with Cache-Aside)
   */
  async getUpdatesByDisaster(disasterId) {
    const disaster = await disasterRepo.findById(disasterId);
    if (!disaster) {
      throw new NotFoundError(`Disaster with ID '${disasterId}' does not exist`);
    }

    const cacheKey = `official_updates:disaster:${disasterId}`;

    // 1. Check Redis Cache
    const cached = await cacheService.getWithTtl(cacheKey);
    if (cached) {
      return {
        updates: cached.data,
        cached: true,
        cacheTtl: cached.ttl
      };
    }

    // 2. Fetch from PostgreSQL
    const updates = await officialUpdateRepo.findByDisasterId(disasterId);

    // 3. Store in Redis
    await cacheService.set(cacheKey, updates, this.CACHE_TTL_SECONDS);

    return {
      updates,
      cached: false,
      cacheTtl: this.CACHE_TTL_SECONDS
    };
  }

  /**
   * Issue a new official emergency advisory
   */
  async createOfficialUpdate(disasterId, data, userId) {
    const disaster = await disasterRepo.findById(disasterId);
    if (!disaster) {
      throw new NotFoundError(`Disaster with ID '${disasterId}' does not exist`);
    }

    const update = await officialUpdateRepo.create({
      disasterId,
      agency: data.agency,
      severity: data.severity,
      headline: data.headline,
      body: data.body,
      userId
    });

    // Invalidate cache for fresh retrieval
    const cacheKey = `official_updates:disaster:${disasterId}`;
    await cacheService.del(cacheKey);

    // Broadcast real-time WebSocket alert
    emitOfficialUpdate(disasterId, update);

    return update;
  }
}

module.exports = new OfficialUpdateService();
