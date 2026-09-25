const crypto = require('crypto');
const { redisClient } = require('../config/redis');

class QueueService {
  constructor() {
    this.JOB_TTL_SECONDS = 3600; // Retain job metadata in Redis for 1 hour
    this.QUEUE_KEY = 'jobs:queue:report_sync';
    this.JOB_PREFIX = 'job:';
  }

  /**
   * Enqueue a new asynchronous background task
   * @param {string} type - Job category (e.g. 'SYNC_EXTERNAL_REPORTS')
   * @param {Object} payload - Input parameters for job execution
   */
  async enqueue(type, payload) {
    const jobId = crypto.randomUUID();
    const jobKey = `${this.JOB_PREFIX}${jobId}`;
    const now = new Date().toISOString();

    const jobData = {
      id: jobId,
      type,
      payload: JSON.stringify(payload),
      status: 'queued',
      progress: '0',
      error: '',
      result: '',
      created_at: now,
      started_at: '',
      completed_at: ''
    };

    if (redisClient && redisClient.status !== 'end') {
      // Store job hash in Redis
      await redisClient.hset(jobKey, jobData);
      await redisClient.expire(jobKey, this.JOB_TTL_SECONDS);

      // Push jobId to processing queue list
      await redisClient.lpush(this.QUEUE_KEY, jobId);
    } else {
      // Fallback in-memory map if Redis is temporarily unreachable
      this._inMemoryJobs = this._inMemoryJobs || new Map();
      this._inMemoryJobs.set(jobId, jobData);
    }

    return {
      id: jobId,
      status: 'queued',
      type,
      created_at: now
    };
  }

  /**
   * Retrieve job status and execution result
   * @param {string} jobId
   */
  async getJob(jobId) {
    const jobKey = `${this.JOB_PREFIX}${jobId}`;

    if (redisClient && redisClient.status !== 'end') {
      const data = await redisClient.hgetall(jobKey);
      if (!data || !data.id) return null;

      return {
        ...data,
        payload: data.payload ? JSON.parse(data.payload) : {},
        result: data.result ? JSON.parse(data.result) : null,
        progress: parseInt(data.progress || '0', 10)
      };
    }

    if (this._inMemoryJobs && this._inMemoryJobs.has(jobId)) {
      const data = this._inMemoryJobs.get(jobId);
      return {
        ...data,
        payload: JSON.parse(data.payload),
        result: data.result ? JSON.parse(data.result) : null,
        progress: parseInt(data.progress, 10)
      };
    }

    return null;
  }

  /**
   * Update job status and telemetry
   */
  async updateJob(jobId, updates) {
    const jobKey = `${this.JOB_PREFIX}${jobId}`;
    const serialized = {};

    for (const [k, v] of Object.entries(updates)) {
      if (typeof v === 'object' && v !== null) {
        serialized[k] = JSON.stringify(v);
      } else {
        serialized[k] = String(v);
      }
    }

    if (redisClient && redisClient.status !== 'end') {
      await redisClient.hset(jobKey, serialized);
    } else if (this._inMemoryJobs && this._inMemoryJobs.has(jobId)) {
      const existing = this._inMemoryJobs.get(jobId);
      this._inMemoryJobs.set(jobId, { ...existing, ...serialized });
    }
  }

  /**
   * Pop next job ID from Redis queue
   */
  async popNextJob() {
    if (redisClient && redisClient.status !== 'end') {
      return await redisClient.rpop(this.QUEUE_KEY);
    }
    return null;
  }
}

module.exports = new QueueService();
