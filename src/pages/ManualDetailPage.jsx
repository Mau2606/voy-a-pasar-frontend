import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getManual, getChaptersByManual, getChapterUnlockStatus } from '../services/api';
import { Lock, Unlock, PlayCircle, Trophy, ChevronRight } from 'lucide-react';
import QuizSetupModal from '../components/QuizSetupModal';

export default function ManualDetailPage() {
  const { manualId } = useParams();
  const navigate = useNavigate();

  const [manual, setManual] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [unlockMap, setUnlockMap] = useState({});   // chapterId → UnlockStatusDTO
  const [loading, setLoading] = useState(true);
  const [modalChapter, setModalChapter] = useState(null); // chapter to start quiz for

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

          return (
            <div key={ch.id} className="flex items-center justify-between p-5 gap-4">
              {/* Lock icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${unlocked ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {unlocked
                  ? <Unlock size={18} className="text-indigo-600 dark:text-indigo-400" />
                  : <Lock size={18} className="text-gray-400 dark:text-gray-500" />
                }
              </div>

              {/* Chapter info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  Cap. {ch.number}: {ch.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {/* Progress bar */}
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 max-w-xs">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${passed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(bestScore, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                    {bestScore > 0 ? `${Math.round(bestScore)}%` : 'Sin intentos'}
                  </span>
                  <span className="text-xs text-gray-400">umbral: {threshold}%</span>
                </div>
              </div>

              {/* Action */}
              <button
                id={`btn-chapter-${ch.id}`}
                onClick={() => unlocked && setModalChapter(ch)}
                disabled={!unlocked}
                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  unlocked
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <PlayCircle size={13} />
                {unlocked ? 'Practicar' : 'Bloqueado'}
              </button>
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
    </div>
  );
}
