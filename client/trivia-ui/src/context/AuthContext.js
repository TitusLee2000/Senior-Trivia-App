import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  api,
  clearStoredSession,
  getStoredEmail,
  getStoredRoles,
  getStoredToken,
  setStoredSession,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [email, setEmail] = useState(() => getStoredEmail());
  const [roles, setRoles] = useState(() => getStoredRoles());

  const applySession = useCallback((authResponse) => {
    setStoredSession(authResponse.token, authResponse.email, authResponse.roles);
    setToken(authResponse.token);
    setEmail(authResponse.email);
    setRoles(authResponse.roles || []);
  }, []);

  const login = useCallback(
    async (loginEmail, password) => {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: { email: loginEmail, password },
        auth: false,
      });
      applySession(data);
      return data;
    },
    [applySession]
  );

  const register = useCallback(
    async (registerEmail, password) => {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: { email: registerEmail, password },
        auth: false,
      });
      applySession(data);
      return data;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setToken(null);
    setEmail('');
    setRoles([]);
  }, []);

  const value = useMemo(
    () => ({
      token,
      email,
      roles,
      isAuthenticated: Boolean(token),
      isAdmin: roles.includes('Admin'),
      login,
      register,
      logout,
    }),
    [token, email, roles, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
