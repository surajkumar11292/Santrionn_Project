const { getIO } = require('../config/socket');

/**
 * Standardized Real-Time Event Dispatchers
 * Broadcasts events once cleanly without duplicating to room subscribers.
 */

const emitDisasterCreated = (disaster) => {
  const io = getIO();
  const payload = {
    event: 'disaster_created',
    timestamp: new Date().toISOString(),
    disaster
  };

  io.emit('disaster_created', payload);
};

const emitDisasterUpdated = (disaster, changes = {}) => {
  const io = getIO();
  const payload = {
    event: 'disaster_updated',
    timestamp: new Date().toISOString(),
    disaster,
    changes
  };

  io.emit('disaster_updated', payload);
};

const emitDisasterDeleted = (disasterId) => {
  const io = getIO();
  const payload = {
    event: 'disaster_deleted',
    timestamp: new Date().toISOString(),
    disasterId
  };

  io.emit('disaster_deleted', payload);
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
};

const emitOfficialUpdate = (disasterId, update) => {
  const io = getIO();
  const payload = {
    event: 'official_update',
    timestamp: new Date().toISOString(),
    disasterId,
    update
  };

  io.emit('official_update', payload);
};

module.exports = {
  emitDisasterCreated,
  emitDisasterUpdated,
  emitDisasterDeleted,
  emitReportAdded,
  emitOfficialUpdate
};
