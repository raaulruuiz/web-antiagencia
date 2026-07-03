import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';

const CATEGORIAS = { email: 'Email', ficha: 'Ficha de Producto' };
const SUBCATEGORIAS = { automatizacion: 'Automatización', campana: 'Campaña' };
const CATEGORIA_COLORS = {
  email: { bg: 'rgba(59,130,246,0.15)', border: '#3b82f6', color: '#93c5fd' },
  ficha: { bg: 'rgba(168,85,247,0.15)', border: '#a855f7', color: '#d8b4fe' },
};
const SUBCAT_COLORS = {
  automatizacion: { bg: 'rgba(34,197,94,0.12)', border: '#22c55e', color: '#86efac' },
  campana:        { bg: 'rgba(249,115,22,0.12)',  border: '#f97316', color: '#fdba74' },
};

function Pill({ colors, label }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', display: 'inline-block', background: colors.bg, border: `1px solid ${colors.border}`, color: colors.color, alignSelf: 'flex-start' }}>
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

// ── Block renderers (view-only) ───────────────────────────────────────────────

function EnlacesBlockView({ block }) {
  // Support both new structure (links[]) and legacy (url + images)
  const links = block.links?.length
    ? block.links
    : (block.url ? [{ images: block.images || [], url: block.url }] : []);
  if (!links.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {links.map((link, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {(link.images || []).map((img, j) => (
            <a key={j} href={link.url || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', flexShrink: 0 }}>
              <img src={img.url} alt="" style={{ height: 72, borderRadius: 7, objectFit: 'cover', border: '1px solid #27272a', display: 'block' }} />
            </a>
          ))}
          {link.url && (
            <>
              <span style={{ fontSize: 22, color: '#6366f1', fontWeight: 300 }}>→</span>
              <a href={link.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: '#a5b4fc', textDecoration: 'none', wordBreak: 'break-all' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                {link.url}
              </a>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ImagenBlockView({ block }) {
  const images = block.images || [];
  const [current, setCurrent] = useState(0);
  if (!images.length) return null;

  if (block.view === 'carousel') {
    return (
      <div>
        <div style={{ position: 'relative' }}>
          <img src={images[current]} style={{ width: '100%', borderRadius: 10, display: 'block', maxHeight: 400, objectFit: 'contain', background: '#111' }} />
          {images.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 }}>
              <button onClick={() => setCurrent(c => (c - 1 + images.length) % images.length)}
                style={{ background: '#1a1a1a', border: '1px solid #3f3f46', color: 'white', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>‹</button>
              <span style={{ fontSize: 11, color: '#71717a' }}>{current + 1} / {images.length}</span>
              <button onClick={() => setCurrent(c => (c + 1) % images.length)}
                style={{ background: '#1a1a1a', border: '1px solid #3f3f46', color: 'white', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>›</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid
  return (
    <div>
      <BlockHeader title={block.title} subtitle={block.subtitle} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
        {images.map((url, i) => (
          <div key={i} style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: 8, border: '1px solid #27272a' }}>
            <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ImagenTextoBlockView({ block }) {
  if (!block.text && !block.imageUrl) return null;
  const isReversed = block.layout === 'text_image';
  const color = block.color || '#6366f1';
  return (
    <div>
      <BlockHeader title={block.title} subtitle={block.subtitle} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start', direction: isReversed ? 'rtl' : 'ltr' }}>
        {block.imageUrl && (
          <div style={{ direction: 'ltr' }}>
            <img src={block.imageUrl} style={{ width: '100%', borderRadius: 10, display: 'block' }} />
          </div>
        )}
        {block.text && (
          <div style={{ direction: 'ltr', background: color + '18', border: `1px solid ${color}44`, borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'white', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{block.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CorreccionBlockView({ block }) {
  const rows = block.rows || [];
  if (!rows.length) return null;
  return (
    <div>
      <BlockHeader title={block.title} subtitle={block.subtitle} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(row => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.cols}, 1fr)`, gap: 8 }}>
            {row.cells.map(cell => (
              <div key={cell.id}>
                {cell.type === 'text' ? (
                  <p style={{ fontSize: 13, color: 'white', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '8px 0' }}>{cell.content}</p>
                ) : cell.imageUrl ? (
                  <img src={cell.imageUrl} style={{ width: '100%', borderRadius: 8, display: 'block' }} />
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockView({ block }) {
  const wrapStyle = { border: '1px solid #1f1f1f', borderRadius: 12, padding: '20px 24px', background: '#0a0a0a' };
  switch (block.type) {
    case 'enlaces':      return <div style={wrapStyle}><EnlacesBlockView block={block} /></div>;
    case 'imagen':       return <div style={wrapStyle}><ImagenBlockView block={block} /></div>;
    case 'imagen_texto': return <div style={wrapStyle}><ImagenTextoBlockView block={block} /></div>;
    case 'correccion':   return <div style={wrapStyle}><CorreccionBlockView block={block} /></div>;
    default: return null;
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BibliotecaItemPublica() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem]       = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/biblioteca/${id}`).then(r => r.ok ? r.json() : Promise.reject(r.status === 404 ? 'No encontrado' : 'Error')),
      fetch(`${API_BASE}/biblioteca/tags/public`).then(r => r.ok ? r.json() : []),
    ])
      .then(([itemData, tagsData]) => { setItem(itemData); setAllTags(tagsData); })
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

  const hasRightContent = item.categoria || item.subcategoria || item.marca !== null || item.asunto !== null || item.adelanto !== null || item.enviado_el;
  const enviadoDisplay  = item.enviado_el ? new Date(item.enviado_el + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
  const resolvedTags    = (item.tags || []).map(tid => allTags.find(t => t.id === tid)).filter(Boolean);
  const blocksData      = item.blocks_data && item.blocks_data.blocks ? item.blocks_data : { blocks: [] };

  return (
    <div style={{ ...s, background: '#0d0d0d', color: 'white', minHeight: '100vh', padding: '32px 24px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Back button */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate('/anti-biblioteca')}
            style={{ background: 'transparent', border: '1px solid #27272a', color: '#71717a', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#52525b'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#71717a'; }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Anti-Biblioteca
          </button>
        </div>

        {/* Two equal columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'flex-start' }}>

          {/* Left: image */}
          <div style={{ height: 560, overflowY: 'auto', overflowX: 'hidden', borderRadius: 12, border: '1px solid #27272a' }}>
            <img src={item.url} alt={item.filename} style={{ width: '100%', display: 'block' }} />
          </div>

          {/* Right: metadata */}
          {hasRightContent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Categoria / Subcategoria */}
              {(item.categoria || item.subcategoria) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.categoria && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
                      <Pill colors={CATEGORIA_COLORS[item.categoria] || { bg: '#18181b', border: '#27272a', color: 'white' }} label={CATEGORIAS[item.categoria] || item.categoria} />
                    </div>
                  )}
                  {item.subcategoria && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
                      <Pill colors={SUBCAT_COLORS[item.subcategoria] || { bg: '#18181b', border: '#27272a', color: 'white' }} label={SUBCATEGORIAS[item.subcategoria] || item.subcategoria} />
                    </div>
                  )}
                </div>
              )}

              {/* Etiquetas */}
              {resolvedTags.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etiquetas</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {resolvedTags.map(tag => (
                      <span key={tag.id} style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', background: tag.color + '22', border: `1px solid ${tag.color}`, color: tag.color }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fields */}
              <Field label="Marca"          value={item.marca} />
              <Field label="Asunto"         value={item.asunto} />
              <Field label="Adelanto"       value={item.adelanto} />
              <Field label="Enviado el Día" value={enviadoDisplay} />
            </div>
          )}
        </div>

        {/* Blocks — view only, only for email */}
        {item.categoria === 'email' && blocksData.blocks.length > 0 && (
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {blocksData.blocks.map(block => (
              <BlockView key={block.id} block={block} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
