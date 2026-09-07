import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

export const SignUpPage = ({ onSignUpSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // required for httpOnly cookie to be stored
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Only call onSignUpSuccess when the API actually succeeds (HTTP 201)
        onSignUpSuccess(data.user);
      } else {
        setError(data.message || 'Sign up failed. Please try again.');
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
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Get started with your tourism guide</p>

        {error && <p className="auth-message auth-error">{error}</p>}

        <div className="input-group">
          <User className="input-icon" />
          <input
            type="text"
            placeholder="Full Name"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

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
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <div className="auth-switcher">
          <p>
            Already have an account?{' '}
            <button type="button" className="auth-link-button" onClick={onNavigateToLogin}>
              Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};