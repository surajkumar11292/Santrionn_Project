import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function DisasterCard({ disaster, onSelect, onDelete }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { text: 'CRITICAL / ACTIVE', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' };
      case 'monitoring':
        return { text: 'MONITORING', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' };
      case 'resolved':
        return { text: 'RESOLVED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' };
      default:
        return { text: status?.toUpperCase(), color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  const badge = getStatusBadge(disaster.status);
  const lat = disaster.location?.latitude;
  const lng = disaster.location?.longitude;

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all var(--transition-normal)',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--color-border-active)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--color-border)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }}>
      {/* Top Status & Meta */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-3)'
        }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            color: badge.color,
            background: badge.bg,
            border: `1px solid ${badge.border}`
          }}>
            {badge.text}
          </span>

          <span style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            {disaster.created_at ? new Date(disaster.created_at).toLocaleDateString() : 'Active'}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1.3,
          marginBottom: 'var(--space-2)'
        }}>
          {disaster.title}
        </h3>

        {/* Geographic Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--color-info)',
          fontSize: '0.85rem',
          marginBottom: 'var(--space-3)'
        }}>
          <span>📍</span>
          <span style={{ fontWeight: 600 }}>{disaster.location?.name || 'Unspecified Epicenter'}</span>
          {lat !== undefined && lng !== undefined && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              marginLeft: 'auto'
            }}>
              {lat.toFixed(3)}, {lng.toFixed(3)}
            </span>
          )}
        </div>

        {/* Description Snippet */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
          marginBottom: 'var(--space-3)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {disaster.description}
        </p>

        {/* Tags */}
        {disaster.tags && disaster.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {disaster.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  background: 'var(--color-bg-elevated)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'var(--space-3)',
        borderTop: '1px solid var(--color-border)'
      }}>
        <button
          onClick={() => onSelect(disaster)}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.825rem',
            fontWeight: 600,
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-info)',
            border: '1px solid var(--color-border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-elevated)')}
        >
          🔍 View Intel & Resources
        </button>

        {isAdmin && (
          <button
            onClick={() => onDelete(disaster.id)}
            title="Delete disaster (Admin)"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--color-critical)',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
