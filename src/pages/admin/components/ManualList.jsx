import { useState, useEffect } from 'react';
import { getManuals, createManual, updateManual, deleteManual } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { Plus, Pencil, Trash2, Check, X, BookOpen, Upload, FileText } from 'lucide-react';

const emptyForm = { title: '', description: '' };

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

export default function ManualList({ onSelectManual }) {
  const toast = useToast();
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfManual, setPdfManual] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchManuals(); }, []);

  const fetchManuals = async () => {
    setLoading(true);
    try {
      const m = await getManuals();
      setManuals(m.data);
    } catch {
      toast.error('Error al cargar manuales');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditData(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (m) => { setEditData(m); setForm({ title: m.title, description: m.description || '' }); setShowModal(true); };
  const openPdfUpload = (m) => { setPdfManual(m); setPdfFile(null); setShowPdfModal(true); };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) { await updateManual(editData.id, form); toast.success('Manual actualizado'); }
      else { await createManual(form); toast.success('Manual creado'); }
      setShowModal(false); fetchManuals();
    } catch (err) { toast.error(err.response?.data?.message || 'Error guardando manual'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar manual y todo su contenido?')) return;
    try { await deleteManual(id); toast.success('Manual eliminado'); fetchManuals(); }
    catch { toast.error('No se pudo eliminar el manual'); }
  };

  if (loading && manuals.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white">Manuales ({manuals.length})</h2>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={16} /> Nuevo manual
        </button>
      </div>

      <div className="p-5 bg-gray-50/50 dark:bg-gray-900/10">
        {manuals.length === 0 ? (
          <div className="py-12 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            No hay manuales creados aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {manuals.map((m) => (
              <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">#{m.id}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{m.title}</h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                  {m.description || 'Sin descripción'}
                </p>

                <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-2">
                  <button 
                    onClick={() => openPdfUpload(m)} 
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition border border-emerald-100 dark:border-emerald-800/30"
                  >
                    {m.pdfUrl ? <><FileText size={16} /> Actualizar Archivo PDF</> : <><Upload size={16} /> Subir PDF ({m.pdfUrl ? 'Listo' : 'Falta'})</>}
                  </button>
                  <button 
                    onClick={() => onSelectManual(m)} 
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition"
                  >
                    <BookOpen size={16} /> Gestionar Capítulos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editData ? 'Editar manual' : 'Nuevo manual'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
              <input className="input-field" required placeholder="Título del manual" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Descripción breve (opcional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex items-center gap-2"><Check size={16} /> {editData ? 'Actualizar' : 'Crear'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {showPdfModal && pdfManual && (
        <Modal title={`Subir PDF — ${pdfManual.title}`} onClose={() => setShowPdfModal(false)}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!pdfFile) return;
            setUploading(true);
            try {
              const { uploadManualPdf } = await import('../../../services/api');
              await uploadManualPdf(pdfManual.id, pdfFile);
              toast.success('PDF subido correctamente');
              setShowPdfModal(false); 
              fetchManuals();
            } catch { toast.error('Error al subir PDF'); }
            finally { setUploading(false); }
          }} className="space-y-4">
            {pdfManual.pdfUrl && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 text-sm flex items-center gap-2">
                <FileText size={16}/> PDF actual: <span className="font-mono truncate">{pdfManual.pdfUrl.split('/').pop()}</span>
              </div>
            )}
            <div>
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {pdfFile ? pdfFile.name : 'Haz clic para seleccionar el archivo (Max 100MB)'}
                </span>
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
