import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastCtx = createContext(null);

let _toastId = 0;

const ICONS = {
  success: <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />,
  error:   <XCircle    size={18} className="text-red-400    flex-shrink-0" />,
  info:    <AlertCircle size={18} className="text-blue-400   flex-shrink-0" />,
};

/**
 * ToastProvider component to wrap the app.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  const toastMethods = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error',   dur),
    info:    (msg, dur) => addToast(msg, 'info',     dur),
  };

  return (
    <ToastCtx.Provider value={toastMethods}>
      {children}
      <div
        style={{ 
          position: 'fixed', 
          top: '1.5rem', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 99999, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem', 
          alignItems: 'center', 
          pointerEvents: 'none' 
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{ pointerEvents: 'auto' }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium min-w-[280px] max-w-[420px] animate-toast-in
              ${t.type === 'success' ? 'bg-gray-900 border-emerald-500/40 text-white' :
                t.type === 'error'   ? 'bg-gray-900 border-red-500/40 text-white' :
                                       'bg-gray-900 border-blue-500/40 text-white'}`}
          >
            {ICONS[t.type]}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-white transition flex-shrink-0">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/**
 * Hook to use toast.
 */
export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
