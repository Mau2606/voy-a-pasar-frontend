import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFinalExam, getManual, submitFinalExam } from '../services/api';
import {
  CheckCircle2, XCircle, ChevronRight, ChevronLeft, Trophy,
  Clock, Send, AlertTriangle, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

const EXAM_DURATION_SECONDS = 40 * 60; // 40 minutes

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── Option Button (no feedback colors during exam) ──────────────────────────
function ExamOptionBtn({ label, text, selected, onClick }) {
  const isSelected = label === selected;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200
        ${isSelected
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
          : 'border-slate-200 dark:border-gray-600 hover:border-violet-300 dark:hover:border-violet-500 text-slate-700 dark:text-gray-300'
        }`}
    >
      <span className="font-bold mr-2">{label}.</span>{text}
    </button>
  );
}

// ── Review Option Button (with correct/incorrect colors) ─────────────────────
function ReviewOptionBtn({ label, text, selected, correct }) {
  let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 font-medium ';
  if (label === correct) {
    cls += 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
  } else if (label === selected && label !== correct) {
    cls += 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300';
  } else {
    cls += 'border-slate-200 dark:border-gray-700 text-slate-400 dark:text-gray-500';
  }
  return (
    <div className={cls}>
      <span className="font-bold mr-2">{label}.</span>{text}
    </div>
  );
}

export default function FinalExamPage() {
  const { manualId } = useParams();
  const navigate = useNavigate();

  // States
  const [questions, setQuestions] = useState([]);
  const [manual, setManual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Exam state
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOpt }
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [examPhase, setExamPhase] = useState('taking'); // 'taking' | 'submitting' | 'review'
  const [results, setResults] = useState(null);
  const [reviewIdx, setReviewIdx] = useState(0);
  const timerRef = useRef(null);

  // Load exam data
  useEffect(() => {
    Promise.all([getFinalExam(manualId), getManual(manualId)])
      .then(([examRes, manRes]) => {
        if (examRes.status === 403 || typeof examRes.data === 'string') {
          setError(examRes.data || 'Debes aprobar todos los capítulos primero.');
        } else {
          setQuestions(examRes.data);
          setManual(manRes.data);
        }
      })
      .catch((err) => {
        setError(err.response?.data || 'No tienes acceso al examen final.');
      })
      .finally(() => setLoading(false));
  }, [manualId]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (examPhase !== 'taking') return;
    setExamPhase('submitting');
    clearInterval(timerRef.current);

    const payload = {
      manualId: parseInt(manualId),
      answers: questions.map((q) => ({
        questionId: q.id,
        selectedOpt: answers[q.id] || null,
      })),
    };

    try {
      const res = await submitFinalExam(payload);
      setResults(res.data);
      setExamPhase('review');
    } catch (e) {
      toast.error('Error al enviar el examen.');
      setExamPhase('taking');
    }
  }, [manualId, questions, answers, examPhase]);

  // Timer
  useEffect(() => {
    if (examPhase !== 'taking' || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [examPhase, questions.length, handleSubmit]);

  const currentQ = questions[current];
  const answeredCount = Object.keys(answers).length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500" />
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="card p-8">
        <Trophy size={48} className="mx-auto mb-4 text-amber-500 opacity-50" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Examen no disponible</h2>
        <p className="text-slate-500 dark:text-gray-400 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-primary py-3 px-6 text-sm">
          Volver al Manual
        </button>
      </div>
    </div>
  );

  // ── Submitting ────────────────────────────────────────────────────────────
  if (examPhase === 'submitting') return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500" />
      <p className="text-slate-500 dark:text-gray-400 font-medium">Enviando examen...</p>
    </div>
  );

  // ── Review Phase ──────────────────────────────────────────────────────────
  if (examPhase === 'review' && results) {
    const pct = results.scorePercentage;
    const color = pct >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                : pct >= 50 ? 'text-amber-500'
                : 'text-rose-500';

    // Show results summary first, then individual review
    if (reviewIdx < 0) {
      // This shouldn't happen, but guard
      setReviewIdx(0);
    }

    const showingSummary = reviewIdx === -1 || (results.results && reviewIdx >= results.results.length);

    if (reviewIdx === 0 && !window._shownSummary) {
      // Show summary screen first
    }

    // Summary screen (first view)
    const rq = results.results?.[reviewIdx];
    const isReviewingQuestions = rq !== undefined;

    if (!isReviewingQuestions) {
      return (
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="card p-8">
            <Trophy size={48} className="mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Examen Final</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-4">{manual?.title}</p>
            <div className={`text-7xl font-extrabold mb-2 ${color}`}>{Math.round(pct)}%</div>
            <p className="text-slate-600 dark:text-gray-300 mb-2">
              {results.correctCount} de {results.totalQuestions} correctas
            </p>
            <p className={`text-sm font-bold mb-6 ${results.passed ? 'text-emerald-600' : 'text-rose-500'}`}>
              {results.passed ? '✅ ¡Aprobado!' : '❌ No aprobado'}
            </p>
            <div className="flex flex-col gap-3">
              <button
                id="review-questions-btn"
                onClick={() => setReviewIdx(0)}
                className="btn-primary py-3 text-sm flex items-center justify-center gap-2"
              >
                Revisar respuestas <ChevronRight size={16} />
              </button>
              <button
                onClick={() => navigate(`/manual/${manualId}`)}
                className="btn-secondary py-3 text-sm"
              >
                Volver al Manual
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Question review
    const opts = ['A', 'B', 'C', 'D', 'E'];
    const optTexts = [rq.optA, rq.optB, rq.optC, rq.optD, rq.optE];

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-500 font-bold">
            <Trophy size={20} />
            Revisión – {manual?.title}
          </div>
          <span className={`text-sm font-bold ${rq.isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
            {rq.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
          </span>
        </div>

        <div className="card p-4 mb-4">
          <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
            <span>Pregunta {reviewIdx + 1} de {results.results.length}</span>
            <span className="font-semibold text-amber-500">{results.correctCount} correctas</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
              style={{ width: `${((reviewIdx + 1) / results.results.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="card p-6">
          <p className="text-slate-800 dark:text-white font-semibold text-base mb-5 leading-relaxed whitespace-pre-wrap">
            {rq.statement}
          </p>
          <div className="space-y-3 mb-6">
            {opts.map((opt, i) => (
              <ReviewOptionBtn
                key={opt} label={opt} text={optTexts[i]}
                selected={rq.selectedOpt} correct={rq.correctOpt}
              />
            ))}
          </div>

          {/* Explanation */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
            rq.isCorrect
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'
          }`}>
            {rq.isCorrect
              ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              : <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
            }
            <div>
              <p className={`font-bold text-sm ${rq.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                {rq.isCorrect ? '¡Correcto!' : `Incorrecto. La respuesta es ${rq.correctOpt}.`}
              </p>
              {rq.explanation && (
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">
                  {rq.explanation}
                </p>
              )}
              {rq.pageReference && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  <FileText size={14} />
                  Referencia: Página {rq.pageReference}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))}
              disabled={reviewIdx <= 0}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            {reviewIdx + 1 < results.results.length ? (
              <button
                onClick={() => setReviewIdx(reviewIdx + 1)}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-1"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => navigate(`/manual/${manualId}`)}
                className="btn-primary py-2 px-4 text-sm"
              >
                Finalizar revisión
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Exam Taking Phase ─────────────────────────────────────────────────────
  const opts = ['A', 'B', 'C', 'D', 'E'];
  const optTexts = [currentQ?.optA, currentQ?.optB, currentQ?.optC, currentQ?.optD, currentQ?.optE];
  const isUrgent = timeLeft < 300; // < 5 minutes

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Timer + Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-amber-500 font-bold">
          <Trophy size={20} />
          Examen Final – {manual?.title}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg
          ${isUrgent
            ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse'
            : 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-200'
          }`}>
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="card p-4 mb-4">
        <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
          <span>Pregunta {current + 1} de {questions.length}</span>
          <span className="font-semibold text-violet-600 dark:text-violet-400">
            {answeredCount} respondidas
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question picker (mini dots) */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrent(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
              ${i === current
                ? 'bg-violet-600 text-white shadow-lg'
                : answers[q.id]
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
              }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div className="card p-6">
        {/* COMBINED type: render statement items vertically */}
        {currentQ?.questionType === 'COMBINED' ? (
          <div className="mb-5">
            {currentQ.statement.split('\n').map((line, i) => (
              <p key={i} className={`text-slate-800 dark:text-white leading-relaxed
                ${i === 0 ? 'font-semibold text-base mb-3' : 'pl-4 text-sm mb-1.5 text-slate-600 dark:text-gray-300'}`}>
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-slate-800 dark:text-white font-semibold text-base mb-5 leading-relaxed whitespace-pre-wrap">
            {currentQ?.statement}
          </p>
        )}

        <div className="space-y-3 mb-6">
          {opts.map((opt, i) => (
            <ExamOptionBtn
              key={opt} label={opt} text={optTexts[i]}
              selected={answers[currentQ?.id]}
              onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current <= 0}
            className="btn-secondary py-2 px-4 text-sm flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          <div className="flex gap-3">
            {current + 1 < questions.length && (
              <button
                onClick={() => setCurrent(current + 1)}
                className="btn-secondary py-2 px-4 text-sm flex items-center gap-1"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            )}
            <button
              id="submit-exam-btn"
              onClick={() => {
                const unanswered = questions.length - answeredCount;
                if (unanswered > 0) {
                  if (!confirm(`Tienes ${unanswered} pregunta(s) sin responder. ¿Deseas enviar el examen?`)) return;
                }
                handleSubmit();
              }}
              className="btn-warning py-2 px-4 text-sm flex items-center gap-2"
            >
              <Send size={16} /> Finalizar examen
            </button>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      {isUrgent && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800">
          <AlertTriangle size={18} className="text-rose-500 shrink-0" />
          <span className="text-sm text-rose-700 dark:text-rose-300 font-medium">
            ¡Quedan menos de 5 minutos! El examen se enviará automáticamente.
          </span>
        </div>
      )}
    </div>
  );
}
