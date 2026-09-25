const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email address is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  })
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

const createDisasterSchema = Joi.object({
  title: Joi.string().min(3).max(500).required().messages({
    'string.min': 'Title must be at least 3 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(10).required().messages({
    'string.min': 'Description must be at least 10 characters long to provide incident context',
    'any.required': 'Description is required'
  }),
  location_name: Joi.string().max(255).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).default([]),
  status: Joi.string().valid('active', 'monitoring', 'resolved').default('active')
});

const updateDisasterSchema = Joi.object({
  title: Joi.string().min(3).max(500).optional(),
  description: Joi.string().min(10).optional(),
  location_name: Joi.string().max(255).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  status: Joi.string().valid('active', 'monitoring', 'resolved').optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const queryDisastersSchema = Joi.object({
  tag: Joi.string().trim().lowercase().optional(),
  status: Joi.string().valid('active', 'monitoring', 'resolved').optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

const nearbyResourcesQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  radius: Joi.number().positive().max(500).default(10).optional(),
  type: Joi.string().valid('shelter', 'hospital', 'food', 'water', 'rescue').optional()
});

const createResourceSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'any.required': 'Resource name is required'
  }),
  type: Joi.string().valid('shelter', 'hospital', 'food', 'water', 'rescue').required().messages({
    'any.required': 'Resource type is required (shelter, hospital, food, water, rescue)'
  }),
  latitude: Joi.number().min(-90).max(90).required().messages({
    'any.required': 'Latitude coordinate is required'
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'any.required': 'Longitude coordinate is required'
  }),
  location_name: Joi.string().max(255).optional(),
  capacity: Joi.number().integer().min(1).default(100),
  available_units: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid('available', 'limited', 'full').default('available')
});

const createOfficialUpdateSchema = Joi.object({
  agency: Joi.string().min(2).max(255).required().messages({
    'any.required': 'Issuing agency name is required (e.g., FEMA, NWS)'
  }),
  severity: Joi.string().valid('evacuation', 'warning', 'advisory', 'all_clear').required().messages({
    'any.required': 'Advisory severity is required (evacuation, warning, advisory, all_clear)'
  }),
  headline: Joi.string().min(5).max(500).required().messages({
    'any.required': 'Advisory headline is required'
  }),
  body: Joi.string().min(10).required().messages({
    'any.required': 'Advisory body text is required'
  })
});

const verifyImageSchema = Joi.object({
  imageUrl: Joi.string().uri().required().messages({
    'any.required': 'Valid image URL is required for verification',
    'string.uri': 'imageUrl must be a valid HTTP or HTTPS URI'
  }),
  caption: Joi.string().max(500).allow('', null).optional()
});

module.exports = {
  loginSchema,
  refreshTokenSchema,
  createDisasterSchema,
  updateDisasterSchema,
  queryDisastersSchema,
  nearbyResourcesQuerySchema,
  createResourceSchema,
  createOfficialUpdateSchema,
  verifyImageSchema
};
