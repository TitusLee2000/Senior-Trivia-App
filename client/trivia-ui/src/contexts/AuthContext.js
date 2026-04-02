import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, registerAdmin as apiRegisterAdmin } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    if (token && email && role) {
      setUser({ token, email, role });
    }
    setLoading(false);
  }, []);

  const saveUser = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
    setUser(data);
  };

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    saveUser(res.data);
    return res.data;
  };

  const register = async (email, password, displayName) => {
    const res = await apiRegister(email, password, displayName);
    saveUser(res.data);
    return res.data;
  };

  const registerAdmin = async (email, password, displayName) => {
    const res = await apiRegisterAdmin(email, password, displayName);
    saveUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
