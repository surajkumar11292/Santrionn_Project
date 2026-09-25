import React, { useEffect } from 'react';
import { useDisasterStore } from '../store/disasterStore';
import StatsBar from '../components/StatsBar';
import DisasterCard from '../components/DisasterCard';
import LiveFeed from '../components/LiveFeed';
import { api } from '../api/client';

export default function DashboardView({ onSelectDisaster, liveEvents, isSocketConnected }) {
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
    if (!window.confirm('Are you sure you want to permanently remove this incident?')) return;
    try {
      await api.disasters.delete(id);
      fetchDisasters();
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const quickTags = ['flood', 'fire', 'hurricane', 'storm', 'earthquake'];

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* KPI Stats */}
      <StatsBar disasters={disasters} />

      {/* Main Grid: Left = Incidents (70%), Right = Live Feed (30%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
        gap: 'var(--space-6)',
        alignItems: 'start'
      }}>
        {/* Left Column: Filter Controls & Incidents List */}
        <div>
          {/* Filter Bar */}
          <div style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search disasters by title or description..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              />

              <select
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="monitoring">Monitoring Only</option>
                <option value="resolved">Resolved Only</option>
              </select>

              {(filters.tag || filters.status || filters.search) && (
                <button
                  onClick={resetFilters}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-elevated)'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Quick Tag Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Filter by Tag:
              </span>
              {quickTags.map((tag) => {
                const isSelected = filters.tag.toLowerCase() === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setFilter('tag', isSelected ? '' : tag)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: isSelected ? 'var(--color-info)' : 'var(--color-bg-elevated)',
                      color: isSelected ? 'white' : 'var(--color-text-secondary)',
                      border: `1px solid ${isSelected ? 'var(--color-info)' : 'var(--color-border)'}`,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incidents Grid */}
          {loading && disasters.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-10)',
              color: 'var(--color-text-muted)',
              fontSize: '1rem'
            }}>
              Loading active disaster intelligence...
            </div>
          ) : error ? (
            <div style={{
              padding: 'var(--space-6)',
              background: 'var(--color-critical-dim)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-critical)',
              textAlign: 'center'
            }}>
              {error}
            </div>
          ) : disasters.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-12)',
              background: 'var(--color-bg-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-text-muted)'
            }}>
              <h3>No Disaster Incidents Found</h3>
              <p style={{ fontSize: '0.875rem', marginTop: '6px' }}>
                Try adjusting your search criteria or register a new disaster incident.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
        </div>

        {/* Right Column: Live Event Feed (Socket.IO Real-Time Stream) */}
        <div>
          <LiveFeed events={liveEvents} isConnected={isSocketConnected} />
        </div>
      </div>
    </div>
  );
}
