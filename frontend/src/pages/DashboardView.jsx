/* Theme: Editorial Linen & Forest Green (suraj-portfolio-io.vercel.app)
 * Disaster Operations Dashboard
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
    if (!window.confirm('Confirm deletion of this incident record?')) return;
    try {
      await api.disasters.delete(id);
      fetchDisasters();
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const quickTags = ['flood', 'fire', 'earthquake', 'storm', 'medical', 'hurricane'];

  return (
    <div style={{
      maxWidth: '1320px',
      margin: '0 auto',
      width: '100%',
      padding: '24px 32px 48px'
    }}>
      {/* Semantic accessible title */}
      <h1 className="sr-only">Disaster Response Incident Operations</h1>

      {/* 01 · Status Overview Counters */}
      <StatsBar disasters={disasters} />

      {/* 02 · Main Grid (Incident Cards 70% + Live Feed 30%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left: Search, Filters & Incident Cards */}
        <section aria-label="Incident Registry">
          {/* Filter Bar */}
          <div
            className="aurora-card"
            style={{
              padding: '16px 20px',
              marginBottom: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--color-rule)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search incidents by title, location, or keyword..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '13px'
                }}
              />

              <select
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="">ALL STATUSES</option>
                <option value="active">ACTIVE</option>
                <option value="monitoring">MONITORING</option>
                <option value="resolved">RESOLVED</option>
              </select>

              {(filters.tag || filters.status || filters.search) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-outline"
                  style={{ fontSize: '12px', padding: '7px 14px' }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Quick Category Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', marginRight: '2px' }}>
                CATEGORIES:
              </span>
              {quickTags.map((tag) => {
                const isSelected = filters.tag.toLowerCase() === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFilter('tag', isSelected ? '' : tag)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: isSelected ? 'var(--color-forest)' : 'var(--color-paper-pill)',
                      color: isSelected ? '#ffffff' : 'var(--color-forest)',
                      border: `1px solid ${isSelected ? 'var(--color-forest)' : 'var(--color-rule-2)'}`,
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
              padding: '48px',
              color: 'var(--color-muted)',
              fontSize: '14px'
            }}>
              Loading incident records...
            </div>
          ) : error ? (
            <div style={{
              padding: '14px 18px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#b91c1c',
              fontSize: '13px'
            }}>
              {error}
            </div>
          ) : disasters.length === 0 ? (
            <div className="aurora-card" style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--color-rule)'
            }}>
              <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: '4px' }}>
                No Incidents Found
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                No active events match current filters.
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '18px'
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

        {/* Right: Live Broadcast Stream */}
        <section aria-label="Real-Time Feed">
          <LiveFeed events={liveEvents} isConnected={isSocketConnected} />
        </section>
      </div>
    </div>
  );
}
