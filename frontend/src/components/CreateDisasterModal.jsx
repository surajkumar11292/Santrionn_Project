/* Hallmark Theme: Aurora (usehallmark.com)
 * Disaster Incident Registration Modal
 */
import React, { useState } from 'react';
import { api } from '../api/client';

export default function CreateDisasterModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    tagsInput: 'flood, urgent',
    location_name: '',
    latitude: '',
    longitude: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Title and description are required for incident registration.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const tags = formData.tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        tags
      };

      if (formData.location_name) payload.location_name = formData.location_name;
      if (formData.latitude) payload.latitude = parseFloat(formData.latitude);
      if (formData.longitude) payload.longitude = parseFloat(formData.longitude);

      const response = await api.disasters.create(payload);
      onSuccess?.(response.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to dispatch disaster incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 13, 17, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="aurora-card"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
          borderBottom: '1px solid var(--color-rule)',
          paddingBottom: '12px'
        }}>
          <div>
            <div className="mono-label" style={{ color: 'var(--color-accent)', marginBottom: '3px', fontSize: '10px' }}>
              <span className="eyebrow-square" />
              INCIDENT REGISTRATION
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)' }}>
              Log Disaster Incident Dossier
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="mono-label"
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--color-muted)',
              border: '1px solid var(--color-rule)',
              backgroundColor: 'transparent'
            }}
          >
            ✕ ESC
          </button>
        </div>

        {error && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: 'var(--color-critical-dim)',
            border: '1px solid var(--color-critical-border)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--color-critical)',
            fontSize: '12px',
            marginBottom: '12px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="mono-label" style={{ display: 'block', marginBottom: '4px' }}>
              Incident Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Flash Flooding in Lower Manhattan, NYC"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="mono-label">Field Description *</label>
              <span className="mono-label" style={{ color: 'var(--color-accent)', fontSize: '10px' }}>
                NLP AUTO-GEOCODE
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Detail emergency conditions. Locations mentioned (e.g. Mumbai, Delhi, Miami, London) are automatically parsed into geo-coordinates."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13px', lineHeight: 1.45, resize: 'vertical' }}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="mono-label">Specific Location (Optional)</label>
              <span className="mono-label" style={{ color: 'var(--color-muted)', fontSize: '10px' }}>
                AUTO-RESOLVED IF BLANK
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Mumbai, Maharashtra or Manhattan, NYC (Leave empty to auto-extract)"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '4px' }}>
                Operational Triage
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mono-label"
                style={{ width: '100%', padding: '8px 12px', fontSize: '11px', cursor: 'pointer' }}
              >
                <option value="active">CRITICAL / ACTIVE</option>
                <option value="monitoring">MONITORING</option>
                <option value="resolved">RESOLVED</option>
              </select>
            </div>

            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '4px' }}>
                Classification Tags
              </label>
              <input
                type="text"
                placeholder="flood, urgent, medical"
                value={formData.tagsInput}
                onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            marginTop: '8px',
            paddingTop: '12px',
            borderTop: '1px solid var(--color-rule)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-cyan"
            >
              {submitting ? 'Saving Incident...' : 'Broadcast Incident Dossier →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
