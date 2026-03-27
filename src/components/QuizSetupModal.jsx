import { X } from 'lucide-react';

const LIMITS = [5, 10, 20, 30, 'Todas'];

export default function QuizSetupModal({ chapter, onClose, onStart }) {
  const handleSelect = (val) => {
    const limit = val === 'Todas' ? 100 : val;
    onStart(limit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
        {/* Close */}
        <button
          id="btn-close-quiz-setup"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Configurar práctica
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Cap. {chapter.number}: {chapter.title}
          </span>
          <br />
          ¿Cuántas preguntas quieres responder en esta sesión?
        </p>

        <div className="grid grid-cols-3 gap-3">
          {LIMITS.map((val) => (
            <button
              key={val}
              id={`btn-limit-${val}`}
              onClick={() => handleSelect(val)}
              className="py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-700
                         text-indigo-700 dark:text-indigo-300 font-bold text-lg
                         hover:bg-indigo-600 hover:text-white hover:border-indigo-600
                         dark:hover:bg-indigo-500 transition-all duration-200"
            >
              {val}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
          Las preguntas se seleccionan aleatoriamente. Máximo 100.
        </p>
      </div>
    </div>
  );
}
