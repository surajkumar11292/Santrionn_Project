import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useDisasterStore } from '../store/disasterStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const socketRef = useRef(null);

  const { onDisasterCreated, onDisasterUpdated, onDisasterDeleted } = useDisasterStore();

  const addLiveEvent = useCallback((eventData) => {
    setLiveEvents((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toLocaleTimeString(),
        ...eventData
      },
      ...prev.slice(0, 29) // Keep last 30 events
    ]);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setSocketId(socket.id);
      addLiveEvent({
        type: 'system',
        title: 'Real-time WebSocket Gateway Connected',
        detail: `Socket ID: ${socket.id}`,
        level: 'info'
      });
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      setSocketId(null);
      addLiveEvent({
        type: 'system',
        title: 'WebSocket Disconnected',
        detail: reason,
        level: 'warning'
      });
    });

    socket.on('disaster_created', (data) => {
      if (data?.disaster) {
        onDisasterCreated(data.disaster);
        addLiveEvent({
          type: 'disaster_created',
          title: 'New Emergency Reported',
          detail: `${data.disaster.title} (${data.disaster.location?.name || 'Unknown Location'})`,
          level: 'critical',
          data: data.disaster
        });
      }
    });

    socket.on('disaster_updated', (data) => {
      if (data?.disaster) {
        onDisasterUpdated(data.disaster);
        addLiveEvent({
          type: 'disaster_updated',
          title: 'Incident Status Updated',
          detail: `${data.disaster.title} → Status: ${data.disaster.status}`,
          level: 'warning',
          data: data.disaster
        });
      }
    });

    socket.on('disaster_deleted', (data) => {
      if (data?.disasterId) {
        onDisasterDeleted(data.disasterId);
        addLiveEvent({
          type: 'disaster_deleted',
          title: 'Incident Resolved / Removed',
          detail: `Disaster ID: ${data.disasterId}`,
          level: 'info'
        });
      }
    });

    socket.on('report_added', (data) => {
      addLiveEvent({
        type: 'report_added',
        title: 'New Field Report Ingested',
        detail: data?.report?.content || 'Incoming crisis intelligence',
        level: data?.report?.priority === 'critical' ? 'critical' : 'info',
        data: data?.report
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [onDisasterCreated, onDisasterUpdated, onDisasterDeleted, addLiveEvent]);

  const joinDisasterRoom = useCallback((disasterId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join:disaster', disasterId);
    }
  }, []);

  const leaveDisasterRoom = useCallback((disasterId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave:disaster', disasterId);
    }
  }, []);

  return {
    connected,
    socketId,
    liveEvents,
    joinDisasterRoom,
    leaveDisasterRoom
  };
}
