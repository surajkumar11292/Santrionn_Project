const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');
const { redisClient } = require('../src/config/redis');

describe('Input Validation Integration Tests', () => {
  let adminToken;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@relief.io',
        password: 'admin123'
      });
    adminToken = loginRes.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await pool.end();
    if (redisClient && redisClient.status !== 'end') {
      await redisClient.quit();
    }
  });

  it('POST /disasters - should return 400 when required "title" is missing', async () => {
    const invalidPayload = {
      description: 'Disaster incident description without title',
      tags: ['flooding']
    };

    const res = await request(app)
      .post('/disasters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.message).toMatch(/Validation failed/i);
    expect(res.body.error.details).toBeDefined();
    expect(JSON.stringify(res.body.error.details)).toMatch(/title is required/i);
  });

  it('POST /disasters - should return 400 when required "description" is missing', async () => {
    const invalidPayload = {
      title: 'Title without any incident description'
    };

    const res = await request(app)
      .post('/disasters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.message).toMatch(/Validation failed/i);
    expect(res.body.error.details).toBeDefined();
    expect(JSON.stringify(res.body.error.details)).toMatch(/description is required/i);
  });

  it('PATCH /disasters/:id - should return 400 when invalid status enum is passed', async () => {
    const dummyId = 'a1111111-1111-1111-1111-111111111111';
    const invalidPayload = {
      status: 'non_existent_status'
    };

    const res = await request(app)
      .patch(`/disasters/${dummyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.details).toBeDefined();
    expect(JSON.stringify(res.body.error.details)).toMatch(/status must be one of/i);
  });
});
