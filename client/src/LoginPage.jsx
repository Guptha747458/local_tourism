import React, { useState } from 'react';
import { Mail, Lock, LogIn, Waves } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

export const LoginPage = ({ onLoginSuccess, onNavigateToSignUp, onNavigateToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // required for httpOnly cookie to be stored
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="auth-brand-badge">
            <Waves size={16} /> Azure Coast Guide
          </span>
        </div>
        <h2 className="auth-title">Welcome Back!</h2>
        <p className="auth-subtitle">Sign in to access your coastal guide</p>

        {error && <p className="auth-message auth-error">{error}</p>}

        <div className="input-group">
          <Mail className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <Lock className="input-icon" />
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          <LogIn className="icon-xsmall icon-right" />
          {loading ? 'Signing in…' : 'Login'}
        </button>

        <div className="auth-switcher">
          <p>
            Don't have an account?{' '}
            <button type="button" className="auth-link-button" onClick={onNavigateToSignUp}>
              Sign Up
            </button>
          </p>
          <p className="forgot-password-link">
            <button type="button" className="auth-link-button" onClick={onNavigateToForgotPassword}>
              Forgot Password?
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};