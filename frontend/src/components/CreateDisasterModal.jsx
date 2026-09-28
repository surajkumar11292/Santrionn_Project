/* Theme: Editorial Linen & Forest Green (suraj-portfolio-io.vercel.app)
 * Disaster Incident Registration Modal
 */
import React, { useState } from 'react';
import { api } from '../api/client';

export default function CreateDisasterModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    tagsInput: '',
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
        backgroundColor: 'rgba(26, 26, 26, 0.45)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="aurora-card"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '28px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--color-rule)',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          borderBottom: '1px solid var(--color-rule)',
          paddingBottom: '14px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-forest)',
              marginBottom: '3px'
            }}>
              INCIDENT REGISTRATION
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 400,
              color: 'var(--color-ink)'
            }}>
              Log Disaster Incident
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn-modal-close-pill"
          >
            ✕ ESC
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#b91c1c',
            fontSize: '13px',
            marginBottom: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '5px' }}>
              Incident Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Severe Cyclone & Coastal Flooding in Mumbai"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px' }}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)' }}>
                Field Description *
              </label>
              <span style={{ fontSize: '11px', color: 'var(--color-forest)', fontWeight: 600 }}>
                Location Auto-Resolved
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Detail emergency conditions. Mentioned cities/regions (e.g. Mumbai, Chamoli, Wayanad, Chennai) are automatically parsed into geo-coordinates."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', fontSize: '13px', lineHeight: 1.45, resize: 'vertical', borderRadius: '8px' }}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)' }}>
                Specific Location (Optional)
              </label>
              <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Auto-extracted if blank
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Mumbai, Maharashtra or Chamoli, Uttarakhand"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '5px' }}>
                Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', backgroundColor: '#ffffff' }}
              >
                <option value="active">ACTIVE</option>
                <option value="monitoring">MONITORING</option>
                <option value="resolved">RESOLVED</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '5px' }}>
                Tags
              </label>
              <input
                type="text"
                placeholder="flood, urgent, medical"
                value={formData.tagsInput}
                onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
            paddingTop: '16px',
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
              className="btn-forest"
            >
              {submitting ? 'Saving Incident...' : 'Broadcast Incident →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
