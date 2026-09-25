import React from 'react';

export default function LiveFeed({ events, isConnected }) {
  const getEventLevelBadge = (level) => {
    switch (level) {
      case 'critical':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' };
      case 'warning':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' };
      default:
        return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6' };
    }
  };

  return (
    <aside style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: 'calc(100vh - 180px)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 'var(--space-3)',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 'var(--space-3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '1rem' }}>⚡</span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Real-Time Crisis Feed
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: isConnected ? 'var(--color-success)' : 'var(--color-critical)'
        }}>
          {isConnected ? '● STREAMING' : '○ OFFLINE'}
        </span>
      </div>

      {/* Stream List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {events.length === 0 ? (
          <div style={{
            padding: 'var(--space-6)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem'
          }}>
            Listening for live WebSocket disaster broadcasts...
          </div>
        ) : (
          events.map((evt) => {
            const badge = getEventLevelBadge(evt.level);
            return (
              <div
                key={evt.id}
                style={{
                  background: 'var(--color-bg-elevated)',
                  borderLeft: `3px solid ${badge.border}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: badge.color
                  }}>
                    {evt.title}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {evt.timestamp}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.775rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.4
                }}>
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
