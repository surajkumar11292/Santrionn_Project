const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const { loginSchema, refreshTokenSchema } = require('../schemas/validation');

const router = express.Router();

router.post('/login', validate(loginSchema, 'body'), authController.login);
router.post('/refresh', validate(refreshTokenSchema, 'body'), authController.refresh);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
