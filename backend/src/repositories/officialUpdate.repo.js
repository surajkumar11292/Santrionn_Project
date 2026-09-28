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

  /**
   * Retrieve persistent crisis broadcast feed across all incidents for the last N days (default 7 days)
   */
  async findBroadcastFeed(days = 7) {
    const text = `
      SELECT * FROM (
        SELECT 
          u.id::text AS id,
          'official_update' AS type,
          'Official Bulletin: ' || u.agency AS title,
          CASE 
            WHEN u.headline IS NOT NULL AND u.headline != '' THEN u.headline || ' — ' || u.body 
            ELSE u.body 
          END AS detail,
          CASE 
            WHEN u.severity IN ('critical', 'evacuation') THEN 'critical' 
            ELSE 'warning' 
          END AS level,
          u.issued_at AS timestamp,
          u.disaster_id
        FROM official_updates u
        WHERE u.issued_at >= NOW() - ($1 * INTERVAL '1 day')

        UNION ALL

        SELECT
          r.id::text AS id,
          'report_added' AS type,
          'Field Intel: ' || COALESCE(r.user_handle, '@scout_unit') AS title,
          r.content AS detail,
          CASE 
            WHEN r.priority = 'critical' THEN 'critical' 
            ELSE 'info' 
          END AS level,
          r.created_at AS timestamp,
          r.disaster_id
        FROM reports r
        WHERE r.created_at >= NOW() - ($1 * INTERVAL '1 day')
      ) feed
      ORDER BY timestamp DESC
      LIMIT 60;
    `;
    const res = await query(text, [days]);

    // If fewer than 3 records within N days, fetch latest updates without date cutoff as safety fallback
    if (res.rows.length < 3) {
      const fallbackText = `
        SELECT * FROM (
          SELECT 
            u.id::text AS id,
            'official_update' AS type,
            'Official Bulletin: ' || u.agency AS title,
            CASE 
              WHEN u.headline IS NOT NULL AND u.headline != '' THEN u.headline || ' — ' || u.body 
              ELSE u.body 
            END AS detail,
            CASE 
              WHEN u.severity IN ('critical', 'evacuation') THEN 'critical' 
              ELSE 'warning' 
            END AS level,
            u.issued_at AS timestamp,
            u.disaster_id
          FROM official_updates u

          UNION ALL

          SELECT
            r.id::text AS id,
            'report_added' AS type,
            'Field Intel: ' || COALESCE(r.user_handle, '@scout_unit') AS title,
            r.content AS detail,
            CASE 
              WHEN r.priority = 'critical' THEN 'critical' 
              ELSE 'info' 
            END AS level,
            r.created_at AS timestamp,
            r.disaster_id
          FROM reports r
        ) feed
        ORDER BY timestamp DESC
        LIMIT 60;
      `;
      const fallbackRes = await query(fallbackText);
      return fallbackRes.rows;
    }

    return res.rows;
  }
}

module.exports = new OfficialUpdateRepository();

