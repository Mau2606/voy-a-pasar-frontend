import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProgress, getMyEnrollments } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, BookOpen, Clock, Trophy, ChevronRight, Library } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyProgress(), getMyEnrollments()])
      .then(([p, e]) => { setProgress(p.data); setEnrollments(e.data); })
      .finally(() => setLoading(false));
  }, []);

  // Compute per-manual stats from progress logs
  const manualStats = enrollments.map((enrollment) => {
    const manual = enrollment.manual;
    // Get all progress logs tied to chapters belonging to this manual
    const logs = progress.filter((p) => p.chapter?.manual?.id === manual.id);
    const avg = logs.length > 0
      ? Math.round(logs.reduce((s, p) => s + p.scorePercentage, 0) / logs.length)
      : 0;
    const best = logs.length > 0 ? Math.max(...logs.map((l) => l.scorePercentage)) : 0;
    return { ...manual, attempts: logs.length, avg, best };
  });

  const totalAttempts = progress.length;
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + p.scorePercentage, 0) / progress.length)
    : 0;
  const enrolled = enrollments.length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Hola, <span className="text-indigo-600 dark:text-indigo-400">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Aquí está tu progreso de estudio.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Library} label="Manuales activos" value={enrolled} color="bg-indigo-500" />
        <StatCard icon={Clock} label="Intentos totales" value={totalAttempts} color="bg-purple-500" />
        <StatCard icon={TrendingUp} label="Promedio general" value={`${avgScore}%`} color="bg-amber-500" />
      </div>

      {/* Enrolled Manuals */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mis Manuales Activos</h2>
          </div>
          <button
            id="btn-go-catalog"
            onClick={() => navigate('/catalog')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Explorar catálogo
          </button>
        </div>

        {enrollments.length === 0 && (
          <div className="text-center py-12">
            <Library size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-400 dark:text-gray-500 mb-4">Todavía no estás inscrito en ningún manual.</p>
            <button
              id="btn-catalog-empty"
              onClick={() => navigate('/catalog')}
              className="btn-primary text-sm px-6 py-2"
            >
              Explorar catálogo
            </button>
          </div>
        )}

        <div className="space-y-4">
          {manualStats.map((m) => {
            const pct = Math.min(m.avg, 100);
            const barColor = pct >= 70 ? 'from-emerald-500 to-green-400'
                           : pct >= 50 ? 'from-indigo-500 to-purple-500'
                           : 'from-rose-500 to-pink-400';
            return (
              <div key={m.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{m.title}</span>
                    {m.attempts > 0 && (
                      <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                        {m.attempts} intento{m.attempts !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${pct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
                      {m.attempts > 0 ? `${pct}% prom.` : 'Sin intentos'}
                    </span>
                    <button
                      id={`btn-manual-${m.id}`}
                      onClick={() => navigate(`/manual/${m.id}`)}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                    >
                      Ver manual <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div className={`h-3 rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                       style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

