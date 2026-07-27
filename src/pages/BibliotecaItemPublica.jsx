import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import MailerLitePopup from '@/components/MailerLitePopup';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';
const SESSION_KEY = 'biblioteca_acceso_email';
const PRO_KEY = 'biblioteca_pro_access';
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000;

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { email, ts } = JSON.parse(raw);
    if (Date.now() - ts > SESSION_TTL) { localStorage.removeItem(SESSION_KEY); return null; }
    return email;
  } catch { return null; }
}
function saveSession(email) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now() }));
}
function loadProSession() {
  try {
    const raw = localStorage.getItem(PRO_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw);
    if (Date.now() - ts > SESSION_TTL) { localStorage.removeItem(PRO_KEY); return false; }
    return true;
  } catch { return false; }
}

function getBibliotecaToken() {
  return localStorage.getItem('biblioteca_session_token') || null;
}

function Gate({ onAcceso }) {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState('idle'); // idle | cargando | error

  async function verificar(e) {
    e.preventDefault();
    if (!email) return;
    setEstado('cargando');
    try {
      const res = await fetch(`${API_BASE}/api/verificar-acceso-q3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.acceso) {
        saveSession(email);
        if (data.session_token) localStorage.setItem('biblioteca_session_token', data.session_token);
        onAcceso();
      } else {
        setEstado('error');
      }
    } catch {
      setEstado('error');
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '8px', padding: '40px 32px',
        maxWidth: '420px', width: '100%',
        fontFamily: "'Georgia', serif", textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#111' }}>
          Accede a la Anti-Biblioteca
        </h2>
        <p style={{ fontSize: '14px', color: '#555', marginBottom: '28px', lineHeight: '1.6' }}>
          Accede con el email con el que te registraste.
        </p>
        <form onSubmit={verificar}>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setEstado('idle'); }}
            required
            style={{
              width: '100%', padding: '12px 14px', fontSize: '15px',
              border: '1px solid #ccc', borderRadius: '4px',
              marginBottom: '12px', boxSizing: 'border-box',
              fontFamily: "'Georgia', serif", color: '#333',
            }}
          />
          {estado === 'error' && (
            <p style={{ color: '#cc0000', fontSize: '13px', marginBottom: '12px' }}>
              Este email no tiene acceso. Si crees que es un error, escríbenos.
            </p>
          )}
          <button
            type="submit"
            disabled={estado === 'cargando'}
            style={{
              width: '100%', padding: '13px',
              backgroundColor: estado === 'cargando' ? '#999' : '#0067FD',
              color: '#fff', border: 'none', borderRadius: '4px',
              fontSize: '15px', fontWeight: '700',
              cursor: estado === 'cargando' ? 'default' : 'pointer',
              fontFamily: "'Georgia', serif",
            }}
          >
            {estado === 'cargando' ? 'Verificando...' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
}

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
    <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', display: 'inline-block', background: colors.bg, border: `1px solid ${colors.border}`, color: colors.border, alignSelf: 'flex-start' }}>
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

// ── Icons (same as admin) ─────────────────────────────────────────────────────
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── ImageModal — imagen principal (same as admin) ─────────────────────────────
function ImageModal({ imageUrl, alt, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'32px 24px' }} onClick={onClose}>
      <div style={{ position:'relative', maxWidth:900, width:'100%' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:-36, right:0, background:'transparent', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6 }}><IconX /> Cerrar</button>
        <img src={imageUrl} alt={alt} style={{ width:'100%', borderRadius:12, display:'block' }} />
      </div>
    </div>
  );
}

// ── PreviewImg — imágenes de bloques (same as admin) ──────────────────────────
function PreviewImg({ src, imgStyle, wrapperStyle, onPreview, href }) {
  const [hov, setHov] = useState(false);
  const mobile = window.innerWidth < 640;
  const imgEl = <img src={src} alt="" loading="lazy" style={{ display: 'block', ...imgStyle }} />;
  return (
    <div style={{ position: 'relative', ...wrapperStyle }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>{imgEl}</a>
        : imgEl}
      {(hov || mobile) && (
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onPreview(src); }}
          style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11, fontWeight: 500, backdropFilter: 'blur(4px)' }}>
          <IconEye /> Ver
        </button>
      )}
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

function EnlacesBlockView({ block, onPreview, hideTitle }) {
  // Support both new structure (links[]) and legacy (url + images)
  const links = block.links?.length
    ? block.links
    : (block.url ? [{ images: block.images || [], url: block.url }] : []);
  if (!links.length && !block.titulo && !block.subtitulo) return null;
  if (!links.length) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  const layout = block.links_layout || 'columna';
  const isGrid = layout === 'grid';
  const isFila = layout === 'fila';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {!hideTitle && block.titulo && <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 4px' }}>{block.titulo}</h2>}
      {!hideTitle && block.subtitulo && <p style={{ fontSize: 13, color: 'var(--t-text-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{block.subtitulo}</p>}
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
                <PreviewImg key={j} src={img.url} href={link.url} onPreview={onPreview}
                  wrapperStyle={{ borderRadius: 9 }}
                  imgStyle={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 9, border: '1px solid var(--t-border)', display: 'block' }} />
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
            isFila ? (
              /* Fila: imágenes en horizontal */
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, overflow: 'hidden' }}>
                {(link.images || []).map((img, j) => (
                  <PreviewImg key={j} src={img.url} href={link.url} onPreview={onPreview}
                    wrapperStyle={{ borderRadius: 9, flexShrink: 0 }}
                    imgStyle={{ height: 160, width: 'auto', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)', display: 'block' }} />
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
            ) : (
              /* Columna: imágenes apiladas, url debajo */
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(link.images || []).map((img, j) => (
                  <PreviewImg key={j} src={img.url} href={link.url} onPreview={onPreview}
                    wrapperStyle={{ borderRadius: 9, flexShrink: 0 }}
                    imgStyle={{ height: 160, width: 'auto', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)', display: 'block' }} />
                ))}
                {link.url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 26, color: '#3b82f6', fontWeight: 300, flexShrink: 0 }}>→</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none', wordBreak: 'break-all' }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                      {link.url}
                    </a>
                  </div>
                )}
              </div>
            )
          )
        ))}
      </div>
    </div>
  );
}

function ImagenBlockView({ block, onPreview, hideTitle }) {
  const images = block.images || [];
  if (!images.length && !block.titulo && !block.subtitulo) return null;
  if (!images.length) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  const layout = block.images_layout;

  if (layout === 'fila') {
    return (
      <div>
        {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, overflowX: 'auto' }}>
          {images.map((img, i) => (
            <PreviewImg key={i} src={img.url || img} onPreview={onPreview}
              wrapperStyle={{ borderRadius: 9, flexShrink: 0 }}
              imgStyle={{ height: 180, width: 'auto', borderRadius: 9, objectFit: 'contain', border: '1px solid var(--t-border)', display: 'block' }} />
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div>
        {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {images.map((img, i) => (
            <PreviewImg key={i} src={img.url || img} onPreview={onPreview}
              wrapperStyle={{ borderRadius: 9 }}
              imgStyle={{ width: '100%', aspectRatio: '1', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)', display: 'block' }} />
          ))}
        </div>
      </div>
    );
  }

  // Default: columna
  return (
    <div>
      {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {images.map((img, i) => (
          <PreviewImg key={i} src={img.url || img} onPreview={onPreview}
            wrapperStyle={{ borderRadius: 9 }}
            imgStyle={{ width: '100%', height: 'auto', maxHeight: 320, borderRadius: 9, objectFit: 'contain', border: '1px solid var(--t-border)', display: 'block' }} />
        ))}
      </div>
    </div>
  );
}

function ImagenTextoBlockView({ block, onPreview, hideTitle, isMobile }) {
  const items = block.items || [];
  if (!items.length && !block.titulo && !block.subtitulo) return null;
  if (!items.length) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  const layout   = block.it_layout || 'img-text';
  const isHoriz  = !isMobile && (layout === 'img-text' || layout === 'text-img');
  const imgFirst = layout === 'img-text' || layout === 'img-top';

  return (
    <div>
      {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((it, i) => {
          const color = it.text_color || '#6366f1';
          const hasImage = it.image?.url;
          const hasText  = it.texto?.trim();
          const imgEl = hasImage ? (
            <PreviewImg src={it.image.url} onPreview={onPreview}
              wrapperStyle={{ borderRadius: 10 }}
              imgStyle={{ width: '100%', borderRadius: 10, display: 'block' }} />
          ) : null;
          const txtEl = hasText ? (
            <div style={{ background: color + '18', border: `1px solid ${color}44`, borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: color, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', textAlign: it.text_align || 'left' }}>{it.texto}</p>
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

function AsuntoAdelantoBlockView({ block, item, hideTitle, isMobile }) {
  const items = block.items || [];
  if (!items.length && !block.titulo && !block.subtitulo) return null;
  if (!items.length) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  const layout   = block.it_layout || 'img-text';
  const isHoriz  = !isMobile && (layout === 'img-text' || layout === 'text-img');
  const fieldFirst = layout === 'img-text' || layout === 'img-top';

  return (
    <div>
      {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((it, i) => {
          const color = it.text_color || '#6366f1';
          const hasField = it.show_asunto || it.show_adelanto;
          const hasText  = it.texto?.trim();
          const fieldEl = hasField ? (
            <div style={{
              background: 'var(--t-surface2)',
              border: '1px solid var(--t-border)',
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              {it.show_asunto && item?.asunto && (
                <>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asunto</span>
                  <span style={{ fontSize: 24, color: 'var(--t-text)', lineHeight: 1.3 }}>{item.asunto}</span>
                </>
              )}
              {it.show_adelanto && item?.adelanto && (
                <>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Adelanto</span>
                  <span style={{ fontSize: 24, color: 'var(--t-text)', lineHeight: 1.3 }}>{item.adelanto}</span>
                </>
              )}
            </div>
          ) : null;
          const txtEl = hasText ? (
            <div style={{ background: color + '18', border: `1px solid ${color}44`, borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: color, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', textAlign: it.text_align || 'left' }}>{it.texto}</p>
            </div>
          ) : null;
          const first  = fieldFirst ? fieldEl : txtEl;
          const second = fieldFirst ? txtEl : fieldEl;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: isHoriz && hasField && hasText ? '1fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
              {first}
              {second}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderEBBlock(eb, i, colMode, onPreview) {
  return (
    <div key={i}>
      {eb.type === 'text' && eb.content && (() => {
        const p = <p style={{ margin: 0, fontSize: eb.size || 14, fontWeight: eb.bold ? 700 : 400, textAlign: eb.align || 'left', color: '#1a1a1a', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{eb.content}</p>;
        return eb.href ? <a href={eb.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{p}</a> : p;
      })()}
      {eb.type === 'image' && eb.url && (
        <div style={{ textAlign: 'center' }}>
          <PreviewImg src={eb.url} onPreview={onPreview}
            wrapperStyle={{ display: 'inline-block', borderRadius: 6 }}
            imgStyle={{ display: 'block', maxWidth: '100%', maxHeight: colMode ? 120 : 200, objectFit: 'contain', borderRadius: 6, margin: '0 auto' }} />
        </div>
      )}
      {eb.type === 'button' && eb.text && (
        <div style={{ textAlign: 'center' }}>
          <a href={eb.href || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#6366f1', color: 'white', borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{eb.text}</a>
        </div>
      )}
      {eb.type === 'columns' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{(eb.left || []).map((sub, j) => renderEBBlock(sub, j, true, onPreview))}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{(eb.right || []).map((sub, j) => renderEBBlock(sub, j, true, onPreview))}</div>
        </div>
      )}
    </div>
  );
}

function CorreccionBlockView({ block, onPreview, hideTitle }) {
  const { theme } = useTheme();
  const emailBlocks = block.email_blocks || [];
  if (!emailBlocks.length && !block.titulo && !block.subtitulo) return null;
  if (!emailBlocks.length) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  const emailBg  = block.email_bg || '#ffffff';
  const outerBg  = theme === 'dark' ? '#1e1e1e' : '#e0e0e0';

  return (
    <div>
      {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
      <div style={{ background: outerBg, borderRadius: 12, padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: emailBg, borderRadius: 8, padding: '20px 24px', width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {emailBlocks.map((eb, i) => renderEBBlock(eb, i, false, onPreview))}
        </div>
      </div>
    </div>
  );
}

function TranscribirBlockView({ block, hideTitle }) {
  if (!block.texto && !block.titulo && !block.subtitulo) return null;
  if (!block.texto) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {!hideTitle && block.titulo && <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 4px' }}>{block.titulo}</h2>}
      {!hideTitle && block.subtitulo && <p style={{ fontSize: 13, color: 'var(--t-text-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{block.subtitulo}</p>}
      <div style={{ background: (block.text_color || '#06b6d4') + '18', border: `1px solid ${(block.text_color || '#06b6d4')}44`, borderRadius: 10, padding: '14px 16px' }}>
        <p style={{ fontSize: 13, color: block.text_color || '#06b6d4', margin: 0, lineHeight: 1.6, textAlign: block.text_align || 'left', whiteSpace: 'pre-wrap' }}>
          {block.texto}
        </p>
      </div>
    </div>
  );
}

function ColumnasBlockView({ block, onPreview, theme, isMobile, item }) {
  const numCols = block.num_columnas || 2;
  const columns = block.columns || [];
  const hasContent = columns.some(col => Array.isArray(col) && col.length > 0);
  if (!hasContent) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {block.titulo && <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 4px' }}>{block.titulo}</h2>}
      {block.subtitulo && <p style={{ fontSize: 13, color: 'var(--t-text-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{block.subtitulo}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${numCols}, 1fr)`, gap: 12 }}>
        {Array.from({ length: numCols }, (_, ci) => {
          const col = columns[ci] || [];
          return (
            <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.map((nb, bi) => (
                <BlockView key={nb.id || bi} block={nb} onPreview={onPreview} theme={theme} isMobile={isMobile} item={item} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BlockView({ block, onPreview, theme, isMobile, item, isPro }) {
  const wrapStyle = { border: `1px solid ${theme === 'light' ? '#d4d4d8' : '#27272a'}`, borderRadius: 12, padding: '20px 24px', background: 'var(--t-surface3)' };

  // Determine visibility: explicit false = hidden; undefined defaults: correccion=hidden, others=visible
  const isVisible = block.visible !== undefined
    ? block.visible !== false
    : block.type !== 'correccion';

  if (!isVisible && !isPro) {
    // Render title + blurred content
    const title = block.titulo;
    const subtitle = block.subtitulo;
    let content;
    switch (block.type) {
      case 'enlaces':          content = <EnlacesBlockView block={block} onPreview={() => {}} hideTitle />; break;
      case 'imagen':           content = <ImagenBlockView block={block} onPreview={() => {}} hideTitle />; break;
      case 'imagen_texto':     content = <ImagenTextoBlockView block={block} onPreview={() => {}} hideTitle isMobile={isMobile} />; break;
      case 'correccion':       content = <CorreccionBlockView block={block} onPreview={() => {}} hideTitle />; break;
      case 'asunto_adelanto':  content = <AsuntoAdelantoBlockView block={block} item={item} hideTitle isMobile={isMobile} />; break;
      case 'transcribir':      content = <TranscribirBlockView block={block} hideTitle />; break;
      default: content = null;
    }
    return (
      <div style={wrapStyle}>
        {title && <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 12px' }}>{title}</h2>}
        <div style={{ position: 'relative' }}>
          <div style={{ filter: 'blur(8px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.7 }}>
            {content}
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Contenido exclusivo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  switch (block.type) {
    case 'enlaces':         return <div style={wrapStyle}><EnlacesBlockView block={block} onPreview={onPreview} /></div>;
    case 'imagen':          return <div style={wrapStyle}><ImagenBlockView block={block} onPreview={onPreview} /></div>;
    case 'imagen_texto':    return <div style={wrapStyle}><ImagenTextoBlockView block={block} onPreview={onPreview} isMobile={isMobile} /></div>;
    case 'correccion':      return <div style={wrapStyle}><CorreccionBlockView block={block} onPreview={onPreview} /></div>;
    case 'asunto_adelanto': return <div style={wrapStyle}><AsuntoAdelantoBlockView block={block} item={item} isMobile={isMobile} /></div>;
    case 'transcribir':     return <div style={wrapStyle}><TranscribirBlockView block={block} /></div>;
    case 'columnas':        return <div style={wrapStyle}><ColumnasBlockView block={block} onPreview={onPreview} theme={theme} isMobile={isMobile} item={item} /></div>;
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
  const [allSectors, setAllSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const [acceso, setAcceso] = useState(() => !!loadSession());
  const [isPro] = useState(() => loadProSession());
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const biblToken = getBibliotecaToken();
    const authHeaders = biblToken ? { 'Authorization': `Bearer ${biblToken}` } : {};
    Promise.all([
      fetch(`${API_BASE}/biblioteca/${id}`, { cache: 'no-store', headers: authHeaders }).then(r => r.ok ? r.json() : Promise.reject(r.status === 404 ? 'No encontrado' : r.status === 401 ? 'Acceso requerido' : 'Error')),
      fetch(`${API_BASE}/biblioteca/tags/public`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/biblioteca/sectores/public`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    ])
      .then(([itemData, tagsData, sectorsData]) => {
        setItem(itemData);
        setAllTags(tagsData);
        setAllSectors(sectorsData);
        const email = loadSession();
        if (email && itemData?.titulo) {
          fetch(`${API_BASE}/api/biblioteca-click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, elemento: `item: ${itemData.titulo}` }),
          }).catch(() => {});
        }
      })
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
  const enviadoDisplay  = item.enviado_el ? (() => { const s = new Date(item.enviado_el + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }); return s.charAt(0).toUpperCase() + s.slice(1); })() : null;
  const fechaAnalisisDisplay = item.fecha_analisis ? new Date(item.fecha_analisis + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
  const resolvedTags    = (item.tags || []).map(tid => allTags.find(t => t.id === tid)).filter(Boolean);
  const resolvedSectors = (item.sector || []).map(sid => allSectors.find(s => s.id === sid)).filter(Boolean);
  const blocksData      = (item.blocks_data_published?.blocks ? item.blocks_data_published : null) || (item.blocks_data?.blocks ? item.blocks_data : null) || { blocks: [] };

  return (
    <>
    <Helmet>
      <title>{item?.titulo ? `${item.titulo} — Anti-Biblioteca` : 'Anti-Biblioteca — Antiagencia'}</title>
      <meta name="description" content={item?.titulo ? `Análisis de ${item.titulo} en la Anti-Biblioteca de Antiagencia.` : 'Anti-Biblioteca — Antiagencia'} />
    </Helmet>
    <div data-theme={theme} style={{ ...s, background: 'var(--t-bg)', color: 'var(--t-text)', minHeight: '100vh' }}>
      {!acceso && <Gate onAcceso={() => setAcceso(true)} />}
      <MailerLitePopup />
      {showModal && item && <ImageModal imageUrl={item.url} alt={item.filename} onClose={() => setShowModal(false)} />}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 10, boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontSize: 18, lineHeight: 1 }}>
            ✕
          </button>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--t-bg)', borderBottom: '1px solid var(--t-border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/anti-biblioteca')}
            style={{ background: 'transparent', border: `1px solid ${theme === 'light' ? '#71717a' : '#3f3f46'}`, color: 'var(--t-text)', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#71717a'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = theme === 'light' ? '#71717a' : '#3f3f46'; }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Anti-Biblioteca
          </button>
          <button onClick={toggle}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={{ background: 'transparent', border: `1px solid ${theme === 'light' ? '#71717a' : '#3f3f46'}`, color: 'var(--t-text-muted)', borderRadius: 8, padding: '6px 10px', fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px', overflowX: 'hidden', boxSizing: 'border-box', width: '100%' }}>
        <div>

        {/* Two equal columns — stacks on mobile */}
        <div style={isMobile
          ? { display: 'flex', flexDirection: 'column', gap: 24 }
          : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'flex-start' }}>

          {/* Left: image (screenshot) */}
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setImageHover(true)}
            onMouseLeave={() => setImageHover(false)}>
            <div style={{ height: 560, overflowY: 'auto', overflowX: 'hidden', borderRadius: 12, border: '1px solid var(--t-border)' }}>
              <img src={item.url} alt={item.filename} loading="lazy" style={{ width: '100%', display: 'block' }} />
            </div>
            {(imageHover || isMobile) && (
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                <button onClick={() => setShowModal(true)}
                  style={{ background:'rgba(0,0,0,0.7)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.8)', borderRadius:8, padding:'6px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:12, backdropFilter:'blur(4px)' }}>
                  <IconEye /> Ver
                </button>
              </div>
            )}
          </div>

          {/* Right: metadata */}
          {hasRightContent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Categoria / Sector / Subcategoria */}
              {(item.categoria || resolvedSectors.length > 0 || item.subcategoria) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.categoria && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
                      <Pill colors={CATEGORIA_COLORS[item.categoria] || { bg: '#18181b', border: '#27272a', color: 'var(--t-text)' }} label={CATEGORIAS[item.categoria] || item.categoria} />
                    </div>
                  )}
                  {resolvedSectors.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sector</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {resolvedSectors.map(s => (
                          <span key={s.id} style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', background: s.color + '22', border: `1px solid ${s.color}`, color: s.color }}>{s.name}</span>
                        ))}
                      </div>
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
              <BlockView key={block.id} block={block} onPreview={setLightbox} theme={theme} isMobile={isMobile} item={item} isPro={isPro} />
            ))}
          </div>
        )}

        </div>
      </div>
    </div>
    </>
  );
}
