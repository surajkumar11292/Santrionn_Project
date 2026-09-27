/* Hallmark Theme: Aurora (usehallmark.com)
 * Disaster Operations Cockpit - High-Density Single-View Layout
 */
import React, { useEffect } from 'react';
import { useDisasterStore } from '../store/disasterStore';
import StatsBar from '../components/StatsBar';
import DisasterCard from '../components/DisasterCard';
import LiveFeed from '../components/LiveFeed';
import { api } from '../api/client';

export default function DashboardView({ onSelectDisaster, liveEvents = [], isSocketConnected = false }) {
  const {
    disasters,
    loading,
    error,
    filters,
    fetchDisasters,
    setFilter,
    resetFilters
  } = useDisasterStore();

  useEffect(() => {
    fetchDisasters();
  }, []);

  const handleDeleteDisaster = async (id) => {
    if (!window.confirm('Confirm de-registration of this active incident record?')) return;
    try {
      await api.disasters.delete(id);
      fetchDisasters();
    } catch (err) {
      alert(`De-registration failed: ${err.message}`);
    }
  };

  const quickTags = ['flood', 'fire', 'earthquake', 'storm', 'medical', 'hurricane'];

  return (
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto',
      width: '100%',
      padding: 'var(--space-6)'
    }}>
      {/* Header Eyebrow & Platform Identification */}
      <header style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="eyebrow-square" />
          <span className="mono-label" style={{ color: 'var(--color-accent)', letterSpacing: '0.12em' }}>
            CRISIS OPERATIONS · REAL-TIME TRIAGE
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 3.8vw, 3rem)',
          fontWeight: 700,
          color: 'var(--color-ink)',
          marginBottom: '6px'
        }}>
          Disaster Response Coordination
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--color-ink-2)',
          maxWidth: '56ch',
          lineHeight: 1.5
        }}>
          Real-time crisis telemetry, PostGIS spatial radar, and multi-agency emergency resource dispatch.
        </p>
      </header>

      {/* 01 · Instant Status Counters (Zero-Click Metric Visibility) */}
      <StatsBar disasters={disasters} />

      {/* 02 · Main Operations Grid (Triage Cards 70% + Live Stream 30%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: 'var(--space-5)',
        alignItems: 'start'
      }}>
        {/* Left: Search, Filters & Incident Cards */}
        <section aria-label="Incident Triage Registry">
          {/* Quick Filter Strip */}
          <div
            className="aurora-card"
            style={{
              padding: '12px 16px',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search incidents by name, city, district, or keyword..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '13px'
                }}
              />

              <select
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
                className="mono-label"
                style={{
                  padding: '8px 12px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                <option value="">ALL STATUSES</option>
                <option value="active">CRITICAL / ACTIVE</option>
                <option value="monitoring">MONITORING</option>
                <option value="resolved">RESOLVED</option>
              </select>

              {(filters.tag || filters.status || filters.search) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-outline"
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  RESET
                </button>
              )}
            </div>

            {/* Quick Tag Category Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span className="mono-label" style={{ fontSize: '10px', color: 'var(--color-muted)' }}>
                CATEGORY:
              </span>
              {quickTags.map((tag) => {
                const isSelected = filters.tag.toLowerCase() === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFilter('tag', isSelected ? '' : tag)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-paper)',
                      color: isSelected ? '#030d11' : 'var(--color-ink-2)',
                      border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-rule)'}`,
                      fontWeight: isSelected ? 700 : 400,
                      cursor: 'pointer'
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incident Cards Grid */}
          {loading && disasters.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              color: 'var(--color-muted)',
              fontSize: '13px'
            }}>
              Loading crisis incident records...
            </div>
          ) : error ? (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--color-critical-dim)',
              border: '1px solid var(--color-critical-border)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--color-critical)',
              fontSize: '13px'
            }}>
              {error}
            </div>
          ) : disasters.length === 0 ? (
            <div className="aurora-card" style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              color: 'var(--color-muted)'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                No Incidents Found
              </div>
              <div style={{ fontSize: '12px' }}>
                No active events match current filters. Log a new disaster or reset filters.
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: 'var(--space-4)'
            }}>
              {disasters.map((d) => (
                <DisasterCard
                  key={d.id}
                  disaster={d}
                  onSelect={onSelectDisaster}
                  onDelete={handleDeleteDisaster}
                />
              ))}
            </div>
          )}
        </section>

        {/* Right: Real-Time Stream (No navigation needed to view updates) */}
        <section aria-label="Real-Time Telemetry Feed">
          <LiveFeed events={liveEvents} isConnected={isSocketConnected} />
        </section>
      </div>
    </div>
  );
}
