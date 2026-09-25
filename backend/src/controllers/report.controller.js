const reportService = require('../services/report.service');
const { successResponse } = require('../utils/response');

class ReportController {
  async getByDisasterId(req, res, next) {
    try {
      const { id } = req.params;
      const result = await reportService.getReportsForDisaster(id);

      return successResponse(
        res,
        result.reports,
        {
          cached: result.cached,
          cache_ttl: result.cacheTtl,
          external_status: result.externalServiceStatus || 'HEALTHY',
          disaster: result.disaster,
          total: result.reports.length
        }
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
