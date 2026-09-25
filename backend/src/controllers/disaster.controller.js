const disasterService = require('../services/disaster.service');
const { successResponse, paginatedResponse } = require('../utils/response');

class DisasterController {
  async create(req, res, next) {
    try {
      const disaster = await disasterService.createDisaster(req.body, req.user?.id);
      return successResponse(res, disaster, { message: 'Disaster incident reported successfully' }, 201);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const { tag, status, search, page, limit } = req.query;
      const { disasters, total } = await disasterService.listDisasters({
        tag,
        status,
        search,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10
      });

      return paginatedResponse(res, disasters, total, page || 1, limit || 10);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const disaster = await disasterService.getDisasterById(req.params.id);
      return successResponse(res, disaster);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await disasterService.updateDisaster(req.params.id, req.body);
      return successResponse(res, updated, { message: 'Disaster incident updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await disasterService.deleteDisaster(req.params.id);
      return successResponse(res, result, { message: 'Disaster incident deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DisasterController();
