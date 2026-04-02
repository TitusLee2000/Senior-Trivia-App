import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="auth-lead">Use your account to browse categories and play quizzes.</p>
        <form onSubmit={handleSubmit} className="stack">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
            />
          </label>
          {error && (
            <p className="error-banner" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-large" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-footer">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
