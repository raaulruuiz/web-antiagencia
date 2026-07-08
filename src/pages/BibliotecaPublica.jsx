import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BibliotecaCardMeta from '@/components/BibliotecaCardMeta';
import { useTheme } from '@/lib/ThemeContext';
import MailerLitePopup from '@/components/MailerLitePopup';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';
const SESSION_KEY = 'biblioteca_acceso_email';
const PRO_KEY = 'biblioteca_pro_access';
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 días

function saveSession(email) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now() }));
}
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { email, ts } = JSON.parse(raw);
    if (Date.now() - ts > SESSION_TTL) { localStorage.removeItem(SESSION_KEY); return null; }
    return email;
  } catch { return null; }
}
function saveProSession() {
  localStorage.setItem(PRO_KEY, JSON.stringify({ ts: Date.now() }));
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

function Gate({ onAcceso }) {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState('idle');

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
          <p style={{ fontSize: '13px', color: '#777', marginTop: '16px' }}>
            ¿No estás en la lista?{' '}
            <a href="https://antiagencia.es" style={{ color: '#0067FD', textDecoration: 'underline' }}>
              Apúntate aquí
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

// ── DateRangePicker (same as admin) ───────────────────────────────────────────
function DateRangePicker({ from, to, onChange }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const WDAYS  = ['L','M','X','J','V','S','D'];
  const pad = (n) => String(n).padStart(2, '0');
  const toYMD = (y, m, d) => `${y}-${pad(m+1)}-${pad(d)}`;
  const fmtShort = (s) => {
    if (!s) return '';
    const [, m, d] = s.split('-');
    return `${parseInt(d)} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][parseInt(m)-1]}`;
  };
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayMon = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

  const handleDayClick = (ymd) => {
    if (!from || (from && to)) { onChange({ from: ymd, to: '' }); }
    else {
      if (ymd >= from) { onChange({ from, to: ymd }); }
      else             { onChange({ from: ymd, to: from }); }
    }
  };

  const prevMonth = () => viewMonth === 0  ? (setViewYear(y => y-1), setViewMonth(11)) : setViewMonth(m => m-1);
  const nextMonth = () => viewMonth === 11 ? (setViewYear(y => y+1), setViewMonth(0))  : setViewMonth(m => m+1);

  const hasFilter = from || to;
  const label = hasFilter ? (from && to ? `${fmtShort(from)} – ${fmtShort(to)}` : `Desde ${fmtShort(from)}`) : null;
  const numDays = daysInMonth(viewYear, viewMonth);
  const offset  = firstDayMon(viewYear, viewMonth);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, background: hasFilter ? 'rgba(99,102,241,0.1)' : 'transparent', border: `1px solid ${hasFilter ? '#6366f1' : '#3f3f46'}`, color: hasFilter ? '#a5b4fc' : 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>{label || 'Fecha de envío'}</span>
        {hasFilter && <span onMouseDown={e => { e.stopPropagation(); onChange({ from: '', to: '' }); }} style={{ opacity: 0.7, lineHeight: 1, fontSize: 15, marginLeft: 2 }}>×</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: '#1a1a1a', border: '1px solid #3f3f46', borderRadius: 12, padding: '14px', zIndex: 100, width: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {from && !to && <p style={{ fontSize: 10, color: '#6366f1', margin: '0 0 8px', textAlign: 'center' }}>Ahora selecciona la fecha final</p>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 18, padding: '0 8px', lineHeight: 1 }}>‹</button>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 18, padding: '0 8px', lineHeight: 1 }}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {WDAYS.map(d => <span key={d} style={{ textAlign: 'center', fontSize: 10, color: '#52525b', display: 'block' }}>{d}</span>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: numDays }).map((_, i) => {
              const d = i + 1; const ymd = toYMD(viewYear, viewMonth, d);
              const isStart = ymd === from; const isEnd = ymd === to;
              const inRange = from && to && ymd > from && ymd < to;
              return (
                <button key={d} onClick={() => handleDayClick(ymd)} style={{ width: '100%', aspectRatio: '1', border: 'none', borderRadius: isStart || isEnd ? '50%' : inRange ? 0 : 4, background: isStart || isEnd ? '#6366f1' : inRange ? 'rgba(99,102,241,0.2)' : 'transparent', color: isStart || isEnd ? 'white' : inRange ? '#a5b4fc' : '#d4d4d8', cursor: 'pointer', fontSize: 12, fontWeight: isStart || isEnd ? 700 : 400 }}>
                  {d}
                </button>
              );
            })}
          </div>
          {hasFilter && <button onClick={() => { onChange({ from: '', to: '' }); setOpen(false); }} style={{ marginTop: 10, width: '100%', background: 'none', border: '1px solid #3f3f46', color: 'white', borderRadius: 8, padding: '5px', fontSize: 11, cursor: 'pointer' }}>Limpiar</button>}
        </div>
      )}
    </div>
  );
}

