import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, getMe, logoutUser } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session via HttpOnly Cookie using /auth/me endpoint
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await getMe();
        const { email, name, role, userId } = res.data;
        setUser({ email, name, role, userId });
      } catch (error) {
        // If 401, no valid session cookie exists
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    // Token is now set securely via Set-Cookie header. We just save user info.
    const { name, role, userId } = res.data;
    setUser({ email, name, role, userId });
    
    // Log telemetry
    try { await import('../services/api').then(m => m.telemetryLogin()); } catch (e) {}
    
    return res.data;
  };

  const registerUser = async (name, email, password, phone, captchaToken) => {
    const res = await registerApi({ name, email, password, phone, captchaToken });
    // Registration no longer returns a token (account is PENDING)
    // Show appropriate message to the user
    if (!res.data.token && res.data.role !== 'ADMIN') { // Handle optional pending flow
      toast.success(
        'Su solicitud de incorporación fue ingresada exitosamente.',
        { duration: 6000 }
      );
      return { pending: true, ...res.data };
    }
    // Fallback if auto-login occurs
    const { role, userId } = res.data;
    setUser({ email, name, role, userId });
    return res.data;
  };

  const logout = async () => {
    try {
      await import('../services/api').then(m => m.telemetryLogout());
      await logoutUser();
    } catch (e) {
      console.error('Logout failed on server, clearing locally.');
    }
    setUser(null);
    // Optional: force a refresh or clean redirect 
    window.location.href = '/login';
  };

  const isAdmin = user?.role === 'ADMIN';

  const value = { user, login, register: registerUser, logout, loading, isAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
