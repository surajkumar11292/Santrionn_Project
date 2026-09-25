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
      setError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const tags = formData.tagsInput
        .split(',')
        .map((t) => t.trim())
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
      setError(err.message || 'Failed to submit disaster incident');
    } finally {
      setSubmitting(false);
    }
  };

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
        maxWidth: '580px',
        width: '100%',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-lg)'
      }}
      onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            🚨 Report New Disaster Incident
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)'
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-critical-dim)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-critical)',
            fontSize: '0.85rem',
            marginBottom: 'var(--space-4)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              Incident Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Severe Flash Flooding in Manhattan, NYC"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                fontSize: '0.9rem'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              Incident Description *
            </label>
            <textarea
              rows={3}
              placeholder="Describe the crisis. Mentioning recognized cities (e.g. Miami, Manhattan, NYC, Los Angeles) will automatically resolve coordinates via NLP geocoding engine!"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontSize: '0.85rem'
                }}
              >
                <option value="active">Active (Immediate Danger)</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Tags (Comma-Separated)
              </label>
              <input
                type="text"
                placeholder="flood, hurricane, evacuation"
                value={formData.tagsInput}
                onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-2)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-secondary)',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: 'var(--shadow-glow-critical)'
              }}
            >
              {submitting ? 'Broadcasting...' : 'Broadcast Disaster Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
