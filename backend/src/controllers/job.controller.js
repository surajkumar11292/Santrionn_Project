const queueService = require('../services/queue.service');
const jobWorker = require('../workers/job.worker');
const disasterRepo = require('../repositories/disaster.repo');
const { successResponse } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

class JobController {
  /**
   * Enqueue background crisis intelligence sync
   * HTTP 202 Accepted
   */
  async syncReports(req, res, next) {
    try {
      const { id: disasterId } = req.params;
      const disaster = await disasterRepo.findById(disasterId);
      if (!disaster) {
        throw new NotFoundError(`Disaster with ID '${disasterId}' does not exist`);
      }

      // Enqueue job into Redis
      const job = await queueService.enqueue('SYNC_EXTERNAL_REPORTS', {
        disasterId,
        requestedBy: req.user?.id || 'anonymous'
      });

      // Trigger asynchronous execution without awaiting (non-blocking HTTP response)
      setImmediate(() => {
        jobWorker.processJob(job.id).catch((err) => {
          console.error('[Async Job Trigger Error]', err.message);
        });
      });

      return res.status(202).json({
        success: true,
        data: {
          jobId: job.id,
          status: 'queued',
          type: job.type,
          disasterId,
          checkStatusUrl: `/jobs/${job.id}`
        },
        meta: {
          timestamp: new Date().toISOString(),
          message: 'External crisis stream sync job accepted for asynchronous background processing'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Check asynchronous job status
   * HTTP 200 OK or 404 Not Found
   */
  async getStatus(req, res, next) {
    try {
      const { jobId } = req.params;
      const job = await queueService.getJob(jobId);

      if (!job) {
        throw new NotFoundError(`Job with ID '${jobId}' does not exist or has expired`);
      }

      return successResponse(res, job, {
        isComplete: job.status === 'completed' || job.status === 'failed'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new JobController();
