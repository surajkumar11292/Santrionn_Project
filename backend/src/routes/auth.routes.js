const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const { loginSchema, refreshTokenSchema } = require('../schemas/validation');

const router = express.Router();

const rateLimit = require('express-rate-limit');
const config = require('../config');

// Rate limiter for authentication routes (mitigate brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env === 'test' ? 1000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts from this IP, please try again later',
      status: 429
    }
  }
});

router.post('/login', authLimiter, validate(loginSchema, 'body'), authController.login);
router.post('/refresh', authLimiter, validate(refreshTokenSchema, 'body'), authController.refresh);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
