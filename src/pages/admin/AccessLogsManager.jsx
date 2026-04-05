import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Clock, Smartphone, Monitor, Globe, User, MapPin } from 'lucide-react';

export default function AccessLogsManager() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 15;

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/telemetry/sessions', { params: { page, size: PAGE_SIZE, sort: 'loginTimestamp,desc' } });
      const data = res.data;
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error('Error al cargar bitácora de accesos');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (seconds == null) return <span className="text-amber-500 flex items-center gap-1 text-xs"><Clock size={12}/> En Línea</span>;
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const DeviceIcon = ({ type }) => {
    if (type === 'Smartphone' || type === 'Tablet') return <Smartphone size={14} className="text-gray-500" />;
    return <Monitor size={14} className="text-gray-500" />;
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Globe size={20} className="text-violet-500" /> Bitácora de Accesos ({totalElements})
        </h2>
        <p className="text-sm text-gray-500 mt-1">Monitoreo de telemetría y geolocalización de sesiones.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {['Usuario', 'Login', 'Logout', 'Duración', 'Dispositivo', 'IP / Locación'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {logs.map((L) => (
              <tr key={L.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <td className="px-5 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{L.user?.name || 'Desconocido'}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {L.loginTimestamp ? new Date(L.loginTimestamp).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {L.logoutTimestamp ? new Date(L.logoutTimestamp).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td className="px-5 py-3 text-sm font-medium">
                  {formatDuration(L.durationSeconds)}
                </td>
                <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-2.5">
                  <DeviceIcon type={L.deviceType} />
                  {L.deviceType || 'Desconocido'}
                </td>
                <td className="px-5 py-3 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-gray-500">{L.ipAddress || 'IP Local'}</span>
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <MapPin size={10} /> {L.location || 'Consultando...'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No hay registros de sesiones</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">
              Anterior
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
