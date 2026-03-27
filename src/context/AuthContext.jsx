import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    if (token && email) {
      setUser({ token, name, email, role, userId });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    const { token, name, role, userId } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', userId);
    setUser({ token, name, email, role, userId });
    return res.data;
  };

  const registerUser = async (name, email, password) => {
    const res = await registerApi({ name, email, password });
    // Registration no longer returns a token (account is PENDING)
    // Show appropriate message to the user
    if (!res.data.token) {
      toast.success(
        'Registro exitoso. Tu cuenta está pendiente de aprobación. Te enviaremos un correo cuando esté activa.',
        { duration: 6000 }
      );
      return { pending: true, ...res.data };
    }
    // Fallback if token is returned (shouldn't happen with new flow)
    const { token, role, userId } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', userId);
    setUser({ token, name, email, role, userId });
    return res.data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  const value = { user, login, register: registerUser, logout, loading, isAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
