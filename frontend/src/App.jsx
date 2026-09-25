import React from 'react';

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(ellipse at top, #162035 0%, #070d1a 70%)',
      padding: 'var(--space-6)',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '640px',
        padding: 'var(--space-8)',
        background: 'var(--color-bg-glass)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-1) var(--space-3)',
          background: 'var(--color-critical-dim)',
          color: 'var(--color-critical)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          marginBottom: 'var(--space-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          ● Platform Initialized (Phase 1)
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          marginBottom: 'var(--space-3)',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Disaster Response Coordination
        </h1>

        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '1rem',
          marginBottom: 'var(--space-6)',
          lineHeight: 1.6
        }}>
          Next-generation real-time incident response, geospatial resource discovery, and intelligent community coordination.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'var(--space-3)',
          fontSize: '0.875rem'
        }}>
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <span style={{ color: 'var(--color-info)', fontWeight: 600 }}>PostGIS</span>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Geospatial Engine</div>
          </div>
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <span style={{ color: 'var(--color-critical)', fontWeight: 600 }}>Redis 7</span>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Cache-Aside TTL</div>
          </div>
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>Socket.IO</span>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Real-time Rooms</div>
          </div>
        </div>
      </div>
    </div>
  );
}
