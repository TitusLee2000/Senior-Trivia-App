import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-lead">
          New accounts are <strong>players</strong>. Admins are created by your course team.
        </p>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="input"
            />
          </label>
          <p className="hint">At least 8 characters, with a number and an uppercase letter.</p>
          {error && (
            <p className="error-banner" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-large" disabled={busy}>
            {busy ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
