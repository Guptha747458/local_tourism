import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export const ForgotPasswordPage = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // To give user feedback

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous message

    if (!email) {
      alert('Please enter your email.');
      return;
    }

    try {
      // We will build this endpoint in the next step
      const response = await fetch('http://localhost:5001/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message); // e.g., "Reset link sent to your email."
      } else {
        setMessage('Error: ' + data.message); // e.g., "User not found."
      }

    } catch (error) {
      console.error('Network error:', error);
      setMessage('Could not connect to the server. Please try again later.');
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
          />
        </div>
        
        {/* Show a success/error message here */}
        {message && (
          <p className="auth-message">{message}</p>
        )}
        
        <button type="submit" className="auth-button">
          <Send className="icon-xsmall icon-right" />
          Send Reset Link
        </button>
        
        <div className="auth-switcher">
          <p>
            Remember your password?{' '}
            <button
              type="button"
              className="auth-link-button"
              onClick={onNavigateToLogin}
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};