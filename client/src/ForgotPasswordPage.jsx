import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

export const ForgotPasswordPage = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message);
      } else {
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Network error:', err);
      setMessage('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to get a reset link</p>

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

        {message && (
          <p className={`auth-message ${isSuccess ? 'auth-success' : 'auth-error'}`}>
            {message}
          </p>
        )}

        <button type="submit" className="auth-button" disabled={loading || isSuccess}>
          <Send className="icon-xsmall icon-right" />
          {loading ? 'Sending…' : 'Send Reset Link'}
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