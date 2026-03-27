import { useState, useEffect } from 'react';
import { getQuestionsByChapter, createQuestion, updateQuestion, deleteQuestion } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

const emptyForm = { 
  type: 'DIRECT', statement: '', optA: '', optB: '', optC: '', optD: '', optE: '', 
  correctOpt: 'A', explanation: '', pageReference: '' 
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function QuestionList({ chapter }) {
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchQuestions(); }, [chapter.id]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const q = await getQuestionsByChapter(chapter.id, 100); // 100 as limit to get all
      setQuestions(q.data);
    } catch {
      toast.error('Error al cargar preguntas');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditData(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (q) => { 
    setEditData(q); 
    setForm({ 
      type: q.type, statement: q.statement, 
      optA: q.optA, optB: q.optB, optC: q.optC, optD: q.optD, optE: q.optE, 
      correctOpt: q.correctOpt, explanation: q.explanation || '', 
      pageReference: q.pageReference || '' 
    }); 
    setShowModal(true); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, chapterId: chapter.id, pageReference: form.pageReference ? form.pageReference : null };
      if (editData) { await updateQuestion(editData.id, payload); toast.success('Pregunta actualizada'); }
      else { await createQuestion(payload); toast.success('Pregunta creada'); }
      setShowModal(false); fetchQuestions();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar pregunta'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar pregunta?')) return;
    try { await deleteQuestion(id); toast.success('Eliminada'); fetchQuestions(); }
    catch { toast.error('Error al eliminar pregunta'); }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 card border border-gray-100 dark:border-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">Preguntas ({questions.length})</h2>
          <p className="text-sm text-gray-500 mt-0.5">En el capítulo: {chapter.title}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm py-2 px-4 shadow-sm">
          <Plus size={16} /> Nueva pregunta
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <tr>
              {['Tipo', 'Enunciado', 'Pág', 'Res.', 'Acciones'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {questions.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition">
                <td className="px-5 py-4 w-32">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${q.type==='COMBINED'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}>
                    {q.type==='COMBINED'?'COMBINADA':'DIRECTA'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-gray-900 dark:text-white max-w-sm truncate font-medium">{q.statement?.substring(0,80)}…</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500 font-mono w-16">{q.pageReference || '—'}</td>
                <td className="px-5 py-4 w-16">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold ring-2 ring-indigo-50 dark:ring-indigo-900/20">
                    {q.correctOpt}
                  </span>
                </td>
                <td className="px-5 py-4 w-28 flex gap-2">
                  <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Este capítulo no tiene preguntas aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editData ? 'Editar pregunta' : 'Nueva pregunta'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="DIRECT">Directa (Preg. cerrada)</option>
                  <option value="COMBINED">Combinada (Romanos)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cita (Página PDF)</label>
                <input className="input-field" type="text" placeholder="Ej. 42 o 45-46" value={form.pageReference} onChange={e => setForm({ ...form, pageReference: e.target.value })} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enunciado</label>
              <textarea className="input-field max-h-40 min-h-[4rem] resize-y font-mono text-sm leading-relaxed whitespace-pre-wrap" required rows={4} placeholder="Escribe la pregunta. Si es combinada, usa Enter para las opciones I, II, III..." value={form.statement} onChange={e => setForm({ ...form, statement: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 dark:border-gray-700 pt-3">
              {(['A', 'B', 'C', 'D', 'E']).map((opt) => (
                <div key={opt}>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Opción {opt}</label>
                  <input className="input-field" required placeholder={`Texto ${opt}`} value={form[`opt${opt}`]} onChange={e => setForm({ ...form, [`opt${opt}`]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">Opción Correcta</label>
                <select className="input-field border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20" value={form.correctOpt} onChange={e => setForm({ ...form, correctOpt: e.target.value })}>
                  <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Explicación (Feedback)</label>
              <textarea className="input-field resize-none" rows={2} placeholder="Se mostrará si el usuario responde mal." value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex items-center gap-2"><Check size={16} /> {editData ? 'Actualizar' : 'Crear'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
