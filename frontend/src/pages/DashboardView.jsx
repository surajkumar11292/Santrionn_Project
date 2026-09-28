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

        {/* Right: Live Broadcast Stream & Active Incidents Queue */}
        <section aria-label="Real-Time Feed and Incidents" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <LiveFeed events={liveEvents} isConnected={isSocketConnected} />

          {/* Incidents displayed right below the Broadcast Feed */}
          {disasters.length > 0 && (
            <div
              className="aurora-card"
              style={{
                padding: '20px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid var(--color-rule)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--color-rule)',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-forest)'
                  }} />
                  <h3 style={{
                    fontSize: '1.15rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    color: 'var(--color-ink)'
                  }}>
                    Active Incidents
                  </h3>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-muted)'
                }}>
                  {disasters.length} tracked
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {disasters.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => onSelectDisaster && onSelectDisaster(d)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--color-paper)',
                      border: '1px solid var(--color-rule)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-forest)';
                      e.currentTarget.style.backgroundColor = 'var(--color-forest-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-rule)';
                      e.currentTarget.style.backgroundColor = 'var(--color-paper)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--color-ink)',
                        lineHeight: 1.3
                      }}>
                        {d.title}
                      </h4>
                      <span style={{
                        fontSize: '9.5px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: d.status === 'active' ? '#fef2f2' : d.status === 'monitoring' ? '#fffbeb' : '#e8f0eb',
                        color: d.status === 'active' ? '#b91c1c' : d.status === 'monitoring' ? '#b45309' : 'var(--color-forest)',
                        border: `1px solid ${d.status === 'active' ? '#fecaca' : d.status === 'monitoring' ? '#fde68a' : 'var(--color-forest-border)'}`,
                        textTransform: 'uppercase',
                        flexShrink: 0
                      }}>
                        {d.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <span>📍 {d.location_name || d.location?.name || 'Epicenter'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(d.tags || []).slice(0, 2).map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--color-muted)'
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--color-forest)'
                      }}>
                        Inspect →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
