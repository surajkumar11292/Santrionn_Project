const express = require('express');
const disasterController = require('../controllers/disaster.controller');
const reportController = require('../controllers/report.controller');
const resourceController = require('../controllers/resource.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
  createDisasterSchema,
  updateDisasterSchema,
  queryDisastersSchema,
  nearbyResourcesQuerySchema,
  createResourceSchema
} = require('../schemas/validation');

const router = express.Router();

// List all disasters with filters (?tag=flood&status=active)
router.get('/', validate(queryDisastersSchema, 'query'), disasterController.getAll);

// Community Reports with Redis Caching and External Stream Integration
router.get('/:id/reports', reportController.getByDisasterId);

// Nearby Emergency Resources with PostGIS ST_DWithin and Redis Caching
router.get('/:id/resources', validate(nearbyResourcesQuerySchema, 'query'), resourceController.getNearby);

// Register resource under disaster (admin only)
router.post(
  '/:id/resources',
  authenticate,
  authorize('admin'),
  validate(createResourceSchema, 'body'),
  resourceController.create
);

// Retrieve single disaster
router.get('/:id', disasterController.getById);

// Create disaster (admin, contributor)
router.post(
  '/',
  authenticate,
  authorize('admin', 'contributor'),
  validate(createDisasterSchema, 'body'),
  disasterController.create
);

// Partial update disaster (admin, contributor)
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'contributor'),
  validate(updateDisasterSchema, 'body'),
  disasterController.update
);

// Delete disaster (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  disasterController.delete
);

module.exports = router;
