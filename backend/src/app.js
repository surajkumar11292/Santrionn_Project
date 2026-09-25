const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { testConnection } = require('./config/database');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with safe size limit to mitigate large payload DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP request logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

// Health Check Endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await testConnection();

  const isHealthy = dbHealth.connected;
  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'disaster-response-backend',
    database: {
      connected: dbHealth.connected,
      postgis: dbHealth.postgis || null,
      error: dbHealth.error || null
    }
  });
});

// Root API information endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Disaster Response Coordination Platform API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      status: 404
    }
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (config.env !== 'test' && status === 500) {
    console.error('Unhandled Application Error:', err);
  }

  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message,
      status,
      ...(config.env === 'development' && { stack: err.stack })
    }
  });
});

module.exports = app;
