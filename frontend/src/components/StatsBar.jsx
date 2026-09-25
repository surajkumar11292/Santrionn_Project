import React from 'react';

export default function StatsBar({ disasters }) {
  const total = disasters.length;
  const active = disasters.filter((d) => d.status === 'active').length;
  const monitoring = disasters.filter((d) => d.status === 'monitoring').length;
  const resolved = disasters.filter((d) => d.status === 'resolved').length;

  const stats = [
    { label: 'Active Incidents', value: active, color: '#ef4444', icon: '🚨', bg: 'rgba(239, 68, 68, 0.1)' },
    { label: 'Under Monitoring', value: monitoring, color: '#f59e0b', icon: '⚠️', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Resolved Events', value: resolved, color: '#10b981', icon: '✅', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Total Tracked', value: total, color: '#3b82f6', icon: '🌐', bg: 'rgba(59, 130, 246, 0.1)' }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-6)'
    }}>
      {stats.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{
            fontSize: '1.5rem',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: item.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${item.color}33`
          }}>
            {item.icon}
          </div>
          <div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              lineHeight: 1.1
            }}>
              {item.value}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              marginTop: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
