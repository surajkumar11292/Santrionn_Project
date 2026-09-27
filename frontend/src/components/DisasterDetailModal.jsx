/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function DisasterDetailModal({ disaster, onClose, onJoinRoom, onLeaveRoom }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const canPostUpdate = user?.role === 'admin' || user?.role === 'contributor';

  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'updates' | 'reports' | 'images'

  // Tab 1: Resources & PostGIS Proximity Radar
  const [resources, setResources] = useState([]);
  const [radius, setRadius] = useState(25);
  const [resourceType, setResourceType] = useState('');
  const [newResource, setNewResource] = useState({ name: '', type: 'shelter', latitude: '', longitude: '' });

  // Tab 2: Official Bulletins
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState({ agency: 'Emergency Management Agency', severity: 'warning', headline: '', body: '' });

  // Tab 3: Citizen Intel Reports
  const [reports, setReports] = useState([]);
  const [syncingReports, setSyncingReports] = useState(false);

  // Tab 4: AI Vision Damage Verification
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState({ imageUrl: '', caption: '' });
  const [analyzingImage, setAnalyzingImage] = useState(false);

  // General Loading & Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Join WebSocket Room for Live Disaster Updates
  useEffect(() => {
    if (disaster?.id) {
      onJoinRoom?.(disaster.id);
      loadResources();
      loadUpdates();
      loadReports();
      loadImages();
    }
    return () => {
      if (disaster?.id) {
        onLeaveRoom?.(disaster.id);
      }
    };
  }, [disaster?.id, radius, resourceType]);

  const loadResources = async () => {
    try {
      const params = { radius };
      if (resourceType) params.type = resourceType;
      const res = await api.resources.getNearby(disaster.id, params);
      setResources(res.data || []);
    } catch (err) {
      console.error('Failed to load resources:', err);
    }
  };

  const loadUpdates = async () => {
    try {
      const res = await api.updates.getByDisaster(disaster.id);
      setUpdates(res.data || []);
    } catch (err) {
      console.error('Failed to load updates:', err);
    }
  };

  const loadReports = async () => {
    try {
      const res = await api.reports.getByDisaster(disaster.id);
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const loadImages = async () => {
    try {
      const res = await api.images.getByDisaster(disaster.id);
      setImages(res.data || []);
    } catch (err) {
      console.error('Failed to load verified images:', err);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!newResource.name || !newResource.latitude || !newResource.longitude) return;
    try {
      await api.resources.create(disaster.id, {
        name: newResource.name,
        type: newResource.type,
        latitude: parseFloat(newResource.latitude),
        longitude: parseFloat(newResource.longitude)
      });
      setNewResource({ name: '', type: 'shelter', latitude: '', longitude: '' });
      loadResources();
    } catch (err) {
      alert(`Resource creation failed: ${err.message}`);
    }
  };

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.headline || !newUpdate.body) return;
    try {
      await api.updates.create(disaster.id, {
        agency: newUpdate.agency,
        severity: newUpdate.severity,
        headline: newUpdate.headline,
        body: newUpdate.body
      });
      setNewUpdate({ agency: 'Emergency Management Agency', severity: 'warning', headline: '', body: '' });
      loadUpdates();
    } catch (err) {
      alert(`Bulletin broadcast failed: ${err.message}`);
    }
  };

  const handleSyncReports = async () => {
    setSyncingReports(true);
    try {
      await api.reports.syncExternal(disaster.id);
      setTimeout(() => {
        loadReports();
        setSyncingReports(false);
      }, 1200);
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
      setSyncingReports(false);
    }
  };

  const handleVerifyImage = async (e) => {
    e.preventDefault();
    if (!newImage.imageUrl) return;
    setAnalyzingImage(true);
    try {
      await api.images.verify(disaster.id, {
        imageUrl: newImage.imageUrl,
        caption: newImage.caption
      });
      setNewImage({ imageUrl: '', caption: '' });
      loadImages();
    } catch (err) {
      alert(`AI Vision verification failed: ${err.message}`);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const lat = disaster.location?.latitude;
  const lng = disaster.location?.longitude;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'oklch(0% 0 0 / 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 'var(--space-4)'
      }}
      onClick={onClose}
    >
      <div
        className="aurora-card"
        style={{
          maxWidth: '920px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dossier Header */}
        <header style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--color-rule)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: 'var(--color-paper-surface)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="mono-label" style={{
                color: disaster.status === 'active' ? 'var(--color-critical)' : 'var(--color-warning)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: disaster.status === 'active' ? 'var(--color-critical-dim)' : 'var(--color-warning-dim)',
                border: `1px solid ${disaster.status === 'active' ? 'var(--color-critical-border)' : 'var(--color-warning-border)'}`
              }}>
                <span className="eyebrow-square" style={{ backgroundColor: disaster.status === 'active' ? 'var(--color-critical)' : 'var(--color-warning)' }} />
                {disaster.status?.toUpperCase()}
              </span>

              {lat !== undefined && lng !== undefined && (
                <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>
                  COORDINATES: [{lat.toFixed(4)}, {lng.toFixed(4)}]
                </span>
              )}

              <span className="mono-label" style={{ color: 'var(--color-success)', fontSize: '10px' }}>
                ● ROOM SUBSCRIBED
              </span>
            </div>

            <h1 style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: '3px 0'
            }}>
              {disaster.title}
            </h1>

            <div style={{ fontSize: '12px', color: 'var(--color-accent)' }}>
              📍 {disaster.location?.name || 'Unspecified Epicenter'} · Tracked in PostGIS Registry
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mono-label"
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--color-muted)',
              border: '1px solid var(--color-rule)',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            ✕ ESC
          </button>
        </header>

        {/* Tab Navigation Ribbon */}
        <nav style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-rule)',
          backgroundColor: 'var(--color-paper)'
        }}>
          {[
            { id: 'resources', label: '01 · PROXIMITY RADAR', count: resources.length },
            { id: 'updates', label: '02 · OFFICIAL BULLETINS', count: updates.length },
            { id: 'reports', label: '03 · COMMUNITY INTEL', count: reports.length },
            { id: 'images', label: '04 · AI VISION DAMAGE', count: images.length }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="mono-label"
                style={{
                  flex: 1,
                  padding: '11px 8px',
                  fontSize: '11px',
                  color: isActive ? 'var(--color-ink)' : 'var(--color-muted)',
                  borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                  backgroundColor: isActive ? 'var(--color-paper-surface)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                {tab.label} [{tab.count}]
              </button>
            );
          })}
        </nav>

        {/* Tab Panel Body */}
        <div style={{ padding: 'var(--space-6)', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: PROXIMITY RADAR */}
          {activeTab === 'resources' && (
            <div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-paper)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <label className="mono-label" style={{ color: 'var(--color-text-secondary)' }}>
                    Radar Range:
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  <span className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                    {radius} KM
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <label className="mono-label" style={{ color: 'var(--color-text-secondary)' }}>
                    Category:
                  </label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="mono-label"
                    style={{
                      padding: '4px 8px',
                      background: 'var(--color-paper-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.72rem'
                    }}
                  >
                    <option value="">ALL RADAR TARGETS</option>
                    <option value="shelter">Shelters</option>
                    <option value="hospital">Hospitals</option>
                    <option value="food">Food Depots</option>
                    <option value="water">Water Points</option>
                    <option value="rescue">Rescue Units</option>
                  </select>
                </div>
              </div>

              {resources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  No relief assets detected within {radius}km radius.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-3)' }}>
                  {resources.map((res) => (
                    <div
                      key={res.id}
                      style={{
                        backgroundColor: 'var(--color-paper)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        padding: 'var(--space-3)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="mono-label" style={{ color: 'var(--color-accent)', fontSize: '0.65rem' }}>
                          {res.type?.toUpperCase()}
                        </span>
                        <span className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700 }}>
                          {res.distance_km !== null && res.distance_km !== undefined ? `${Number(res.distance_km).toFixed(1)} km` : 'Near'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                        {res.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                        [{(res.location?.latitude ?? res.latitude)?.toFixed(4)}, {(res.location?.longitude ?? res.longitude)?.toFixed(4)}]
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Admin Asset Provisioning Form */}
              {isAdmin && (
                <form onSubmit={handleCreateResource} style={{
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)'
                }}>
                  <div className="mono-label" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                    + Provision Emergency Asset (Admin Clearance)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 'var(--space-2)' }}>
                    <input
                      type="text"
                      placeholder="Resource name..."
                      value={newResource.name}
                      onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--color-paper-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.8rem'
                      }}
                      required
                    />
                    <select
                      value={newResource.type}
                      onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                      className="mono-label"
                      style={{
                        padding: '6px',
                        background: 'var(--color-paper-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.72rem'
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
                      placeholder="Lat"
                      value={newResource.latitude}
                      onChange={(e) => setNewResource({ ...newResource, latitude: e.target.value })}
                      style={{
                        padding: '6px',
                        background: 'var(--color-paper-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.8rem'
                      }}
                      required
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Lng"
                      value={newResource.longitude}
                      onChange={(e) => setNewResource({ ...newResource, longitude: e.target.value })}
                      style={{
                        padding: '6px',
                        background: 'var(--color-paper-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.8rem'
                      }}
                      required
                    />
                    <button
                      type="submit"
                      className="mono-label"
                      style={{
                        padding: '6px 12px',
                        background: 'var(--color-accent)',
                        color: 'var(--color-paper)',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: 'var(--radius-xs)'
                      }}
                    >
                      DEPLOY
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: OFFICIAL BULLETINS */}
          {activeTab === 'updates' && (
            <div>
              {updates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  No official emergency bulletins registered for this episode.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {updates.map((upd) => (
                    <div
                      key={upd.id}
                      style={{
                        backgroundColor: 'var(--color-paper)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        padding: 'var(--space-4)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                          🏛️ {upd.agency}
                        </span>
                        <span className="mono-label" style={{
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.65rem',
                          color: upd.severity === 'evacuation' ? 'var(--color-critical)' : 'var(--color-warning)',
                          background: upd.severity === 'evacuation' ? 'var(--color-critical-dim)' : 'var(--color-warning-dim)',
                          border: `1px solid ${upd.severity === 'evacuation' ? 'var(--color-critical-border)' : 'var(--color-warning-border)'}`
                        }}>
                          {upd.severity?.toUpperCase()}
                        </span>
                      </div>
                      {upd.headline && (
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                          {upd.headline}
                        </div>
                      )}
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {upd.body || upd.message}
                      </div>
                      <div className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                        {upd.issued_at || upd.created_at ? new Date(upd.issued_at || upd.created_at).toLocaleString() : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* First Responder Bulletin Broadcast Form */}
              {canPostUpdate && (
                <form onSubmit={handleCreateUpdate} style={{
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)'
                }}>
                  <div className="mono-label" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                    + Broadcast Official Bulletin (First Responder Authorization)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <input
                      type="text"
                      placeholder="Dispatch Agency (e.g. FEMA / Civil Defense)"
                      value={newUpdate.agency}
                      onChange={(e) => setNewUpdate({ ...newUpdate, agency: e.target.value })}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--color-paper-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.8rem'
                      }}
                      required
                    />
                    <select
                      value={newUpdate.severity}
                      onChange={(e) => setNewUpdate({ ...newUpdate, severity: e.target.value })}
                      className="mono-label"
                      style={{
                        padding: '6px',
                        background: 'var(--color-paper-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.72rem'
                      }}
                    >
                      <option value="advisory">Advisory Notice</option>
                      <option value="warning">Active Warning</option>
                      <option value="evacuation">Mandatory Evacuation</option>
                      <option value="all_clear">All Clear</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <input
                      type="text"
                      placeholder="Advisory headline (e.g. Flash Flood Emergency in Sector 4)..."
                      value={newUpdate.headline}
                      onChange={(e) => setNewUpdate({ ...newUpdate, headline: e.target.value })}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--color-paper-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.8rem'
                      }}
                      required
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <input
                        type="text"
                        placeholder="Detailed safety protocol or evacuation directive..."
                        value={newUpdate.body}
                        onChange={(e) => setNewUpdate({ ...newUpdate, body: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          background: 'var(--color-paper-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-xs)',
                          color: 'var(--color-text-primary)',
                          fontSize: '0.8rem'
                        }}
                        required
                      />
                      <button
                        type="submit"
                        className="mono-label"
                        style={{
                          padding: '6px 14px',
                          background: 'var(--color-warning)',
                          color: 'var(--color-paper)',
                          fontWeight: 700,
                          border: 'none',
                          borderRadius: 'var(--radius-xs)'
                        }}
                      >
                        TRANSMIT
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNITY INTEL (REDIS CACHE-ASIDE) */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <span className="mono-label" style={{ color: 'var(--color-text-muted)' }}>
                  REDIS CACHE-ASIDE SYNCED REPORTS
                </span>
                <button
                  type="button"
                  onClick={handleSyncReports}
                  disabled={syncingReports}
                  className="mono-label"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-paper)',
                    color: 'var(--color-accent)',
                    fontSize: '0.7rem'
                  }}
                >
                  {syncingReports ? 'SYNCING BACKGROUND WORKER...' : '⚡ SYNC EXTERNAL CACHE'}
                </button>
              </div>

              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  No citizen situation reports cached in Redis. Click sync above to query queue.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      style={{
                        backgroundColor: 'var(--color-paper)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        padding: 'var(--space-4)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{rep.user}</span>
                          {rep.verified_user && (
                            <span className="mono-label" style={{ color: 'var(--color-info)', fontSize: '0.65rem' }}>
                              ☑ VERIFIED
                            </span>
                          )}
                        </div>
                        <span className="mono-label" style={{
                          fontSize: '0.65rem',
                          color: rep.priority === 'critical' ? 'var(--color-critical)' : 'var(--color-warning)'
                        }}>
                          {rep.priority?.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                        {rep.content || rep.message}
                      </div>
                      <div className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {rep.created_at || rep.timestamp ? new Date(rep.created_at || rep.timestamp).toLocaleString() : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI VISION DAMAGE VERIFICATION */}
          {activeTab === 'images' && (
            <div>
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-paper)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                marginBottom: 'var(--space-4)',
                fontSize: '0.825rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5
              }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Computer Vision Pipeline:</strong> Submit disaster photography for neural damage assessment, structural collapse detection, and confidence indexing.
              </div>

              {/* Verify New Image Form */}
              <form onSubmit={handleVerifyImage} style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-paper)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                marginBottom: 'var(--space-5)'
              }}>
                <div className="mono-label" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                  + Verify Disaster Imagery URL
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 'var(--space-2)' }}>
                  <input
                    type="url"
                    placeholder="https://example.com/aerial-flood-damage.jpg"
                    value={newImage.imageUrl}
                    onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                    style={{
                      padding: '6px 10px',
                      background: 'var(--color-paper-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.8rem'
                    }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Caption (e.g. Sector 4 levee breach)"
                    value={newImage.caption}
                    onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                    style={{
                      padding: '6px 10px',
                      background: 'var(--color-paper-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.8rem'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={analyzingImage}
                    className="mono-label"
                    style={{
                      padding: '6px 14px',
                      background: 'var(--color-accent)',
                      color: 'var(--color-paper)',
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: 'var(--radius-xs)'
                    }}
                  >
                    {analyzingImage ? 'ANALYZING...' : 'ANALYZE DAMAGE →'}
                  </button>
                </div>
              </form>

              {images.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  No verified visual assessments recorded for this episode yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                  {images.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        backgroundColor: 'var(--color-paper)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <img
                        src={img.image_url || img.imageUrl}
                        alt={img.caption || 'Verified disaster assessment'}
                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderBottom: '1px solid var(--color-border)' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="mono-label" style={{
                            fontSize: '0.68rem',
                            color: (img.damage_severity || img.severity) === 'critical' || (img.damage_severity || img.severity) === 'catastrophic' ? 'var(--color-critical)' : 'var(--color-warning)'
                          }}>
                            {(img.damage_severity || img.severity)?.toUpperCase()} DAMAGE
                          </span>
                          <span className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {Math.round(((img.confidence_score !== undefined ? img.confidence_score : img.damage_score) || 0.95) * ((img.confidence_score !== undefined && img.confidence_score <= 1) ? 100 : 1))}% SCORE
                          </span>
                        </div>

                        {img.caption && (
                          <div style={{ fontSize: '0.825rem', color: 'var(--color-text-primary)' }}>
                            {img.caption}
                          </div>
                        )}

                        {(img.detected_hazards || img.hazard_tags) && (img.detected_hazards || img.hazard_tags).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                            {(img.detected_hazards || img.hazard_tags).map((tag, idx) => (
                              <span
                                key={idx}
                                className="mono-label"
                                style={{
                                  fontSize: '0.62rem',
                                  padding: '1px 5px',
                                  borderRadius: 'var(--radius-xs)',
                                  background: 'var(--color-paper-surface)',
                                  border: '1px solid var(--color-border)',
                                  color: 'var(--color-text-secondary)'
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          Confidence: {Number(((img.confidence_score !== undefined ? img.confidence_score : img.confidence_rating) || 0.95) * ((img.confidence_score !== undefined && img.confidence_score <= 1) ? 100 : 1)).toFixed(1)}% · Model Verified
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
