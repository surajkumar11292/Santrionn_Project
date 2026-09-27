/* Hallmark Theme: Aurora (usehallmark.com)
 * Disaster Management Instant Status Counters
 */
import React from 'react';

export default function StatsBar({ disasters = [] }) {
  const total = disasters.length;
  const active = disasters.filter((d) => d.status === 'active').length;
  const monitoring = disasters.filter((d) => d.status === 'monitoring').length;
  const resolved = disasters.filter((d) => d.status === 'resolved').length;

  const stats = [
    {
      code: 'ACT-01',
      label: 'ACTIVE INCIDENTS',
      value: active,
      color: 'var(--color-critical)',
      tag: 'IMMEDIATE ACTION'
    },
    {
      code: 'MON-02',
      label: 'UNDER SURVEILLANCE',
      value: monitoring,
      color: 'var(--color-warning)',
      tag: 'ELEVATED RISK'
    },
    {
      code: 'RES-03',
      label: 'RESOLVED / CONTAINED',
      value: resolved,
      color: 'var(--color-success)',
      tag: 'POST-HAZARD'
    },
    {
      code: 'TOT-04',
      label: 'TOTAL TRACKED',
      value: total,
      color: 'var(--color-accent)',
      tag: 'POSTGIS REGISTRY'
    }
  ];

  return (
    <section
      aria-label="Incident Overview"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-5)'
      }}
    >
      {stats.map((s) => (
        <div
          key={s.code}
          className="aurora-card"
          style={{
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span className="mono-label" style={{ color: 'var(--color-muted)', fontSize: '10px' }}>
              <span className="eyebrow-square" style={{ backgroundColor: s.color }} />
              {s.code}
            </span>

            <span className="mono-label" style={{
              fontSize: '9px',
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-paper)',
              color: s.color,
              border: '1px solid var(--color-rule)'
            }}>
              {s.tag}
            </span>
          </div>

          <div
            className="tnum"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.4rem',
              fontWeight: 700,
              lineHeight: 1,
              color: s.color,
              letterSpacing: '-0.03em',
              margin: '6px 0 2px'
            }}
          >
            {s.value.toString().padStart(2, '0')}
          </div>

          <div className="mono-label" style={{ color: 'var(--color-ink-2)', fontSize: '11px' }}>
            {s.label}
          </div>
        </div>
      ))}
    </section>
  );
}
