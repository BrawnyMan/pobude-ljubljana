import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const data = await response.json();
      localStorage.setItem('admin_token', data.token);
      navigate('/admin');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h1 className="mb-4">Admin Login</h1>
      <form onSubmit={handleSubmit} role="form" aria-label="Admin login form">
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            aria-describedby={error ? "login-error" : undefined}
            aria-invalid={error ? "true" : "false"}
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-describedby={error ? "login-error" : undefined}
            aria-invalid={error ? "true" : "false"}
            disabled={isSubmitting}
          />
        </div>
        {error && (
          <div className="alert alert-danger" id="login-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}
        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={isSubmitting}
          aria-describedby={isSubmitting ? "submitting-status" : undefined}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        {isSubmitting && (
          <div id="submitting-status" className="visually-hidden" aria-live="polite">
            Logging in, please wait...
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginPage; 