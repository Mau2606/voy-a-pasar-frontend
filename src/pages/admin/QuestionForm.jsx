import { useState } from 'react';
import { updateQuestion } from '../../services/api';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';

export default function QuestionForm({ initialData, chapterId, onSaved, onCancel }) {
  const [form, setForm] = useState(initialData || { 
    type: 'DIRECT', statement: '', optA: '', optB: '', optC: '', optD: '', optE: '', 
    correctOpt: 'A', explanation: '', pageReference: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, chapterId, pageReference: form.pageReference ? form.pageReference : null };
      if (initialData?.id) {
        await updateQuestion(initialData.id, payload);
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar pregunta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 card p-6">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
          <select className="input-field" value={form.type || 'DIRECT'} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="DIRECT">Directa (Preg. cerrada)</option>
            <option value="COMBINED">Combinada (Romanos)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cita (Página PDF)</label>
          <input className="input-field" type="text" placeholder="Ej. 42 o 45-46" value={form.pageReference || ''} onChange={e => setForm({ ...form, pageReference: e.target.value })} />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enunciado</label>
        <textarea className="input-field max-h-40 min-h-[4rem] resize-y font-mono text-sm leading-relaxed whitespace-pre-wrap" required rows={4} placeholder="Escribe la pregunta. Si es combinada, usa Enter para las opciones I, II, III..." value={form.statement || ''} onChange={e => setForm({ ...form, statement: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-gray-100 dark:border-gray-700 pt-3">
        {(['A', 'B', 'C', 'D', 'E']).map((opt) => (
          <div key={opt}>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Opción {opt}</label>
            <input className="input-field" required placeholder={`Texto ${opt}`} value={form[`opt${opt}`] || ''} onChange={e => setForm({ ...form, [`opt${opt}`]: e.target.value })} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">Opción Correcta</label>
          <select className="input-field border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20" value={form.correctOpt || 'A'} onChange={e => setForm({ ...form, correctOpt: e.target.value })}>
            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Explicación (Feedback)</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Se mostrará si el usuario responde mal." value={form.explanation || ''} onChange={e => setForm({ ...form, explanation: e.target.value })} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2"><Check size={16} /> {loading ? 'Guardando...' : 'Actualizar Pregunta'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}
