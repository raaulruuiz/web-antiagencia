import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function ConfirmModal({ count, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-xl border border-zinc-700 p-6 flex flex-col gap-4"
        style={{ backgroundColor: '#1a1a1a', width: '320px' }}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-sm text-white font-medium">
          {count === 1
            ? '¿Eliminar esta captura?'
            : `¿Eliminar ${count} capturas?`}
        </p>
        <p className="text-xs text-zinc-400">Esta acción no se puede deshacer.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="text-xs text-white bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Biblioteca() {
  const navigate = useNavigate();
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected]   = useState(new Set());
  const [deleting, setDeleting]   = useState(false);
  const [confirm, setConfirm]     = useState(null); // { ids: [] }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Sin sesión');
      const res = await fetch(`${API_BASE}/biblioteca`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar');
      setItems(await res.json());
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteIds = useCallback(async (ids) => {
    setDeleting(true);
    setConfirm(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/biblioteca`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error('Error al eliminar');
      setItems(prev => prev.filter(i => !ids.includes(i.id)));
      setSelected(new Set());
    } catch(e) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  }, []);

  const askDelete = (ids) => setConfirm({ ids });

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exitSelect = () => { setSelecting(false); setSelected(new Set()); };

  return (
    <div className="p-4 md:p-8" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>

      {/* Modal de confirmación */}
      {confirm && (
        <ConfirmModal
          count={confirm.ids.length}
          onConfirm={() => deleteIds(confirm.ids)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Biblioteca</h1>
        <div className="flex items-center gap-2">
          {selecting ? (
            <>
              {selected.size > 0 && (
                <button
                  onClick={() => askDelete([...selected])}
                  disabled={deleting}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  <TrashIcon />
                  Eliminar {selected.size}
                </button>
              )}
              <button
                onClick={exitSelect}
                className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <a
                href="/anti-biblioteca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Enlace público
              </a>
              <button
                onClick={() => setSelecting(true)}
                className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
              >
                Seleccionar
              </button>
              <button
                onClick={load}
                disabled={loading}
                className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Cargando…' : 'Actualizar'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-zinc-500 text-sm">
          Sin capturas todavía. Usa la extensión para capturar páginas.
        </p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(item => {
            const isSelected = selected.has(item.id);
            return (
              <div
                key={item.id}
                className="group relative cursor-pointer"
                onClick={() => {
                  if (selecting) { toggleSelect(item.id); return; }
                  navigate(`/admin/biblioteca/${item.id}`);
                }}
              >
                <div
                  className="aspect-video bg-zinc-900 rounded-lg overflow-hidden border transition-colors"
                  style={{ borderColor: isSelected ? '#fff' : '#27272a' }}
                >
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Overlay hover con papelera */}
                  {!selecting && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={e => { e.stopPropagation(); askDelete([item.id]); }}
                        disabled={deleting}
                        className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-red-600/80 transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}

                  {/* Checkbox modo selección */}
                  {selecting && (
                    <div className="absolute top-2 left-2">
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                        style={{
                          borderColor: isSelected ? '#fff' : 'rgba(255,255,255,0.5)',
                          backgroundColor: isSelected ? '#fff' : 'rgba(0,0,0,0.4)',
                        }}
                      >
                        {isSelected && <span style={{ color: '#000' }}><CheckIcon /></span>}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-500 mt-1 truncate">
                  {new Date(item.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
