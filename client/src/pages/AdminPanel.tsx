import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Toggle } from '../components/ui/Toggle';
import { Search, UserPlus, CheckCircle, XCircle, Snowflake, RefreshCw, Trash2, Edit3, ShieldAlert, History, Users } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  year: number;
  section: string;
  role: 'STUDENT' | 'ADMIN';
  isFrozen: boolean;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  disclaimerAcceptedAt?: string;
  createdAt: string;
  aura: number;
}

interface Transaction {
  id: string;
  fromUser: { firstName: string; lastName: string; email: string };
  toUser: { firstName: string; lastName: string; email: string };
  points: number;
  type: 'POSITIVE' | 'NEGATIVE';
  reason?: string;
  createdAt: string;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'transactions'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [resetAuraUser, setResetAuraUser] = useState<AdminUser | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    password: '',
    year: '1',
    section: 'A',
    role: 'STUDENT',
    emailVerified: true,
  });

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    year: 1,
    section: 'A',
    role: 'STUDENT' as 'STUDENT' | 'ADMIN',
    emailVerified: true,
    newPassword: '',
  });

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (yearFilter !== 'all') params.set('year', yearFilter);
      if (sectionFilter !== 'all') params.set('section', sectionFilter);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (verifiedFilter !== 'all') params.set('verified', verifiedFilter);

      const res = await client.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch admin users', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTx(true);
    try {
      const res = await client.get('/admin/transactions?limit=50');
      setTransactions(res.data.data?.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchTransactions();
    }
  }, [activeTab, search, yearFilter, sectionFilter, roleFilter, verifiedFilter]);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // Actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await client.post('/admin/users', createForm);
      showNotification('Usuario creado exitosamente');
      setCreateModalOpen(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        nickname: '',
        email: '',
        password: '',
        year: '1',
        section: 'A',
        role: 'STUDENT',
        emailVerified: true,
      });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Error al crear usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname || '',
      year: user.year,
      section: user.section,
      role: user.role,
      emailVerified: user.emailVerified,
      newPassword: '',
    });
    setFormError('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');
    setFormLoading(true);

    try {
      const payload: any = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        nickname: editForm.nickname,
        year: editForm.year,
        section: editForm.section,
        role: editForm.role,
        emailVerified: editForm.emailVerified,
      };
      if (editForm.newPassword.trim()) {
        payload.password = editForm.newPassword;
      }

      await client.put(`/admin/users/${editingUser.id}`, payload);
      showNotification(`Usuario ${editingUser.firstName} actualizado`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Error al actualizar usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleVerify = async (user: AdminUser) => {
    try {
      const newStatus = !user.emailVerified;
      await client.put(`/admin/users/${user.id}/verify-email`, { emailVerified: newStatus });
      showNotification(`Correo de ${user.firstName} ${newStatus ? 'validado' : 'desmarcado'}`);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al modificar estado de correo');
    }
  };

  const handleToggleFreeze = async (user: AdminUser) => {
    try {
      const newStatus = !user.isFrozen;
      await client.put(`/admin/users/${user.id}/freeze`, { frozen: newStatus });
      showNotification(`Cuenta de ${user.firstName} ${newStatus ? 'congelada' : 'descongelada'}`);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al congelar/descongelar');
    }
  };

  const handleResetAura = async () => {
    if (!resetAuraUser) return;
    try {
      await client.put(`/admin/users/${resetAuraUser.id}/reset-aura`);
      showNotification(`Aura de ${resetAuraUser.firstName} reseteada a 0`);
      setResetAuraUser(null);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al resetear aura');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    try {
      await client.delete(`/admin/users/${deleteUser.id}`);
      showNotification(`Usuario ${deleteUser.firstName} eliminado`);
      setDeleteUser(null);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-4 font-semibold text-sm">
          ✨ {actionSuccess}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <span>👑 Panel de Control Admin</span>
          </h1>
          <p className="text-sm opacity-70 mt-1">Gestión completa de usuarios, validaciones y auditoría</p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2 py-2.5 px-4 text-sm">
          <UserPlus size={18} />
          <span>Nuevo Usuario</span>
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md'
              : 'hover:bg-slate-200 dark:hover:bg-white/10 opacity-70'
          }`}
        >
          <Users size={18} />
          <span>Usuarios ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'transactions'
              ? 'bg-purple-600 text-white shadow-md'
              : 'hover:bg-slate-200 dark:hover:bg-white/10 opacity-70'
          }`}
        >
          <History size={18} />
          <span>Historial de Transacciones</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          {/* Filters Bar */}
          <Card className="flex flex-wrap gap-3 p-4">
            <div className="flex-1 min-w-[200px] relative">
              <Input
                label="Buscar usuario"
                placeholder="Nombre, apodo o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 w-28">
              <label className="text-xs font-semibold opacity-70">Año</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm outline-none"
              >
                <option value="all" className="bg-white dark:bg-zinc-900">Todos</option>
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-zinc-900">{y}º</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 w-28">
              <label className="text-xs font-semibold opacity-70">Sección</label>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm outline-none"
              >
                <option value="all" className="bg-white dark:bg-zinc-900">Todas</option>
                {['A', 'B', 'C', 'D'].map((s) => (
                  <option key={s} value={s} className="bg-white dark:bg-zinc-900">{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 w-32">
              <label className="text-xs font-semibold opacity-70">Estado Correo</label>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm outline-none"
              >
                <option value="all" className="bg-white dark:bg-zinc-900">Todos</option>
                <option value="true" className="bg-white dark:bg-zinc-900">Verificados</option>
                <option value="false" className="bg-white dark:bg-zinc-900">Pendientes</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 w-28">
              <label className="text-xs font-semibold opacity-70">Rol</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm outline-none"
              >
                <option value="all" className="bg-white dark:bg-zinc-900">Todos</option>
                <option value="STUDENT" className="bg-white dark:bg-zinc-900">Estudiante</option>
                <option value="ADMIN" className="bg-white dark:bg-zinc-900">Admin</option>
              </select>
            </div>
          </Card>

          {/* User List */}
          {loadingUsers ? (
            <div className="text-center py-12 opacity-60">Cargando usuarios...</div>
          ) : (
            <div className="grid gap-4">
              {users.map((u) => (
                <Card key={u.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base">{u.firstName} {u.lastName}</h3>
                        {u.nickname && <span className="text-xs opacity-70">"{u.nickname}"</span>}
                        {u.role === 'ADMIN' && (
                          <span className="text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/30">
                            Admin
                          </span>
                        )}
                        {u.isFrozen && (
                          <span className="text-[10px] font-bold bg-sky-500/20 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-md border border-sky-500/30 flex items-center gap-1">
                            <Snowflake size={12} /> Congelado
                          </span>
                        )}
                      </div>

                      <p className="text-xs opacity-70 mt-0.5">{u.email}</p>
                      <div className="text-xs opacity-60 mt-1 flex items-center gap-3">
                        <span>{u.year}º Año - Sección {u.section}</span>
                        <span>•</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{u.aura} Aura</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2 flex-wrap self-end sm:self-center w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/10">
                    {/* Toggle Verify Button */}
                    <button
                      onClick={() => handleToggleVerify(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                        u.emailVerified
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                      title={u.emailVerified ? 'Desmarcar verificación de correo' : 'Validar correo manualmente'}
                    >
                      {u.emailVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      <span>{u.emailVerified ? 'Verificado' : 'Validar'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-purple-500/20 hover:text-purple-600 transition-colors"
                      title="Editar usuario"
                    >
                      <Edit3 size={16} />
                    </button>

                    {/* Freeze Button */}
                    <button
                      onClick={() => handleToggleFreeze(u)}
                      className={`p-2 rounded-xl border transition-colors ${
                        u.isFrozen
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/30 hover:bg-sky-500/30'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border-transparent hover:bg-slate-200 dark:hover:bg-white/20'
                      }`}
                      title={u.isFrozen ? 'Descongelar cuenta' : 'Congelar cuenta'}
                    >
                      <Snowflake size={16} />
                    </button>

                    {/* Reset Aura Button */}
                    <button
                      onClick={() => setResetAuraUser(u)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-amber-500/20 hover:text-amber-600 transition-colors"
                      title="Resetear aura a 0"
                    >
                      <RefreshCw size={16} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteUser(u)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Card>
              ))}

              {users.length === 0 && (
                <div className="text-center py-12 opacity-50">No se encontraron usuarios con los filtros actuales.</div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'transactions' && (
        <Card className="p-4 overflow-x-auto">
          {loadingTx ? (
            <div className="text-center py-12 opacity-60">Cargando transacciones...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 opacity-70">
                  <th className="py-3 px-2">Emisor</th>
                  <th className="py-3 px-2">Receptor</th>
                  <th className="py-3 px-2">Puntos</th>
                  <th className="py-3 px-2">Razón</th>
                  <th className="py-3 px-2">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 font-medium">{t.fromUser.firstName} {t.fromUser.lastName}</td>
                    <td className="py-3 px-2 font-medium">{t.toUser.firstName} {t.toUser.lastName}</td>
                    <td className="py-3 px-2">
                      <span className={`font-bold ${t.type === 'POSITIVE' ? 'text-emerald-600 dark:text-green-400' : 'text-rose-600 dark:text-red-400'}`}>
                        {t.type === 'POSITIVE' ? '+100 Aura' : '-100 Aura'}
                      </span>
                    </td>
                    <td className="py-3 px-2 opacity-80 max-w-xs truncate">{t.reason || 'Sin razón'}</td>
                    <td className="py-3 px-2 opacity-60 text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 opacity-50">No hay transacciones registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Modal: Crear Usuario */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="➕ Crear Nuevo Usuario">
        <form onSubmit={handleCreateUser} className="space-y-4">
          {formError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">{formError}</div>}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nombre"
              value={createForm.firstName}
              onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
              required
            />
            <Input
              label="Apellido"
              value={createForm.lastName}
              onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Apodo (opcional)"
            value={createForm.nickname}
            onChange={(e) => setCreateForm({ ...createForm, nickname: e.target.value })}
          />

          <Input
            label="Correo electrónico"
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium opacity-80">Año</label>
              <select
                value={createForm.year}
                onChange={(e) => setCreateForm({ ...createForm, year: e.target.value })}
                className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm outline-none"
              >
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-zinc-900">{y}º Año</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium opacity-80">Sección</label>
              <select
                value={createForm.section}
                onChange={(e) => setCreateForm({ ...createForm, section: e.target.value })}
                className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm outline-none"
              >
                {['A', 'B', 'C', 'D'].map((s) => (
                  <option key={s} value={s} className="bg-white dark:bg-zinc-900">Sec. {s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium opacity-80">Rol</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm outline-none"
              >
                <option value="STUDENT" className="bg-white dark:bg-zinc-900">Estudiante</option>
                <option value="ADMIN" className="bg-white dark:bg-zinc-900">Admin</option>
              </select>
            </div>
          </div>

          <Toggle
            label="Marcar correo como verificado inmediatamente"
            checked={createForm.emailVerified}
            onChange={(checked) => setCreateForm({ ...createForm, emailVerified: checked })}
          />

          <Button type="submit" className="w-full mt-4" loading={formLoading}>
            Guardar y Crear Usuario
          </Button>
        </form>
      </Modal>

      {/* Modal: Editar Usuario */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="✏️ Editar Usuario">
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            {formError && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">{formError}</div>}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
              />
              <Input
                label="Apellido"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Apodo"
              value={editForm.nickname}
              onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-80">Año</label>
                <select
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value, 10) })}
                  className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm outline-none"
                >
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y} className="bg-white dark:bg-zinc-900">{y}º Año</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-80">Sección</label>
                <select
                  value={editForm.section}
                  onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                  className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm outline-none"
                >
                  {['A', 'B', 'C', 'D'].map((s) => (
                    <option key={s} value={s} className="bg-white dark:bg-zinc-900">Sec. {s}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-80">Rol</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'STUDENT' | 'ADMIN' })}
                  className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm outline-none"
                >
                  <option value="STUDENT" className="bg-white dark:bg-zinc-900">Estudiante</option>
                  <option value="ADMIN" className="bg-white dark:bg-zinc-900">Admin</option>
                </select>
              </div>
            </div>

            <Toggle
              label="Correo verificado"
              checked={editForm.emailVerified}
              onChange={(checked) => setEditForm({ ...editForm, emailVerified: checked })}
            />

            <Input
              label="Cambiar Contraseña (dejar en blanco para no cambiar)"
              type="password"
              placeholder="Nueva contraseña..."
              value={editForm.newPassword}
              onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
            />

            <Button type="submit" className="w-full mt-4" loading={formLoading}>
              Guardar Cambios
            </Button>
          </form>
        )}
      </Modal>

      {/* Modal: Reset Aura */}
      <Modal isOpen={!!resetAuraUser} onClose={() => setResetAuraUser(null)} title="🔄 Resetear Aura">
        {resetAuraUser && (
          <div className="space-y-4">
            <p className="opacity-80 text-sm">
              ¿Estás seguro de resetear los puntos de aura de <strong>{resetAuraUser.firstName} {resetAuraUser.lastName}</strong>?
              Esto borrará todo su historial de puntos recibidos y dejará su aura en 0.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setResetAuraUser(null)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleResetAura} className="flex-1">
                Sí, Resetear a 0
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Eliminar Usuario */}
      <Modal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} title="🗑️ Eliminar Usuario">
        {deleteUser && (
          <div className="space-y-4">
            <p className="opacity-80 text-sm">
              ¿Estás seguro de eliminar permanentemente a <strong>{deleteUser.firstName} {deleteUser.lastName}</strong> ({deleteUser.email})?
              Esta acción eliminará todos sus datos y no se puede deshacer.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDeleteUser(null)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDeleteUser} className="flex-1">
                Eliminar Permanentemente
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPanel;
