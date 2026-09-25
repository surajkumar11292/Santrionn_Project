const { Server } = require('socket.io');
const config = require('./index');

let io = null;

/**
 * Initialize Socket.IO server attached to HTTP server
 * @param {import('http').Server} httpServer
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    if (config.env !== 'test') {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);
    }

    // Join room for specific disaster updates
    socket.on('join:disaster', (disasterId) => {
      if (disasterId) {
        socket.join(`disaster:${disasterId}`);
        socket.emit('joined:disaster', { disasterId, status: 'subscribed' });
        if (config.env !== 'test') {
          console.log(`[Socket.IO] Client ${socket.id} joined room disaster:${disasterId}`);
        }
      }
    });

    // Leave room
    socket.on('leave:disaster', (disasterId) => {
      if (disasterId) {
        socket.leave(`disaster:${disasterId}`);
        socket.emit('left:disaster', { disasterId, status: 'unsubscribed' });
      }
    });

    socket.on('disconnect', (reason) => {
      if (config.env !== 'test') {
        console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
      }
    });
  });

  return io;
};

/**
 * Access initialized Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    // Return mock object if called before init to prevent crashes in unit tests
    return {
      emit: () => {},
      to: () => ({ emit: () => {} })
    };
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
