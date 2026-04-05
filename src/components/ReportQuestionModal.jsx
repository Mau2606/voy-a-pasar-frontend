import { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createReport } from '../services/api';

export default function ReportQuestionModal({ questionId, onClose }) {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Por favor, ingresa una descripción para entender el problema.');
      return;
    }
    
    setSubmitting(true);
    try {
      await createReport({ questionId, description });
      setIsSuccess(true);
    } catch (err) {
      toast.error('Ocurrió un error al enviar el reporte. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-emerald-500/10 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">¡Reporte Enviado!</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              Muchas gracias por colaborar. Nuestro equipo administrativo revisará este caso a la brevedad para mejorar la calidad del material.
            </p>
            <button
              onClick={onClose}
              className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-amber-500 fill-amber-100 dark:fill-amber-900/50" size={24} />
            Reportar un Problema
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción del problema
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Explícanos brevemente qué está mal en esta pregunta (error de tipeo, respuesta incorrecta, página equivocada, etc.)
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Ej. La respuesta dice B pero debería ser C porque..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 dark:bg-gray-700 dark:text-white custom-scrollbar resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 flex items-center gap-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
