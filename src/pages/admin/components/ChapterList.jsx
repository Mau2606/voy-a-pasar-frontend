import { useState, useEffect } from 'react';
import { getChaptersByManual, createChapter, updateChapter, deleteChapter, uploadChapterPdf } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { Plus, Pencil, Trash2, Check, X, HelpCircle, Upload, FileText } from 'lucide-react';

const emptyForm = { title: '', orderIndex: '' };

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

export default function ChapterList({ manual, onSelectChapter }) {
  const toast = useToast();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // PDF upload state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfChapter, setPdfChapter] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => { fetchChapters(); }, [manual.id]);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const c = await getChaptersByManual(manual.id);
      setChapters(c.data);
    } catch {
      toast.error('Error al cargar capítulos');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditData(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditData(c); setForm({ title: c.title, orderIndex: c.orderIndex }); setShowModal(true); };
  const openPdfUpload = (c) => { setPdfChapter(c); setPdfFile(null); setShowPdfModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, orderIndex: parseInt(form.orderIndex, 10), manualId: manual.id };
      if (editData) { await updateChapter(editData.id, payload); toast.success('Capítulo actualizado'); }
      else { await createChapter(payload); toast.success('Capítulo creado'); }
      setShowModal(false); fetchChapters();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar capítulo'); }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile || !pdfChapter) return;
    setUploading(true);
    try {
      await uploadChapterPdf(pdfChapter.id, pdfFile);
      toast.success('PDF del capítulo subido correctamente');
      setShowPdfModal(false);
      fetchChapters();
    } catch {
      toast.error('Error al subir el PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar capítulo y sus preguntas?')) return;
    try { await deleteChapter(id); toast.success('Capítulo eliminado'); fetchChapters(); }
    catch { toast.error('No se pudo eliminar el capítulo'); }
  };

  if (loading && chapters.length === 0) {
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
          <h2 className="font-bold text-gray-900 dark:text-white">Capítulos ({chapters.length})</h2>
          <p className="text-sm text-gray-500 mt-0.5">En el manual: {manual.title}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm py-2 px-4 shadow-sm">
          <Plus size={16} /> Nuevo capítulo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <tr>
              {['Orden', 'Título', 'PDF', 'Acciones'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {chapters.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition">
                <td className="px-5 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 w-20">{c.orderIndex}</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.title}</td>
                <td className="px-5 py-4">
                  {c.pdfUrl ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/20">
                      <FileText size={12} /> Subido
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500 border border-gray-100 dark:border-gray-700">
                      Sin PDF
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => openPdfUpload(c)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition border border-emerald-100 dark:border-emerald-900/20"
                  >
                    <Upload size={14} /> {c.pdfUrl ? 'Cambiar PDF' : 'Subir PDF'}
                  </button>
                  <button 
                    onClick={() => onSelectChapter(c)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 transition border border-amber-100 dark:border-amber-900/20"
                  >
                    <HelpCircle size={14} /> Preguntas
                  </button>
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {chapters.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">Este manual no tiene capítulos aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Chapter Modal */}
      {showModal && (
        <Modal title={editData ? 'Editar capítulo' : 'Nuevo capítulo'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
              <input className="input-field" required placeholder="Título del capítulo (ej. Principios Fundamentales)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orden (#)</label>
              <input className="input-field" type="number" min="1" required placeholder="1, 2, 3…" value={form.orderIndex} onChange={e => setForm({ ...form, orderIndex: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex items-center gap-2"><Check size={16} /> {editData ? 'Actualizar' : 'Crear'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {/* PDF Upload Modal */}
      {showPdfModal && pdfChapter && (
        <Modal title={`Subir PDF — ${pdfChapter.title}`} onClose={() => setShowPdfModal(false)}>
          <form onSubmit={handlePdfUpload} className="space-y-4">
            {pdfChapter.pdfUrl && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                <FileText size={16}/> PDF actual: <span className="font-mono truncate">{pdfChapter.pdfUrl.split('/').pop()}</span>
              </div>
            )}
            <div>
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {pdfFile ? pdfFile.name : 'Haz clic para seleccionar el archivo PDF'}
                </span>
                <span className="text-xs text-gray-400 mt-1">Opcional — Solo el PDF de este capítulo</span>
                <input type="file" accept=".pdf" className="hidden" required onChange={e => setPdfFile(e.target.files[0])} />
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={uploading || !pdfFile} className="btn-primary flex items-center gap-2 w-full justify-center">
                {uploading ? <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"/> : <Upload size={16}/>}
                {uploading ? 'Subiendo…' : 'Subir archivo'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
