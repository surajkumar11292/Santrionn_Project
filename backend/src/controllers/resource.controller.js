const resourceService = require('../services/resource.service');
const { successResponse } = require('../utils/response');

class ResourceController {
  async getNearby(req, res, next) {
    try {
      const { id } = req.params;
      const result = await resourceService.findNearby(id, req.query);

      return successResponse(
        res,
        result.resources,
        {
          cached: result.cached,
          cache_ttl: result.cacheTtl,
          search_center: result.searchCenter,
          total: result.resources.length
        }
      );
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { id } = req.params;
      const resource = await resourceService.createResource(id, req.body);
      return successResponse(res, resource, { message: 'Emergency resource registered successfully' }, 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ResourceController();
