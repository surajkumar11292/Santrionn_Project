/* Theme: Editorial Linen & Forest Green (suraj-portfolio-io.vercel.app)
 * Real-Time Emergency Broadcast Feed
 */
import React from 'react';

export default function LiveFeed({ events = [], isConnected = false }) {
  // Filter out any lingering internal system/socket debug packets
  const broadcastEvents = events.filter((evt) => evt.type !== 'system' && !evt.title?.includes('WebSocket'));

  return (
    <aside
      aria-label="Live Crisis Broadcast Feed"
      className="aurora-card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: 'calc(100vh - 180px)',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--color-rule)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Feed Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--color-rule)',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-forest)'
          }} />
          <h2 style={{
            fontSize: '1.2rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            color: 'var(--color-ink)'
          }}>
            Broadcast Feed
          </h2>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: isConnected ? 'var(--color-forest-subtle)' : '#fef2f2',
          color: isConnected ? 'var(--color-forest)' : '#b91c1c',
          border: `1px solid ${isConnected ? 'var(--color-forest-border)' : '#fecaca'}`
        }}>
          {isConnected ? '● STREAMING' : '○ OFFLINE'}
        </span>
      </header>

      {/* Broadcast Stream */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        overflowY: 'auto',
        paddingRight: '2px'
      }}>
        {broadcastEvents.length === 0 ? (
          <div style={{
            padding: '36px 12px',
            textAlign: 'center',
            color: 'var(--color-muted)',
            fontSize: '13px',
            lineHeight: 1.5
          }}>
            No emergency alerts broadcasted yet. Real-time updates will stream here automatically.
          </div>
        ) : (
          broadcastEvents.map((evt) => {
            const isCritical = evt.level === 'critical';
            return (
              <div
                key={evt.id}
                style={{
                  backgroundColor: isCritical ? '#fef2f2' : 'var(--color-paper-elevated)',
                  border: `1px solid ${isCritical ? '#fecaca' : 'var(--color-rule)'}`,
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: isCritical ? '#b91c1c' : 'var(--color-forest)'
                  }}>
                    {evt.title}
                  </span>
                  <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)' }}>
                    {evt.timestamp}
                  </span>
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--color-ink-2)', lineHeight: 1.45 }}>
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
