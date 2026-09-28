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
    allDisasters,
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

  const topDisasters = disasters.slice(0, 2);
  const bottomDisasters = disasters.slice(2);

  return (
    <div style={{
      maxWidth: '1320px',
      margin: '0 auto',
      width: '100%',
      padding: '24px 32px 48px'
    }}>
      {/* Semantic accessible title */}
      <h1 className="sr-only">Disaster Response Incident Operations</h1>

      {/* 01 · Status Overview Counters (Remains constant across all filters) */}
      <StatsBar disasters={allDisasters && allDisasters.length > 0 ? allDisasters : disasters} />

      {/* 02 · Top Section: Filter Bar & Top 2 Cards (Left) + Broadcast Feed (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 380px',
        gap: '24px',
        alignItems: 'stretch',
        marginBottom: bottomDisasters.length > 0 ? '20px' : '0'
      }}>
        {/* Left: Filter Bar + Top 2 Cards (Defines row height) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filter Bar */}
          <div
            className="aurora-card"
            style={{
              padding: '16px 20px',
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
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search incidents by title, location, or keyword..."
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 38px 9px 16px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '13px',
                    border: '1.5px solid var(--color-forest)',
                    boxShadow: '0 0 0 2px rgba(27, 67, 50, 0.10)',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-forest)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: 'absolute',
                    right: '14px',
                    pointerEvents: 'none',
                    opacity: 0.8
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              <select
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
                className="select-status-pill"
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
                  className="btn-nav-pill"
                  style={{ fontSize: '12px', height: '36px', padding: '0 14px' }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Quick Category Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.03em', color: 'var(--color-muted)', marginRight: '2px' }}>
                CATEGORIES:
              </span>
              {quickTags.map((tag) => {
                const isSelected = filters.tag.toLowerCase() === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFilter('tag', isSelected ? '' : tag)}
                    className={`category-tag-pill ${isSelected ? 'active' : ''}`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading, Error or Empty States */}
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
            /* First 2 Incident Cards (alongside Broadcast Feed) */
            <div style={{
              display: 'grid',
              gridTemplateColumns: topDisasters.length === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              gap: '18px'
            }}>
              {topDisasters.map((d) => (
                <DisasterCard
                  key={d.id}
                  disaster={d}
                  onSelect={onSelectDisaster}
                  onDelete={handleDeleteDisaster}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Broadcast Feed (Levels exactly with the 2 incident cards on the left) */}
        <aside aria-label="Real-Time Feed" style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <LiveFeed events={liveEvents} isConnected={isSocketConnected} />
          </div>
        </aside>
      </div>

      {/* 03 · Bottom Grid: 3 incident cards per row across the full width where broadcast feed is not there */}
      {bottomDisasters.length > 0 && (
        <section aria-label="All Incidents Grid">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '18px'
          }}>
            {bottomDisasters.map((d) => (
              <DisasterCard
                key={d.id}
                disaster={d}
                onSelect={onSelectDisaster}
                onDelete={handleDeleteDisaster}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
