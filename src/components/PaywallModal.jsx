import { X, Zap, CheckCircle2 } from 'lucide-react';

const benefits = [
  'Acceso a todos los manuales y capítulos',
  'Preguntas ilimitadas por capítulo',
  'Exámenes simulados con temporizador',
  'Explicaciones detalladas y referencias PDF',
  'Seguimiento completo de tu progreso',
];

export default function PaywallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="card p-8 text-center">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>

          {/* Icon */}
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/30 mb-6">
            <Zap size={32} className="text-white" />
          </div>

          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Has alcanzado el límite gratuito
          </h3>
          <p className="text-slate-500 dark:text-gray-400 mb-6">
            La versión gratuita permite 3 preguntas por capítulo.
            Desbloquea todo el contenido con Premium.
          </p>

          {/* Benefits */}
          <div className="text-left space-y-3 mb-8">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 dark:text-gray-300">{b}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            id="paywall-upgrade-btn"
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
            onClick={() => {
              // TODO: Integrate with MercadoPago preference creation
              alert('Funcionalidad de pago próximamente.');
              onClose();
            }}
          >
            <Zap size={18} />
            Obtener Premium
          </button>

          <button
            onClick={onClose}
            className="mt-3 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
          >
            Continuar con la versión gratuita
          </button>
        </div>
      </div>
    </div>
  );
}
