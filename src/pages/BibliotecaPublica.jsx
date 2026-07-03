import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';

export default function BibliotecaPublica() {
  const navigate = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/biblioteca/public`);
      if (!res.ok) throw new Error('Error al cargar');
      setItems(await res.json());
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div
      style={{
        backgroundColor: '#0d0d0d',
        color: 'white',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/images/9563e10d2_AALogo.png" alt="Logo" style={{ height: '28px', width: 'auto' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Anti-Biblioteca</h1>
          </div>
          <button
            onClick={load}
            disabled={loading}
            style={{
              fontSize: '0.75rem',
              color: '#a1a1aa',
              background: 'transparent',
              border: '1px solid #3f3f46',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { if (!loading) { e.target.style.borderColor = '#71717a'; e.target.style.color = '#fff'; }}}
            onMouseLeave={e => { e.target.style.borderColor = '#3f3f46'; e.target.style.color = '#a1a1aa'; }}
          >
            {loading ? 'Cargando…' : 'Actualizar'}
          </button>
        </div>

        {error && (
          <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '16px' }}>{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p style={{ color: '#52525b', fontSize: '0.875rem' }}>Sin capturas todavía.</p>
        )}

        {items.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '12px',
          }}>
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/anti-biblioteca/${item.id}`)}
                style={{ display: 'block', textDecoration: 'none', cursor: 'pointer' }}
              >
                <div style={{
                  aspectRatio: '16/9',
                  backgroundColor: '#18181b',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #27272a',
                  transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#52525b'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#27272a'}
                >
                  <img
                    src={item.url}
                    alt={item.filename}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                </div>
                <div style={{ marginTop: 4 }}>
                  {item.marca ? (
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.marca}
                    </p>
                  ) : (
                    <p style={{ fontSize: 11, color: '#52525b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {new Date(item.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                  {(item.categoria || item.subcategoria) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                      {item.categoria && (
                        <span style={{
                          fontSize: 10, borderRadius: 999, padding: '1px 7px', fontWeight: 500,
                          background: item.categoria === 'email' ? 'rgba(59,130,246,0.15)' : 'rgba(168,85,247,0.15)',
                          border: `1px solid ${item.categoria === 'email' ? '#3b82f6' : '#a855f7'}`,
                          color: item.categoria === 'email' ? '#93c5fd' : '#d8b4fe',
                        }}>
                          {item.categoria === 'email' ? 'Email' : 'Ficha'}
                        </span>
                      )}
                      {item.subcategoria && (
                        <span style={{
                          fontSize: 10, borderRadius: 999, padding: '1px 7px', fontWeight: 500,
                          background: item.subcategoria === 'automatizacion' ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)',
                          border: `1px solid ${item.subcategoria === 'automatizacion' ? '#22c55e' : '#f97316'}`,
                          color: item.subcategoria === 'automatizacion' ? '#86efac' : '#fdba74',
                        }}>
                          {item.subcategoria === 'automatizacion' ? 'Auto.' : 'Campaña'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
