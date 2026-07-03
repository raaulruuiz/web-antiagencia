import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';

const CATEGORIA_COLORS = {
  email: { bg: 'rgba(59,130,246,0.15)', border: '#3b82f6', text: '#93c5fd' },
  ficha: { bg: 'rgba(168,85,247,0.15)', border: '#a855f7', text: '#d8b4fe' },
};

const CATEGORIAS = [
  {
    value: 'email',
    label: 'Email',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <polyline points="2,4 12,13 22,4"/>
      </svg>
    ),
  },
  {
    value: 'ficha',
    label: 'Ficha de Producto',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="15" y2="17"/>
      </svg>
    ),
  },
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
      if (res.ok) setItem(await res.json());
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#0d0d0d' }}>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={() => navigate('/admin/biblioteca')} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-4 py-2 rounded-lg transition-colors">
        ← Volver a Biblioteca
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-8" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>

      {/* Back + saving */}
      <div className="flex items-center gap-3 mb-5">
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

      {/* Nombre — full width */}
      <input
        type="text"
        value={nombre}
        onChange={e => handleNombreChange(e.target.value)}
        placeholder="Nombre…"
        className="w-full bg-transparent border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-base text-white outline-none transition-colors mb-5"
      />

      {/* Two equal columns */}
      <div className="grid grid-cols-2 gap-8 items-start">

        {/* Left: image with scroll frame */}
        <div>
          <div
            className="rounded-xl border border-zinc-800"
            style={{ height: 560, overflowY: 'auto', overflowX: 'hidden' }}
          >
            <img
              src={item.url}
              alt={nombre || item.filename}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          <p className="text-xs text-zinc-700 mt-2">
            {new Date(item.created_at).toLocaleDateString('es-ES', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>

        {/* Right: metadata */}
        <div className="flex flex-col gap-6">

          {categoria ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-500 uppercase tracking-widest">Categoría</span>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-medium rounded-full px-3 py-1"
                  style={{
                    background: CATEGORIA_COLORS[categoria]?.bg,
                    border: `1px solid ${CATEGORIA_COLORS[categoria]?.border}`,
                    color: CATEGORIA_COLORS[categoria]?.text,
                  }}
                >
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
            <div className="flex flex-col items-center gap-6 pt-8">
              <span className="text-sm text-zinc-300 self-start">¿Email o Ficha de Producto?</span>
              <div className="flex gap-4 w-full">
                {CATEGORIAS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => handleCategoria(c.value)}
                    className="flex flex-col items-center justify-center gap-3 border rounded-2xl transition-all flex-1"
                    style={{
                      height: 160,
                      borderColor: '#3f3f46',
                      color: '#71717a',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = CATEGORIA_COLORS[c.value].border;
                      e.currentTarget.style.color = CATEGORIA_COLORS[c.value].text;
                      e.currentTarget.style.background = CATEGORIA_COLORS[c.value].bg;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#3f3f46';
                      e.currentTarget.style.color = '#71717a';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {c.icon}
                    <span className="text-sm text-center leading-tight px-2">{c.label}</span>
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
