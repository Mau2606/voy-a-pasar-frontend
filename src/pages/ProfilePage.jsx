import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { changePassword, getMySessions } from '../services/api';
import { User, KeyRound, MonitorSmartphone, Clock, Calendar, Shield, MapPin } from 'lucide-react';

const TRANSLATE_ACCESS = {
  PERMANENT: 'Permanente',
  THIRTY_DAYS: '30 Días',
  ONE_DAY: '1 Día',
};

const TRANSLATE_ROLE = {
  USER: 'Usuario',
  ADMIN: 'Administrador',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  
  // Tabs
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'password', 'sessions'

  // Password state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Load sessions on mount or page change
  useEffect(() => {
    if (activeTab === 'sessions') {
      loadSessions();
    }
  }, [activeTab, page]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await getMySessions(page, 10);
      setSessions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Error al cargar historial de accesos.');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error('Las contraseñas nuevas no coinciden.');
    }
    if (passwords.new.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres.');
    }
    
    setIsChangingPassword(true);
    try {
      const res = await changePassword(passwords.current, passwords.new);
      toast.success(res.data.message || 'Contraseña actualizada correctamente.');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar contraseña.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No definida';
    return new Date(dateStr).toLocaleString('es-CL');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400">
          <User size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Mi Perfil
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestiona tu cuenta, seguridad y revisa tus accesos.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <div className="card overflow-hidden">
            <button
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeTab === 'info' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 text-indigo-700 dark:text-indigo-400 font-semibold' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <User size={18} /> Información de Cuenta
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-t border-gray-100 dark:border-gray-800 ${
                activeTab === 'password' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 text-indigo-700 dark:text-indigo-400 font-semibold' 
                  : 'border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <KeyRound size={18} /> Seguridad
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-t border-gray-100 dark:border-gray-800 ${
                activeTab === 'sessions' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 text-indigo-700 dark:text-indigo-400 font-semibold' 
                  : 'border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <MonitorSmartphone size={18} /> Historial de Accesos
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === 'info' && (
            <div className="card p-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">
                Datos Personales
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Nombre Completo
                    </label>
                    <div className="text-gray-900 dark:text-white font-medium p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      {user?.name || '---'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="text-gray-900 dark:text-white font-medium p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      {user?.email || '---'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                      <Shield size={14} /> Rol en Sistema
                    </label>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {TRANSLATE_ROLE[user?.role] || user?.role}
                    </div>
                  </div>
                  
                  {user?.role === 'USER' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                          Tipo de Suscripción
                        </label>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {TRANSLATE_ACCESS[user?.accessType] || user?.accessType || 'Ninguna'}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                          <Calendar size={14} /> Tu suscripción finaliza el:
                        </label>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {user?.expirationDate ? formatDate(user.expirationDate) : 'No definida o Permanente'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="card p-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">
                Cambiar Contraseña
              </h2>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    className="input-field"
                    placeholder="Tu contraseña actual"
                  />
                </div>
                
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="input-field"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="input-field"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Contraseña'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'sessions' && (
            <div className="card overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Historial de Accesos
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Se muestran tus últimos dispositivos y ubicaciones de conexión.
                </p>
              </div>

              {loadingSessions ? (
                <div className="p-10 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                  No hay conexiones registradas.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Inicio de Sesión</th>
                        <th className="px-6 py-4 font-semibold">Dispositivo</th>
                        <th className="px-6 py-4 font-semibold">Ubicación</th>
                        <th className="px-6 py-4 font-semibold">Cierre / Duración</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                              <Clock size={14} className="text-gray-400" />
                              {formatDate(session.loginTimestamp)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium">
                              {session.deviceType || 'Desconocido'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                              {session.location ? (
                                <>
                                  <MapPin size={14} />
                                  <span className="truncate max-w-[150px]">{session.location}</span>
                                </>
                              ) : (
                                '---'
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {session.logoutTimestamp ? (
                              formatDate(session.logoutTimestamp)
                            ) : session.durationSeconds ? (
                              `${Math.floor(session.durationSeconds / 60)} mins`
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                                Activa / Sin Cierre
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-500">
                    Página {page + 1} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