function ProModal({ onClose, onProActivated }) {
  const [token, setToken] = useState('');
  const [estado, setEstado] = useState('idle'); // idle | cargando | error

  async function verificar(e) {
    e.preventDefault();
    if (!token.trim()) return;
    setEstado('cargando');
    try {
      const res = await fetch(`${API_BASE}/biblioteca/pro/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        saveProSession();
        onProActivated();
      } else {
        setEstado('error');
      }
    } catch {
      setEstado('error');
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: '#111', border: '1px solid #27272a', borderRadius: 14, padding: '32px 28px', maxWidth: 400, width: '100%' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white', margin: 0 }}>Modo PRO</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6, marginBottom: 20 }}>
          De momento el modo PRO solo es accesible para perfiles manuales, si eres uno de ellos, introduce el token.
        </p>
        <form onSubmit={verificar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="text"
            placeholder="Token de acceso"
            value={token}
            onChange={e => { setToken(e.target.value); setEstado('idle'); }}
            autoFocus
            style={{ background: '#1a1a1a', border: `1px solid ${estado === 'error' ? '#ef4444' : '#3f3f46'}`, borderRadius: 8, padding: '10px 12px', fontSize: 14, color: 'white', outline: 'none', colorScheme: 'dark' }}
          />
          {estado === 'error' && (
            <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>Token incorrecto. Comprueba que lo has escrito bien.</p>
          )}
          <button
            type="submit"
            disabled={estado === 'cargando' || !token.trim()}
            style={{ background: estado === 'cargando' || !token.trim() ? '#1d4ed8' : '#0067FD', color: 'white', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 600, cursor: estado === 'cargando' || !token.trim() ? 'not-allowed' : 'pointer', opacity: estado === 'cargando' || !token.trim() ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            {estado === 'cargando' ? 'Verificando…' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BibliotecaPublica() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [acceso, setAcceso] = useState(() => !!loadSession());
  const [isPro, setIsPro] = useState(() => loadProSession());
  const [showProModal, setShowProModal] = useState(false);
  const [items, setItems]     = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [allSectors, setAllSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const [showMenu, setShowMenu] = useState(false);

  // Search & filters
  const [showSearch, setShowSearch]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [showFilters, setShowFilters]       = useState(false);
  const [filterCategoria, setFilterCategoria]   = useState('');
  const [filterSubcat, setFilterSubcat]         = useState('');
  const [filterMarca, setFilterMarca]           = useState('');
  const [filterTagIds, setFilterTagIds]         = useState([]);
  const [filterSectorIds, setFilterSectorIds]   = useState([]);
  const [filterFechaFrom, setFilterFechaFrom]   = useState('');
  const [filterFechaTo, setFilterFechaTo]       = useState('');

  const toggleFilterTag    = (id) => setFilterTagIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleFilterSector = (id) => setFilterSectorIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const activeFilterCount = [filterCategoria, filterSubcat, filterMarca, filterTagIds.length ? '1' : '', filterSectorIds.length ? '1' : '', (filterFechaFrom || filterFechaTo) ? '1' : ''].filter(Boolean).length;

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/biblioteca/public`);
      if (!res.ok) throw new Error('Error al cargar');
      setItems(await res.json());
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch(`${API_BASE}/biblioteca/tags/public`).then(r => r.ok ? r.json() : []).then(setAllTags).catch(() => {});
    fetch(`${API_BASE}/biblioteca/sectores/public`).then(r => r.ok ? r.json() : []).then(setAllSectors).catch(() => {});
  }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => (i.marca||'').toLowerCase().includes(q) || (i.asunto||'').toLowerCase().includes(q) || (i.adelanto||'').toLowerCase().includes(q));
    }
    if (filterCategoria)        result = result.filter(i => i.categoria === filterCategoria);
    if (filterSubcat)           result = result.filter(i => i.subcategoria === filterSubcat);
    if (filterMarca)            result = result.filter(i => (i.marca || '').toLowerCase().includes(filterMarca.toLowerCase()));
    if (filterSectorIds.length) result = result.filter(i => filterSectorIds.some(sid => (i.sector || []).includes(sid)));
    if (filterTagIds.length)    result = result.filter(i => filterTagIds.some(tid => (i.tags || []).includes(tid)));
    if (filterFechaFrom)        result = result.filter(i => i.enviado_el && i.enviado_el >= filterFechaFrom);
    if (filterFechaTo)          result = result.filter(i => i.enviado_el && i.enviado_el <= filterFechaTo);
    // Visible items first, blurred last
    return result.sort((a, b) => (a.publico === false ? 1 : 0) - (b.publico === false ? 1 : 0));
  }, [items, searchQuery, filterCategoria, filterSubcat, filterMarca, filterSectorIds, filterTagIds, filterFechaFrom, filterFechaTo]);

  const clearFilters = () => { setFilterCategoria(''); setFilterSubcat(''); setFilterMarca(''); setFilterTagIds([]); setFilterSectorIds([]); setFilterFechaFrom(''); setFilterFechaTo(''); };

  const s = { fontFamily: 'system-ui, sans-serif' };
  const inputStyle = { background: 'transparent', border: '1px solid #3f3f46', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', cursor: 'pointer' };

  return (
    <div data-theme={theme} style={{ ...s, background: 'var(--t-bg)', color: 'var(--t-text)', minHeight: '100vh' }}>
      {!acceso && <Gate onAcceso={() => setAcceso(true)} />}
      {showProModal && <ProModal onClose={() => setShowProModal(false)} onProActivated={() => { setIsPro(true); setShowProModal(false); }} />}
      <MailerLitePopup />

      {showMenu && (
        <>
          <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 260, zIndex: 101, background: 'var(--t-surface)', borderLeft: '1px solid var(--t-border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--t-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--t-text)' }}>Menú</span>
              <button onClick={() => setShowMenu(false)} style={{ background: 'none', border: 'none', color: 'var(--t-text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
              <button onClick={() => { toggle(); setShowMenu(false); }}
                style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'flex-start', boxSizing: 'border-box' }}>
                {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              </button>
              <button onClick={() => { setShowFilters(s => !s); setShowSearch(false); setShowMenu(false); }}
                style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'flex-start', boxSizing: 'border-box', borderColor: activeFilterCount > 0 ? '#6366f1' : '#3f3f46', color: activeFilterCount > 0 ? '#a5b4fc' : 'var(--t-text)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filtrar {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <button onClick={() => { load(); setShowMenu(false); }} disabled={loading}
                style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'flex-start', boxSizing: 'border-box', opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                {loading ? 'Cargando…' : 'Actualizar'}
              </button>
              {!isPro && (
                <button onClick={() => { setShowProModal(true); setShowMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'flex-start', boxSizing: 'border-box', padding: '6px 10px', borderRadius: 8, fontSize: 12, background: '#0067FD', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                  ⚡ Pasar a PRO
                </button>
              )}
              {isPro && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, fontSize: 12, background: 'rgba(0,103,253,0.15)', border: '1px solid rgba(0,103,253,0.4)', color: '#60a5fa' }}>
                  ⚡ PRO activo
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--t-bg)', borderBottom: '1px solid var(--t-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={theme === 'light' ? '/images/82b3b8d5c_freepik__background__33914.png' : '/images/9563e10d2_AALogo.png'} alt="Logo" style={{ height: '28px', width: 'auto' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Anti-Biblioteca</h1>
          </div>
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => { setShowSearch(s => !s); setShowFilters(false); }}
                style={{ ...inputStyle, display: 'flex', alignItems: 'center', background: showSearch ? '#1a1a1a' : 'transparent' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <button onClick={() => setShowMenu(true)}
                style={{ ...inputStyle, display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={toggle} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8, fontSize: 14, background: 'transparent', border: `1px solid ${theme === 'light' ? '#71717a' : '#3f3f46'}`, color: 'var(--t-text-muted)', cursor: 'pointer', lineHeight: 1 }}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button onClick={() => { setShowSearch(s => !s); setShowFilters(false); }}
                style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 5, background: showSearch ? '#1a1a1a' : 'transparent' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <button onClick={() => { setShowFilters(s => !s); setShowSearch(false); }}
                style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 5, background: (showFilters || activeFilterCount > 0) ? '#1a1a1a' : 'transparent', borderColor: activeFilterCount > 0 ? '#6366f1' : '#3f3f46', color: activeFilterCount > 0 ? '#a5b4fc' : 'var(--t-text)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filtrar
                {activeFilterCount > 0 && <span style={{ background: '#6366f1', color: 'white', fontSize: 9, fontWeight: 700, borderRadius: 999, padding: '1px 5px' }}>{activeFilterCount}</span>}
              </button>
              <button onClick={load} disabled={loading}
                style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 5, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                {loading ? 'Cargando…' : 'Actualizar'}
              </button>
              {isPro ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(0,103,253,0.15)', border: '1px solid rgba(0,103,253,0.4)', color: '#60a5fa' }}>
                  ⚡ PRO activo
                </div>
              ) : (
                <button onClick={() => setShowProModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#0067FD', border: 'none', color: 'white', cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  ⚡ Pasar a PRO
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px 32px', overflowX: 'hidden' }}>

        {/* Search bar */}
        {showSearch && (
          <div style={{ marginBottom: 12, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#52525b', pointerEvents: 'none', display: 'flex' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por marca, asunto, adelanto…"
              style={{ width: '100%', background: '#111', border: '1px solid #27272a', borderRadius: 10, padding: '9px 12px 9px 34px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (() => {
          const showSubcat  = filterCategoria !== 'ficha';
          const showFecha   = filterCategoria !== 'ficha' && filterSubcat !== 'automatizacion';
          const visibleTags = filterCategoria === 'ficha'
            ? allTags.filter(t => t.subcategoria === 'ficha')
            : filterCategoria === 'email'
              ? allTags.filter(t => t.subcategoria === 'email' || !t.subcategoria)
              : allTags;
          return (
            <div style={{ marginBottom: 16, background: '#111', border: '1px solid #27272a', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Row 1: selects + marca + fecha */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
                  <select value={filterCategoria} onChange={e => {
                    const val = e.target.value;
                    setFilterCategoria(val);
                    if (val === 'ficha') { setFilterSubcat(''); setFilterFechaFrom(''); setFilterFechaTo(''); setFilterTagIds([]); }
                  }} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Todas</option>
                    <option value="email">Email</option>
                    <option value="ficha">Ficha de Producto</option>
                  </select>
                </div>
                {showSubcat && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
                    <select value={filterSubcat} onChange={e => {
                      const val = e.target.value;
                      setFilterSubcat(val);
                      if (!filterCategoria) setFilterCategoria('email');
                      if (val === 'automatizacion') { setFilterFechaFrom(''); setFilterFechaTo(''); }
                    }} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">Todas</option>
                      <option value="automatizacion">Automatización</option>
                      <option value="campana">Campaña</option>
                    </select>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Marca</span>
                  <input value={filterMarca} onChange={e => setFilterMarca(e.target.value)} placeholder="Filtrar…"
                    style={{ ...inputStyle, width: 130 }} />
                </div>
                {showFecha && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enviado el Día</span>
                    <DateRangePicker from={filterFechaFrom} to={filterFechaTo} onChange={({ from, to }) => { setFilterFechaFrom(from); setFilterFechaTo(to); }} />
                  </div>
                )}
              </div>

              {/* Row 2: Sector chips */}
              {allSectors.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sector</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {allSectors.map(sec => {
                      const active = filterSectorIds.includes(sec.id);
                      return (
                        <button key={sec.id} onClick={() => toggleFilterSector(sec.id)} style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', cursor: 'pointer', transition: 'all 0.1s', background: active ? sec.color + '33' : 'transparent', border: `1px solid ${active ? sec.color : '#3f3f46'}`, color: active ? sec.color : '#71717a' }}>
                          {sec.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Row 3: Etiquetas chips (scoped by categoria) */}
              {visibleTags.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etiquetas</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {visibleTags.map(t => {
                      const active = filterTagIds.includes(t.id);
                      return (
                        <button key={t.id} onClick={() => toggleFilterTag(t.id)} style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', cursor: 'pointer', transition: 'all 0.1s', background: active ? t.color + '33' : 'transparent', border: `1px solid ${active ? t.color : '#3f3f46'}`, color: active ? t.color : '#71717a' }}>
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeFilterCount > 0 && (
                <button onClick={clearFilters} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  × Limpiar filtros
                </button>
              )}
            </div>
          );
        })()}

        {(searchQuery || activeFilterCount > 0) && !loading && (
          <p style={{ fontSize: 12, color: '#52525b', marginBottom: 12 }}>{filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'}</p>
        )}

        {error && <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '16px' }}>{error}</p>}
        {!loading && !error && items.length === 0 && <p style={{ color: '#52525b', fontSize: '0.875rem' }}>Sin capturas todavía.</p>}
        {!loading && filteredItems.length === 0 && items.length > 0 && <p style={{ color: '#52525b', fontSize: '0.875rem' }}>No hay capturas que coincidan.</p>}

        {filteredItems.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {filteredItems.map(item => {
              const isBlurred = item.publico === false && !isPro;
              return isBlurred ? (
                <div key={item.id} style={{ cursor: 'default' }}>
                  <div style={{ aspectRatio: item.categoria === 'email' ? '9/16' : '16/9', backgroundColor: '#18181b', borderRadius: '8px', overflow: 'hidden', border: '1px solid #27272a', position: 'relative' }}>
                    <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.categoria === 'email' ? 'top' : 'center', display: 'block', filter: 'blur(12px)', transform: 'scale(1.05)' }} loading="lazy" />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Contenido exclusivo</span>
                      </div>
                    </div>
                  </div>
                  <BibliotecaCardMeta item={item} allTags={allTags} allSectors={allSectors} hideSubtext />
                </div>
              ) : (
                <div key={item.id} onClick={() => navigate(`/anti-biblioteca/${item.id}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ aspectRatio: item.categoria === 'email' ? '9/16' : '16/9', backgroundColor: '#18181b', borderRadius: '8px', overflow: 'hidden', border: '1px solid #27272a', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#52525b'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#27272a'}>
                    <img src={item.url} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.categoria === 'email' ? 'top' : 'center', display: 'block' }} loading="lazy" />
                  </div>
                  <BibliotecaCardMeta item={item} allTags={allTags} allSectors={allSectors} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
