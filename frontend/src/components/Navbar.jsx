/* Theme: Editorial Linen & Forest Green (suraj-portfolio-io.vercel.app)
 * Clean Minimal Navigation Bar
 */
import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function Navbar({ currentView, setCurrentView, onOpenCreateModal, isSocketConnected }) {
  const { user, logout } = useAuthStore();
  const canCreate = user?.role === 'admin' || user?.role === 'contributor';

  return (
    <header style={{
      borderBottom: '1px solid var(--color-rule)',
      backgroundColor: 'var(--color-paper)',
      padding: '14px 32px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Brand (Editorial Serif: Disaster in Charcoal, Response in Italic Forest Green) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{ display: 'flex', alignItems: 'baseline', gap: '6px', cursor: 'pointer' }}
            onClick={() => setCurrentView?.('dashboard')}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 400,
              color: 'var(--color-ink)',
              letterSpacing: '-0.02em'
            }}>
              Disaster
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '1.65rem',
              color: 'var(--color-forest)',
              letterSpacing: '-0.01em'
            }}>
              Response
            </span>
          </div>
        </div>

        {/* View Switchers */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setCurrentView && setCurrentView('dashboard')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '13px',
              fontWeight: currentView === 'dashboard' ? 700 : 500,
              color: currentView === 'dashboard' ? '#ffffff' : 'var(--color-ink-2)',
              backgroundColor: currentView === 'dashboard' ? 'var(--color-forest)' : 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Incidents
          </button>

          <button
            type="button"
            onClick={() => setCurrentView && setCurrentView('map')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '13px',
              fontWeight: currentView === 'map' ? 700 : 500,
              color: currentView === 'map' ? '#ffffff' : 'var(--color-ink-2)',
              backgroundColor: currentView === 'map' ? 'var(--color-forest)' : 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Spatial Radar
          </button>

          <a
            href="http://localhost:3000/api-docs"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-muted)',
              textDecoration: 'none'
            }}
          >
            API Docs ↗
          </a>
        </nav>

        {/* Actions & Role Clearance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {canCreate && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="btn-forest"
              style={{
                padding: '7px 16px',
                fontSize: '13px'
              }}
            >
              + Log Incident
            </button>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-paper-muted)',
            border: '1px solid var(--color-rule)',
            fontSize: '12px'
          }}>
            <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
              {user?.email ? user.email.split('@')[0] : 'operator'}
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: user?.role === 'admin' ? '#b91c1c' : 'var(--color-forest)',
              textTransform: 'uppercase'
            }}>
              {user?.role || 'viewer'}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--color-muted)',
              border: '1px solid var(--color-rule)',
              backgroundColor: 'var(--color-paper-surface)',
              cursor: 'pointer'
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
