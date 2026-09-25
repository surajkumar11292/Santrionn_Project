const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { testConnection } = require('./config/database');

const path = require('path');

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false // Allows socket-test.html CDN script in dev/testing
}));

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

const authRoutes = require('./routes/auth.routes');
const disasterRoutes = require('./routes/disaster.routes');
const errorHandler = require('./middleware/errorHandler');

// Swagger API Documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/docs', (req, res) => res.redirect('/api-docs'));

// Root API information endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Disaster Response Coordination Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      docs: '/api-docs',
      auth: '/api/auth',
      disasters: '/disasters',
      realtimeTest: '/socket-test'
    }
  });
});

// Interactive Real-Time Socket.IO Test UI
app.get('/socket-test', (req, res) => {
  res.sendFile(path.join(__dirname, '../tests/socket-test.html'));
});

// Mount Routes (supporting both /disasters and /api/disasters)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/disasters', disasterRoutes);
app.use('/api/disasters', disasterRoutes);

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
app.use(errorHandler);

module.exports = app;
