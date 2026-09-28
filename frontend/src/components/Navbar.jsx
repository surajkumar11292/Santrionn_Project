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
      borderBottom: '1.5px solid #bab5a6',
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
            className={`btn-nav-pill ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            Incidents
          </button>

          <button
            type="button"
            onClick={() => setCurrentView && setCurrentView('map')}
            className={`btn-nav-pill ${currentView === 'map' ? 'active' : ''}`}
          >
            Spatial Radar
          </button>

          <a
            href="http://localhost:3000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="btn-nav-pill"
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
              className="btn-nav-pill"
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
