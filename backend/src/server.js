const http = require('http');
const app = require('./app');
const config = require('./config');

const server = http.createServer(app);

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`[Disaster Response API] Server running in ${config.env} mode on port ${PORT}`);
});

// Graceful shutdown handling
const handleGracefulShutdown = (signal) => {
  console.log(`[Disaster Response API] Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('[Disaster Response API] HTTP server closed gracefully.');
    process.exit(0);
  });

  // Force close after 10s if ongoing requests hang
  setTimeout(() => {
    console.error('[Disaster Response API] Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

module.exports = server;
