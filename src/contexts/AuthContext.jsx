import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    const { token, role, userId, email: userEmail } = res.data;
    const userData = { userId, email: userEmail, role };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
