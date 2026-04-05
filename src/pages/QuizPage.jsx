import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  getQuestionsByChapter, getChapter, saveProgress, telemetryQuizAttempt
} from '../services/api';
import { resolveBackendUrl } from '../services/urlHelper';
import {
  CheckCircle2, XCircle, ChevronRight, BookOpen,
  ChevronLeft, ChevronRightIcon, FileText,
  ZoomIn, ZoomOut, Maximize, Minimize, Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Tooltip from '../components/Tooltip';
import ReportQuestionModal from '../components/ReportQuestionModal';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// ── Components ────────────────────────────────────────────────────────────────

function OptionButton({ label, text, selected, correct, revealed, onClick }) {
  let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 ';
  if (!revealed) {
    cls += (label === selected)
      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
      : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300';
  } else if (label === correct) {
    cls += 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
  } else if (label === selected) {
    cls += 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300';
  } else {
    cls += 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500';
  }
  return (
    <button onClick={onClick} disabled={revealed} className={cls}>
      <span className="font-bold mr-2">{label}.</span>{text}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function QuizPage() {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const navigate = useNavigate();

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // PDF viewer state
  const [showPdf, setShowPdf] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [pageLabels, setPageLabels] = useState([]);
  const [pdfProxy, setPdfProxy] = useState(null);
  const [pdfWidth, setPdfWidth] = useState(340);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pendingJump, setPendingJump] = useState(null);

  // Clear PDF cache when hidden
  useEffect(() => {
    if (!showPdf) {
      setPdfProxy(null);
      setPageLabels([]);
      setNumPages(null);
      setPendingJump(null);
    }
  }, [showPdf]);

  // Refs
  const pdfContainerRef = useRef(null);
  const pdfWrapperRef = useRef(null); // Used to observe width safely

  useEffect(() => {
    Promise.all([
      getQuestionsByChapter(chapterId, limit),
      getChapter(chapterId),
    ])
      .then(([qRes, chRes]) => {
        setQuestions(qRes.data);
        setChapter(chRes.data);
        setStartTime(new Date().toISOString());
      })
      .finally(() => setLoading(false));
  }, [chapterId, limit]);

  // Resize PDF panel responsively avoiding scrollbar layout thrashing
  useEffect(() => {
    if (!pdfWrapperRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      // Set width base based on non-scrolling parent to avoid flickering loop
      setPdfWidth(entry.contentRect.width - 32); 
    });
    obs.observe(pdfWrapperRef.current);
    return () => obs.disconnect();
  }, [showPdf]); // Re-observe if showPdf changes

  // Listen for fullscreen change events to sync state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Detect mobile for layout decisions (< lg breakpoint = 1024px)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const currentQ = questions[current];

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
  };

  const handleReveal = () => {
    if (!selected) return toast.error('Selecciona una opción primero.');
    setRevealed(true);
    
    // Auto-show PDF on both mobile and desktop. It will stack below on mobile.
    setShowPdf(true);
    
    if (selected === currentQ?.correctOpt) setCorrectCount((c) => c + 1);
    
    // Auto-jump PDF to logical page reference if available
    if (currentQ?.pageReference) jumpToPdfPage(currentQ.pageReference);

    // Scroll to the PDF container on mobile so the user sees it appeared
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        pdfContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleNext = async () => {
    if (current + 1 >= questions.length) {
      // Save progress
      const total = questions.length;
      const score = parseFloat(((correctCount / total) * 100).toFixed(2));
      const secondsUsed = startTime ? Math.floor((new Date() - new Date(startTime)) / 1000) : null;
      try {
        await saveProgress({
          chapterId: parseInt(chapterId),
          scorePercentage: score,
          correctAnswers: correctCount,
          totalQuestions: total,
        });
        
        await telemetryQuizAttempt({
          chapterId: parseInt(chapterId),
          score: score,
          startTime: startTime,
          secondsUsed: secondsUsed
        });
      } catch (e) {
        console.error('Error saving progress or telemetry', e);
      }
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
      setShowPdf(false); // Hide PDF for the next question until answered
      setPdfScale(1.0);  // Reset scale
    }
  };

  // Helper: jump PDF to logical printed page reference
  const jumpToPdfPage = async (pageRef, overrideProxy = null, overrideLabels = null) => {
    if (!pageRef) return;
    
    const currentProxy = overrideProxy || pdfProxy;
    const currentLabels = overrideLabels || pageLabels;

    // If PDF isn't loaded yet, queue it to run when ready
    if (!showPdf || !currentProxy) {
      setShowPdf(true);
      setPendingJump(pageRef);
      return;
    }

    setShowPdf(true); // Ensure it's open
    
    // If pageRef is a range like "45-46" or "45 y 46", extract the first number
    const match = String(pageRef).match(/\d+/);
    const refString = match ? match[0] : String(pageRef).trim();

    // 1. Try PDF internal logical labels first
    if (currentLabels && currentLabels.length > 0) {
      const pageIndex = currentLabels.findIndex(label => label === refString);
      if (pageIndex !== -1) {
        setPdfPage(pageIndex + 1); // physical page is index + 1
        return;
      }
    }

    // 2. Intelligent Text Search: Scan headers and footers for the page number
    const searchToast = toast.loading('Buscando página en el manual...');
    try {
      for (let i = 1; i <= currentProxy.numPages; i++) {
        const page = await currentProxy.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text items, clean up spaces
        const items = textContent.items.map(t => t.str.trim()).filter(Boolean);
        if (items.length > 0) {
          // Check first 15 and last 15 elements (typical header/footer locations for page numbers)
          let firstItems = items.slice(0, 15);
          let lastItems = items.slice(-15);
          
          if (firstItems.includes(refString) || lastItems.includes(refString)) {
            setPdfPage(i);
            toast.success(`Página ${refString} encontrada`, { id: searchToast });
            return;
          }
        }
      }
      toast.error(`No se encontró el texto "Pág. ${refString}" en el documento`, { id: searchToast });
    } catch (err) {
      console.error("Error searching PDF text:", err);
      toast.dismiss(searchToast);
    }

    // 3. Fallback: Parse as a physical absolute number if search fails
    const num = parseInt(refString, 10);
    if (!isNaN(num) && num >= 1) {
      setPdfPage(Math.max(1, Math.min(numPages || currentProxy.numPages || Infinity, num)));
    }
  };

  const formatStatement = (text) => {
    if (!text) return '';
    // Forces Roman numeral lists (I., II., III., etc.) to appear on new lines
    // Matches whitespace followed by Roman numeral and a dot or parenthesis, preceded by word boundary
    return text.replace(/\s+\b(I{1,3}|IV|V|VI{1,3}|IX|X)[\.\)]\s/gi, '\n$1. ')
               .replace(/^\s*\b(I{1,3}|IV|V|VI{1,3}|IX|X)[\.\)]\s/gi, '$1. ')
               .trim();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      pdfContainerRef.current?.requestFullscreen().catch(err => {
        console.warn(`Error al activar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500" />
    </div>
  );

  if (questions.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-400 dark:text-gray-500">
      <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
      <p>No hay preguntas disponibles para este capítulo.</p>
      <button onClick={() => navigate(-1)} className="btn-primary mt-6 px-6 py-2 text-sm">
        Volver
      </button>
    </div>
  );

  // ── Finished Screen ──────────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    const color = pct >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                : pct >= 50 ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-rose-500';
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <div className={`text-7xl font-extrabold mb-2 ${color}`}>{pct}%</div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {correctCount} de {questions.length} respuestas correctas
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
            {chapter?.title}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate(0)} className="btn-primary py-3 text-sm">
              Volver a intentar
            </button>
            <button onClick={() => navigate(-1)} className="py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              Volver al Manual
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Quiz + PDF Layout ──────────────────────────────────────────────────
  const opts = ['A', 'B', 'C', 'D', 'E'];
  const optTexts = [currentQ.optA, currentQ.optB, currentQ.optC, currentQ.optD, currentQ.optE];
  const isCorrect = selected === currentQ.correctOpt;

  // On mobile, PDF opens as a bottom-sheet overlay, not inline
  const pdfVisible = showPdf && chapter?.manual?.pdfUrl;

  // PDF Panel component (shared between desktop side-panel and mobile bottom sheet)
  const renderPdfPanel = (mobile) => (
    <>
      {/* PDF toolbar */}
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-2 bg-gray-50/80 dark:bg-gray-800 backdrop-blur-sm z-10 flex-shrink-0">
        {/* Top row: Title, close (mobile), Fullscreen */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 line-clamp-1 pr-2">
            <BookOpen size={14} className="text-indigo-500 shrink-0" />
            <span className="truncate">{chapter.title}</span>
          </span>
          <div className="flex items-center gap-1">
            {!mobile && (
              <Tooltip text={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"} position="left">
                <button onClick={toggleFullscreen} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 dark:hover:text-indigo-400 rounded-lg transition-colors flex-shrink-0">
                  {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                </button>
              </Tooltip>
            )}
            {mobile && (
              <button
                onClick={() => setShowPdf(false)}
                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex-shrink-0"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>
        
        {/* Bottom row: Page controls and Zoom */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
            <Tooltip text="Página anterior" position="bottom">
              <button onClick={() => setPdfPage(p => Math.max(1, p - 1))} disabled={pdfPage <= 1} className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 transition-colors"><ChevronLeft size={16}/></button>
            </Tooltip>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-center select-none">
              {pageLabels[pdfPage - 1] && pageLabels[pdfPage - 1] !== String(pdfPage) 
                  ? `${pageLabels[pdfPage - 1]} (${pdfPage}/${numPages || '?'})` 
                  : `${pdfPage} / ${numPages || '?'}`}
            </span>
            <Tooltip text="Página siguiente" position="bottom">
              <button onClick={() => setPdfPage(p => Math.min(numPages ?? p, p + 1))} disabled={pdfPage >= (numPages ?? 1)} className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 transition-colors"><ChevronRightIcon size={16}/></button>
            </Tooltip>
          </div>
          
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
            <Tooltip text="Alejar vista" position="bottom">
              <button onClick={() => setPdfScale(s => Math.max(0.5, s - 0.25))} className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><ZoomOut size={15}/></button>
            </Tooltip>
            <Tooltip text="Restaurar a tamaño original" position="bottom">
              <button onClick={() => setPdfScale(1.0)} className="text-xs font-medium text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 w-11 text-center select-none transition-colors">
                {Math.round(pdfScale * 100)}%
              </button>
            </Tooltip>
            <Tooltip text="Acercar vista" position="bottom">
              <button onClick={() => setPdfScale(s => Math.min(3.0, s + 0.25))} className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><ZoomIn size={15}/></button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* PDF document */}
      <div ref={pdfWrapperRef} className="flex-1 relative bg-gray-200/50 dark:bg-gray-900 overflow-hidden min-h-0">
        <div className="absolute inset-0 overflow-auto flex items-start justify-center p-4 custom-scrollbar">
          <Document
            file={resolveBackendUrl(chapter.manual?.pdfUrl)}
            onLoadSuccess={async (pdfDoc) => {
              setPdfProxy(pdfDoc);
              setNumPages(pdfDoc.numPages);
              let labels = [];
              try {
                labels = await pdfDoc.getPageLabels();
                if (labels) setPageLabels(labels);
              } catch (e) {
                console.warn("Could not retrieve PDF page labels", e);
              }
              // Immediately execute any deep-link jump that was queued
              setPendingJump((currentPending) => {
                if (currentPending) {
                  jumpToPdfPage(currentPending, pdfDoc, labels);
                }
                return null;
              });
            }}
            onLoadError={(err) => console.error('PDF load error:', err)}
            loading={
              <div className="flex flex-col items-center justify-center h-full w-full gap-3 text-indigo-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
                <span className="text-sm font-medium animate-pulse">Cargando material...</span>
              </div>
            }
            className="drop-shadow-xl"
          >
            <Page
              pageNumber={pdfPage}
              width={pdfWidth}
              scale={pdfScale}
              renderTextLayer
              renderAnnotationLayer
              className="bg-white"
            />
          </Document>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div className={`flex flex-col lg:flex-row gap-6 mx-auto px-4 py-6 ${isMobile ? 'min-h-0' : 'h-[calc(100vh-4rem)]'} ${pdfVisible ? 'max-w-7xl' : 'max-w-4xl'}`}>

        {/* ── LEFT: Quiz Panel ───────────────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col ${isMobile ? '' : 'overflow-y-auto'}`}>
          {/* Progress header & manual toggle */}
          <div className="card p-4 mb-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Pregunta {current + 1} de {questions.length}</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {correctCount} correctas
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                  style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            {chapter?.manual?.pdfUrl && (
              <Tooltip text={showPdf ? "Ocultar material de apoyo" : "Mostrar material de apoyo"} position="left">
                <button 
                  onClick={() => setShowPdf(!showPdf)} 
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${showPdf ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50 dark:hover:bg-indigo-900/50' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'}`}
                >
                  {showPdf ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span className="hidden sm:inline">{showPdf ? 'Ocultar PDF' : 'Ver PDF'}</span>
                </button>
              </Tooltip>
            )}
          </div>

          {/* Question */}
          <div className="card p-6 flex-1 flex flex-col">
            <p className="text-gray-900 dark:text-white font-semibold text-base mb-5 leading-relaxed whitespace-pre-wrap">
              {formatStatement(currentQ.statement)}
            </p>

            <div className="space-y-3 mb-6">
              {opts.map((opt, i) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  text={optTexts[i]}
                  selected={selected}
                  correct={currentQ.correctOpt}
                  revealed={revealed}
                  onClick={() => handleSelect(opt)}
                />
              ))}
            </div>

            {/* Reveal / Explanation */}
            {!revealed ? (
              <button onClick={handleReveal} className="btn-primary py-3 text-sm mt-auto">
                Confirmar respuesta
              </button>
            ) : (
              <div className="mt-auto space-y-4">
                {/* Feedback */}
                <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
                  isCorrect
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'
                }`}>
                  {isCorrect
                    ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                    : <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className={`font-bold text-sm ${isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                      {isCorrect ? '¡Correcto!' : `Incorrecto. La respuesta es ${currentQ.correctOpt}.`}
                    </p>
                    {currentQ.explanation && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                        {currentQ.explanation}
                      </p>
                    )}

                    {/* ── Deep-link to PDF page ── */}
                    {currentQ.pageReference && chapter?.manual?.pdfUrl && (
                      <button
                        id={`btn-pdf-page-${currentQ.pageReference}`}
                        onClick={() => jumpToPdfPage(currentQ.pageReference)}
                        className="mt-3 mr-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors inline-flex"
                      >
                        <FileText size={14} />
                        Ver Pág. {currentQ.pageReference} en el manual
                      </button>
                    )}
                    
                    {/* ── Report Question Button ── */}
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 transition-colors inline-flex"
                    >
                      <AlertTriangle size={14} />
                      Reportar un error en esta pregunta
                    </button>
                  </div>
                </div>

                <button onClick={handleNext} className="btn-primary py-3 text-sm flex items-center justify-center gap-2">
                  {current + 1 >= questions.length ? 'Ver resultados' : 'Siguiente pregunta'}
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            
            {showReportModal && (
              <ReportQuestionModal 
                questionId={currentQ.id} 
                onClose={() => setShowReportModal(false)} 
              />
            )}
          </div>
        </div>

        {/* ── PDF Support Panel (Both Desktop & Mobile) ──────────────────── */}
        {pdfVisible && (
          <div
            ref={pdfContainerRef}
            className={`flex flex-col overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 ${isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen !border-0 !rounded-none' : 'w-full lg:w-[450px] xl:w-[500px] h-[500px] lg:h-full rounded-2xl'}`}
          >
            {renderPdfPanel(isMobile)}
          </div>
        )}
      </div>
    </>
  );
}
