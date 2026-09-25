/**
 * Real-Time Socket.IO Verification Script
 */

const { io } = require('socket.io-client');
const http = require('http');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function runSocketVerification() {
  console.log('[Socket.IO Verifier] Connecting to:', SERVER_URL);

  const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true
  });

  let createdEventReceived = false;
  let updatedEventReceived = false;

  await new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log(`[Socket.IO Verifier] Connected successfully with socket id: ${socket.id}`);
      resolve();
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket.IO Verifier] Connection error:', err.message);
      reject(err);
    });

    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });

  socket.on('disaster_created', (data) => {
    console.log('[Socket.IO Verifier] Received "disaster_created" event:');
    console.log('  Title:', data.disaster.title);
    console.log('  Location:', data.disaster.location.name);
    console.log('  Status:', data.disaster.status);
    createdEventReceived = true;
  });

  socket.on('disaster_updated', (data) => {
    console.log('[Socket.IO Verifier] Received "disaster_updated" event:');
    console.log('  Title:', data.disaster.title);
    console.log('  Updated status:', data.disaster.status);
    console.log('  Changes:', data.changes);
    updatedEventReceived = true;
  });

  // Helper to make HTTP JSON requests
  const postJson = (path, body, headers = {}) => {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const url = new URL(path, SERVER_URL);
      const req = http.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers
        }
      }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  };

  const patchJson = (path, body, headers = {}) => {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const url = new URL(path, SERVER_URL);
      const req = http.request(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers
        }
      }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  };

  try {
    // 1. Authenticate as admin
    console.log('[Socket.IO Verifier] Authenticating...');
    const authRes = await postJson('/api/auth/login', {
      email: 'admin@relief.io',
      password: 'admin123'
    });
    const token = authRes.data.tokens.accessToken;

    // 2. Trigger disaster creation via REST API
    console.log('[Socket.IO Verifier] Triggering POST /disasters to test real-time broadcast...');
    const createRes = await postJson('/disasters', {
      title: 'Real-Time WebSocket Verification Incident',
      description: 'Triggering live event verification stream in Manhattan, NYC.',
      tags: ['realtime', 'test']
    }, { Authorization: `Bearer ${token}` });

    const disasterId = createRes.data.id;

    // 3. Trigger disaster update via REST API
    await new Promise(r => setTimeout(r, 600));
    console.log('[Socket.IO Verifier] Triggering PATCH /disasters/:id to test real-time update event...');
    await patchJson(`/disasters/${disasterId}`, {
      status: 'resolved'
    }, { Authorization: `Bearer ${token}` });

    // Wait 1 second to ensure all events were processed
    await new Promise(r => setTimeout(r, 1000));

    socket.disconnect();

    if (createdEventReceived && updatedEventReceived) {
      console.log('[Socket.IO Verifier] SUCCESS: All real-time WebSocket events were captured cleanly!');
      process.exit(0);
    } else {
      console.error('[Socket.IO Verifier] FAILURE: Missing expected WebSocket events', {
        createdEventReceived,
        updatedEventReceived
      });
      process.exit(1);
    }
  } catch (err) {
    console.error('[Socket.IO Verifier] Error:', err.message);
    socket.disconnect();
    process.exit(1);
  }
}

runSocketVerification();
