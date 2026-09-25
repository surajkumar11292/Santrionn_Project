import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function Navbar({ currentView, setCurrentView, onOpenCreateModal, isSocketConnected }) {
  const { user, logout } = useAuthStore();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' };
      case 'contributor':
        return { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)' };
    }
  };

  const roleStyle = getRoleBadgeStyle(user?.role);
  const canCreate = user?.role === 'admin' || user?.role === 'contributor';

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-3) var(--space-6)',
      background: 'var(--color-bg-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(12px)'
    }}>
      {/* Brand Identity & Live Stream Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            RELIEF.IO
          </span>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-muted)',
            fontWeight: 600,
            borderLeft: '1px solid var(--color-border)',
            paddingLeft: 'var(--space-2)'
          }}>
            Crisis Command
          </span>
        </div>

        {/* Live WebSocket Pulse */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          background: isSocketConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${isSocketConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          fontSize: '0.75rem',
          fontWeight: 600,
          color: isSocketConnected ? 'var(--color-success)' : 'var(--color-critical)'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: isSocketConnected ? 'var(--color-success)' : 'var(--color-critical)',
            boxShadow: isSocketConnected ? '0 0 8px #10b981' : 'none',
            display: 'inline-block'
          }}></span>
          {isSocketConnected ? 'LIVE FEED' : 'DISCONNECTED'}
        </div>
      </div>

      {/* Navigation View Switcher */}
      <nav style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          onClick={() => setCurrentView('dashboard')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: currentView === 'dashboard' ? 'var(--color-bg-elevated)' : 'transparent',
            color: currentView === 'dashboard' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            border: currentView === 'dashboard' ? '1px solid var(--color-border-active)' : '1px solid transparent',
            transition: 'all var(--transition-fast)'
          }}
        >
          📊 Dashboard
        </button>

        <button
          onClick={() => setCurrentView('map')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: currentView === 'map' ? 'var(--color-bg-elevated)' : 'transparent',
            color: currentView === 'map' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            border: currentView === 'map' ? '1px solid var(--color-border-active)' : '1px solid transparent',
            transition: 'all var(--transition-fast)'
          }}
        >
          🗺️ Spatial Map
        </button>

        <a
          href="http://localhost:3000/api-docs"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            border: '1px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          📖 API Docs ↗
        </a>
      </nav>

      {/* Actions & User Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {canCreate && (
          <button
            onClick={onOpenCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-glow-critical)',
              transition: 'transform var(--transition-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            + Report Disaster
          </button>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          background: 'var(--color-bg-base)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            {user?.email || 'operator@relief.io'}
          </span>
          <span style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            background: roleStyle.bg,
            color: roleStyle.text,
            border: `1px solid ${roleStyle.border}`
          }}>
            {user?.role || 'viewer'}
          </span>
        </div>

        <button
          onClick={logout}
          title="Sign out of command session"
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            background: 'transparent'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-critical)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
