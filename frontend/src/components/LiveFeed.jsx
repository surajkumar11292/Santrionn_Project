/* Theme: Editorial Linen & Forest Green (suraj-portfolio-io.vercel.app)
 * Real-Time Emergency Broadcast Feed
 */
import React from 'react';

export default function LiveFeed({ events = [], isConnected = false }) {
  const displayTime = (ts) => {
    if (!ts) return '';
    if (typeof ts === 'string' && ts.includes('·')) return ts;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
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
  };

  // Filter out internal system packets and deleted/removed incident notices
  const broadcastEvents = events.filter((evt) => 
    evt.type !== 'system' && 
    !evt.title?.includes('WebSocket') &&
    evt.type !== 'disaster_deleted' &&
    !evt.title?.includes('Removed')
  );

  return (
    <aside
      aria-label="Crisis Broadcast Feed"
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
                    {displayTime(evt.timestamp)}
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
