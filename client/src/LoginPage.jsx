import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';

// You can save this as a new file, e.g., LoginPage.js, and import it in App.js
// Or, you can just paste this component definition inside your App.js file.

export const LoginPage = ({ onLoginSuccess, onNavigateToSignUp, onNavigateToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // This is the NEW function for LoginPage.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please fill in both fields.');
      return;
    }

    try {
      // Send data to your new /api/login endpoint
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Server said login was successful!
        // The onLoginSuccess prop comes from App.js
        onLoginSuccess();
      } else {
        // Server sent an error (e.g., "Invalid credentials.")
        alert('Login failed: ' + data.message);
      }

    } catch (error) {
      console.error('Network error:', error);
      alert('Could not connect to the server. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Welcome Back!</h2>
        <p className="auth-subtitle">Sign in to access your guide</p>

        <div className="input-group">
          <Mail className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </div>

        <button type="submit" className="auth-button">
          <LogIn className="icon-xsmall icon-right" />
          Login
        </button>

        <div className="auth-switcher">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="auth-link-button"
              onClick={onNavigateToSignUp}
            >
              Sign Up
            </button>
          </p>

          {/* --- NEW FORGOT PASSWORD LINK --- */}
          <p className="forgot-password-link">
            <button
              type="button"
              className="auth-link-button"
              onClick={onNavigateToForgotPassword}
            // We will add this prop to App.js next
            >
              Forgot Password?
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};