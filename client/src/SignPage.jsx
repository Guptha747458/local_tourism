import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';

// You can save this as a new file, e.g., SignUpPage.js, and import it in App.js
// Or, you can just paste this component definition inside your App.js file.

export const SignUpPage = ({ onSignUpSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

// In /client/src/SignUpPage.jsx

  const handleSubmit = async (e) => { // Make the function async
    e.preventDefault();
    
    if (!name || !email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      // Send data to your new backend
      const response = await fetch('http://localhost:5001/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // HTTP 201 (Created)
        alert(data.message); // "User created successfully!"
        onSignUpSuccess(); // This is the function from App.js to log in
      } else {
        // HTTP 400 (Bad Request) or 500 (Server Error)
        alert('Error: ' + data.message); // e.g., "User already exists"
      }

    } catch (error) {
      console.error('Network error:', error);
      alert('Could not connect to the server. Please try again later.');
    }
  };
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Get started with your tourism guide</p>
        
        <div className="input-group">
          <User className="input-icon" />
          <input
            type="text"
            placeholder="Full Name"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
          Create Account
        </button>
        
        <div className="auth-switcher">
          <p>
            Already have an account?{' '}
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