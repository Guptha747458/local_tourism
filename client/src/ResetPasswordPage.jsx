import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, Waves } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const MIN_PW_LEN = 8;

export const ResetPasswordPage = ({ onNavigateToLogin }) => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Read token from ?token=... in the URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!t) {
      setError('No reset token found in the URL. Please request a new password reset link.');
    } else {
      setToken(t);
    }
  }, []);

  // Client-side password strength feedback
  const pwTooShort = newPassword.length > 0 && newPassword.length < MIN_PW_LEN;
  const pwMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
      return;
    }
    if (newPassword.length < MIN_PW_LEN) {
      setError(`Password must be at least ${MIN_PW_LEN} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-form" style={{ textAlign: 'center' }}>
          <div className="auth-brand" style={{ justifyContent: 'center' }}>
            <span className="auth-brand-badge">
              <Waves size={16} /> Azure Coast Guide
            </span>
          </div>
          <CheckCircle style={{ width: '3rem', height: '3rem', color: '#16a34a', margin: '0 auto 1rem' }} />
          <h2 className="auth-title">Password Reset!</h2>
          <p className="auth-subtitle">Your password has been updated successfully.</p>
          <button
            type="button"
            className="auth-button"
            style={{ marginTop: '1.5rem' }}
            onClick={onNavigateToLogin}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="auth-brand-badge">
            <Waves size={16} /> Azure Coast Guide
          </span>
        </div>
        <h2 className="auth-title">Set New Password</h2>
        <p className="auth-subtitle">Choose a strong password for your account</p>

        {error && <p className="auth-message auth-error">{error}</p>}

        <div className="input-group" style={{ position: 'relative' }}>
          <Lock className="input-icon" />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder={`New password (min. ${MIN_PW_LEN} chars)`}
            className={`auth-input${pwTooShort ? ' input-error' : ''}`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowPw(v => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {pwTooShort && (
          <p className="field-hint field-hint-error">
            Password must be at least {MIN_PW_LEN} characters.
          </p>
        )}

        <div className="input-group">
          <Lock className="input-icon" />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Confirm new password"
            className={`auth-input${pwMismatch ? ' input-error' : ''}`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        {pwMismatch && (
          <p className="field-hint field-hint-error">Passwords do not match.</p>
        )}

        <button
          type="submit"
          className="auth-button"
          disabled={loading || pwTooShort || pwMismatch || !token}
        >
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>

        <div className="auth-switcher">
          <p>
            Remember your password?{' '}
            <button type="button" className="auth-link-button" onClick={onNavigateToLogin}>
              Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
