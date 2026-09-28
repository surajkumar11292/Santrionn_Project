/* Theme: Editorial Linen & Forest Green (suraj-portfolio-io.vercel.app)
 * Clean Editorial Sign In Portal
 */
import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative'
    }}>
      {/* Background Watermark Initials (matching "S.K" outline watermark in screenshot) */}
      <div style={{
        position: 'absolute',
        top: '40px',
        right: '60px',
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(8rem, 16vw, 15rem)',
        fontWeight: 400,
        color: 'transparent',
        WebkitTextStroke: '1px rgba(27, 67, 50, 0.08)',
        userSelect: 'none',
        pointerEvents: 'none',
        lineHeight: 1
      }}>
        D.R
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '56px',
        maxWidth: '1060px',
        width: '100%',
        alignItems: 'center',
        zIndex: 1
      }}>
        {/* Left Column: Editorial Portfolio Style Layout */}
        <div>
          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(3rem, 6vw, 4.8rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            marginBottom: '8px'
          }}>
            <span style={{ color: 'var(--color-ink)', display: 'block' }}>Disaster</span>
            <span style={{
              fontStyle: 'italic',
              color: 'var(--color-forest)'
            }}>
              Response
            </span>
          </h1>

          {/* Simple, human description */}
          <p style={{
            fontSize: '1rem',
            color: 'var(--color-ink-2)',
            maxWidth: '44ch',
            lineHeight: 1.6,
            marginTop: '16px',
            marginBottom: '28px'
          }}>
            Coordinate emergency rescue operations, locate nearby relief supplies, and report crisis incidents in real time across India.
          </p>
        </div>

        {/* Right Column: Clean White Access Card */}
        <div className="aurora-card" style={{
          padding: '36px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--color-rule)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <header style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-muted)',
              letterSpacing: '0.05em',
              marginBottom: '4px'
            }}>
              OPERATOR ACCESS
            </div>
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 400,
              fontFamily: 'var(--font-display)',
              color: 'var(--color-ink)'
            }}>
              Sign in to Console
            </h2>
          </header>

          {error && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '13px',
              marginBottom: '18px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '5px' }}>
                Operator Email
              </label>
              <input
                type="email"
                placeholder="admin@relief.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', borderRadius: '8px' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '5px' }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 14px',
                    fontSize: '13.5px',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-muted)',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-forest)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-forest"
              style={{
                width: '100%',
                padding: '11px 18px',
                marginTop: '6px',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {loading ? 'Verifying...' : 'Sign In →'}
            </button>
          </form>

          {/* Quick Clearance Presets */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-rule)'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-muted)',
              marginBottom: '10px',
              textAlign: 'center',
              letterSpacing: '0.04em'
            }}>
              QUICK CLEARANCE PRESETS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleSelectPreset('admin@relief.io', 'admin123')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-rule-2)',
                  backgroundColor: 'var(--color-paper)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: '11.5px' }}>ADMIN</span>
                <span style={{ fontSize: '10px', color: 'var(--color-muted)' }}>Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('contrib@relief.io', 'contrib123')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-rule-2)',
                  backgroundColor: 'var(--color-paper)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ color: '#b45309', fontWeight: 700, fontSize: '11.5px' }}>CONTRIB</span>
                <span style={{ fontSize: '10px', color: 'var(--color-muted)' }}>Responder</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('viewer@relief.io', 'viewer123')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-rule-2)',
                  backgroundColor: 'var(--color-paper)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ color: 'var(--color-forest)', fontWeight: 700, fontSize: '11.5px' }}>VIEWER</span>
                <span style={{ fontSize: '10px', color: 'var(--color-muted)' }}>Auditor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
