const cacheService = require('./cache.service');
const mockSocialService = require('../mocks/social.mock');
const classifierService = require('./classifier.service');
const disasterRepo = require('../repositories/disaster.repo');
const { query } = require('../config/database');
const { NotFoundError } = require('../utils/errors');

class ReportService {
  constructor() {
    this.CACHE_TTL_SECONDS = 300; // 5-minute TTL per assignment recommendation
  }

  /**
   * Retrieve community reports for a disaster implementing the Cache-Aside pattern
   * Flow: Check Cache -> Hit (Return) -> Miss (Fetch External -> Normalize -> Cache -> Return)
   */
  async getReportsForDisaster(disasterId) {
    // 1. Verify disaster exists
    const disaster = await disasterRepo.findById(disasterId);
    if (!disaster) {
      throw new NotFoundError(`Disaster with ID '${disasterId}' does not exist`);
    }

    const cacheKey = `reports:disaster:${disasterId}`;

    // 2. Check Cache
    const cachedEntry = await cacheService.getWithTtl(cacheKey);
    if (cachedEntry) {
      return {
        reports: cachedEntry.data,
        cached: true,
        cacheTtl: cachedEntry.ttl,
        disaster: {
          id: disaster.id,
          title: disaster.title,
          location: disaster.location.name
        }
      };
    }

    // 3. Cache Miss: Fetch from external service with fault tolerance
    let externalPosts = [];
    let externalError = null;

    try {
      externalPosts = await mockSocialService.fetchExternalDisasterReports(
        disaster.location.name || disaster.title
      );
    } catch (err) {
      console.warn(`[ReportService] External social feed failed: ${err.message}. Engaging fallback strategy.`);
      externalError = err.message;
    }

    // 4. Normalize external responses into standard internal schema
    const normalizedExternalReports = externalPosts.map(post => ({
      id: post.tweet_id,
      content: post.text,
      user: post.author.screen_name,
      verified_user: post.author.verified_badge,
      priority: classifierService.classifyPriority(post.text),
      source: 'external_social_media',
      created_at: post.posted_at
    }));

    // 5. Fetch persistent reports from PostgreSQL for this disaster
    const dbReportsRes = await query(
      'SELECT id, content, user_handle, priority, verified, source, created_at FROM reports WHERE disaster_id = $1 ORDER BY created_at DESC',
      [disasterId]
    );

    const dbReports = dbReportsRes.rows.map(row => ({
      id: row.id,
      content: row.content,
      user: row.user_handle,
      verified_user: row.verified,
      priority: row.priority,
      source: row.source,
      created_at: row.created_at
    }));

    // Merge persistent and normalized external reports
    const combinedReports = [...dbReports, ...normalizedExternalReports];

    // 6. Store normalized response in Redis Cache with TTL
    await cacheService.set(cacheKey, combinedReports, this.CACHE_TTL_SECONDS);

    return {
      reports: combinedReports,
      cached: false,
      cacheTtl: this.CACHE_TTL_SECONDS,
      externalServiceStatus: externalError ? 'DEGRADED_FALLBACK' : 'HEALTHY',
      disaster: {
        id: disaster.id,
        title: disaster.title,
        location: disaster.location.name
      }
    };
  }
}

module.exports = new ReportService();
