const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
  max: config.db.max,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected error on idle client', err);
});

/**
 * Execute parameterized query safely
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters for parameterized execution
 */
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (config.env === 'development') {
    // Debug log in development for query timing
    // console.log('[DB Query]', { text: text.trim().slice(0, 100), duration: `${duration}ms`, rows: res.rowCount });
  }
  return res;
};

/**
 * Check database connection status
 */
const testConnection = async () => {
  try {
    const res = await query('SELECT NOW() AS current_time, PostGIS_Version() AS postgis_version;');
    return {
      connected: true,
      time: res.rows[0].current_time,
      postgis: res.rows[0].postgis_version
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
