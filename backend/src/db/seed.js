const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runSeed() {
  const client = await pool.connect();
  console.log('[Seed Runner] Starting test and demo database seeding...');

  try {
    const seedSqlPath = path.join(__dirname, 'seeds', 'seed.sql');
    const sql = fs.readFileSync(seedSqlPath, 'utf-8');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    const usersCount = await client.query('SELECT COUNT(*) FROM users;');
    const disastersCount = await client.query('SELECT COUNT(*) FROM disasters;');
    const resourcesCount = await client.query('SELECT COUNT(*) FROM resources;');
    const reportsCount = await client.query('SELECT COUNT(*) FROM reports;');
    const updatesCount = await client.query('SELECT COUNT(*) FROM official_updates;');
    const imagesCount = await client.query('SELECT COUNT(*) FROM disaster_image_verifications;');

    console.log('[Seed Runner] Seeding completed successfully:');
    console.log(`  - Users seeded:            ${usersCount.rows[0].count}`);
    console.log(`  - Disasters seeded:        ${disastersCount.rows[0].count}`);
    console.log(`  - Resources seeded:        ${resourcesCount.rows[0].count}`);
    console.log(`  - Reports seeded:          ${reportsCount.rows[0].count}`);
    console.log(`  - Official updates seeded: ${updatesCount.rows[0].count}`);
    console.log(`  - Verified images seeded:  ${imagesCount.rows[0].count}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed Runner] Seeding failed with error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
