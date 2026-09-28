/* Theme: Editorial Linen & Forest Green (suraj-portfolio-io.vercel.app)
 * Status Overview Counters
 */
import React from 'react';

export default function StatsBar({ disasters = [] }) {
  const total = disasters.length;
  const active = disasters.filter((d) => d.status === 'active').length;
  const monitoring = disasters.filter((d) => d.status === 'monitoring').length;
  const resolved = disasters.filter((d) => d.status === 'resolved').length;

  const stats = [
    {
      label: 'Active Incidents',
      value: active,
      color: '#b91c1c'
    },
    {
      label: 'Under Surveillance',
      value: monitoring,
      color: '#b45309'
    },
    {
      label: 'Resolved / Contained',
      value: resolved,
      color: 'var(--color-forest)'
    },
    {
      label: 'Total Incidents Tracked',
      value: total,
      color: 'var(--color-ink)'
    }
  ];

  return (
    <section
      aria-label="Incident Overview"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}
    >
      {stats.map((s, idx) => (
        <div
          key={idx}
          className="aurora-card"
          style={{
            padding: '18px 22px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--color-rule)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)' }}>
              {s.label}
            </span>
          </div>

          <div
            className="tnum"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.8rem',
              fontWeight: 400,
              lineHeight: 1.05,
              color: s.color,
              margin: '6px 0 2px'
            }}
          >
            {s.value.toString().padStart(2, '0')}
          </div>
        </div>
      ))}
    </section>
  );
}
