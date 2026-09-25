const { getIO } = require('../config/socket');

/**
 * Standardized Real-Time Event Dispatchers
 */

const emitDisasterCreated = (disaster) => {
  const io = getIO();
  const payload = {
    event: 'disaster_created',
    timestamp: new Date().toISOString(),
    disaster
  };

  // Broadcast to global feed
  io.emit('disaster_created', payload);
  if (io.to) {
    io.to('disasters').emit('disaster_created', payload);
  }
};

const emitDisasterUpdated = (disaster, changes = {}) => {
  const io = getIO();
  const payload = {
    event: 'disaster_updated',
    timestamp: new Date().toISOString(),
    disaster,
    changes
  };

  // Broadcast to global feed
  io.emit('disaster_updated', payload);
  // Broadcast to specific disaster room subscribers
  if (io.to) {
    io.to(`disaster:${disaster.id}`).emit('disaster_updated', payload);
  }
};

const emitDisasterDeleted = (disasterId) => {
  const io = getIO();
  const payload = {
    event: 'disaster_deleted',
    timestamp: new Date().toISOString(),
    disasterId
  };

  io.emit('disaster_deleted', payload);
  if (io.to) {
    io.to(`disaster:${disasterId}`).emit('disaster_deleted', payload);
  }
};

const emitReportAdded = (disasterId, report) => {
  const io = getIO();
  const payload = {
    event: 'report_added',
    timestamp: new Date().toISOString(),
    disasterId,
    report
  };

  io.emit('report_added', payload);
  if (io.to) {
    io.to(`disaster:${disasterId}`).emit('report_added', payload);
  }
};

module.exports = {
  emitDisasterCreated,
  emitDisasterUpdated,
  emitDisasterDeleted,
  emitReportAdded
};
