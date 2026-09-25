const resourceRepo = require('../repositories/resource.repo');
const disasterRepo = require('../repositories/disaster.repo');
const cacheService = require('./cache.service');
const { NotFoundError, BadRequestError } = require('../utils/errors');

class ResourceService {
  constructor() {
    this.CACHE_TTL_SECONDS = 120; // 2 minutes for geospatial radius queries
  }

  /**
   * Find resources within a given radius of coordinates or disaster epicenter
   * Endpoint: GET /disasters/:id/resources?lat=<lat>&lng=<lng>&radius=<km>
   */
  async findNearby(disasterId, queryParams) {
    const disaster = await disasterRepo.findById(disasterId);
    if (!disaster) {
      throw new NotFoundError(`Disaster with ID '${disasterId}' does not exist`);
    }

    // Resolve query coordinates: use provided lat/lng or fallback to disaster coordinates
    const latitude = queryParams.lat !== undefined
      ? parseFloat(queryParams.lat)
      : disaster.location.latitude;

    const longitude = queryParams.lng !== undefined
      ? parseFloat(queryParams.lng)
      : disaster.location.longitude;

    const radiusKm = queryParams.radius !== undefined
      ? parseFloat(queryParams.radius)
      : 10; // Default 10km radius

    const type = queryParams.type ? queryParams.type.toLowerCase() : null;

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestError('Invalid latitude or longitude coordinate provided');
    }

    if (isNaN(radiusKm) || radiusKm <= 0) {
      throw new BadRequestError('Radius must be a positive number in kilometers');
    }

    // Cache key for geospatial query
    const cacheKey = `resources:${disasterId}:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${radiusKm}:${type || 'all'}`;

    // Execute Cache-Aside pattern
    const result = await cacheService.wrap(cacheKey, this.CACHE_TTL_SECONDS, async () => {
      return await resourceRepo.findNearby({
        latitude,
        longitude,
        radiusKm,
        disasterId,
        type
      });
    });

    return {
      resources: result.data,
      cached: result.cached,
      cacheTtl: result.ttlRemaining,
      searchCenter: {
        latitude,
        longitude,
        radius_km: radiusKm,
        disaster_title: disaster.title,
        disaster_location: disaster.location.name
      }
    };
  }

  /**
   * Add a new relief resource (associated with a disaster or general)
   */
  async createResource(disasterId, data) {
    let resolvedDisasterId = disasterId;

    if (disasterId) {
      const disaster = await disasterRepo.findById(disasterId);
      if (!disaster) {
        throw new NotFoundError(`Disaster with ID '${disasterId}' does not exist`);
      }
    }

    const resource = await resourceRepo.create({
      disasterId: resolvedDisasterId,
      name: data.name,
      type: data.type,
      locationName: data.location_name || 'Emergency Center',
      latitude: data.latitude,
      longitude: data.longitude,
      capacity: data.capacity,
      availableUnits: data.available_units,
      status: data.status
    });

    return resource;
  }
}

module.exports = new ResourceService();
