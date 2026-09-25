/**
 * Mock External Social Media Stream (Simulating Twitter/X or Bluesky Crisis Feeds)
 */

class MockSocialService {
  constructor() {
    this.failureRate = 0; // Configurable failure rate for fault injection testing
  }

  /**
   * Fetch raw external posts for a disaster context
   * @param {string} query - Keyword or location query
   */
  async fetchExternalDisasterReports(query = '') {
    // Simulate real-world API network latency (120ms)
    await new Promise(resolve => setTimeout(resolve, 120));

    // Simulate occasional external upstream network fault if configured
    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      throw new Error('External Social Media Gateway Timeout (504 Gateway Timeout)');
    }

    const normalizedQuery = query.toLowerCase();

    // Raw external stream schema (un-normalized)
    const rawExternalStream = [
      {
        tweet_id: 'tw_901928301',
        text: `Urgent! Need drinking water and baby formula near ${query || 'Manhattan'}. Roads blocked by debris.`,
        author: {
          screen_name: 'citizen_sarah_99',
          followers_count: 342,
          verified_badge: false
        },
        posted_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        geo_tag: 'US/East',
        retweets: 14
      },
      {
        tweet_id: 'tw_901928302',
        text: `Family trapped on second floor due to rapid water rise near ${query || 'the avenue'}. Urgent rescue needed!`,
        author: {
          screen_name: 'mike_rescue_volunteer',
          followers_count: 1205,
          verified_badge: true
        },
        posted_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        geo_tag: 'US/East',
        retweets: 48
      },
      {
        tweet_id: 'tw_901928303',
        text: `Main power substation sparking violently near flood zone in ${query || 'city center'}. Stay clear!`,
        author: {
          screen_name: 'grid_watch_alert',
          followers_count: 8900,
          verified_badge: true
        },
        posted_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        geo_tag: 'US/East',
        retweets: 112
      },
      {
        tweet_id: 'tw_901928304',
        text: `Community center opened on 5th street offering warm meals, dry blankets, and battery charging.`,
        author: {
          screen_name: 'local_aid_network',
          followers_count: 450,
          verified_badge: false
        },
        posted_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        geo_tag: 'US/East',
        retweets: 29
      }
    ];

    return rawExternalStream;
  }

  setSimulatedFailureRate(rate) {
    this.failureRate = rate;
  }
}

module.exports = new MockSocialService();
