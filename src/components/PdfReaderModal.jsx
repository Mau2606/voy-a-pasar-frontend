import { useRef, useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, BookOpen } from 'lucide-react';
import { resolveBackendUrl } from '../services/urlHelper';

export default function PdfReaderModal({ pdfUrl, title, onClose }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen not supported:', err);
    }
  };

  if (!pdfUrl) return null;

  const resolvedUrl = resolveBackendUrl(pdfUrl);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={containerRef}
        className={`flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full max-w-5xl h-[85vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
              <BookOpen size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                {title}
              </h3>
              <p className="text-xs text-gray-400">Lectura del capítulo</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={() => {
                if (document.fullscreenElement) document.exitFullscreen();
                onClose();
              }}
              className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-950 relative">
          <iframe
            src={resolvedUrl}
            title={`PDF: ${title}`}
            className="w-full h-full border-0"
            style={{ minHeight: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
