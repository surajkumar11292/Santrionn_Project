/* Theme: Editorial Linen & Forest Green (suraj-portfolio-io.vercel.app)
 * Disaster Incident Card
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
          label: 'ACTIVE',
          color: '#b91c1c',
          bg: '#fef2f2',
          border: '#fecaca'
        };
      case 'monitoring':
        return {
          label: 'MONITORING',
          color: '#b45309',
          bg: '#fffbeb',
          border: '#fde68a'
        };
      case 'resolved':
        return {
          label: 'RESOLVED',
          color: 'var(--color-forest)',
          bg: 'var(--color-forest-subtle)',
          border: 'var(--color-forest-border)'
        };
      default:
        return {
          label: status?.toUpperCase() || 'LOGGED',
          color: 'var(--color-muted)',
          bg: 'var(--color-paper-muted)',
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
        padding: '20px 22px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--color-rule)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: 'var(--shadow-sm)'
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
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
              color: triage.color,
              backgroundColor: triage.bg,
              border: `1px solid ${triage.border}`,
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: triage.color }} />
            {triage.label}
          </span>

          <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>
            {disaster.created_at ? new Date(disaster.created_at).toISOString().split('T')[0] : 'LIVE'}
          </span>
        </div>

        {/* Disaster Incident Title (Editorial Serif) */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.45rem',
          fontWeight: 400,
          color: 'var(--color-ink)',
          marginBottom: '6px',
          lineHeight: 1.2
        }}>
          {disaster.title}
        </h3>

        {/* Epicenter Location & Coordinates */}
        <div style={{
          fontSize: '12.5px',
          color: 'var(--color-forest)',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--color-paper-muted)'
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
          fontSize: '13px',
          color: 'var(--color-ink-2)',
          lineHeight: 1.55,
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {disaster.description}
        </p>

        {/* Classification Tags */}
        {disaster.tags && disaster.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {disaster.tags.map((tag, idx) => (
              <span
                key={idx}
                className="card-tag-pill"
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
        paddingTop: '12px',
        borderTop: '1px solid var(--color-paper-muted)',
        marginTop: '6px'
      }}>
        <button
          type="button"
          onClick={() => onSelect && onSelect(disaster)}
          className="btn-details-pill"
        >
          <span>View Details</span>
          <span aria-hidden="true">→</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onDelete && onDelete(disaster.id)}
            className="btn-delete-pill"
            title="Delete Incident"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <span>Delete</span>
          </button>
        )}
      </div>
    </article>
  );
}
