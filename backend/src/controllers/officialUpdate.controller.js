const officialUpdateService = require('../services/officialUpdate.service');
const { successResponse } = require('../utils/response');

class OfficialUpdateController {
  async getByDisaster(req, res, next) {
    try {
      const { id } = req.params;
      const result = await officialUpdateService.getUpdatesByDisaster(id);

      return successResponse(
        res,
        result.updates,
        {
          cached: result.cached,
          cache_ttl: result.cacheTtl,
          total: result.updates.length
        }
      );
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { id } = req.params;
      const update = await officialUpdateService.createOfficialUpdate(id, req.body, req.user?.id);

      return successResponse(
        res,
        update,
        { message: 'Official emergency advisory broadcast successfully' },
        201
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OfficialUpdateController();
