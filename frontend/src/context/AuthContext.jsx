import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('architect_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('architect_user', JSON.stringify(userData));
    if (token) localStorage.setItem('architect_token', token);
  };

  const logout = (reason) => {
    setUser(null);
    localStorage.removeItem('architect_user');
    localStorage.removeItem('architect_token');
    if (reason === 'system_update') {
      window.location.href = '/login?error=system_update';
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('architect_user', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const handleSystemError = () => {
      logout('system_update');
    };
    window.addEventListener('system-error-logout', handleSystemError);
    return () => window.removeEventListener('system-error-logout', handleSystemError);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
