import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  const handleQuickLogin = async (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    clearError();
    await login(roleEmail, rolePass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #162035 0%, #070d1a 75%)',
      padding: 'var(--space-6)'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'var(--color-bg-glass)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'var(--color-critical-dim)',
            color: 'var(--color-critical)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-3)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            🚨 Crisis Response Operations
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            RELIEF.IO Command Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Real-time geospatial coordination, automated priority classification, and tactical asset deployment.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-critical-dim)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-critical)',
            fontSize: '0.85rem',
            marginBottom: 'var(--space-4)',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Sign in Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              Operator Email
            </label>
            <input
              type="email"
              placeholder="e.g. admin@relief.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                fontSize: '0.9rem'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              Security Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                fontSize: '0.9rem'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-glow-critical)',
              marginTop: 'var(--space-2)'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Command Center'}
          </button>
        </form>

        {/* Quick Reviewer Logins */}
        <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            marginBottom: 'var(--space-3)',
            textAlign: 'center'
          }}>
            ⚡ Quick-Login (Evaluation Presets)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
            <button
              onClick={() => handleQuickLogin('admin@relief.io', 'admin123')}
              style={{
                padding: '8px 4px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              👑 Admin
            </button>
            <button
              onClick={() => handleQuickLogin('contrib@relief.io', 'contrib123')}
              style={{
                padding: '8px 4px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: '#f59e0b',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              🛡️ Contributor
            </button>
            <button
              onClick={() => handleQuickLogin('viewer@relief.io', 'viewer123')}
              style={{
                padding: '8px 4px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: '#3b82f6',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              👁️ Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
