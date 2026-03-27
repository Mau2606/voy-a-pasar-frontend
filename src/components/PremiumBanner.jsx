import { Sparkles } from 'lucide-react';

export default function PremiumBanner() {
  return (
    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20
                    border border-violet-200 dark:border-violet-800/40 rounded-xl p-3 mb-4
                    flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-violet-500" />
        <span className="text-sm text-violet-700 dark:text-violet-300 font-medium">
          Versión gratuita — 3 preguntas por capítulo
        </span>
      </div>
      <button
        id="premium-banner-upgrade"
        className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-200 transition-colors whitespace-nowrap"
      >
        Obtener Premium →
      </button>
    </div>
  );
}
