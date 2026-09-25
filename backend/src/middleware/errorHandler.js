const config = require('../config');

/**
 * Centralized Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected internal error occurred';
  let details = err.details || null;

  // Handle PostgreSQL specific error codes
  if (err.code === '23505') {
    status = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'A record with this identifier or unique field already exists';
  } else if (err.code === '22P02') {
    status = 400;
    code = 'INVALID_INPUT_SYNTAX';
    message = 'Invalid format for UUID or numeric data input';
  } else if (err.code === '23503') {
    status = 400;
    code = 'FOREIGN_KEY_VIOLATION';
    message = 'Referenced related record does not exist';
  }

  // Handle JWT validation errors
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    code = 'INVALID_TOKEN';
    message = 'Provided authorization token is malformed or invalid';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authorization token has expired. Please refresh your session';
  }

  // Log 500 unexpected errors
  if (status === 500 && config.env !== 'test') {
    console.error('[UNHANDLED ERROR]', {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      error: err.stack || err
    });
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      status,
      ...(details && { details }),
      ...(config.env === 'development' && status === 500 && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
