const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');
const { redisClient } = require('../src/config/redis');

describe('Disaster CRUD Integration Tests', () => {
  let adminToken;
  let createdDisasterId;

  beforeAll(async () => {
    // Authenticate as Admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@relief.io',
        password: 'admin123'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.tokens.accessToken).toBeDefined();
    adminToken = loginRes.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    // Cleanup created test disaster if still present
    if (createdDisasterId) {
      await request(app)
        .delete(`/disasters/${createdDisasterId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
    await pool.end();
    if (redisClient && redisClient.status !== 'end') {
      await redisClient.quit();
    }
  });

  it('POST /disasters - should create a new disaster with automatic NLP location extraction', async () => {
    const payload = {
      title: 'Automated Test Coastal Surge in Miami',
      description: 'Severe storm surge rising along coastlines in Miami, FL causing localized flooding.',
      tags: ['test', 'flood', 'hurricane']
    };

    const res = await request(app)
      .post('/disasters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.title).toBe(payload.title);
    expect(res.body.data.status).toBe('active');
    expect(res.body.data.location.name).toMatch(/Miami/i);
    expect(res.body.data.location.latitude).toBeDefined();
    expect(res.body.data.location.longitude).toBeDefined();

    createdDisasterId = res.body.data.id;
  });

  it('GET /disasters/:id - should retrieve the newly created disaster details', async () => {
    expect(createdDisasterId).toBeDefined();

    const res = await request(app)
      .get(`/disasters/${createdDisasterId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdDisasterId);
    expect(res.body.data.title).toBe('Automated Test Coastal Surge in Miami');
  });

  it('PATCH /disasters/:id - should partially update disaster status and tags', async () => {
    expect(createdDisasterId).toBeDefined();

    const updatePayload = {
      status: 'monitoring',
      tags: ['test', 'monitoring', 'resolved-soon']
    };

    const res = await request(app)
      .patch(`/disasters/${createdDisasterId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('monitoring');
    expect(res.body.data.tags).toContain('resolved-soon');
  });

  it('DELETE /disasters/:id - should delete disaster and subsequent GET return 404', async () => {
    expect(createdDisasterId).toBeDefined();

    // 1. Delete
    const deleteRes = await request(app)
      .delete(`/disasters/${createdDisasterId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.data.deleted).toBe(true);

    // 2. Verify 404 on subsequent GET
    const getRes = await request(app)
      .get(`/disasters/${createdDisasterId}`);

    expect(getRes.status).toBe(404);
    expect(getRes.body.success).toBe(false);
    expect(getRes.body.error.code).toBe('NOT_FOUND');

    createdDisasterId = null;
  });

  it('GET /disasters - should support filtering across different global locations and hazard types', async () => {
    // 1. Filter by flood tag
    const floodRes = await request(app).get('/disasters?tag=flood');
    expect(floodRes.status).toBe(200);
    expect(floodRes.body.data.length).toBeGreaterThan(0);
    expect(floodRes.body.data.some((d) => d.tags.includes('flood'))).toBe(true);

    // 2. Filter by earthquake tag
    const quakeRes = await request(app).get('/disasters?tag=earthquake');
    expect(quakeRes.status).toBe(200);
    expect(quakeRes.body.data.some((d) => d.tags.includes('earthquake'))).toBe(true);

    // 3. Search across different locations (Mumbai, Tokyo)
    const mumbaiRes = await request(app).get('/disasters?search=Mumbai');
    expect(mumbaiRes.status).toBe(200);
    expect(mumbaiRes.body.data.some((d) => d.location.name.includes('Mumbai'))).toBe(true);

    const chamoliRes = await request(app).get('/disasters?search=Chamoli');
    expect(chamoliRes.status).toBe(200);
    expect(chamoliRes.body.data.some((d) => d.location.name.includes('Chamoli'))).toBe(true);
  });
});
