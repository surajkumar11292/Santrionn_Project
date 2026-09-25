const { redisClient } = require('../config/redis');

class CacheService {
  /**
   * Retrieve parsed JSON value from cache
   */
  async get(key) {
    if (!redisClient) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn(`[Cache Warning] Failed to GET key "${key}":`, err.message);
      return null;
    }
  }

  /**
   * Set JSON value in cache with TTL in seconds
   */
  async set(key, value, ttlSeconds = 300) {
    if (!redisClient) return false;
    try {
      const serialized = JSON.stringify(value);
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
      return true;
    } catch (err) {
      console.warn(`[Cache Warning] Failed to SET key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Retrieve cached value along with its remaining TTL in seconds
   */
  async getWithTtl(key) {
    if (!redisClient) return null;
    try {
      const pipeline = redisClient.pipeline();
      pipeline.get(key);
      pipeline.ttl(key);
      const results = await pipeline.exec();

      const [errData, data] = results[0];
      const [errTtl, ttl] = results[1];

      if (errData || !data) return null;

      return {
        data: JSON.parse(data),
        ttl: Math.max(0, ttl)
      };
    } catch (err) {
      console.warn(`[Cache Warning] Failed to getWithTtl for "${key}":`, err.message);
      return null;
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key) {
    if (!redisClient) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (err) {
      console.warn(`[Cache Warning] Failed to DEL key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Cache-Aside pattern executor
   * Checks cache -> Hit returns cached data -> Miss calls fetchFn, caches response, returns data
   */
  async wrap(key, ttlSeconds, fetchFn) {
    const cachedEntry = await this.getWithTtl(key);

    if (cachedEntry) {
      return {
        data: cachedEntry.data,
        cached: true,
        ttlRemaining: cachedEntry.ttl
      };
    }

    // Cache Miss -> Fetch fresh data
    const freshData = await fetchFn();

    // Store in cache asynchronously
    if (freshData !== null && freshData !== undefined) {
      await this.set(key, freshData, ttlSeconds);
    }

    return {
      data: freshData,
      cached: false,
      ttlRemaining: ttlSeconds
    };
  }
}

module.exports = new CacheService();
