import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';

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
      <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: 13, color: value ? 'var(--t-text)' : 'var(--t-text-muted)', fontStyle: value ? 'normal' : 'italic' }}>{value || '(Vacío)'}</span>
    </div>
  );
}

// ── Block renderers (view-only) ───────────────────────────────────────────────

function BlockHeader({ title, subtitle }) {
  if (!title && !subtitle) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      {title && <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 4px' }}>{title}</h2>}
      {subtitle && <p style={{ fontSize: 13, color: 'var(--t-text-muted)', margin: 0, lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

function EnlacesBlockView({ block }) {
  // Support both new structure (links[]) and legacy (url + images)
  const links = block.links?.length
    ? block.links
    : (block.url ? [{ images: block.images || [], url: block.url }] : []);
  if (!links.length) return null;
  const layout = block.links_layout || 'columna';
  const isGrid = layout === 'grid';
  const isFila = layout === 'fila';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {block.titulo && <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 4px' }}>{block.titulo}</h2>}
      {block.subtitulo && <p style={{ fontSize: 13, color: 'var(--t-text-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{block.subtitulo}</p>}
      <div style={
        isFila
          ? { display: 'flex', flexDirection: 'row', gap: 12, overflowX: 'auto', alignItems: 'flex-start' }
          : isGrid
          ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }
          : { display: 'flex', flexDirection: 'column', gap: 12 }
      }>
        {links.map((link, i) => (
          isGrid ? (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              {(link.images || []).map((img, j) => (
                <a key={j} href={link.url || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                  <img src={img.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 9, border: '1px solid var(--t-border)', display: 'block' }} />
                </a>
              ))}
              {link.url && (
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: '#3b82f6', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  {link.url}
                </a>
              )}
            </div>
          ) : (
            /* columna y fila: imágenes en fila horizontal (height 160), url a la derecha */
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, overflow: 'hidden' }}>
              {(link.images || []).map((img, j) => (
                <a key={j} href={link.url || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', flexShrink: 0 }}>
                  <img src={img.url} alt="" style={{ height: 160, borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)', display: 'block' }} />
                </a>
              ))}
              {link.url && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, maxWidth: 320 }}>
                  <span style={{ fontSize: 26, color: '#3b82f6', fontWeight: 300, flexShrink: 0 }}>→</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                    {link.url}
                  </a>
                </div>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
}

function ImagenBlockView({ block }) {
  const images = block.images || [];
  if (!images.length) return null;
  const layout = block.images_layout;

  if (layout === 'fila') {
    return (
      <div>
        <BlockHeader title={block.titulo} subtitle={block.subtitulo} />
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, overflowX: 'auto' }}>
          {images.map((img, i) => (
            <img key={i} src={img.url || img} alt="" style={{ height: 180, width: 'auto', borderRadius: 9, objectFit: 'contain', border: '1px solid var(--t-border)', flexShrink: 0, display: 'block' }} />
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div>
        <BlockHeader title={block.titulo} subtitle={block.subtitulo} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {images.map((img, i) => (
            <img key={i} src={img.url || img} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)', display: 'block' }} />
          ))}
        </div>
      </div>
    );
  }

  // Default: columna
  return (
    <div>
      <BlockHeader title={block.titulo} subtitle={block.subtitulo} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {images.map((img, i) => (
          <img key={i} src={img.url || img} alt="" style={{ width: '100%', height: 'auto', maxHeight: 320, borderRadius: 9, objectFit: 'contain', border: '1px solid var(--t-border)', display: 'block' }} />
        ))}
      </div>
    </div>
  );
}

function ImagenTextoBlockView({ block }) {
  const items = block.items || [];
  if (!items.length) return null;
  const layout   = block.it_layout || 'img-text';
  const isHoriz  = layout === 'img-text' || layout === 'text-img';
  const imgFirst = layout === 'img-text' || layout === 'img-top';

  return (
    <div>
      <BlockHeader title={block.titulo} subtitle={block.subtitulo} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((it, i) => {
          const color = it.text_color || '#6366f1';
          const hasImage = it.image?.url;
          const hasText  = it.texto?.trim();
          const imgEl = hasImage ? (
            <img src={it.image.url} alt="" style={{ width: '100%', borderRadius: 10, display: 'block' }} />
          ) : null;
          const txtEl = hasText ? (
            <div style={{ background: color + '18', border: `1px solid ${color}44`, borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--t-text)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', textAlign: it.text_align || 'left' }}>{it.texto}</p>
            </div>
          ) : null;
          const first  = imgFirst ? imgEl : txtEl;
          const second = imgFirst ? txtEl : imgEl;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: isHoriz && hasImage && hasText ? '1fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
              {first}
              {second}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderEBBlock(eb, i, colMode) {
  return (
    <div key={i}>
      {eb.type === 'text' && eb.content && (() => {
        const p = <p style={{ margin: 0, fontSize: eb.size || 14, fontWeight: eb.bold ? 700 : 400, textAlign: eb.align || 'left', color: '#1a1a1a', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{eb.content}</p>;
        return eb.href ? <a href={eb.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{p}</a> : p;
      })()}
      {eb.type === 'image' && eb.url && (() => {
        const img = <img src={eb.url} alt="" style={{ display: 'block', maxWidth: '100%', maxHeight: colMode ? 120 : 200, objectFit: 'contain', borderRadius: 6, margin: '0 auto' }} />;
        return <div style={{ textAlign: 'center' }}>{eb.href ? <a href={eb.href} target="_blank" rel="noopener noreferrer">{img}</a> : img}</div>;
      })()}
      {eb.type === 'button' && eb.text && (
        <div style={{ textAlign: 'center' }}>
          <a href={eb.href || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#6366f1', color: 'white', borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{eb.text}</a>
        </div>
      )}
      {eb.type === 'columns' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{(eb.left || []).map((sub, j) => renderEBBlock(sub, j, true))}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{(eb.right || []).map((sub, j) => renderEBBlock(sub, j, true))}</div>
        </div>
      )}
    </div>
  );
}

function CorreccionBlockView({ block }) {
  const { theme } = useTheme();
  const emailBlocks = block.email_blocks || [];
  if (!emailBlocks.length) return null;
  const emailBg  = block.email_bg || '#ffffff';
  const outerBg  = theme === 'dark' ? '#1e1e1e' : '#e0e0e0';

  return (
    <div>
      <BlockHeader title={block.titulo} subtitle={block.subtitulo} />
      <div style={{ background: outerBg, borderRadius: 12, padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: emailBg, borderRadius: 8, padding: '20px 24px', width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {emailBlocks.map((eb, i) => renderEBBlock(eb, i, false))}
        </div>
      </div>
    </div>
  );
}

function BlockView({ block }) {
  const wrapStyle = { border: '1px solid var(--t-border-s)', borderRadius: 12, padding: '20px 24px', background: 'var(--t-surface3)' };
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
  const { theme, toggle } = useTheme();
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
    <div data-theme={theme} style={{ ...s, background: 'var(--t-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2px solid var(--t-border)', borderTopColor: 'var(--t-text)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div data-theme={theme} style={{ ...s, background: 'var(--t-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: '#f87171', fontSize: 14 }}>{error}</p>
      <button onClick={() => navigate('/anti-biblioteca')} style={{ background: 'transparent', border: '1px solid var(--t-border-mid)', color: 'var(--t-text-placeholder)', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
        ← Anti-Biblioteca
      </button>
    </div>
  );

  const hasRightContent = item.categoria || item.subcategoria || item.marca !== null || item.asunto !== null || item.adelanto !== null || item.enviado_el || item.ficha_url || item.fecha_analisis;
  const enviadoDisplay  = item.enviado_el ? new Date(item.enviado_el + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
  const fechaAnalisisDisplay = item.fecha_analisis ? new Date(item.fecha_analisis + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
  const resolvedTags    = (item.tags || []).map(tid => allTags.find(t => t.id === tid)).filter(Boolean);
  const blocksData      = item.blocks_data && item.blocks_data.blocks ? item.blocks_data : { blocks: [] };

  return (
    <div data-theme={theme} style={{ ...s, background: 'var(--t-bg)', color: 'var(--t-text)', minHeight: '100vh', padding: '32px 24px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Back button + theme toggle */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/anti-biblioteca')}
            style={{ background: 'transparent', border: '1px solid var(--t-border)', color: 'var(--t-text-muted)', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-border-muted)'; e.currentTarget.style.color = 'var(--t-text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border)'; e.currentTarget.style.color = 'var(--t-text-muted)'; }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Anti-Biblioteca
          </button>
          <button onClick={toggle}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={{ background: 'transparent', border: '1px solid var(--t-border)', color: 'var(--t-text-muted)', borderRadius: 8, padding: '6px 10px', fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Two equal columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'flex-start' }}>

          {/* Left: image (screenshot) */}
          <div style={{ height: 560, overflowY: 'auto', overflowX: 'hidden', borderRadius: 12, border: '1px solid var(--t-border)' }}>
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
                      <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
                      <Pill colors={CATEGORIA_COLORS[item.categoria] || { bg: '#18181b', border: '#27272a', color: 'var(--t-text)' }} label={CATEGORIAS[item.categoria] || item.categoria} />
                    </div>
                  )}
                  {item.subcategoria && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
                      <Pill colors={SUBCAT_COLORS[item.subcategoria] || { bg: '#18181b', border: '#27272a', color: 'var(--t-text)' }} label={SUBCATEGORIAS[item.subcategoria] || item.subcategoria} />
                    </div>
                  )}
                </div>
              )}

              {/* Etiquetas */}
              {resolvedTags.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etiquetas</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {resolvedTags.map(tag => (
                      <span key={tag.id} style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', background: tag.color + '22', border: `1px solid ${tag.color}`, color: tag.color }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fields — email */}
              <Field label="Marca"          value={item.marca} />
              {item.categoria === 'email' && <Field label="Asunto"         value={item.asunto} />}
              {item.categoria === 'email' && <Field label="Adelanto"       value={item.adelanto} />}
              {item.categoria === 'email' && <Field label="Enviado el Día" value={enviadoDisplay} />}
              {/* Fields — ficha */}
              {item.categoria === 'ficha' && item.ficha_url && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>URL</span>
                  <a href={item.ficha_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 13, color: '#a5b4fc', textDecoration: 'none', wordBreak: 'break-all' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                    {item.ficha_url}
                  </a>
                </div>
              )}
              {item.categoria === 'ficha' && fechaAnalisisDisplay && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fecha de Análisis</span>
                  <span style={{ fontSize: 13, color: 'var(--t-text)' }}>{fechaAnalisisDisplay}</span>
                  <span style={{ fontSize: 11, color: 'var(--t-text-subtle)', fontStyle: 'italic' }}>* La página puede haber sido editada en fechas posteriores</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Blocks — view only */}
        {(item.categoria === 'email' || item.categoria === 'ficha') && blocksData.blocks.length > 0 && (
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
