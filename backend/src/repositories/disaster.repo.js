const { query } = require('../config/database');

class DisasterRepository {
  /**
   * Insert a new disaster record with PostGIS point
   */
  async create({ title, description, locationName, latitude, longitude, tags, status, createdBy }) {
    const sql = `
      INSERT INTO disasters (
        title,
        description,
        location_name,
        latitude,
        longitude,
        location,
        tags,
        status,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5,
        ST_SetSRID(ST_MakePoint($5, $4), 4326)::geography,
        $6, $7, $8
      )
      RETURNING 
        id, title, description, location_name, latitude, longitude,
        tags, status, created_by, created_at, updated_at;
    `;

    const res = await query(sql, [
      title,
      description,
      locationName,
      latitude,
      longitude,
      tags,
      status,
      createdBy
    ]);

    return this.formatRecord(res.rows[0]);
  }

  /**
   * Find disasters with optional filtering by tag, status, keyword search, and pagination
   */
  async findAll({ tag, status, search, page = 1, limit = 10 }) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (tag) {
      conditions.push(`$${paramIndex} = ANY(tags)`);
      params.push(tag.toLowerCase());
      paramIndex++;
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR location_name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countSql = `SELECT COUNT(*) AS total FROM disasters ${whereClause};`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    // Data query with offset
    const offset = (page - 1) * limit;
    const dataSql = `
      SELECT 
        d.id, d.title, d.description, d.location_name, d.latitude, d.longitude,
        d.tags, d.status, d.created_by, d.created_at, d.updated_at,
        u.name AS creator_name, u.email AS creator_email
      FROM disasters d
      LEFT JOIN users u ON d.created_by = u.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    params.push(limit, offset);
    const dataRes = await query(dataSql, params);

    return {
      disasters: dataRes.rows.map(row => this.formatRecord(row)),
      total
    };
  }

  /**
   * Find single disaster by UUID
   */
  async findById(id) {
    const sql = `
      SELECT 
        d.id, d.title, d.description, d.location_name, d.latitude, d.longitude,
        d.tags, d.status, d.created_by, d.created_at, d.updated_at,
        u.name AS creator_name, u.email AS creator_email
      FROM disasters d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.id = $1;
    `;

    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    return this.formatRecord(res.rows[0]);
  }

  /**
   * Update disaster fields dynamically
   */
  async update(id, updates) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      params.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      params.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      params.push(updates.status);
    }
    if (updates.tags !== undefined) {
      fields.push(`tags = $${paramIndex++}`);
      params.push(updates.tags);
    }
    if (updates.location_name !== undefined) {
      fields.push(`location_name = $${paramIndex++}`);
      params.push(updates.location_name);
    }
    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      fields.push(`latitude = $${paramIndex++}`);
      params.push(updates.latitude);
      fields.push(`longitude = $${paramIndex++}`);
      params.push(updates.longitude);
      fields.push(`location = ST_SetSRID(ST_MakePoint($${paramIndex - 1}, $${paramIndex - 2}), 4326)::geography`);
    }

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const sql = `
      UPDATE disasters
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, title, description, location_name, latitude, longitude,
        tags, status, created_by, created_at, updated_at;
    `;

    const res = await query(sql, params);
    if (res.rows.length === 0) return null;
    return this.formatRecord(res.rows[0]);
  }

  /**
   * Delete disaster by ID
   */
  async delete(id) {
    const res = await query('DELETE FROM disasters WHERE id = $1 RETURNING id;', [id]);
    return res.rows.length > 0;
  }

  /**
   * Format DB row into clean API output with nested location object
   */
  formatRecord(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      location: {
        name: row.location_name,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude)
      },
      tags: row.tags || [],
      status: row.status,
      created_by: row.created_by,
      creator: row.creator_name ? {
        name: row.creator_name,
        email: row.creator_email
      } : null,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

module.exports = new DisasterRepository();
