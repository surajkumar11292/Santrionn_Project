const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');
const { redisClient } = require('../src/config/redis');

describe('AI Image Verification & Hazard Assessment Integration Tests', () => {
  const disasterId = 'a1111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    if (redisClient && redisClient.status !== 'end') {
      await redisClient.del(`images:disaster:${disasterId}`);
    }
  });

  afterAll(async () => {
    if (redisClient && redisClient.status !== 'end') {
      await redisClient.del(`images:disaster:${disasterId}`);
      await redisClient.quit();
    }
    await pool.end();
  });

  it('GET /disasters/:id/images - should retrieve verified images with Cache-Aside metadata', async () => {
    // First request - Cache Miss
    const res1 = await request(app).get(`/disasters/${disasterId}/images`);
    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);
    expect(Array.isArray(res1.body.data)).toBe(true);
    expect(res1.body.meta.cached).toBe(false);

    // Second request - Cache Hit
    const res2 = await request(app).get(`/disasters/${disasterId}/images`);
    expect(res2.status).toBe(200);
    expect(res2.body.meta.cached).toBe(true);
    expect(res2.body.meta.cache_ttl).toBeGreaterThan(0);
  });

  it('POST /disasters/:id/verify-image - should verify damage image and detect hazards via AI vision', async () => {
    const payload = {
      imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=800',
      caption: 'Catastrophic urban flooding submerging ground floor residences'
    };

    const res = await request(app)
      .post(`/disasters/${disasterId}/verify-image`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.is_genuine).toBe(true);
    expect(Number(res.body.data.confidence_score)).toBeGreaterThanOrEqual(0.9);
    expect(res.body.data.damage_severity).toBe('severe');
    expect(res.body.data.detected_hazards).toContain('floodwater_depth_high');
    expect(res.body.data.ai_analysis).toHaveProperty('structuralIntegrity');
  });

  it('POST /disasters/:id/verify-image - should reject invalid request missing imageUrl with 400', async () => {
    const res = await request(app)
      .post(`/disasters/${disasterId}/verify-image`)
      .send({ caption: 'Missing image URL' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('POST /disasters/:id/verify-image - should return 404 for non-existent disaster', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .post(`/disasters/${nonExistentId}/verify-image`)
      .send({
        imageUrl: 'https://example.com/test.jpg',
        caption: 'Test damage image'
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
