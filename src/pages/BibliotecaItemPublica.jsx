import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';

const CATEGORIAS = {
  email: 'Email',
  ficha: 'Ficha de Producto',
};
const SUBCATEGORIAS = {
  automatizacion: 'Automatización',
  campana: 'Campaña',
};

const CATEGORIA_COLORS = {
  email: { bg: 'rgba(59,130,246,0.15)', border: '#3b82f6', color: '#93c5fd' },
  ficha: { bg: 'rgba(168,85,247,0.15)', border: '#a855f7', color: '#d8b4fe' },
};
const SUBCAT_COLORS = {
  automatizacion: { bg: 'rgba(34,197,94,0.12)', border: '#22c55e', color: '#86efac' },
  campana:        { bg: 'rgba(249,115,22,0.12)',  border: '#f97316', color: '#fdba74' },
};

function Tag({ colors, label }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', display: 'inline-block',
      background: colors.bg, border: `1px solid ${colors.border}`, color: colors.color,
    }}>
      {label}
    </span>
  );
}

function Field({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: 13, color: value ? 'white' : '#71717a', fontStyle: value ? 'normal' : 'italic' }}>{value || '(Vacío)'}</span>
    </div>
  );
}

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
  const hasRightContent = item.categoria || item.subcategoria || item.marca !== null || item.asunto !== null || item.adelanto !== null || item.enviado_el;

  const enviadoDisplay = item.enviado_el
    ? new Date(item.enviado_el + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

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

        {/* Nombre */}
        {displayName && (
          <p style={{ fontSize: 16, fontWeight: 500, color: 'white', margin: '0 0 20px' }}>{displayName}</p>
        )}

        {/* Two equal columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'flex-start' }}>

          {/* Left: image with scroll frame */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 560, overflowY: 'auto', overflowX: 'hidden', borderRadius: 12, border: '1px solid #27272a' }}>
              <img
                src={item.url}
                alt={displayName || item.filename}
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </div>

          {/* Right: metadata */}
          {hasRightContent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Tags */}
              {(item.categoria || item.subcategoria) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.categoria && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
                      <Tag colors={CATEGORIA_COLORS[item.categoria] || { bg: '#18181b', border: '#27272a', color: 'white' }} label={CATEGORIAS[item.categoria] || item.categoria} />
                    </div>
                  )}
                  {item.subcategoria && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
                      <Tag colors={SUBCAT_COLORS[item.subcategoria] || { bg: '#18181b', border: '#27272a', color: 'white' }} label={SUBCATEGORIAS[item.subcategoria] || item.subcategoria} />
                    </div>
                  )}
                </div>
              )}

              {/* Fields */}
              <Field label="Marca" value={item.marca} />
              <Field label="Asunto" value={item.asunto} />
              <Field label="Adelanto" value={item.adelanto} />
              <Field label="Enviado el Día" value={enviadoDisplay} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
