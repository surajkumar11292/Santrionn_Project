const { query } = require('../config/database');

class OfficialUpdateRepository {
  /**
   * Create official emergency bulletin
   */
  async create({ disasterId, agency, severity, headline, body, userId }) {
    const text = `
      INSERT INTO official_updates (
        disaster_id, agency, severity, headline, body, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, disaster_id, agency, severity, headline, body, issued_at, created_at;
    `;
    const values = [disasterId, agency, severity, headline, body, userId || null];
    const res = await query(text, values);
    return res.rows[0];
  }

  /**
   * Retrieve all official updates for a disaster, newest first
   */
  async findByDisasterId(disasterId) {
    const text = `
      SELECT id, disaster_id, agency, severity, headline, body, issued_at, created_at
      FROM official_updates
      WHERE disaster_id = $1
      ORDER BY issued_at DESC;
    `;
    const res = await query(text, [disasterId]);
    return res.rows;
  }
}

module.exports = new OfficialUpdateRepository();
