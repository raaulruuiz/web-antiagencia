import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';

const CATEGORIAS = {
  email: 'Email',
  ficha: 'Ficha de Producto',
};

export default function BibliotecaItemPublica() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/biblioteca/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status === 404 ? 'No encontrado' : 'Error'))
      .then(setItem)
      .catch(e => setError(typeof e === 'string' ? e : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [id]);

  const s = { fontFamily: 'system-ui, sans-serif' };

  if (loading) return (
    <div style={{ ...s, background: '#0d0d0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #27272a', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ ...s, background: '#0d0d0d', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: '#f87171', fontSize: 14 }}>{error}</p>
      <button onClick={() => navigate('/anti-biblioteca')} style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
        ← Anti-Biblioteca
      </button>
    </div>
  );

  const displayName = item.nombre || null;

  return (
    <div style={{ ...s, background: '#0d0d0d', color: 'white', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate('/anti-biblioteca')}
            style={{ background: 'transparent', border: '1px solid #27272a', color: '#71717a', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#52525b'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#71717a'; }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Anti-Biblioteca
          </button>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* Left: image */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayName && (
              <p style={{ fontSize: 15, fontWeight: 500, color: 'white', margin: 0 }}>{displayName}</p>
            )}
            <img
              src={item.url}
              alt={displayName || item.filename}
              style={{ width: '100%', borderRadius: 12, border: '1px solid #27272a', display: 'block' }}
            />
            <p style={{ fontSize: 11, color: '#3f3f46', margin: 0 }}>
              {new Date(item.created_at).toLocaleDateString('es-ES', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>

          {/* Right: metadata (only show if something set) */}
          {item.categoria && (
            <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, paddingTop: displayName ? 28 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Categoría</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'white', background: '#18181b', border: '1px solid #27272a', borderRadius: 999, padding: '4px 12px', display: 'inline-block' }}>
                  {CATEGORIAS[item.categoria] || item.categoria}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
