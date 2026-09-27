/* Hallmark Theme: Aurora (16 / 21 — usehallmark.com)
 * Disaster Response Operations Portal - Sign In
 */
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

  const handleSelectPreset = (presetEmail, presetPass) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    clearError();
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--color-paper)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
      position: 'relative'
    }}>
      {/* Top Left Hallmark Eyebrow & Brand */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--color-ink)'
        }}>
          <span style={{ color: 'var(--color-accent)' }}>/</span> disaster response
        </span>
        <span className="mono-label" style={{ color: 'var(--color-muted)', fontSize: '10px' }}>
          v1.1 · AURORA
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-10)',
        maxWidth: '920px',
        width: '100%',
        alignItems: 'center'
      }}>
        {/* Left Side: Authentic Disaster Response Headline (Aurora Style) */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: 'var(--space-3)'
          }}>
            <span className="eyebrow-square" />
            <span className="mono-label" style={{ color: 'var(--color-accent)', letterSpacing: '0.12em' }}>
              CRISIS DISPATCH · ACTIVE
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: 'var(--color-ink)',
            marginBottom: 'var(--space-4)'
          }}>
            Emergency Crisis<br />Management
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--color-ink-2)',
            maxWidth: '38ch',
            marginBottom: 'var(--space-6)',
            lineHeight: 1.55
          }}>
            Unified dispatch console for emergency incident triage, real-time WebSocket incident packets, and PostGIS spatial coordination.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            padding: '10px 16px',
            backgroundColor: 'var(--color-paper-surface)',
            border: '1px solid var(--color-rule)',
            borderRadius: 'var(--radius-xs)'
          }}>
            <div>
              <div className="mono-label" style={{ fontSize: '10px', color: 'var(--color-muted)' }}>
                LATENCY
              </div>
              <div className="tnum" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)' }}>
                18 MS
              </div>
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-rule)' }} />
            <div>
              <div className="mono-label" style={{ fontSize: '10px', color: 'var(--color-muted)' }}>
                SECURITY
              </div>
              <div className="tnum" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                LEVEL 4 RBAC
              </div>
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-rule)' }} />
            <div>
              <div className="mono-label" style={{ fontSize: '10px', color: 'var(--color-muted)' }}>
                DATABASE
              </div>
              <div className="tnum" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-success)' }}>
                POSTGIS LIVE
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Aurora Access Card */}
        <div className="aurora-card" style={{ padding: 'var(--space-6)', width: '100%' }}>
          <header style={{ marginBottom: 'var(--space-5)' }}>
            <div className="mono-label" style={{ color: 'var(--color-accent)', marginBottom: '4px' }}>
              OPERATOR ACCESS
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--color-ink)' }}>
              Sign In to Command Console
            </h2>
          </header>

          {error && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-critical-dim)',
              border: '1px solid var(--color-critical-border)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--color-critical)',
              fontSize: '12px',
              marginBottom: 'var(--space-4)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '4px' }}>
                Operator Identity (Email)
              </label>
              <input
                type="email"
                placeholder="admin@relief.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                required
              />
            </div>

            <div>
              <label className="mono-label" style={{ display: 'block', marginBottom: '4px' }}>
                Security Passkey
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cyan"
              style={{ width: '100%', padding: '10px 16px', marginTop: 'var(--space-2)' }}
            >
              {loading ? 'Verifying Credentials...' : 'Enter Operations Console →'}
            </button>
          </form>

          {/* 1-Click Role Presets */}
          <div style={{
            marginTop: 'var(--space-5)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-rule)'
          }}>
            <div className="mono-label" style={{ color: 'var(--color-muted)', marginBottom: '8px', fontSize: '10px' }}>
              1-CLICK CLEARANCE PRESETS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleSelectPreset('admin@relief.io', 'admin123')}
                className="btn-outline"
                style={{ fontSize: '11px', padding: '6px 4px', flexDirection: 'column', gap: '2px' }}
              >
                <span style={{ color: 'var(--color-critical)', fontWeight: 700 }}>👑 ADMIN</span>
                <span style={{ fontSize: '9px', color: 'var(--color-muted)' }}>Full Clearance</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('contrib@relief.io', 'contrib123')}
                className="btn-outline"
                style={{ fontSize: '11px', padding: '6px 4px', flexDirection: 'column', gap: '2px' }}
              >
                <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>🛡️ CONTRIB</span>
                <span style={{ fontSize: '9px', color: 'var(--color-muted)' }}>First Responder</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('viewer@relief.io', 'viewer123')}
                className="btn-outline"
                style={{ fontSize: '11px', padding: '6px 4px', flexDirection: 'column', gap: '2px' }}
              >
                <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>👁️ VIEWER</span>
                <span style={{ fontSize: '9px', color: 'var(--color-muted)' }}>Auditor Intel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
