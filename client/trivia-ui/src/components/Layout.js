import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { email, isAdmin, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <h1>Senior Trivia</h1>
          </Link>
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/" end className="nav-link">
              Categories
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="nav-link">
                Admin
              </NavLink>
            )}
          </nav>
          <div className="user-area">
            <span className="user-email" title={email}>
              {email}
            </span>
            <button type="button" className="btn btn-secondary" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
