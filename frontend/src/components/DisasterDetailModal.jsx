import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function DisasterDetailModal({ disaster, onClose, onJoinRoom, onLeaveRoom }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState([]);
  const [resourcesMeta, setResourcesMeta] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsMeta, setReportsMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Proximity filter states
  const [radius, setRadius] = useState(15);
  const [resourceType, setResourceType] = useState('');

  // Add Resource state (Admin)
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'shelter',
    latitude: disaster?.location?.latitude || '',
    longitude: disaster?.location?.longitude || ''
  });
  const [creatingResource, setCreatingResource] = useState(false);

  // Subscribe to room
  useEffect(() => {
    if (disaster?.id) {
      onJoinRoom?.(disaster.id);
    }
    return () => {
      if (disaster?.id) {
        onLeaveRoom?.(disaster.id);
      }
    };
  }, [disaster?.id, onJoinRoom, onLeaveRoom]);

  // Load Resources
  const loadResources = async () => {
    if (!disaster?.id) return;
    setLoading(true);
    setError(null);
    try {
      const params = { radius };
      if (resourceType) params.type = resourceType;
      const res = await api.resources.getNearby(disaster.id, params);
      setResources(res.data || []);
      setResourcesMeta(res.meta || null);
    } catch (err) {
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  // Load Reports
  const loadReports = async () => {
    if (!disaster?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.reports.getByDisaster(disaster.id);
      setReports(res.data || []);
      setReportsMeta(res.meta || null);
    } catch (err) {
      setError(err.message || 'Failed to load community reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'resources') {
      loadResources();
    } else if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, radius, resourceType, disaster?.id]);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!newResource.name) return;
    setCreatingResource(true);
    try {
      await api.resources.create(disaster.id, {
        name: newResource.name,
        type: newResource.type,
        latitude: parseFloat(newResource.latitude) || disaster.location.latitude,
        longitude: parseFloat(newResource.longitude) || disaster.location.longitude
      });
      setNewResource({
        name: '',
        type: 'shelter',
        latitude: disaster.location.latitude,
        longitude: disaster.location.longitude
      });
      loadResources();
    } catch (err) {
      alert(`Resource creation failed: ${err.message}`);
    } finally {
      setCreatingResource(false);
    }
  };

  if (!disaster) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(7, 13, 26, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: 'var(--space-4)'
    }}
    onClick={onClose}>
      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '840px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}
      onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-elevated)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                background: disaster.status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: disaster.status === 'active' ? '#ef4444' : '#10b981',
                border: `1px solid ${disaster.status === 'active' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
              }}>
                {disaster.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                ROOM: disaster:{disaster.id.slice(0, 8)}...
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              {disaster.title}
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-info)' }}>
              📍 {disaster.location?.name} ({disaster.location?.latitude?.toFixed(4)}, {disaster.location?.longitude?.toFixed(4)})
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem',
              color: 'var(--color-text-secondary)',
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-base)'
        }}>
          <button
            onClick={() => setActiveTab('resources')}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: activeTab === 'resources' ? 'var(--color-info)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'resources' ? '2px solid var(--color-info)' : '2px solid transparent',
              background: activeTab === 'resources' ? 'var(--color-bg-elevated)' : 'transparent'
            }}
          >
            🏥 Emergency Resources (PostGIS Radius)
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: activeTab === 'reports' ? 'var(--color-critical)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'reports' ? '2px solid var(--color-critical)' : '2px solid transparent',
              background: activeTab === 'reports' ? 'var(--color-bg-elevated)' : 'transparent'
            }}
          >
            📢 Community & Social Feed (Redis Cache)
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: activeTab === 'overview' ? 'var(--color-warning)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'overview' ? '2px solid var(--color-warning)' : '2px solid transparent',
              background: activeTab === 'overview' ? 'var(--color-bg-elevated)' : 'transparent'
            }}
          >
            📝 Incident Overview
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: 'var(--space-5)', overflowY: 'auto', flex: 1 }}>
          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div>
              {/* Radius & Type Filter */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                alignItems: 'center',
                padding: 'var(--space-3)',
                background: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Search Radius:</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    style={{ accentColor: 'var(--color-info)' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {radius} km
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Category:</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="shelter">Shelter</option>
                    <option value="hospital">Hospital</option>
                    <option value="food">Food Depot</option>
                    <option value="water">Water Supply</option>
                    <option value="rescue">Rescue Team</option>
                  </select>
                </div>

                {resourcesMeta && (
                  <div style={{
                    marginLeft: 'auto',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: resourcesMeta.cached ? 'var(--color-success)' : 'var(--color-text-muted)'
                  }}>
                    {resourcesMeta.cached ? `⚡ CACHED (TTL ${resourcesMeta.cache_ttl}s)` : '● POSTGIS ST_DWITHIN'}
                  </div>
                )}
              </div>

              {/* Resource List */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                  Calculating nearest assets with PostGIS ST_DWithin...
                </div>
              ) : resources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                  No emergency resources found within {radius} km radius.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                  {resources.map((res) => (
                    <div
                      key={res.id}
                      style={{
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--color-info)'
                        }}>
                          {res.type}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: '#10b981'
                        }}>
                          {res.distance_km !== null ? `${res.distance_km} km` : 'Near'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {res.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {res.location_name || `${res.latitude?.toFixed(4)}, ${res.longitude?.toFixed(4)}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Admin Add Resource Form */}
              {isAdmin && (
                <form
                  onSubmit={handleCreateResource}
                  style={{
                    marginTop: 'var(--space-6)',
                    padding: 'var(--space-4)',
                    background: 'var(--color-bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                    + Register Emergency Resource (Admin)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 'var(--space-2)' }}>
                    <input
                      type="text"
                      placeholder="Resource name..."
                      value={newResource.name}
                      onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                      required
                    />
                    <select
                      value={newResource.type}
                      onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                      style={{
                        padding: '6px',
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                    >
                      <option value="shelter">Shelter</option>
                      <option value="hospital">Hospital</option>
                      <option value="food">Food</option>
                      <option value="water">Water</option>
                      <option value="rescue">Rescue</option>
                    </select>
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={newResource.latitude}
                      onChange={(e) => setNewResource({ ...newResource, latitude: e.target.value })}
                      style={{
                        padding: '6px',
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={newResource.longitude}
                      onChange={(e) => setNewResource({ ...newResource, longitude: e.target.value })}
                      style={{
                        padding: '6px',
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={creatingResource}
                      style={{
                        padding: '6px 14px',
                        background: 'var(--color-info)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {creatingResource ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div>
              {/* Cache Header */}
              {reportsMeta && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-4)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <span>
                    Status: <strong style={{ color: '#10b981' }}>{reportsMeta.external_status || 'HEALTHY'}</strong>
                  </span>
                  <span style={{ color: reportsMeta.cached ? '#10b981' : '#f59e0b' }}>
                    {reportsMeta.cached ? `⚡ Redis Cache-Aside Hit (TTL ${reportsMeta.cache_ttl}s)` : '● Fresh Fetch & Classification (Cached)'}
                  </span>
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                  Aggregating crisis intelligence stream & applying NLP priority heuristics...
                </div>
              ) : reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                  No community reports registered for this incident.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {reports.map((rep) => {
                    const isCritical = rep.priority === 'critical';
                    const isHigh = rep.priority === 'high';
                    return (
                      <div
                        key={rep.id}
                        style={{
                          background: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border)',
                          borderLeft: `4px solid ${isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#3b82f6'}`,
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-4)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{rep.user}</span>
                            {rep.verified_user && (
                              <span style={{ color: '#3b82f6', fontSize: '0.75rem' }} title="Verified First Responder">
                                ☑️ Verified
                              </span>
                            )}
                            <span style={{
                              fontSize: '0.7rem',
                              color: 'var(--color-text-muted)',
                              background: 'var(--color-bg-elevated)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              {rep.source}
                            </span>
                          </div>

                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: isCritical ? 'rgba(239, 68, 68, 0.2)' : isHigh ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#3b82f6'
                          }}>
                            {rep.priority} PRIORITY
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                          {rep.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Description</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', lineHeight: 1.6, marginTop: '4px' }}>
                  {disaster.description}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Assigned Tags</h4>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {disaster.tags?.map((t, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.8rem',
                      background: 'var(--color-bg-elevated)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)'
                    }}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>PostGIS Spatial Metadata</h4>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  background: 'var(--color-bg-base)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  marginTop: '6px'
                }}>
                  <div>Latitude: {disaster.location?.latitude}</div>
                  <div>Longitude: {disaster.location?.longitude}</div>
                  <div>Location Identifier: {disaster.location?.name}</div>
                  <div>Disaster UUID: {disaster.id}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
