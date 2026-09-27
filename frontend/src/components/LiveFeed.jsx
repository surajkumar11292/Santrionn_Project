/* Hallmark Theme: Aurora (usehallmark.com)
 * Real-Time Disaster Broadcast Column
 */
import React from 'react';

export default function LiveFeed({ events = [], isConnected = false }) {
  const getPacketColor = (level) => {
    switch (level) {
      case 'critical':
        return 'var(--color-critical)';
      case 'warning':
        return 'var(--color-warning)';
      default:
        return 'var(--color-accent)';
    }
  };

  return (
    <aside
      aria-label="Live Telemetry Stream"
      className="aurora-card"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: 'calc(100vh - 160px)'
      }}
    >
      {/* Feed Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--color-rule)',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="eyebrow-square" style={{ backgroundColor: 'var(--color-accent)' }} />
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>
            Live Crisis Feed
          </h2>
        </div>

        <span className="mono-label" style={{
          fontSize: '9.5px',
          color: isConnected ? 'var(--color-success)' : 'var(--color-critical)'
        }}>
          {isConnected ? '● STREAMING' : '○ OFFLINE'}
        </span>
      </header>

      {/* Packet Stream */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        overflowY: 'auto',
        paddingRight: '2px'
      }}>
        {events.length === 0 ? (
          <div style={{
            padding: '24px 8px',
            textAlign: 'center',
            color: 'var(--color-muted)',
            fontSize: '12px'
          }}>
            Monitoring active WebSocket channel for disaster events and field reports...
          </div>
        ) : (
          events.map((evt) => {
            const color = getPacketColor(evt.level);
            return (
              <div
                key={evt.id}
                style={{
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid var(--color-rule)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono-label" style={{ fontSize: '10px', color }}>
                    {evt.title}
                  </span>
                  <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)' }}>
                    {evt.timestamp}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-ink-2)', lineHeight: 1.4 }}>
                  {evt.detail}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
