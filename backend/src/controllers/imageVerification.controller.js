const imageService = require('../services/imageVerification.service');
const { successResponse } = require('../utils/response');

class ImageVerificationController {
  async verifyImage(req, res, next) {
    try {
      const { id: disasterId } = req.params;
      const { imageUrl, caption } = req.body;
      const verifiedBy = req.user ? req.user.id : null;

      const verifiedRecord = await imageService.verifyAndStoreImage(disasterId, {
        imageUrl,
        caption,
        verifiedBy
      });

      return successResponse(
        res,
        verifiedRecord,
        { message: 'Disaster damage image verified and AI hazard assessment completed' },
        201
      );
    } catch (err) {
      next(err);
    }
  }

  async getDisasterImages(req, res, next) {
    try {
      const { id: disasterId } = req.params;
      const result = await imageService.getDisasterImages(disasterId);

      return successResponse(
        res,
        result.data,
        result.meta
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ImageVerificationController();
