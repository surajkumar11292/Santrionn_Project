import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useDisasterStore } from '../store/disasterStore';
import { api } from '../api/client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function formatBroadcastDateTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} · ${strHours}:${minutes} ${ampm}`;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const socketRef = useRef(null);
  const recentKeysRef = useRef(new Set());

  const { onDisasterCreated, onDisasterUpdated, onDisasterDeleted } = useDisasterStore();

  // Load initial persistent 7-day broadcast feed from database
  useEffect(() => {
    let isMounted = true;
    api.disasters
      .getFeed(7)
      .then((res) => {
        if (!isMounted) return;
        const feedList = res?.data;
        if (Array.isArray(feedList) && feedList.length > 0) {
          const formatted = feedList.map((item) => ({
            id: item.id,
            type: item.type || 'official_update',
            title: item.title,
            detail: item.detail,
            level: item.level || 'warning',
            timestamp: formatBroadcastDateTime(item.timestamp || item.created_at)
          }));
          setLiveEvents(formatted);
        }
      })
      .catch((err) => {
        console.warn('[Broadcast Feed] Initial feed fetch error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const addLiveEvent = useCallback((eventData) => {
    // Client-side deduplication key: prevent identical events within 3 seconds
    const dedupKey = `${eventData.type}:${eventData.title}:${eventData.detail}`;
    if (recentKeysRef.current.has(dedupKey)) {
      return;
    }
    recentKeysRef.current.add(dedupKey);
    setTimeout(() => {
      recentKeysRef.current.delete(dedupKey);
    }, 3000);

    setLiveEvents((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: formatBroadcastDateTime(new Date()),
        ...eventData
      },
      ...prev
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

    socket.on('official_update', (data) => {
      const update = data?.update;
      const detailText = update?.headline
        ? `${update.headline} — ${update.body || ''}`
        : (update?.body || update?.message || 'Emergency broadcast bulletin');

      addLiveEvent({
        type: 'official_update',
        title: `Official Bulletin: ${update?.agency || 'Emergency Agency'}`,
        detail: detailText,
        level: (update?.severity === 'critical' || update?.severity === 'evacuation') ? 'critical' : 'warning',
        data: update
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
