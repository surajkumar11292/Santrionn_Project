const disasterRepo = require('../repositories/disaster.repo');
const { NotFoundError } = require('../utils/errors');

class DisasterService {
  /**
   * Create a new disaster
   */
  async createDisaster(data, userId) {
    const locationName = data.location_name || 'Manhattan, NYC';
    const latitude = data.latitude !== undefined ? data.latitude : 40.7831;
    const longitude = data.longitude !== undefined ? data.longitude : -73.9712;

    const disaster = await disasterRepo.create({
      title: data.title,
      description: data.description,
      locationName,
      latitude,
      longitude,
      tags: data.tags || [],
      status: data.status || 'active',
      createdBy: userId || null
    });

    return disaster;
  }

  /**
   * List disasters with filtering and pagination
   */
  async listDisasters(filters) {
    return await disasterRepo.findAll(filters);
  }

  /**
   * Retrieve disaster by UUID
   */
  async getDisasterById(id) {
    const disaster = await disasterRepo.findById(id);
    if (!disaster) {
      throw new NotFoundError(`Disaster with ID '${id}' does not exist`);
    }
    return disaster;
  }

  /**
   * Update disaster by ID
   */
  async updateDisaster(id, updates) {
    const existing = await disasterRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Disaster with ID '${id}' does not exist`);
    }

    const updated = await disasterRepo.update(id, updates);
    return updated;
  }

  /**
   * Delete disaster by ID
   */
  async deleteDisaster(id) {
    const existing = await disasterRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Disaster with ID '${id}' does not exist`);
    }

    await disasterRepo.delete(id);
    return { id, deleted: true };
  }
}

module.exports = new DisasterService();
