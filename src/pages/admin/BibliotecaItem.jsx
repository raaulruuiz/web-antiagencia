import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';

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

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) { navigate('/admin/login'); return; }
        const res = await fetch(`${API_BASE}/biblioteca/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(res.status === 404 ? 'Captura no encontrada' : 'Error al cargar');
        setItem(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

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
        <button onClick={() => navigate('/admin/biblioteca')} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-lg transition-colors">
          ← Volver a Biblioteca
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/biblioteca')}
          className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Biblioteca
        </button>
        <span className="text-zinc-600 text-xs truncate max-w-xs">{item.filename}</span>
      </div>

      {/* Imagen */}
      <div className="max-w-5xl">
        <img
          src={item.url}
          alt={item.filename}
          className="w-full rounded-xl border border-zinc-800"
          style={{ display: 'block' }}
        />
        <p className="text-xs text-zinc-600 mt-2">
          {new Date(item.created_at).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

    </div>
  );
}
