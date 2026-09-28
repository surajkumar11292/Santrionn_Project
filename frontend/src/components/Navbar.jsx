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
              height: '32px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '13px',
              fontWeight: currentView === 'dashboard' ? 700 : 500,
              color: currentView === 'dashboard' ? '#ffffff' : 'var(--color-ink-2)',
              backgroundColor: currentView === 'dashboard' ? 'var(--color-forest)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxSizing: 'border-box'
            }}
          >
            Incidents
          </button>

          <button
            type="button"
            onClick={() => setCurrentView && setCurrentView('map')}
            style={{
              height: '32px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '13px',
              fontWeight: currentView === 'map' ? 700 : 500,
              color: currentView === 'map' ? '#ffffff' : 'var(--color-ink-2)',
              backgroundColor: currentView === 'map' ? 'var(--color-forest)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxSizing: 'border-box'
            }}
          >
            Spatial Radar
          </button>

          <a
            href="http://localhost:3000/api-docs"
            target="_blank"
            rel="noreferrer"
            style={{
              height: '32px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-ink-2)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxSizing: 'border-box'
            }}
          >
            API Docs ↗
          </a>
        </nav>

        {/* Actions & Role Clearance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {canCreate && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              style={{
                height: '32px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: 'var(--color-forest)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                boxSizing: 'border-box'
              }}
            >
              + Log Incident
            </button>
          )}

          <div style={{
            height: '32px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-paper-muted)',
            border: '1px solid var(--color-rule)',
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxSizing: 'border-box',
            lineHeight: 1
          }}>
            <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
              {user?.email ? user.email.split('@')[0] : 'operator'}
            </span>
            <span style={{
              fontSize: '11px',
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
            className="btn-signout"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
