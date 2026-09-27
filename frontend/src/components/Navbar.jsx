/* Hallmark Theme: Aurora (16 / 21 — usehallmark.com)
 * Disaster Response Operations Shell
 */
import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function Navbar({ currentView, setCurrentView, onOpenCreateModal, isSocketConnected }) {
  const { user, logout } = useAuthStore();
  const canCreate = user?.role === 'admin' || user?.role === 'contributor';

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 18px',
      backgroundColor: 'var(--color-paper-surface)',
      borderBottom: '1px solid var(--color-rule)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Brand & Disaster Management Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-ink)',
            letterSpacing: '-0.02em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ color: 'var(--color-accent)' }}>/</span> disaster response
          </span>

          <span className="mono-label" style={{ color: 'var(--color-muted)', fontSize: '10px' }}>
            v1.1
          </span>
        </div>

        {/* Live WebSocket Telemetry Status */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '2px 8px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: isSocketConnected ? 'var(--color-success-dim)' : 'var(--color-critical-dim)',
          border: `1px solid ${isSocketConnected ? 'var(--color-success-border)' : 'var(--color-critical-border)'}`
        }}>
          <span style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: isSocketConnected ? 'var(--color-success)' : 'var(--color-critical)'
          }} />
          <span className="mono-label" style={{
            fontSize: '9.5px',
            color: isSocketConnected ? 'var(--color-success)' : 'var(--color-critical)'
          }}>
            {isSocketConnected ? 'LIVE FEED ACTIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Direct View Navigation (Zero click bloat) */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          type="button"
          onClick={() => setCurrentView && setCurrentView('dashboard')}
          className="mono-label"
          style={{
            padding: '5px 14px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '11px',
            color: currentView === 'dashboard' ? 'var(--color-ink)' : 'var(--color-muted)',
            backgroundColor: currentView === 'dashboard' ? 'var(--color-paper-elevated)' : 'transparent',
            border: currentView === 'dashboard' ? '1px solid var(--color-rule-2)' : '1px solid transparent'
          }}
        >
          OPERATIONS COCKPIT
        </button>

        <button
          type="button"
          onClick={() => setCurrentView && setCurrentView('map')}
          className="mono-label"
          style={{
            padding: '5px 14px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '11px',
            color: currentView === 'map' ? 'var(--color-ink)' : 'var(--color-muted)',
            backgroundColor: currentView === 'map' ? 'var(--color-paper-elevated)' : 'transparent',
            border: currentView === 'map' ? '1px solid var(--color-rule-2)' : '1px solid transparent'
          }}
        >
          SPATIAL RADAR
        </button>

        <a
          href="http://localhost:3000/api-docs"
          target="_blank"
          rel="noreferrer"
          className="mono-label"
          style={{
            padding: '5px 10px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '11px',
            color: 'var(--color-muted)',
            textDecoration: 'none'
          }}
        >
          API SPEC ↗
        </a>
      </nav>

      {/* Quick Actions & Operator Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {canCreate && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="btn-cyan"
            style={{ padding: '5px 12px', fontSize: '11px' }}
          >
            + LOG INCIDENT
          </button>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 8px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'var(--color-paper)',
          border: '1px solid var(--color-rule)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--color-ink-2)', fontFamily: 'var(--font-mono)' }}>
            {user?.email ? user.email.split('@')[0] : 'operator'}
          </span>
          <span className="mono-label" style={{
            fontSize: '9px',
            color: user?.role === 'admin' ? 'var(--color-critical)' : 'var(--color-accent)'
          }}>
            [{user?.role?.toUpperCase() || 'VIEWER'}]
          </span>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Sign out"
          className="mono-label"
          style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '10px',
            color: 'var(--color-muted)',
            border: '1px solid var(--color-rule)',
            backgroundColor: 'transparent'
          }}
        >
          EXIT
        </button>
      </div>
    </header>
  );
}
