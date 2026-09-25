const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');
const { redisClient } = require('../src/config/redis');

describe('Redis Cache-Aside Pattern Integration Tests', () => {
  const disasterId = 'a1111111-1111-1111-1111-111111111111';
  const cacheKey = `reports:disaster:${disasterId}`;

  beforeAll(async () => {
    // Flush the specific cache key to guarantee starting with a cache miss
    if (redisClient && redisClient.status !== 'end') {
      await redisClient.del(cacheKey);
    }
  });

  afterAll(async () => {
    // Clean up cache entry
    if (redisClient && redisClient.status !== 'end') {
      await redisClient.del(cacheKey);
      await redisClient.quit();
    }
    await pool.end();
  });

  it('GET /disasters/:id/reports - first request should be a Cache Miss (cached: false)', async () => {
    const res = await request(app)
      .get(`/disasters/${disasterId}/reports`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.cached).toBe(false);
    expect(res.body.meta.cache_ttl).toBe(300);
  });

  it('GET /disasters/:id/reports - subsequent request should be a Cache Hit (cached: true)', async () => {
    const res = await request(app)
      .get(`/disasters/${disasterId}/reports`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.cached).toBe(true);
    expect(typeof res.body.meta.cache_ttl).toBe('number');
    expect(res.body.meta.cache_ttl).toBeGreaterThan(0);
    expect(res.body.meta.cache_ttl).toBeLessThanOrEqual(300);
  });
});
