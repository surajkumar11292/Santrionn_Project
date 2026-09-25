const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');
const { redisClient } = require('../src/config/redis');

describe('Auth & RBAC Permissions Integration Tests', () => {
  let viewerToken;
  let contributorToken;
  let adminToken;
  const targetDisasterId = 'a1111111-1111-1111-1111-111111111111';

  beforeAll(async () => {
    // 1. Viewer login
    const viewerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@relief.io', password: 'viewer123' });
    viewerToken = viewerRes.body.data.tokens.accessToken;

    // 2. Contributor login
    const contribRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'contrib@relief.io', password: 'contrib123' });
    contributorToken = contribRes.body.data.tokens.accessToken;

    // 3. Admin login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@relief.io', password: 'admin123' });
    adminToken = adminRes.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await pool.end();
    if (redisClient && redisClient.status !== 'end') {
      await redisClient.quit();
    }
  });

  it('POST /disasters - should return 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .post('/disasters')
      .send({
        title: 'Unauthenticated Request Attempt',
        description: 'Should be rejected at auth middleware.'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('DELETE /disasters/:id - should return 403 Forbidden when viewer attempts deletion', async () => {
    const res = await request(app)
      .delete(`/disasters/${targetDisasterId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toMatch(/lacks permission|denied/i);
  });

  it('DELETE /disasters/:id - should return 403 Forbidden when contributor attempts deletion', async () => {
    const res = await request(app)
      .delete(`/disasters/${targetDisasterId}`)
      .set('Authorization', `Bearer ${contributorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('POST /disasters/:id/resources - should return 403 when contributor attempts resource creation (admin-only)', async () => {
    const res = await request(app)
      .post(`/disasters/${targetDisasterId}/resources`)
      .set('Authorization', `Bearer ${contributorToken}`)
      .send({
        name: 'Contributor Created Shelter',
        type: 'shelter',
        latitude: 40.7831,
        longitude: -73.9712
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
