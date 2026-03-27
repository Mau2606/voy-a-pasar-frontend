import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser, approveUser, suspendUser } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Pencil, Trash2, Check, Shield, User, X, CheckCircle, Clock, Ban, ChevronLeft, ChevronRight } from 'lucide-react';

const emptyUserForm = { name: '', email: '', password: '', role: 'USER' };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    ACTIVE:    { icon: CheckCircle, label: 'Activo',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    PENDING:   { icon: Clock,       label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    SUSPENDED: { icon: Ban,         label: 'Suspendido', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };
  const c = config[status] || config.ACTIVE;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.cls}`}>
      <Icon size={11} /> {c.label}
    </span>
  );
}

export default function UsersManager() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 15;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyUserForm);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(page, PAGE_SIZE);
      // Spring Page object: { content, totalPages, totalElements, ... }
      const data = res.data;
      if (Array.isArray(data)) {
        // Non-paginated fallback
        setUsers(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setUsers(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      }
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditData(null);
    setForm(emptyUserForm);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditData(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await updateUser(editData.id, form);
        toast.success('Usuario actualizado');
      } else {
        await createUser(form);
        toast.success('Usuario creado');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    try {
      await deleteUser(id);
      toast.success('Usuario eliminado');
      fetchUsers();
    } catch {
      toast.error('Error al eliminar usuario');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      toast.success('Usuario aprobado');
      fetchUsers();
    } catch {
      toast.error('Error al aprobar usuario');
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('¿Suspender este usuario?')) return;
    try {
      await suspendUser(id);
      toast.success('Usuario suspendido');
      fetchUsers();
    } catch {
      toast.error('Error al suspender usuario');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white">Usuarios ({totalElements})</h2>
        <button id="btn-create-user" onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <td className="px-5 py-3 text-sm text-gray-500">#{u.id}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {u.role === 'ADMIN' ? <Shield size={11} /> : <User size={11} />} {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={u.accountStatus || 'ACTIVE'} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1.5">
                    {/* Approve — only show for PENDING/SUSPENDED users */}
                    {(u.accountStatus === 'PENDING' || u.accountStatus === 'SUSPENDED') && (
                      <button onClick={() => handleApprove(u.id)} title="Aprobar"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {/* Suspend — only show for ACTIVE users */}
                    {(u.accountStatus === 'ACTIVE' || !u.accountStatus) && u.role !== 'ADMIN' && (
                      <button onClick={() => handleSuspend(u.id)} title="Suspender"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition">
                        <Ban size={15} />
                      </button>
                    )}
                    <button onClick={() => openEdit(u)} title="Editar"
                            className="p-1.5 rounded-lg text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition">
                      <Pencil size={15} />
                    </button>
                    {u.role !== 'ADMIN' && (
                      <button onClick={() => handleDelete(u.id)} title="Eliminar"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No hay usuarios</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40 flex items-center gap-1">
              <ChevronLeft size={14} /> Anterior
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40 flex items-center gap-1">
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal title={editData ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
              <input className="input-field" required placeholder="Nombre completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input className="input-field" type="email" required placeholder="correo@ejemplo.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña {editData && <span className="text-gray-400 font-normal">(dejar en blanco para no cambiar)</span>}
              </label>
              <input className="input-field" type="password" placeholder="Mínimo 6 caracteres"
                     minLength={editData ? 0 : 6} required={!editData}
                     value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
              <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Check size={16} /> {editData ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
