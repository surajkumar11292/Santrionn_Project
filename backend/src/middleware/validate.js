const { BadRequestError } = require('../utils/errors');

/**
 * Validation Middleware generator for Joi Schemas
 * @param {Object} schema - Joi Schema definition
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      return next(new BadRequestError('Validation failed on request parameters', details));
    }

    // Replace request property with sanitized and typed value
    req[property] = value;
    next();
  };
};

module.exports = validate;
