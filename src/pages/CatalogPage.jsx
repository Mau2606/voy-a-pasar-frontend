import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManuals, getMyEnrollments, enrollInManual } from '../services/api';
import { BookOpen, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CatalogPage() {
  const navigate = useNavigate();
  const [manuals, setManuals] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    Promise.all([getManuals(), getMyEnrollments()])
      .then(([manualsRes, enrollRes]) => {
        setManuals(manualsRes.data);
        setEnrolledIds(new Set(enrollRes.data.map((e) => e.manual.id)));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (manualId) => {
    setEnrolling(manualId);
    try {
      await enrollInManual(manualId);
      setEnrolledIds((prev) => new Set([...prev, manualId]));
      toast.success('¡Inscripción exitosa!');
    } catch {
      toast.error('Error al inscribirse');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Catálogo de <span className="text-indigo-600 dark:text-indigo-400">Manuales</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Inscríbete en los manuales que deseas estudiar.
        </p>
      </div>

      {manuals.length === 0 && (
        <div className="card p-10 text-center text-gray-400 dark:text-gray-500">
          No hay manuales disponibles todavía.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {manuals.map((manual) => {
          const enrolled = enrolledIds.has(manual.id);
          return (
            <div key={manual.id} className="card flex flex-col overflow-hidden">
              {/* Cover */}
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <BookOpen size={48} className="text-white opacity-80" />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {manual.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 line-clamp-3">
                  {manual.description}
                </p>

                <div className="mt-4 flex gap-2">
                  {enrolled ? (
                    <>
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                        <CheckCircle2 size={13} /> Inscrito
                      </span>
                      <button
                        id={`btn-view-manual-${manual.id}`}
                        onClick={() => navigate(`/manual/${manual.id}`)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                      >
                        Ver contenido <ChevronRight size={13} />
                      </button>
                    </>
                  ) : (
                    <button
                      id={`btn-enroll-${manual.id}`}
                      onClick={() => handleEnroll(manual.id)}
                      disabled={enrolling === manual.id}
                      className="flex-1 btn-primary text-sm py-2 px-4 disabled:opacity-60"
                    >
                      {enrolling === manual.id ? 'Inscribiendo…' : 'Inscribirse'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
