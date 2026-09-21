import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import MailerLitePopup from '@/components/MailerLitePopup';
import EmailIframe from '@/components/EmailIframe';
import { IconEye, IconDownload } from '@/features/biblioteca/renderer/shared/icons';
import { BlockRenderer } from '@/features/biblioteca/renderer/BlockRenderer';

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
const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconDesktop = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>);
const IconMobile = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>);

// ── ImageModal — imagen principal (same as admin) ─────────────────────────────
function ImageModal({ imageUrl, emailHtml, emailGmailStyles, alt, initialMobileMode = false, onClose }) {
  const [mobileMode, setMobileMode] = useState(initialMobileMode);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.85)', overflowY:'auto' }} onClick={onClose}>
      {/* Sticky controls bar — pointerEvents:none so transparent areas don't block backdrop click */}
      <div style={{ position:'sticky', top:0, zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', pointerEvents:'none' }}>
        {emailHtml ? (
          <div style={{ display:'flex', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, overflow:'hidden', pointerEvents:'auto' }} onClick={e => e.stopPropagation()}>
            {[{ m: false, Icon: IconDesktop, title:'Vista escritorio' }, { m: true, Icon: IconMobile, title:'Vista móvil' }].map(({ m, Icon, title }) => (
              <button key={String(m)} onClick={() => setMobileMode(m)} title={title}
                style={{ background: mobileMode === m ? 'rgba(255,255,255,0.2)' : 'none', border:'none', color: mobileMode === m ? 'white' : 'rgba(255,255,255,0.5)', padding:'5px 8px', cursor:'pointer', display:'flex', alignItems:'center' }}>
                <Icon />
              </button>
            ))}
          </div>
        ) : <span />}
        <button onClick={e => { e.stopPropagation(); onClose(); }} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6, pointerEvents:'auto' }}>
          <IconX /> Cerrar
        </button>
      </div>
      {/* Content — stopPropagation only on the content box itself, not the flex wrapper */}
      <div style={{ display:'flex', justifyContent:'center', padding:'0 24px 40px' }}>
        {emailHtml
          ? <div style={{ background:'#fff', borderRadius:12, overflow:'hidden', width:'fit-content' }} onClick={e => e.stopPropagation()}>
              <EmailIframe html_body={emailHtml} gmail_styles={emailGmailStyles} withLinks={true} mobileMode={mobileMode} />
            </div>
          : <img src={imageUrl} alt={alt} style={{ maxWidth:'100%', borderRadius:12, display:'block' }} onClick={e => e.stopPropagation()} />
        }
      </div>
    </div>
  );
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
  const [emailViewMode, setEmailViewMode] = useState(() => window.innerWidth < 640 ? 'mobile' : 'desktop');
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

  const hasRightContent = item.categoria || item.subcategoria || item.marca !== null || item.asunto !== null || item.adelanto !== null || item.enviado_el || item.remitente || item.ficha_url || item.fecha_analisis;
  const enviadoDisplay  = item.enviado_el ? (() => {
    const v = item.enviado_el;
    const parts = v.includes(' ') ? v.split(' ') : [v, null];
    const [datePart, timePart] = parts;
    const s = new Date(datePart + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formatted = s.charAt(0).toUpperCase() + s.slice(1);
    return timePart ? `${formatted} a las ${timePart}` : formatted;
  })() : null;
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
      {showModal && item && <ImageModal imageUrl={item.url} emailHtml={item.email_html || null} emailGmailStyles={item.email_gmail_styles || null} alt={item.filename} initialMobileMode={emailViewMode === 'mobile'} onClose={() => setShowModal(false)} />}
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
          <div style={{ position: 'relative', width: item?.email_html ? (emailViewMode === 'mobile' ? 375 : undefined) : undefined }}
            onMouseEnter={() => setImageHover(true)}
            onMouseLeave={() => setImageHover(false)}>
            <div style={{ height: 560, overflowY: 'auto', overflowX: 'hidden', borderRadius: 12, border: '1px solid var(--t-border)', width: item.email_html ? (emailViewMode === 'mobile' ? 375 : undefined) : undefined }}>
              {item.email_html
                ? <EmailIframe html_body={item.email_html} gmail_styles={item.email_gmail_styles} withLinks={true} mobileMode={emailViewMode === 'mobile'} />
                : <img src={item.url} alt={item.filename} loading="lazy" style={{ width: '100%', display: 'block' }} />}
            </div>
            {(imageHover || isMobile) && (
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                {item.email_html && (
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, overflow: 'hidden', backdropFilter: 'blur(4px)' }}>
                    {[{ mode: 'desktop', Icon: IconDesktop, title: 'Vista escritorio' }, { mode: 'mobile', Icon: IconMobile, title: 'Vista móvil' }].map(({ mode: m, Icon, title }) => (
                      <button key={m} onClick={() => setEmailViewMode(m)} title={title}
                        style={{ background: emailViewMode === m ? 'rgba(255,255,255,0.15)' : 'none', border: 'none', color: emailViewMode === m ? 'white' : 'rgba(255,255,255,0.5)', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Icon />
                      </button>
                    ))}
                  </div>
                )}
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
              {item.categoria === 'email' && item.remitente && <Field label="Enviado por" value={item.remitente} />}
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
              <BlockRenderer key={block.id} block={block} onPreview={setLightbox} theme={theme} isMobile={isMobile} item={item} isPro={isPro} />
            ))}
          </div>
        )}

        </div>
      </div>
    </div>
    </>
  );
}
