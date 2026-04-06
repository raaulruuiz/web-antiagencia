import { useState, useEffect } from 'react';
import { useAdmin } from './AdminLayout';

import { BACKEND_URL as BACKEND, LOOM_API_KEY as API_KEY } from '@/lib/config';

const PAGE_OPTIONS = [
  { value: 'dashboard',        label: 'Dashboard' },
  { value: 'loom',             label: 'Loom' },
  { value: 'automatizaciones', label: 'Automatizaciones' },
];

function timeAgo(dateStr) {
  if (!dateStr) return 'Nunca';
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Hoy';
  if (d === 1) return 'Ayer';
  return `Hace ${d} días`;
}

const INVITE_EXPIRY_DAYS = 7;

function daysAgo(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function RoleBadge({ role }) {
  const styles = role === 'admin'
    ? 'bg-amber-900 text-amber-300'
    : 'bg-zinc-800 text-zinc-400';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${styles}`}>
      {role === 'admin' ? 'Admin' : 'Lector'}
    </span>
  );
}

function StatusBadge({ confirmed, invitedAt }) {
  if (confirmed) return null;
  const days = daysAgo(invitedAt);
  const expired = days >= INVITE_EXPIRY_DAYS;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${expired ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
      {expired ? `Invitación expirada (${days}d)` : `Pendiente (${days}d)`}
    </span>
  );
}

function PageCheckboxes({ selected, onChange }) {
  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(p => p !== val) : [...selected, val]);
  };
  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {PAGE_OPTIONS.map(({ value, label }) => (
        <label key={value} className="flex items-center gap-1.5 text-sm text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={() => toggle(value)}
            className="accent-white"
          />
          {label}
        </label>
      ))}
    </div>
  );
}

export default function AdminUsers() {
  const { role: myRole } = useAdmin();
  const isAdmin = myRole === 'admin';

  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');

  // Invite form state
  const [email, setEmail]         = useState('');
  const [inviteRole, setInviteRole] = useState('lector');
  const [invitePages, setInvitePages] = useState([]);
  const [inviting, setInviting]   = useState(false);

  // Editing state: { [userId]: { role, pages } }
  const [editing, setEditing] = useState({});
  const [saving, setSaving]   = useState({});

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch(`${BACKEND}/admin/users`, { headers: { 'x-api-key': API_KEY } });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!email) return;
    setInviting(true);
    setMsg('');
    const res = await fetch(`${BACKEND}/admin/invite-user`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: inviteRole, pages: inviteRole === 'admin' ? [] : invitePages }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Invitación enviada a ${email}`);
      setEmail('');
      setInviteRole('lector');
      setInvitePages([]);
      fetchUsers();
    } else {
      setMsg(`Error: ${data.error}`);
    }
    setInviting(false);
  }

  function startEdit(u) {
    setEditing(prev => ({ ...prev, [u.id]: { role: u.role, pages: u.pages ?? [] } }));
  }

  function cancelEdit(id) {
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
  }

  async function saveEdit(u) {
    const { role, pages } = editing[u.id];
    setSaving(prev => ({ ...prev, [u.id]: true }));
    await fetch(`${BACKEND}/admin/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, pages }),
    });
    setSaving(prev => { const n = { ...prev }; delete n[u.id]; return n; });
    cancelEdit(u.id);
    fetchUsers();
  }

  async function handleDelete(id, userEmail) {
    if (!confirm(`¿Eliminar a ${userEmail}?`)) return;
    await fetch(`${BACKEND}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'x-api-key': API_KEY },
    });
    fetchUsers();
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-white text-2xl font-semibold mb-6">Usuarios</h1>

      {/* Invitar — solo admin */}
      {isAdmin && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-5 mb-8">
          <h2 className="text-white text-sm font-medium mb-4">Invitar usuario</h2>
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                required
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-zinc-500 placeholder:text-zinc-600"
              />
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
              >
                <option value="lector">Lector</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={inviting}
                className="bg-white text-black rounded-lg px-5 py-2 text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-50"
              >
                {inviting ? 'Enviando...' : 'Invitar'}
              </button>
            </div>
            {inviteRole === 'lector' && (
              <div>
                <p className="text-zinc-500 text-xs mb-1">Páginas accesibles (además de Usuarios):</p>
                <PageCheckboxes selected={invitePages} onChange={setInvitePages} />
              </div>
            )}
          </form>
          {msg && <p className={`mt-3 text-sm ${msg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}
        </div>
      )}

      {/* Limpiar expirados */}
      {isAdmin && users.some(u => !u.confirmed && daysAgo(u.invited_at) >= INVITE_EXPIRY_DAYS) && (
        <div className="flex items-center justify-between rounded-xl border border-red-900 bg-red-950/30 px-5 py-3 mb-2">
          <p className="text-red-300 text-sm">Hay invitaciones que llevan más de {INVITE_EXPIRY_DAYS} días sin aceptarse.</p>
          <button
            onClick={async () => {
              const expired = users.filter(u => !u.confirmed && daysAgo(u.invited_at) >= INVITE_EXPIRY_DAYS);
              for (const u of expired) {
                await fetch(`${BACKEND}/admin/users/${u.id}`, { method: 'DELETE', headers: { 'x-api-key': API_KEY } });
              }
              fetchUsers();
            }}
            className="text-red-300 hover:text-red-100 text-xs border border-red-800 rounded-lg px-3 py-1 transition-colors ml-4 flex-shrink-0"
          >
            Eliminar expiradas
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {loading && <p className="text-zinc-500 text-sm px-1">Cargando...</p>}
        {!loading && users.map(u => {
          const isEditing = !!editing[u.id];
          const editState = editing[u.id] ?? { role: u.role, pages: u.pages ?? [] };

          return (
            <div key={u.id} className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-white text-sm flex-1">{u.email}</span>
                <StatusBadge confirmed={u.confirmed} invitedAt={u.invited_at} />
                <RoleBadge role={isEditing ? editState.role : u.role} />
                <span className="text-zinc-500 text-xs">{u.confirmed ? timeAgo(u.last_sign_in) : '—'}</span>
                {isAdmin && !isEditing && (
                  <button
                    onClick={() => startEdit(u)}
                    className="text-zinc-500 hover:text-white text-xs transition-colors"
                  >
                    Editar
                  </button>
                )}
                {isAdmin && !isEditing && (
                  <button
                    onClick={() => handleDelete(u.id, u.email)}
                    className="text-zinc-600 hover:text-red-400 text-xs transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              {/* Panel de edición inline */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-zinc-400 text-xs">Rol:</span>
                    <select
                      value={editState.role}
                      onChange={e => setEditing(prev => ({ ...prev, [u.id]: { ...prev[u.id], role: e.target.value, pages: [] } }))}
                      className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2 py-1 outline-none"
                    >
                      <option value="lector">Lector</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {editState.role === 'lector' && (
                    <div className="mb-4">
                      <p className="text-zinc-500 text-xs mb-1">Páginas accesibles (además de Usuarios):</p>
                      <PageCheckboxes
                        selected={editState.pages}
                        onChange={pages => setEditing(prev => ({ ...prev, [u.id]: { ...prev[u.id], pages } }))}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(u)}
                      disabled={saving[u.id]}
                      className="bg-white text-black rounded-lg px-4 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                    >
                      {saving[u.id] ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => cancelEdit(u.id)}
                      className="text-zinc-500 hover:text-white text-xs transition-colors px-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
