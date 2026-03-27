import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, GraduationCap, LayoutDashboard, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setDark(isDark);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/'}
              className="flex items-center gap-2.5 font-bold text-lg text-violet-600 dark:text-violet-400 hover:opacity-80 transition">
          <GraduationCap size={22} />
          <span className="hidden sm:inline">¡Voy a Pasar!</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              {/* Admin panel link — only for admins */}
              {isAdmin && (
                <Link to="/admin"
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition">
                  <Shield size={16} /> Panel Admin
                </Link>
              )}

              {/* Mi Progreso — visible for ALL users (admin + regular) */}
              <Link to="/dashboard"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition">
                <LayoutDashboard size={16} /> Mi Progreso
              </Link>

              <span className="hidden md:inline text-xs text-gray-400 dark:text-gray-500">|</span>
              <span className="hidden md:inline text-sm text-gray-500 dark:text-gray-400">{user.name}</span>
            </>
          )}

          {/* Dark mode toggle */}
          <button onClick={toggleTheme} id="theme-toggle"
                  className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user && (
            <button onClick={handleLogout} id="logout-btn"
                    className="flex items-center gap-1.5 btn-secondary text-sm py-2 px-3">
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
