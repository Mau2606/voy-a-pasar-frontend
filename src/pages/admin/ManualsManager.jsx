import { useState } from 'react';
import ManualList from './components/ManualList';
import ChapterList from './components/ChapterList';
import QuestionList from './components/QuestionList';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export default function ManualsManager() {
  // viewState controls what level of the Master-Detail drill-down we are viewing.
  // Level 1: manual list, Level 2: chapter list (requires manual), Level 3: question list (requires chapter)
  const [viewState, setViewState] = useState({
    level: 1,
    selectedManual: null,
    selectedChapter: null
  });

  const goLevel1 = () => setViewState({ level: 1, selectedManual: null, selectedChapter: null });
  const goLevel2 = (manual = viewState.selectedManual) => setViewState({ level: 2, selectedManual: manual, selectedChapter: null });
  const goLevel3 = (chapter) => setViewState({ level: 3, selectedManual: viewState.selectedManual, selectedChapter: chapter });

  const renderBreadcrumbs = () => {
    const { level, selectedManual, selectedChapter } = viewState;
    return (
      <div className="flex items-center gap-2 text-sm font-medium mb-6 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <button onClick={goLevel1} className={`flex items-center gap-1.5 transition ${level === 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
          <Home size={16} /> Manuales
        </button>

        {level >= 2 && selectedManual && (
          <>
            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
            <button onClick={() => goLevel2(selectedManual)} className={`transition max-w-xs truncate ${level === 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
              {selectedManual.title}
            </button>
          </>
        )}

        {level === 3 && selectedChapter && (
          <>
            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
            <span className="text-indigo-600 dark:text-indigo-400 max-w-xs truncate">
              {selectedChapter.title}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-300">
      {renderBreadcrumbs()}

      {/* RENDER CURRENT LEVEL */}
      {viewState.level === 1 && (
        <ManualList onSelectManual={goLevel2} />
      )}

      {viewState.level === 2 && viewState.selectedManual && (
        <>
          <button onClick={goLevel1} className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white transition">
            <ArrowLeft size={16} /> Volver a manuales
          </button>
          <ChapterList manual={viewState.selectedManual} onSelectChapter={goLevel3} />
        </>
      )}

      {viewState.level === 3 && viewState.selectedChapter && (
        <>
          <button onClick={() => goLevel2(viewState.selectedManual)} className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white transition">
            <ArrowLeft size={16} /> Volver a Capítulos
          </button>
          <QuestionList chapter={viewState.selectedChapter} />
        </>
      )}
    </div>
  );
}
