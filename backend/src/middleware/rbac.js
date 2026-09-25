const { ForbiddenError, UnauthorizedError } = require('../utils/errors');

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles - List of roles permitted to access this endpoint
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before authorization check'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(
        `Access denied. Role '${req.user.role}' lacks permission. Required role: [${allowedRoles.join(', ')}]`
      ));
    }

    next();
  };
};

module.exports = authorize;
