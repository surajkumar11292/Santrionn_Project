/* Theme: Editorial Linen & Forest Green (suraj-portfolio-io.vercel.app)
 * Incident Dossier Modal - High-Information Clean Layout
 */
import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function DisasterDetailModal({ disaster, onClose, onJoinRoom, onLeaveRoom }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const canPostUpdate = user?.role === 'admin' || user?.role === 'contributor';

  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'updates' | 'reports' | 'images'

  // Tab 1: Resources & Proximity Radar
  const [resources, setResources] = useState([]);
  const [radius, setRadius] = useState(25);
  const [resourceType, setResourceType] = useState('');
  const [newResource, setNewResource] = useState({ name: '', type: 'shelter', latitude: '', longitude: '' });

  // Tab 2: Official Bulletins
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState({ agency: 'Emergency Management Agency', severity: 'warning', headline: '', body: '' });

  // Tab 3: Community Reports
  const [reports, setReports] = useState([]);
  const [syncingReports, setSyncingReports] = useState(false);

  // Tab 4: Incident Photos & Damage Assessment
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState({ imageUrl: '', caption: '' });
  const [analyzingImage, setAnalyzingImage] = useState(false);

  // Join WebSocket Room for Live Updates
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
      console.error('Failed to load photos:', err);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!newResource.name?.trim()) {
      alert('Please provide a resource name.');
      return;
    }

    const rawLat = newResource.latitude !== '' ? parseFloat(newResource.latitude) : disaster.location?.latitude;
    const rawLng = newResource.longitude !== '' ? parseFloat(newResource.longitude) : disaster.location?.longitude;

    if (rawLat === undefined || rawLat === null || isNaN(rawLat) || rawLat < -90 || rawLat > 90) {
      alert('Latitude must be a valid geographic coordinate between -90 and 90 (e.g. 29.2183 for Uttarakhand or 19.0760 for Mumbai).\n\nYou entered: ' + (newResource.latitude || '(empty)'));
      return;
    }

    if (rawLng === undefined || rawLng === null || isNaN(rawLng) || rawLng < -180 || rawLng > 180) {
      alert('Longitude must be a valid geographic coordinate between -180 and 180 (e.g. 79.5130 for Uttarakhand or 72.8777 for Mumbai).\n\nYou entered: ' + (newResource.longitude || '(empty)'));
      return;
    }

    try {
      await api.resources.create(disaster.id, {
        name: newResource.name.trim(),
        type: newResource.type,
        latitude: rawLat,
        longitude: rawLng
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
      alert(`Bulletin transmission failed: ${err.message}`);
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
      alert(`Photo assessment failed: ${err.message}`);
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
        backgroundColor: 'rgba(26, 26, 26, 0.45)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="aurora-card"
        style={{
          maxWidth: '960px',
          width: '100%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--color-rule)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dossier Header */}
        <header style={{
          padding: '22px 30px',
          borderBottom: '1px solid var(--color-rule)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: disaster.status === 'active' ? '#fef2f2' : disaster.status === 'monitoring' ? '#fffbeb' : 'var(--color-forest-subtle)',
                color: disaster.status === 'active' ? '#b91c1c' : disaster.status === 'monitoring' ? '#b45309' : 'var(--color-forest)',
                border: `1px solid ${disaster.status === 'active' ? '#fecaca' : disaster.status === 'monitoring' ? '#fde68a' : 'var(--color-forest-border)'}`
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: disaster.status === 'active' ? '#b91c1c' : disaster.status === 'monitoring' ? '#b45309' : 'var(--color-forest)'
                }} />
                {disaster.status?.toUpperCase()}
              </span>

              {lat !== undefined && lng !== undefined && (
                <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>
                  COORDINATES: [{lat.toFixed(4)}, {lng.toFixed(4)}]
                </span>
              )}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.9rem',
              fontWeight: 400,
              letterSpacing: '-0.015em',
              color: 'var(--color-ink)',
              margin: '2px 0 4px 0'
            }}>
              {disaster.title}
            </h1>

            <div style={{ fontSize: '13px', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>📍 {disaster.location?.name || 'Unspecified Epicenter'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--color-ink)',
              border: '1px solid var(--color-rule-2)',
              backgroundColor: 'var(--color-paper)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ✕ Close
          </button>
        </header>

        {/* Tab Navigation Ribbon */}
        <nav
          className="modal-tab-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 30px',
            borderBottom: '1px solid var(--color-rule)',
            backgroundColor: 'var(--color-paper)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {[
            { id: 'resources', label: 'Nearby Resources', count: resources.length },
            { id: 'updates', label: 'Official Bulletins', count: updates.length },
            { id: 'reports', label: 'Community Reports', count: reports.length },
            { id: 'images', label: 'Incident Photos', count: images.length }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  height: '34px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  lineHeight: 1,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--color-ink-2)',
                  backgroundColor: isActive ? 'var(--color-forest)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxSizing: 'border-box'
                }}
              >
                <span>{tab.label}</span>
                <span style={{ opacity: isActive ? 0.9 : 0.6, fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  [{tab.count}]
                </span>
              </button>
            );
          })}
        </nav>

        {/* Tab Panel Body */}
        <div style={{ padding: '24px 30px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: PROXIMITY RADAR */}
          {activeTab === 'resources' && (
            <div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 18px',
                backgroundColor: 'var(--color-paper)',
                border: '1px solid var(--color-rule)',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)' }}>
                    Radar Radius:
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    style={{
                      width: '140px',
                      height: '6px',
                      borderRadius: '999px',
                      background: `linear-gradient(to right, var(--color-forest) 0%, var(--color-forest) ${(radius / 50) * 100}%, #e5e7eb ${(radius / 50) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--color-forest)' }}>
                    {radius} KM
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)' }}>
                    Category:
                  </label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      background: '#ffffff',
                      border: '1px solid var(--color-rule)',
                      borderRadius: 'var(--radius-pill)',
                      color: 'var(--color-ink)',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    <option value="">ALL RESOURCES</option>
                    <option value="shelter">Shelters</option>
                    <option value="hospital">Hospitals</option>
                    <option value="food">Food Depots</option>
                    <option value="water">Water Points</option>
                    <option value="rescue">Rescue Units</option>
                  </select>
                </div>
              </div>

              {resources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-muted)', fontSize: '14px' }}>
                  No relief assets detected within {radius}km radius.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                  {resources.map((res) => (
                    <div
                      key={res.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--color-rule)',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--color-forest-subtle)',
                          color: 'var(--color-forest)'
                        }}>
                          {res.type?.toUpperCase()}
                        </span>
                        <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-forest)', fontWeight: 700 }}>
                          {res.distance_km !== null && res.distance_km !== undefined ? `${Number(res.distance_km).toFixed(1)} km` : 'Near'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)' }}>
                        {res.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        [{(res.location?.latitude ?? res.latitude)?.toFixed(4)}, {(res.location?.longitude ?? res.longitude)?.toFixed(4)}]
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Admin Asset Provisioning Form */}
              {isAdmin && (
                <form onSubmit={handleCreateResource} style={{
                  marginTop: '24px',
                  padding: '18px 20px',
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid var(--color-rule)',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '12px' }}>
                    + Provision Emergency Asset (Admin)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.1fr 1.1fr auto', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Resource name (e.g. Relief Food Center)"
                      value={newResource.name}
                      onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
                      required
                    />
                    <select
                      value={newResource.type}
                      onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                      style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', backgroundColor: '#ffffff' }}
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
                      min="-90"
                      max="90"
                      placeholder="Lat (-90 to 90)"
                      value={newResource.latitude}
                      onChange={(e) => setNewResource({ ...newResource, latitude: e.target.value })}
                      style={{ padding: '8px 10px', fontSize: '13px', borderRadius: '8px' }}
                      title="Geographic Latitude between -90 and 90"
                    />
                    <input
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      placeholder="Lng (-180 to 180)"
                      value={newResource.longitude}
                      onChange={(e) => setNewResource({ ...newResource, longitude: e.target.value })}
                      style={{ padding: '8px 10px', fontSize: '13px', borderRadius: '8px' }}
                      title="Geographic Longitude between -180 and 180"
                    />
                    <button
                      type="submit"
                      className="btn-forest"
                      style={{ padding: '8px 18px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      Deploy
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
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-muted)', fontSize: '14px' }}>
                  No official emergency bulletins registered for this episode.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {updates.map((upd) => (
                    <div
                      key={upd.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--color-rule)',
                        borderRadius: '12px',
                        padding: '18px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)' }}>
                          🏛️ {upd.agency}
                        </span>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '11px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: upd.severity === 'evacuation' ? '#b91c1c' : '#b45309',
                          background: upd.severity === 'evacuation' ? '#fef2f2' : '#fffbeb',
                          border: `1px solid ${upd.severity === 'evacuation' ? '#fecaca' : '#fde68a'}`
                        }}>
                          {upd.severity?.toUpperCase()}
                        </span>
                      </div>
                      {upd.headline && (
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)', marginBottom: '6px' }}>
                          {upd.headline}
                        </div>
                      )}
                      <div style={{ fontSize: '13px', color: 'var(--color-ink-2)', lineHeight: 1.55 }}>
                        {upd.body || upd.message}
                      </div>
                      <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', marginTop: '8px' }}>
                        {upd.issued_at || upd.created_at ? new Date(upd.issued_at || upd.created_at).toLocaleString() : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* First Responder Bulletin Broadcast Form */}
              {canPostUpdate && (
                <form onSubmit={handleCreateUpdate} style={{
                  marginTop: '24px',
                  padding: '18px 20px',
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid var(--color-rule)',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '12px' }}>
                    + Broadcast Official Bulletin
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="Dispatch Agency (e.g. Civil Defense)"
                      value={newUpdate.agency}
                      onChange={(e) => setNewUpdate({ ...newUpdate, agency: e.target.value })}
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
                      required
                    />
                    <select
                      value={newUpdate.severity}
                      onChange={(e) => setNewUpdate({ ...newUpdate, severity: e.target.value })}
                      style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', backgroundColor: '#ffffff' }}
                    >
                      <option value="advisory">Advisory Notice</option>
                      <option value="warning">Active Warning</option>
                      <option value="evacuation">Mandatory Evacuation</option>
                      <option value="all_clear">All Clear</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Advisory headline (e.g. Flash Flood Alert in Sector 4)..."
                      value={newUpdate.headline}
                      onChange={(e) => setNewUpdate({ ...newUpdate, headline: e.target.value })}
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
                      required
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Detailed safety protocol or evacuation directive..."
                        value={newUpdate.body}
                        onChange={(e) => setNewUpdate({ ...newUpdate, body: e.target.value })}
                        style={{ flex: 1, padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
                        required
                      />
                      <button
                        type="submit"
                        className="btn-forest"
                        style={{ padding: '8px 20px', fontSize: '12px' }}
                      >
                        Transmit
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNITY INTEL */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)' }}>
                  COMMUNITY FIELD REPORTS
                </span>
                <button
                  type="button"
                  onClick={handleSyncReports}
                  disabled={syncingReports}
                  className="btn-outline"
                  style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 600 }}
                >
                  {syncingReports ? 'Syncing...' : '↻ Refresh Reports'}
                </button>
              </div>

              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-muted)', fontSize: '14px' }}>
                  No community reports logged for this incident yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--color-rule)',
                        borderRadius: '12px',
                        padding: '16px 18px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-ink)' }}>{rep.user}</span>
                          {rep.verified_user && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: 'var(--color-forest)',
                              backgroundColor: 'var(--color-forest-subtle)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-pill)'
                            }}>
                              ☑ VERIFIED
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-pill)',
                          color: rep.priority === 'critical' ? '#b91c1c' : '#b45309',
                          backgroundColor: rep.priority === 'critical' ? '#fef2f2' : '#fffbeb'
                        }}>
                          {rep.priority?.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-ink-2)', lineHeight: 1.5 }}>
                        {rep.content || rep.message}
                      </div>
                      <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', marginTop: '6px' }}>
                        {rep.created_at || rep.timestamp ? new Date(rep.created_at || rep.timestamp).toLocaleString() : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INCIDENT PHOTOS & DAMAGE ASSESSMENTS */}
          {activeTab === 'images' && (
            <div>
              <div style={{
                padding: '14px 18px',
                backgroundColor: 'var(--color-paper)',
                border: '1px solid var(--color-rule)',
                borderRadius: '12px',
                marginBottom: '18px',
                fontSize: '13px',
                color: 'var(--color-ink-2)',
                lineHeight: 1.55
              }}>
                <strong style={{ color: 'var(--color-ink)' }}>Incident Photography:</strong> Document structural damage, road closures, and site conditions.
              </div>

              {/* Submit Photo Form */}
              <form onSubmit={handleVerifyImage} style={{
                padding: '18px 20px',
                backgroundColor: 'var(--color-paper)',
                border: '1px solid var(--color-rule)',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '10px' }}>
                  + Submit Incident Photo URL
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr auto', gap: '8px' }}>
                  <input
                    type="url"
                    placeholder="https://example.com/flood-damage.jpg"
                    value={newImage.imageUrl}
                    onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                    style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Caption (e.g. Sector 4 levee breach)"
                    value={newImage.caption}
                    onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                    style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
                  />
                  <button
                    type="submit"
                    disabled={analyzingImage}
                    className="btn-forest"
                    style={{ padding: '8px 18px', fontSize: '12px' }}
                  >
                    {analyzingImage ? 'Processing...' : 'Upload Photo →'}
                  </button>
                </div>
              </form>

              {images.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-muted)', fontSize: '14px' }}>
                  No photos submitted for this incident yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {images.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--color-rule)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <img
                        src={img.image_url || img.imageUrl}
                        alt={img.caption || 'Incident damage assessment'}
                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderBottom: '1px solid var(--color-rule)' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            color: (img.damage_severity || img.severity) === 'critical' || (img.damage_severity || img.severity) === 'catastrophic' ? '#b91c1c' : '#b45309',
                            backgroundColor: (img.damage_severity || img.severity) === 'critical' || (img.damage_severity || img.severity) === 'catastrophic' ? '#fef2f2' : '#fffbeb'
                          }}>
                            {(img.damage_severity || img.severity)?.toUpperCase()} DAMAGE
                          </span>
                          <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)' }}>
                            {Math.round(((img.confidence_score !== undefined ? img.confidence_score : img.damage_score) || 0.95) * ((img.confidence_score !== undefined && img.confidence_score <= 1) ? 100 : 1))}% CONFIDENCE
                          </span>
                        </div>

                        {img.caption && (
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                            {img.caption}
                          </div>
                        )}

                        {(img.detected_hazards || img.hazard_tags) && (img.detected_hazards || img.hazard_tags).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                            {(img.detected_hazards || img.hazard_tags).map((tag, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--radius-pill)',
                                  background: 'var(--color-paper)',
                                  border: '1px solid var(--color-rule)',
                                  color: 'var(--color-muted)'
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
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
