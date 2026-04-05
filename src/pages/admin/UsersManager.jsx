import { useEffect, useState } from 'react';
import { getUsers, getUsersStats, createUser, updateUser, deleteUser, approveUser, activateMembership, deactivateMembership } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Pencil, Trash2, Check, Shield, User, X, CheckCircle, Clock, Ban, ChevronLeft, ChevronRight, MessageCircle, Zap, Users, UserCheck, Infinity as InfinityIcon, Calendar, CalendarDays } from 'lucide-react';
import Tooltip from '../../components/Tooltip';

const emptyUserForm = { name: '', email: '', password: '', role: 'USER', accessType: '' };

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
    ACTIVE:           { icon: CheckCircle, label: 'Activo',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    PENDING_APPROVAL: { icon: Clock,       label: 'Pendiente Aprob.',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    PENDING_PAYMENT:  { icon: Clock,       label: 'Pendiente Pago',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    INACTIVE:         { icon: Ban,         label: 'Inactivo', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    SUSPENDED:        { icon: Ban,         label: 'Suspendido', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 15;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyUserForm);

  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activateTarget, setActivateTarget] = useState(null);
  const [activateType, setActivateType] = useState('THIRTY_DAYS');

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        getUsers(page, PAGE_SIZE),
        getUsersStats().catch(() => ({ data: null }))
      ]);
      
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
      
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
    setForm({ name: u.name, email: u.email, password: '', role: u.role, accessType: u.accessType || '' });
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

  const handleWhatsApp = async (u) => {
    try {
      await approveUser(u.id);
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error('Error al aprobar usuario en BD');
      return;
    }
    
    const bankData = import.meta.env.VITE_BANK_DATA || "Banco: [TU BANCO] / Cuenta: [VISTA/CORRIENTE] / Número: [NÚMERO] / RUT: [TU RUT] / Email: [TU EMAIL]";
    let text = `Hola ${u.name}, tu solicitud para 'Voy a pasar' fue aceptada. Para activar tu mes de acceso, realiza la transferencia a: ${bankData}. Envía el comprobante por aquí.`;
    
    let phoneNum = u.phone || '';
    if (phoneNum && !phoneNum.startsWith('56')) phoneNum = '56' + phoneNum;
    if (!phoneNum) {
      toast.error('El usuario no tiene número de teléfono registrado.');
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const url = isMobile ? `whatsapp://send?phone=${phoneNum}&text=${encodeURIComponent(text)}` : `https://web.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('¿Desactivar este usuario? Perderá acceso.')) return;
    try {
      await deactivateMembership(id);
      toast.success('Usuario desactivado');
      fetchUsers();
    } catch {
      toast.error('Error al desactivar usuario');
    }
  };

  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    try {
      await activateMembership(activateTarget.id, activateType);
      toast.success('Membresía activada');
      setShowActivateModal(false);
      fetchUsers();
    } catch {
      toast.error('Error al activar membresía');
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
    <div className="space-y-6">
      {/* Resumen/Stats Monitor */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Activos</p>
              <h4 className="text-2xl font-bold">{stats.active}</h4>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pendiente Aprob.</p>
              <h4 className="text-2xl font-bold">{stats.pending}</h4>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 flex items-center justify-center">
              <Ban size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Suspendidos</p>
              <h4 className="text-2xl font-bold">{stats.suspended}</h4>
            </div>
          </div>
          <div className="card p-4 flex flex-col justify-center">
            <p className="text-sm text-gray-500 font-medium mb-2 border-b border-gray-100 pb-1">Desglose Activos</p>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-gray-600"><InfinityIcon size={12}/> Perm.</span>
                <span className="font-semibold">{stats.permanent}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-gray-600"><CalendarDays size={12}/> 30 Días</span>
                <span className="font-semibold">{stats.thirtyDays}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-gray-600"><Calendar size={12}/> 1 Día</span>
                <span className="font-semibold">{stats.oneDay}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Usuarios */}
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
              {['ID', 'Nombre', 'Email', 'Rol', 'Activación', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map((u, index) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <td className="px-5 py-3 text-sm text-gray-500">#{page * PAGE_SIZE + index + 1}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {u.role === 'ADMIN' ? <Shield size={11} /> : <User size={11} />} {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {u.accessType === 'ONE_DAY' ? '1 Día' : u.accessType === 'THIRTY_DAYS' ? '30 Días' : u.accessType === 'PERMANENT' ? 'Permanente' : <span className="text-gray-400">N/A</span>}
                    </span>
                    {u.expirationDate && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Vence: {new Date(u.expirationDate).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={u.accountStatus || 'ACTIVE'} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1.5 flex-wrap max-w-[140px]">
                    {/* WhatsApp Approve — PENDING_APPROVAL */}
                    {u.accountStatus === 'PENDING_APPROVAL' && (
                      <Tooltip text="Aprobar y contactar por WhatsApp">
                        <button onClick={() => handleWhatsApp(u)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
                          <MessageCircle size={15} />
                        </button>
                      </Tooltip>
                    )}
                    {/* Confirm Payment — PENDING_PAYMENT */}
                    {u.accountStatus === 'PENDING_PAYMENT' && (
                      <Tooltip text="Confirmar pago del estudiante">
                        <button onClick={() => { setActivateTarget(u); setShowActivateModal(true); }}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                          <Zap size={15} />
                        </button>
                      </Tooltip>
                    )}
                    {/* Deactivate — ACTIVE */}
                    {u.accountStatus === 'ACTIVE' && u.role !== 'ADMIN' && (
                      <Tooltip text="Desactivar acceso permanentemente">
                        <button onClick={() => handleDeactivate(u.id)}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition">
                          <Ban size={15} />
                        </button>
                      </Tooltip>
                    )}
                    {/* Reactivate from INACTIVE or SUSPENDED */}
                    {(u.accountStatus === 'INACTIVE' || u.accountStatus === 'SUSPENDED') && (
                      <Tooltip text="Reactivar membresía">
                        <button onClick={() => { setActivateTarget(u); setShowActivateModal(true); }}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                          <Zap size={15} />
                        </button>
                      </Tooltip>
                    )}
                    <Tooltip text="Editar información del usuario">
                      <button onClick={() => openEdit(u)}
                              className="p-1.5 rounded-lg text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition">
                        <Pencil size={15} />
                      </button>
                    </Tooltip>
                    {u.role !== 'ADMIN' && (
                      <Tooltip text="Eliminar usuario del sistema">
                        <button onClick={() => handleDelete(u.id)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                          <Trash2 size={15} />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No hay usuarios</td></tr>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Activación {editData && <span className="text-gray-400 font-normal">(dejar igual para no cambiar plazos)</span>}
              </label>
              <select className="input-field" value={form.accessType || ''} onChange={e => setForm({ ...form, accessType: e.target.value })}>
                <option value="">-- Sin activación inmediata --</option>
                <option value="ONE_DAY">1 Día</option>
                <option value="THIRTY_DAYS">30 Días</option>
                <option value="PERMANENT">Permanente</option>
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

      {/* Activate Modal */}
      {showActivateModal && activateTarget && (
        <Modal title="Confirmar Pago y Membresía" onClose={() => setShowActivateModal(false)}>
          <form onSubmit={handleActivateSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Por cuánto tiempo deseas activar la membresía de <b>{activateTarget.name}</b>?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Acceso</label>
              <select className="input-field" value={activateType} onChange={(e) => setActivateType(e.target.value)}>
                <option value="ONE_DAY">1 Día</option>
                <option value="THIRTY_DAYS">30 Días</option>
                <option value="PERMANENT">Permanente</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Check size={16} /> Activar
              </button>
              <button type="button" onClick={() => setShowActivateModal(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </div>
  );
}
