import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Search, MoreHorizontal, Mail, X, Check, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPendingReports, getAllReports, resolveReport } from '../../services/api';
import QuestionForm from './QuestionForm'; // existing question form

export default function ReportsManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING || ALL
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolveEmail, setResolveEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // For inline question editing
  const [editingQuestion, setEditingQuestion] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = filter === 'PENDING' ? await getPendingReports() : await getAllReports();
      setReports(res.data);
    } catch (err) {
      toast.error('Error al cargar reportes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleResolve = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resolveReport(selectedReport.id, {
        adminNotes: resolveNotes,
        emailResponse: resolveEmail
      });
      toast.success('Reporte resuelto correctamente');
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      toast.error('Error al resolver reporte');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openResolveModal = (report) => {
    setSelectedReport(report);
    setResolveNotes(report.adminNotes || '');
    setResolveEmail(''); // Start fresh for new response
  };

  const handleEditQuestionSaved = () => {
    setEditingQuestion(null);
    toast.success('Pregunta modificada. Ahora puedes resolver el reporte si lo deseas.');
    fetchReports();
  };

  if (editingQuestion) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setEditingQuestion(null)} className="btn-secondary">
            &larr; Volver a Reportes
          </button>
          <h2 className="text-xl font-bold">Editando pregunta reportada</h2>
        </div>
        {/* Re-use exiting QuestionForm, pass the flattened question object from the report */}
        <div className="card p-6 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900 border mb-6">
          <h3 className="font-semibold text-amber-800 dark:text-amber-500 flex items-center gap-2 mb-2">
            <AlertTriangle size={18} /> Contexto del reporte
          </h3>
          <p className="text-sm dark:text-gray-300"><strong>Usuario:</strong> {selectedReport?.userName} ({selectedReport?.userEmail})</p>
          <p className="text-sm dark:text-gray-300"><strong>Motivo:</strong> {selectedReport?.description}</p>
        </div>
        <QuestionForm 
          initialData={editingQuestion} 
          chapterId={editingQuestion.chapterId} 
          onSaved={handleEditQuestionSaved}
          onCancel={() => setEditingQuestion(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            Reportes de Errores ({reports.length})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestiona los problemas reportados por los usuarios en las preguntas.
          </p>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'PENDING' ? 'bg-white dark:bg-gray-700 shadow text-amber-600 dark:text-amber-400' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'ALL' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
          <CheckCircle size={48} className="text-emerald-500 mb-4" />
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">¡Todo está en orden!</h3>
          <p>No hay reportes de error {filter === 'PENDING' ? 'pendientes de revisión' : 'registrados'}.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="card p-5 border-l-4 border-l-amber-500">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left col: Report Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between lg:justify-start gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      report.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                    }`}>
                      {report.status === 'PENDING' ? 'PENDIENTE' : 'RESUELTO'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reportado por:</h4>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.userName} <span className="text-gray-500 font-normal">({report.userEmail})</span>
                    </p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900">
                    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-500 mb-1 flex items-center gap-1.5">
                      <Search size={14} /> Problema descrito:
                    </h4>
                    <p className="text-sm text-amber-900 dark:text-amber-200">
                      {report.description}
                    </p>
                  </div>

                  {report.status === 'RESOLVED' && report.adminNotes && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900 mt-2">
                       <h4 className="text-xs font-semibold text-emerald-800 dark:text-emerald-500 mb-1">Nota de resolución ({new Date(report.resolvedAt).toLocaleDateString()}):</h4>
                       <p className="text-xs text-emerald-900 dark:text-emerald-200">{report.adminNotes}</p>
                    </div>
                  )}
                </div>

                {/* Right col: Question snapshot & Actions */}
                <div className="flex-1 lg:max-w-md flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pregunta Afectada</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 line-clamp-4 relative">
                      <span className="text-xs text-indigo-500 font-bold block mb-1">{report.chapterTitle}</span>
                      {report.questionStatement}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setEditingQuestion({
                          id: report.questionId,
                          chapterId: report.chapterId,
                          statement: report.questionStatement,
                          optA: report.optA,
                          optB: report.optB,
                          optC: report.optC,
                          optD: report.optD,
                          optE: report.optE,
                          correctOpt: report.correctOpt,
                          explanation: report.explanation,
                          pageReference: report.pageReference
                        });
                      }}
                      className="flex-1 btn-secondary py-2 text-sm justify-center flex items-center gap-1.5"
                    >
                      <Edit2 size={16} /> Corregir Pregunta
                    </button>
                    
                    {report.status === 'PENDING' && (
                      <button
                        onClick={() => openResolveModal(report)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle size={16} /> Resolver y Avisar
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {selectedReport && !editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Check className="text-emerald-500" />
                Resolver Reporte de Error
              </h3>
              <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-rose-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleResolve} className="p-5 space-y-4">
              <p className="text-sm dark:text-gray-300">
                Estás a punto de marcar este reporte como resuelto.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas administrativas internas (Opcional)
                </label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  rows={2}
                  placeholder="Ej. Error de tipeo corregido."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <Mail size={16} className="text-indigo-500" /> Respuesta al usuario (Email)
                </label>
                <p className="text-xs text-gray-500 mb-2">Este mensaje se enviará por correo a <strong>{selectedReport.userEmail}</strong>. Déjalo en blanco si no quieres enviar correo.</p>
                <textarea
                  value={resolveEmail}
                  onChange={(e) => setResolveEmail(e.target.value)}
                  rows={4}
                  placeholder="Ej. Gracias por el aviso. Hemos corregido el error en la alternativa B, ya está disponible en la plataforma."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 custom-scrollbar"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedReport(null)} className="btn-secondary px-6">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="btn-primary px-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle size={16} />
                  {submitting ? 'Guardando...' : 'Marcar como Resuelto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
