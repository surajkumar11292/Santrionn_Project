const express = require('express');
const jobController = require('../controllers/job.controller');

const router = express.Router();

// Retrieve status of any background job
router.get('/:jobId', jobController.getStatus);

module.exports = router;
