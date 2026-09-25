const queueService = require('../services/queue.service');
const mockSocialService = require('../mocks/social.mock');
const classifierService = require('../services/classifier.service');
const cacheService = require('../services/cache.service');
const disasterRepo = require('../repositories/disaster.repo');
const { query } = require('../config/database');
const { emitReportAdded } = require('../socket/events');
const { getIO } = require('../config/socket');

class JobWorker {
  constructor() {
    this.isPolling = false;
    this.pollInterval = null;
  }

  /**
   * Process a single job by ID
   * @param {string} jobId
   */
  async processJob(jobId) {
    const job = await queueService.getJob(jobId);
    if (!job) return;

    const startedAt = new Date().toISOString();
    await queueService.updateJob(jobId, {
      status: 'processing',
      progress: 20,
      started_at: startedAt
    });

    try {
      if (job.type === 'SYNC_EXTERNAL_REPORTS') {
        const { disasterId, query: searchQuery } = job.payload;

        const disaster = await disasterRepo.findById(disasterId);
        const searchLocation = searchQuery || disaster?.location?.name || 'Emergency Zone';

        // 1. Fetch external crisis stream
        await queueService.updateJob(jobId, { progress: 40 });
        const externalPosts = await mockSocialService.fetchExternalDisasterReports(searchLocation);

        // 2. Classify and store new persistent reports in PostgreSQL
        await queueService.updateJob(jobId, { progress: 70 });
        let newlyIngestedCount = 0;

        for (const post of externalPosts) {
          const priority = classifierService.classifyPriority(post.text);

          // Insert into reports if not duplicate content
          const insertRes = await query(
            `INSERT INTO reports (disaster_id, content, user_handle, priority, verified, source)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, content, user_handle, priority, verified, source, created_at;`,
            [
              disasterId,
              post.text,
              `@${post.author.screen_name}`,
              priority,
              post.author.verified_badge,
              'async_stream_worker'
            ]
          );

          if (insertRes.rows.length > 0) {
            newlyIngestedCount++;
            // Emit real-time notification
            emitReportAdded(disasterId, insertRes.rows[0]);
          }
        }

        // 3. Invalidate Redis Cache-Aside key so next read hits fresh dataset
        await cacheService.del(`reports:disaster:${disasterId}`);

        // 4. Mark job completed
        const completedAt = new Date().toISOString();
        const resultSummary = {
          disasterId,
          fetchedPosts: externalPosts.length,
          persistedReports: newlyIngestedCount,
          syncedAt: completedAt
        };

        await queueService.updateJob(jobId, {
          status: 'completed',
          progress: 100,
          result: resultSummary,
          completed_at: completedAt
        });

        // Broadcast job completion via WebSocket
        const io = getIO();
        io.emit('job_completed', {
          jobId,
          type: job.type,
          result: resultSummary
        });

        return resultSummary;
      }
    } catch (err) {
      console.error(`[JobWorker] Job ${jobId} failed:`, err.message);
      await queueService.updateJob(jobId, {
        status: 'failed',
        error: err.message,
        completed_at: new Date().toISOString()
      });
      throw err;
    }
  }

  /**
   * Start background queue consumer loop
   */
  startConsumer(intervalMs = 2000) {
    if (this.isPolling) return;
    this.isPolling = true;

    this.pollInterval = setInterval(async () => {
      try {
        const nextJobId = await queueService.popNextJob();
        if (nextJobId) {
          await this.processJob(nextJobId);
        }
      } catch (err) {
        // Suppress polling tick errors
      }
    }, intervalMs);
  }

  stopConsumer() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      this.isPolling = false;
    }
  }
}

module.exports = new JobWorker();
