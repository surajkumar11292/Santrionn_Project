/* Hallmark Theme: Aurora (usehallmark.com)
 * Disaster Incident Card - High-Information Density
 */
import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function DisasterCard({ disaster, onSelect, onDelete }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const getTriageTone = (status) => {
    switch (status) {
      case 'active':
        return {
          label: 'CRITICAL / ACTIVE',
          color: 'var(--color-critical)',
          bg: 'var(--color-critical-dim)',
          border: 'var(--color-critical-border)'
        };
      case 'monitoring':
        return {
          label: 'SURVEILLANCE',
          color: 'var(--color-warning)',
          bg: 'var(--color-warning-dim)',
          border: 'var(--color-warning-border)'
        };
      case 'resolved':
        return {
          label: 'RESOLVED',
          color: 'var(--color-success)',
          bg: 'var(--color-success-dim)',
          border: 'var(--color-success-border)'
        };
      default:
        return {
          label: status?.toUpperCase() || 'LOGGED',
          color: 'var(--color-muted)',
          bg: 'var(--color-paper-elevated)',
          border: 'var(--color-rule)'
        };
    }
  };

  const triage = getTriageTone(disaster.status);
  const lat = disaster.location?.latitude;
  const lng = disaster.location?.longitude;

  return (
    <article
      className="aurora-card"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      <div>
        {/* Triage Status & Date */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span
            className="mono-label"
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              color: triage.color,
              backgroundColor: triage.bg,
              border: `1px solid ${triage.border}`,
              fontSize: '10px'
            }}
          >
            <span className="eyebrow-square" style={{ backgroundColor: triage.color, width: '5px', height: '5px' }} />
            {triage.label}
          </span>

          <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>
            {disaster.created_at ? new Date(disaster.created_at).toISOString().split('T')[0] : 'LIVE'}
          </span>
        </div>

        {/* Disaster Incident Title */}
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--color-ink)',
          marginBottom: '6px',
          lineHeight: 1.3
        }}>
          {disaster.title}
        </h3>

        {/* Epicenter Location & Coordinates */}
        <div style={{
          fontSize: '12px',
          color: 'var(--color-accent)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '6px',
          borderBottom: '1px solid var(--color-rule)'
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
            📍 {disaster.location?.name || 'Unspecified Epicenter'}
          </span>
          {lat !== undefined && lng !== undefined && (
            <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', flexShrink: 0 }}>
              [{lat.toFixed(3)}, {lng.toFixed(3)}]
            </span>
          )}
        </div>

        {/* Field Description */}
        <p style={{
          fontSize: '12.5px',
          color: 'var(--color-ink-2)',
          lineHeight: 1.5,
          marginBottom: '10px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {disaster.description}
        </p>

        {/* Incident Classification Tags */}
        {disaster.tags && disaster.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {disaster.tags.map((tag, idx) => (
              <span
                key={idx}
                className="mono-label"
                style={{
                  fontSize: '9.5px',
                  color: 'var(--color-muted)',
                  backgroundColor: 'var(--color-paper)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--color-rule)'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px solid var(--color-rule)',
        marginTop: '4px'
      }}>
        <button
          type="button"
          onClick={() => onSelect && onSelect(disaster)}
          className="btn-cyan"
          style={{ padding: '5px 12px', fontSize: '11px' }}
        >
          <span>Inspect Dossier</span>
          <span aria-hidden="true">→</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onDelete && onDelete(disaster.id)}
            title="De-register incident record"
            className="mono-label"
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '10px',
              color: 'var(--color-critical)',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-critical-border)'
            }}
          >
            DELETE
          </button>
        )}
      </div>
    </article>
  );
}
