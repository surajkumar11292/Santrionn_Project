const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigrations() {
  const client = await pool.connect();
  console.log('[Migration Runner] Starting database schema migrations...');

  try {
    // Ensure migrations table exists to track applied migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const alreadyApplied = await client.query(
        'SELECT name FROM schema_migrations WHERE name = $1',
        [file]
      );

      if (alreadyApplied.rows.length === 0) {
        console.log(`[Migration Runner] Applying migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (name) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`[Migration Runner] Successfully applied: ${file}`);
      } else {
        console.log(`[Migration Runner] Skipping already applied: ${file}`);
      }
    }

    console.log('[Migration Runner] All migrations executed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Migration Runner] Migration failed with error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
