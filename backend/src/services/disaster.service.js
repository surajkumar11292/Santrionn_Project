const disasterRepo = require('../repositories/disaster.repo');
const geoService = require('./geo.service');
const {
  emitDisasterCreated,
  emitDisasterUpdated,
  emitDisasterDeleted
} = require('../socket/events');
const { NotFoundError } = require('../utils/errors');

class DisasterService {
  /**
   * Create a new disaster with automatic location resolution
   */
  async createDisaster(data, userId) {
    let locationName = data.location_name;
    let latitude = data.latitude;
    let longitude = data.longitude;

    // Automatic location resolution from description if coordinates not provided
    if (latitude === undefined || longitude === undefined || !locationName) {
      const resolved = await geoService.resolveLocationFromText(data.description);
      locationName = locationName || resolved.locationName;
      latitude = latitude !== undefined ? latitude : resolved.latitude;
      longitude = longitude !== undefined ? longitude : resolved.longitude;
    }

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

    // Real-time broadcast to connected clients
    emitDisasterCreated(disaster);

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

    // Real-time broadcast to connected clients and disaster room
    emitDisasterUpdated(updated, updates);

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

    // Real-time broadcast to connected clients
    emitDisasterDeleted(id);

    return { id, deleted: true };
  }
}

module.exports = new DisasterService();
