const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');
const { redisClient } = require('../src/config/redis');

describe('Official Disaster Updates & Advisories Integration Tests', () => {
  const disasterId = 'a1111111-1111-1111-1111-111111111111';
  let adminToken;
  let viewerToken;

  beforeAll(async () => {
    // 1. Admin login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@relief.io', password: 'admin123' });
    adminToken = adminRes.body.data.tokens.accessToken;

    // 2. Viewer login
    const viewerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@relief.io', password: 'viewer123' });
    viewerToken = viewerRes.body.data.tokens.accessToken;

    // Clear cache key
    if (redisClient && redisClient.status !== 'end') {
      await redisClient.del(`official_updates:disaster:${disasterId}`);
    }
  });

  afterAll(async () => {
    if (redisClient && redisClient.status !== 'end') {
      await redisClient.del(`official_updates:disaster:${disasterId}`);
      await redisClient.quit();
    }
    await pool.end();
  });

  it('GET /disasters/:id/updates - should retrieve seeded official bulletins with Cache-Aside miss', async () => {
    const res = await request(app).get(`/disasters/${disasterId}/updates`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.cached).toBe(false);
    expect(res.body.meta.cache_ttl).toBe(180);
    expect(res.body.data[0].agency).toBeDefined();
    expect(res.body.data[0].severity).toBeDefined();
  });

  it('GET /disasters/:id/updates - subsequent request should be a Cache Hit (cached: true)', async () => {
    const res = await request(app).get(`/disasters/${disasterId}/updates`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta.cached).toBe(true);
    expect(res.body.meta.cache_ttl).toBeGreaterThan(0);
  });

  it('POST /disasters/:id/updates - should return 403 Forbidden when viewer attempts creation', async () => {
    const payload = {
      agency: 'Unauthorized Operator',
      severity: 'warning',
      headline: 'Unauthorized Warning Broadcast',
      body: 'Should be rejected by RBAC layer.'
    };

    const res = await request(app)
      .post(`/disasters/${disasterId}/updates`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send(payload);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('POST /disasters/:id/updates - should allow admin to broadcast official advisory (201 Created)', async () => {
    const payload = {
      agency: 'FEMA Joint Disaster Command',
      severity: 'evacuation',
      headline: 'CRITICAL EVACUATION ORDER: Sector 4 Lowlands',
      body: 'All non-emergency personnel must vacate low-lying harbor areas immediately.'
    };

    const res = await request(app)
      .post(`/disasters/${disasterId}/updates`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agency).toBe(payload.agency);
    expect(res.body.data.severity).toBe('evacuation');
    expect(res.body.data.headline).toBe(payload.headline);
  });
});
