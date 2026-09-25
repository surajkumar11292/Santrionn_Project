const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');
const { redisClient } = require('../src/config/redis');

describe('Asynchronous Background Job Queue Integration Tests', () => {
  const disasterId = 'a1111111-1111-1111-1111-111111111111';
  let enqueuedJobId;

  afterAll(async () => {
    if (enqueuedJobId && redisClient && redisClient.status !== 'end') {
      await redisClient.del(`job:${enqueuedJobId}`);
      await redisClient.quit();
    }
    await pool.end();
  });

  it('POST /disasters/:id/sync-reports - should return HTTP 202 Accepted and enqueue background task', async () => {
    const res = await request(app).post(`/disasters/${disasterId}/sync-reports`);

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.jobId).toBeDefined();
    expect(res.body.data.status).toBe('queued');
    expect(res.body.data.type).toBe('SYNC_EXTERNAL_REPORTS');
    expect(res.body.data.checkStatusUrl).toBe(`/jobs/${res.body.data.jobId}`);

    enqueuedJobId = res.body.data.jobId;
  });

  it('GET /jobs/:jobId - should retrieve job status and verify worker completion', async () => {
    expect(enqueuedJobId).toBeDefined();

    // Poll until worker finishes processing the mock external feed (up to 3 seconds)
    let completed = false;
    let jobData = null;

    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const res = await request(app).get(`/jobs/${enqueuedJobId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      jobData = res.body.data;

      if (jobData.status === 'completed') {
        completed = true;
        break;
      }
    }

    expect(completed).toBe(true);
    expect(jobData.status).toBe('completed');
    expect(jobData.progress).toBe(100);
    expect(jobData.result).toBeDefined();
    expect(jobData.result.disasterId).toBe(disasterId);
    expect(jobData.result.fetchedPosts).toBeGreaterThan(0);
  });

  it('GET /jobs/:jobId - should return 404 Not Found for non-existent job', async () => {
    const res = await request(app).get('/jobs/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
