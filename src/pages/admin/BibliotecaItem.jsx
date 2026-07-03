import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';

const CATEGORIAS = [
  { value: 'email', label: 'Email' },
  { value: 'ficha', label: 'Ficha de Producto' },
];

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export default function BibliotecaItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editable fields
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState(null);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) { navigate('/admin/login'); return; }
        const res = await fetch(`${API_BASE}/biblioteca/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(res.status === 404 ? 'Captura no encontrada' : 'Error al cargar');
        const data = await res.json();
        setItem(data);
        setNombre(data.nombre || '');
        setCategoria(data.categoria || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const patch = async (updates) => {
    const token = await getToken();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/biblioteca/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setItem(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNombreChange = (v) => {
    setNombre(v);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => patch({ nombre: v }), 800);
  };

  const handleCategoria = (v) => {
    setCategoria(v);
    patch({ categoria: v });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#0d0d0d' }}>
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={() => navigate('/admin/biblioteca')} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-4 py-2 rounded-lg transition-colors">
          ← Volver a Biblioteca
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/biblioteca')}
          className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Biblioteca
        </button>
        {saving && <span className="text-xs text-zinc-600">Guardando…</span>}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-8 items-start" style={{ maxWidth: 1100 }}>

        {/* Left: image */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Nombre editable */}
          <input
            type="text"
            value={nombre}
            onChange={e => handleNombreChange(e.target.value)}
            placeholder="Nombre…"
            className="bg-transparent border border-zinc-800 focus:border-zinc-500 rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors w-full"
          />
          <img
            src={item.url}
            alt={nombre || item.filename}
            className="w-full rounded-xl border border-zinc-800"
            style={{ display: 'block' }}
          />
          <p className="text-xs text-zinc-700">
            {new Date(item.created_at).toLocaleDateString('es-ES', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>

        {/* Right: metadata */}
        <div className="flex flex-col gap-6" style={{ width: 220, flexShrink: 0 }}>

          {/* Categoría */}
          {categoria ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-500 uppercase tracking-widest">Categoría</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1">
                  {CATEGORIAS.find(c => c.value === categoria)?.label}
                </span>
                <button
                  onClick={() => handleCategoria(null)}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors"
                  title="Quitar categoría"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <span className="text-sm text-zinc-300">¿Email o Ficha de Producto?</span>
              <div className="flex flex-col gap-2">
                {CATEGORIAS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => handleCategoria(c.value)}
                    className="border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-lg px-4 py-3 text-sm transition-colors text-left"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
