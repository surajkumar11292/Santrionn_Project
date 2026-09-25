const { pool } = require('../config/database');

class ImageVerificationRepository {
  async createVerification({
    disasterId,
    imageUrl,
    caption,
    isGenuine,
    confidenceScore,
    damageSeverity,
    detectedHazards,
    aiAnalysis,
    verifiedBy
  }) {
    const query = `
      INSERT INTO disaster_image_verifications (
        disaster_id,
        image_url,
        caption,
        is_genuine,
        confidence_score,
        damage_severity,
        detected_hazards,
        ai_analysis,
        verified_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        disaster_id,
        image_url,
        caption,
        is_genuine,
        confidence_score,
        damage_severity,
        detected_hazards,
        ai_analysis,
        verified_by,
        created_at;
    `;

    const values = [
      disasterId,
      imageUrl,
      caption || null,
      isGenuine ?? true,
      confidenceScore || 0.950,
      damageSeverity || 'moderate',
      detectedHazards || [],
      JSON.stringify(aiAnalysis || {}),
      verifiedBy || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getByDisasterId(disasterId) {
    const query = `
      SELECT
        id,
        disaster_id,
        image_url,
        caption,
        is_genuine,
        confidence_score,
        damage_severity,
        detected_hazards,
        ai_analysis,
        verified_by,
        created_at
      FROM disaster_image_verifications
      WHERE disaster_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [disasterId]);
    return result.rows;
  }

  async getById(id) {
    const query = `
      SELECT
        id,
        disaster_id,
        image_url,
        caption,
        is_genuine,
        confidence_score,
        damage_severity,
        detected_hazards,
        ai_analysis,
        verified_by,
        created_at
      FROM disaster_image_verifications
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = new ImageVerificationRepository();
