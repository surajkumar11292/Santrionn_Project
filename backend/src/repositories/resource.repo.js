const { query } = require('../config/database');

class ResourceRepository {
  /**
   * Find resources within a given radius using PostGIS ST_DWithin (GiST indexed)
   * Calculates exact distance via ST_Distance in kilometers
   */
  async findNearby({ latitude, longitude, radiusKm, disasterId = null, type = null }) {
    const radiusMeters = radiusKm * 1000;
    const conditions = [];
    const params = [latitude, longitude, radiusMeters];
    let paramIndex = 4;

    // PostGIS indexed spatial filter
    conditions.push(`ST_DWithin(r.location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3)`);

    if (type) {
      conditions.push(`r.type = $${paramIndex}`);
      params.push(type.toLowerCase());
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const sql = `
      SELECT 
        r.id,
        r.disaster_id,
        r.name,
        r.type,
        r.location_name,
        r.latitude,
        r.longitude,
        r.capacity,
        r.available_units,
        r.status,
        ROUND((ST_Distance(r.location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) / 1000.0)::numeric, 2) AS distance_km,
        r.created_at,
        r.updated_at
      FROM resources r
      WHERE ${whereClause}
      ORDER BY distance_km ASC;
    `;

    const res = await query(sql, params);
    return res.rows.map(row => this.formatRecord(row));
  }

  /**
   * Insert a new relief resource
   */
  async create({ disasterId, name, type, locationName, latitude, longitude, capacity, availableUnits, status }) {
    const sql = `
      INSERT INTO resources (
        disaster_id,
        name,
        type,
        location_name,
        latitude,
        longitude,
        location,
        capacity,
        available_units,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        ST_SetSRID(ST_MakePoint($6, $5), 4326)::geography,
        $7, $8, $9
      )
      RETURNING 
        id, disaster_id, name, type, location_name, latitude, longitude,
        capacity, available_units, status, created_at, updated_at;
    `;

    const res = await query(sql, [
      disasterId || null,
      name,
      type.toLowerCase(),
      locationName,
      latitude,
      longitude,
      capacity || 100,
      availableUnits !== undefined ? availableUnits : (capacity || 100),
      status || 'available'
    ]);

    return this.formatRecord(res.rows[0]);
  }

  /**
   * Find resource by UUID
   */
  async findById(id) {
    const sql = 'SELECT * FROM resources WHERE id = $1;';
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    return this.formatRecord(res.rows[0]);
  }

  /**
   * Format database record into standard response schema
   */
  formatRecord(row) {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      location: {
        name: row.location_name,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude)
      },
      capacity: row.capacity,
      available_units: row.available_units,
      status: row.status,
      distance_km: row.distance_km !== undefined ? parseFloat(row.distance_km) : undefined,
      disaster_id: row.disaster_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

module.exports = new ResourceRepository();
