import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getManual, getChaptersByManual, getChapterUnlockStatus, toggleChapterRead } from '../services/api';
import { Lock, Unlock, PlayCircle, Trophy, ChevronRight, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import Tooltip from '../components/Tooltip';
import QuizSetupModal from '../components/QuizSetupModal';
import PdfReaderModal from '../components/PdfReaderModal';

export default function ManualDetailPage() {
  const { manualId } = useParams();
  const navigate = useNavigate();

  const [manual, setManual] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [unlockMap, setUnlockMap] = useState({});   // chapterId → UnlockStatusDTO
  const [loading, setLoading] = useState(true);
  const [modalChapter, setModalChapter] = useState(null); // chapter to start quiz for
  const [pdfReader, setPdfReader] = useState(null); // chapter to read PDF for

  useEffect(() => {
    Promise.all([
      getManual(manualId),
      getChaptersByManual(manualId),
      getChapterUnlockStatus(manualId),
    ])
      .then(([manRes, chapRes, unlockRes]) => {
        setManual(manRes.data);
        setChapters(chapRes.data);
        const map = {};
        unlockRes.data.forEach((s) => { map[s.chapterId] = s; });
        setUnlockMap(map);
      })
      .finally(() => setLoading(false));
  }, [manualId]);

  const allPassed = chapters.length > 0 && chapters.every((ch) => {
    const s = unlockMap[ch.id];
    return s && s.bestScore >= s.threshold;
  });

  const handleToggleRead = async (chapterId, currentStatus) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setUnlockMap(prev => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        isRead: newStatus,
        read: newStatus
      }
    }));

    try {
      await toggleChapterRead(chapterId, newStatus);
    } catch (err) {
      toast.error('Error al guardar el estado de lectura');
      // Revert on error
      setUnlockMap(prev => ({
        ...prev,
        [chapterId]: {
          ...prev[chapterId],
          isRead: currentStatus,
          read: currentStatus
        }
      }));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {manual?.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{manual?.description}</p>
      </div>

      {/* Final Exam banner */}
      {allPassed && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Trophy size={28} />
            <div>
              <p className="font-bold text-lg">¡Todos los capítulos superados!</p>
              <p className="text-sm opacity-90">Ya puedes rendir el Examen Final.</p>
            </div>
          </div>
          <button
            id="btn-final-exam"
            onClick={() => navigate(`/final-exam/${manualId}`)}
            className="flex items-center gap-1 bg-white text-orange-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-all"
          >
            Ir al examen <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Chapter list */}
      <div className="card divide-y divide-gray-100 dark:divide-gray-700">
        {chapters.map((ch) => {
          const status = unlockMap[ch.id];
          const unlocked = status?.unlocked ?? ch.orderIndex === 1;
          const bestScore = status?.bestScore ?? 0;
          const threshold = status?.threshold ?? 70;
          const passed = bestScore >= threshold;
          const isChapterRead = status?.isRead ?? status?.read ?? false;

          return (
            <div key={ch.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
              
              {/* Left Column (Icon + Toggle) & Mid Column (Text + Progress) container */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                
                {/* Icons Stack */}
                <div className="flex flex-col items-center flex-shrink-0 w-12">
                  <Tooltip 
                    text={unlocked 
                      ? "Capítulo desbloqueado. Puedes practicarlo." 
                      : `Bloqueado. Debes superar el ${threshold}% en el capítulo anterior.`}
                    position="right"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-help transition-colors ${unlocked ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {unlocked
                        ? <Unlock size={18} className="text-indigo-600 dark:text-indigo-400" />
                        : <Lock size={18} className="text-gray-400 dark:text-gray-500" />
                      }
                    </div>
                  </Tooltip>
                </div>

                {/* Chapter info (Title & Progress) */}
                <div className="flex-1 min-w-0 py-1">
                  <p className="font-semibold text-gray-900 dark:text-white truncate pb-2">
                    Cap. {ch.number}: {ch.title}
                  </p>
                  
                  <Tooltip text="Tu rendimiento más alto en las prácticas de este capítulo" position="top">
                    <div className="flex items-center gap-3 cursor-help">
                      {/* Progress bar */}
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 w-32 max-w-xs">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${passed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min(bestScore, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                        {bestScore > 0 ? `${Math.round(bestScore)}%` : 'Sin intentos'}
                      </span>
                      <span className="hidden md:inline text-xs text-gray-400">umbral: {threshold}%</span>
                    </div>
                  </Tooltip>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex items-center justify-end gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                {unlocked && ch.pdfUrl && (
                  <Tooltip text="Leer el contenido del capítulo en PDF">
                    <button
                      onClick={() => setPdfReader(ch)}
                      className="flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 sm:py-1.5 rounded-lg transition-all w-full sm:w-auto border bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 hover:bg-violet-100 dark:hover:bg-violet-500/20"
                    >
                      <BookOpen size={16} />
                      Leer
                    </button>
                  </Tooltip>
                )}

                {unlocked && (
                  <Tooltip text={isChapterRead ? "Haz click para quitar de tus leídos" : "Guarda este capítulo como leído en tu progreso personal"}>
                    <button
                      onClick={() => handleToggleRead(ch.id, isChapterRead)}
                      className={`flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 sm:py-1.5 rounded-lg transition-all w-full sm:w-auto border ${
                        isChapterRead 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' 
                          : 'bg-white dark:bg-transparent text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {isChapterRead ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      {isChapterRead ? 'Leído' : 'Marcar Leído'}
                    </button>
                  </Tooltip>
                )}

                <Tooltip text={unlocked ? "Ingresar a rendir cuestionario corto" : "No tienes acceso a este cuestionario aún"}>
                  <button
                    id={`btn-chapter-${ch.id}`}
                    onClick={() => unlocked && setModalChapter(ch)}
                    disabled={!unlocked}
                    className={`flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 sm:py-1.5 rounded-lg transition-all w-full sm:w-auto border ${
                      unlocked
                        ? 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                    }`}
                  >
                    <PlayCircle size={16} />
                    {unlocked ? 'Practicar' : 'Bloqueado'}
                  </button>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Setup Modal */}
      {modalChapter && (
        <QuizSetupModal
          chapter={modalChapter}
          onClose={() => setModalChapter(null)}
          onStart={(limit) => navigate(`/quiz/${modalChapter.id}?limit=${limit}`)}
        />
      )}

      {/* PDF Reader Modal */}
      {pdfReader && (
        <PdfReaderModal
          pdfUrl={pdfReader.pdfUrl}
          title={`Cap. ${pdfReader.number}: ${pdfReader.title}`}
          onClose={() => setPdfReader(null)}
        />
      )}
    </div>
  );
}
