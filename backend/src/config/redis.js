const Redis = require('ioredis');
const config = require('./index');

let redisClient = null;

try {
  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false
  });

  redisClient.on('connect', () => {
    if (config.env !== 'test') {
      console.log('[Redis] Connected successfully to Redis server');
    }
  });

  redisClient.on('error', (err) => {
    console.error('[Redis Error]', err.message);
  });
} catch (error) {
  console.error('[Redis Client Initialization Error]', error.message);
}

/**
 * Health check helper for Redis
 */
const testRedisConnection = async () => {
  if (!redisClient) {
    return { connected: false, error: 'Redis client not initialized' };
  }
  try {
    const pong = await redisClient.ping();
    return { connected: pong === 'PONG' };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};

module.exports = {
  redisClient,
  testRedisConnection
};
