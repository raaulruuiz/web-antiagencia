import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import BibliotecaCardMeta from '@/components/BibliotecaCardMeta';
import { useTheme } from '@/lib/ThemeContext';
import MailerLitePopup from '@/components/MailerLitePopup';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';
const SESSION_KEY = 'biblioteca_acceso_email';
const PRO_KEY = 'biblioteca_pro_access';
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 días

function saveSession(email, sessionToken) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now() }));
  if (sessionToken) localStorage.setItem('biblioteca_session_token', sessionToken);
}

function getBibliotecaToken() {
  return localStorage.getItem('biblioteca_session_token') || null;
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
        saveSession(email, data.session_token);
        onAcceso(data.session_token);
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
  const [showToken, setShowToken] = useState(false);

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
        if (data.session_token) localStorage.setItem('biblioteca_session_token', data.session_token);
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
          <div style={{ position: 'relative' }}>
            <input
              type={showToken ? 'text' : 'password'}
              placeholder="Token de acceso"
              value={token}
              onChange={e => { setToken(e.target.value); setEstado('idle'); }}
              autoFocus
              style={{ background: '#1a1a1a', border: `1px solid ${estado === 'error' ? '#ef4444' : '#3f3f46'}`, borderRadius: 8, padding: '10px 40px 10px 12px', fontSize: 14, color: 'white', outline: 'none', colorScheme: 'dark', width: '100%', boxSizing: 'border-box' }}
            />
            <button type="button" onClick={() => setShowToken(v => !v)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 4, lineHeight: 1 }}>
              {showToken
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
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

function trackClick(elemento) {
  const email = loadSession();
  if (!email) return;
  fetch(`${API_BASE}/api/biblioteca-click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, elemento }),
  }).catch(() => {});
}

export default function BibliotecaPublica() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [acceso, setAcceso] = useState(() => !!loadSession());
  const [isPro, setIsPro] = useState(() => loadProSession());
  const [showProModal, setShowProModal] = useState(false);

  const logoutPro = () => {
    localStorage.removeItem(PRO_KEY);
    localStorage.removeItem('biblioteca_session_token');
    setIsPro(false);
    // Reload to re-fetch content without PRO access
    load();
  };
  const [items, setItems]     = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [allSectors, setAllSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const [showMenu, setShowMenu] = useState(false);

  // Search & filters
  const [showStats, setShowStats]           = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
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
  const [filterScoreMin, setFilterScoreMin]     = useState(null);
  const [filterScoreMax, setFilterScoreMax]     = useState(null);
  const [filterSinNota, setFilterSinNota]       = useState(false);

  const toggleFilterTag    = (id) => { const tag = allTags.find(t => t.id === id); trackClick(`filtro tag: ${tag?.nombre || id}`); setFilterTagIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); };
  const toggleFilterSector = (id) => { const sec = allSectors.find(s => s.id === id); trackClick(`filtro sector: ${sec?.nombre || id}`); setFilterSectorIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); };

  const activeFilterCount = [filterCategoria, filterSubcat, filterMarca, filterTagIds.length ? '1' : '', filterSectorIds.length ? '1' : '', (filterFechaFrom || filterFechaTo) ? '1' : '', filterScoreMin != null ? '1' : '', filterSinNota ? '1' : ''].filter(Boolean).length;
  const handleScoreClick = (score) => {
    if (filterScoreMin === null) {
      setFilterScoreMin(score); setFilterScoreMax(null);
    } else if (filterScoreMax === null) {
      if (score === filterScoreMin) { setFilterScoreMin(null); }
      else if (score < filterScoreMin) { setFilterScoreMax(filterScoreMin); setFilterScoreMin(score); }
      else { setFilterScoreMax(score); }
    } else {
      setFilterScoreMin(score); setFilterScoreMax(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const biblToken = getBibliotecaToken();
      const headers = biblToken ? { 'Authorization': `Bearer ${biblToken}` } : {};
      const res = await fetch(`${API_BASE}/biblioteca/public`, { headers });
      if (res.status === 401) {
        localStorage.removeItem('biblioteca_session_token');
        const email = loadSession();
        if (email) {
          // Try to silently re-verify with stored email to get a fresh JWT
          try {
            const r = await fetch(`${API_BASE}/api/verificar-acceso-q3`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            const d = await r.json();
            if (d.acceso && d.session_token) {
              localStorage.setItem('biblioteca_session_token', d.session_token);
              const retry = await fetch(`${API_BASE}/biblioteca/public`, { headers: { 'Authorization': `Bearer ${d.session_token}` } });
              if (retry.ok) { setItems(await retry.json()); return; }
            }
          } catch (_) {}
        }
        localStorage.removeItem(SESSION_KEY);
        setAcceso(false);
        return;
      }
      if (!res.ok) throw new Error('Error al cargar');
      setItems(await res.json());
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [setAcceso]);

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
    const tieneRango = filterScoreMin != null;
    const tieneSinNota = filterSinNota;
    if (tieneRango || tieneSinNota) {
      result = result.filter(i => {
        if (tieneSinNota && i.puntuacion == null) return true;
        if (tieneRango && i.puntuacion != null) {
          if (filterScoreMax != null) return i.puntuacion >= filterScoreMin && i.puntuacion <= filterScoreMax;
          return i.puntuacion >= filterScoreMin;
        }
        return false;
      });
    }
    // Visible items first, blurred last
    return result.sort((a, b) => (a.publico === false ? 1 : 0) - (b.publico === false ? 1 : 0));
  }, [items, searchQuery, filterCategoria, filterSubcat, filterMarca, filterSectorIds, filterTagIds, filterFechaFrom, filterFechaTo, filterScoreMin, filterScoreMax, filterSinNota]);

  const clearFilters = () => { setFilterCategoria(''); setFilterSubcat(''); setFilterMarca(''); setFilterTagIds([]); setFilterSectorIds([]); setFilterFechaFrom(''); setFilterFechaTo(''); setFilterScoreMin(null); setFilterScoreMax(null); setFilterSinNota(false); };

  const statsData = useMemo(() => {
    const emailItems = items.filter(i => i.categoria === 'email');
    const scored = emailItems.filter(i => i.puntuacion != null);
    if (scored.length === 0) return null;
    const mediaGeneral = scored.reduce((s, i) => s + i.puntuacion, 0) / scored.length;
    const suspensas = scored.filter(i => i.puntuacion < 5);
    const cadaXEmails = suspensas.length > 0 ? parseFloat((scored.length / suspensas.length).toFixed(2)) : null;
    const pctEmailsSuspensas = parseFloat(((suspensas.length / scored.length) * 100).toFixed(1));
    // Per-brand stats
    const marcaMap = {};
    scored.forEach(i => {
      const m = i.marca || '(sin marca)';
      if (!marcaMap[m]) marcaMap[m] = { scored: [], allEmailItems: [] };
      marcaMap[m].scored.push(i);
    });
    emailItems.forEach(i => {
      const m = i.marca || '(sin marca)';
      if (marcaMap[m]) marcaMap[m].allEmailItems.push(i);
    });
    const marcas = Object.entries(marcaMap).map(([name, { scored, allEmailItems }]) => {
      const avg = scored.reduce((s, i) => s + i.puntuacion, 0) / scored.length;
      const blurred = !isPro && allEmailItems.every(i => i.publico === false);
      return { name, count: scored.length, avg, blurred };
    }).sort((a, b) => a.avg - b.avg);
    const marcasSuspensas = marcas.filter(m => m.avg < 5);
    const cadaZMarcas = marcasSuspensas.length > 0 ? parseFloat((marcas.length / marcasSuspensas.length).toFixed(2)) : null;
    const pctMarcasSuspensas = marcas.length > 0 ? parseFloat(((marcasSuspensas.length / marcas.length) * 100).toFixed(1)) : null;

    // Evolución temporal (por mes)
    const byMonth = {};
    scored.filter(i => i.enviado_el).forEach(i => {
      const mes = i.enviado_el.substring(0, 7); // YYYY-MM
      if (!byMonth[mes]) byMonth[mes] = [];
      byMonth[mes].push(i.puntuacion);
    });
    const evolucion = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, punts]) => ({ mes, avg: punts.reduce((s, v) => s + v, 0) / punts.length, count: punts.length }));

    // Histograma de distribución (0–10 enteros)
    const histograma = Array.from({ length: 11 }, (_, i) => ({
      score: i,
      count: scored.filter(e => Math.round(e.puntuacion) === i).length,
    }));

    // Campañas vs automatizaciones
    const campanas = scored.filter(i => i.subcategoria === 'campana');
    const automatizaciones = scored.filter(i => i.subcategoria === 'automatizacion');
    const subcat = {
      campanas: { count: campanas.length, avg: campanas.length ? campanas.reduce((s, i) => s + i.puntuacion, 0) / campanas.length : null },
      automatizaciones: { count: automatizaciones.length, avg: automatizaciones.length ? automatizaciones.reduce((s, i) => s + i.puntuacion, 0) / automatizaciones.length : null },
    };

    return { mediaGeneral, cadaXEmails, pctEmailsSuspensas, totalEmails: scored.length, totalMarcas: marcas.length, marcasSuspensas: marcasSuspensas.length, cadaZMarcas, pctMarcasSuspensas, marcas, evolucion, histograma, subcat };
  }, [items, isPro]);

  const s = { fontFamily: 'system-ui, sans-serif' };
  const inputStyle = { background: 'transparent', border: '1px solid #3f3f46', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', cursor: 'pointer' };

  return (
    <>
    <Helmet>
      <title>Anti-Biblioteca — Antiagencia</title>
      <meta name="description" content="Mi biblioteca personal de emails de ecommerce. Análisis semanales de los mejores emails para que puedas aprender y mejorar tus campañas." />
    </Helmet>
    <div data-theme={theme} style={{ ...s, background: 'var(--t-bg)', color: 'var(--t-text)', minHeight: '100vh' }}>
      {!acceso && <Gate onAcceso={() => { setAcceso(true); load(); }} />}
      {showProModal && <ProModal onClose={() => setShowProModal(false)} onProActivated={() => { setIsPro(true); setShowProModal(false); load(); }} />}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, fontSize: 12, background: 'rgba(0,103,253,0.15)', border: '1px solid rgba(0,103,253,0.4)', color: '#60a5fa' }}>
                    ⚡ PRO activo
                  </div>
                  <button onClick={() => { logoutPro(); setShowMenu(false); }}
                    style={{ fontSize: 11, color: '#71717a', background: 'none', border: '1px solid #3f3f46', borderRadius: 6, cursor: 'pointer', padding: '5px 8px', lineHeight: 1 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.borderColor = '#3f3f46'; }}>
                    Salir
                  </button>
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
              {statsData && (
                <button onClick={() => setShowStats(s => !s)} title="Estadísticas"
                  style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 5, background: showStats ? '#1a1a1a' : 'transparent' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </button>
              )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(0,103,253,0.15)', border: '1px solid rgba(0,103,253,0.4)', color: '#60a5fa' }}>
                    ⚡ PRO activo
                  </div>
                  <button onClick={logoutPro}
                    style={{ fontSize: 11, color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, transition: 'color 0.15s', lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                    onMouseLeave={e => e.currentTarget.style.color = '#52525b'}
                    title="Cerrar sesión PRO">
                    Salir
                  </button>
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

              {/* Row 3: Puntuación chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Puntuación{filterScoreMin != null && filterScoreMax != null ? ` ${filterScoreMin}–${filterScoreMax}` : filterScoreMin != null ? ` ${filterScoreMin}+` : ''}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  <button onClick={() => setFilterSinNota(v => !v)} style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', cursor: 'pointer', transition: 'all 0.1s', background: filterSinNota ? '#71717a33' : 'transparent', border: `1px solid ${filterSinNota ? '#71717a' : '#3f3f46'}`, color: filterSinNota ? '#a1a1aa' : '#71717a' }}>
                    Sin nota
                  </button>
                  {[0,1,2,3,4,5,6,7,8,9,10].map(score => {
                    const isMin = filterScoreMin === score;
                    const isMax = filterScoreMax === score;
                    const inRange = filterScoreMin != null && filterScoreMax != null && score > filterScoreMin && score < filterScoreMax;
                    const active = isMin || isMax || inRange;
                    return (
                      <button key={score} onClick={() => handleScoreClick(score)} style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', cursor: 'pointer', transition: 'all 0.1s', background: active ? '#16a34a33' : 'transparent', border: `1px solid ${(isMin || isMax) ? '#16a34a' : inRange ? '#16a34a88' : '#3f3f46'}`, color: active ? '#16a34a' : '#71717a' }}>
                        {score}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Etiquetas chips (scoped by categoria) */}
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

        {/* Stats panel */}
        {showStats && statsData && (
          <>
            {showStatsModal && (
              <>
                <div onClick={() => setShowStatsModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)' }} />
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 201, background: 'var(--t-surface, #111)', border: '1px solid #27272a', borderRadius: 12, padding: '24px', width: 'min(560px, 92vw)', maxHeight: '85vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t-text)' }}>Análisis por marca</span>
                    <button onClick={() => setShowStatsModal(false)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
                  </div>
                  {/* Summary lines */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18, padding: '12px 14px', background: '#18181b', borderRadius: 8, border: '1px solid #27272a' }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--t-text)', lineHeight: 1.6 }}>
                      La puntuación media de los emails es <strong style={{ color: statsData.mediaGeneral < 5 ? '#ef4444' : statsData.mediaGeneral < 7.5 ? '#f97316' : '#22c55e' }}>{statsData.mediaGeneral.toFixed(1)}</strong> <span style={{ fontWeight: 400 }}>(de {statsData.totalEmails} emails evaluados)</span>
                      {statsData.cadaXEmails != null && <>, lo que significa que <strong>1 de cada {statsData.cadaXEmails} emails</strong> que se mandan tienen una nota suspensa <span style={{ fontWeight: 400 }}>(un {statsData.pctEmailsSuspensas}%)</span></>}.
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--t-text)', lineHeight: 1.6 }}>
                      De las <strong>{statsData.totalMarcas} marcas</strong> que se han analizado, <strong>{statsData.marcasSuspensas}</strong> tienen una media de emails suspensa
                      {statsData.cadaZMarcas != null && <>, lo que significa que <strong>1 de cada {statsData.cadaZMarcas} marcas</strong> manda malos emails <span style={{ fontWeight: 400 }}>(un {statsData.pctMarcasSuspensas}%)</span></>}.
                    </p>
                  </div>
                  {/* Quartile chart */}
                  {(() => {
                    const avgs = statsData.marcas.map(m => m.avg).sort((a, b) => a - b);
                    const q1 = avgs[Math.floor((avgs.length - 1) * 0.25)];
                    const q2 = avgs[Math.floor((avgs.length - 1) * 0.5)];
                    const q3 = avgs[Math.floor((avgs.length - 1) * 0.75)];
                    const quartiles = [
                      { label: 'Q1', range: `0–${q1.toFixed(1)}`, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', marks: statsData.marcas.filter(m => m.avg <= q1) },
                      { label: 'Q2', range: `${q1.toFixed(1)}–${q2.toFixed(1)}`, color: '#f97316', bg: 'rgba(249,115,22,0.08)', marks: statsData.marcas.filter(m => m.avg > q1 && m.avg <= q2) },
                      { label: 'Q3', range: `${q2.toFixed(1)}–${q3.toFixed(1)}`, color: '#eab308', bg: 'rgba(234,179,8,0.08)', marks: statsData.marcas.filter(m => m.avg > q2 && m.avg <= q3) },
                      { label: 'Q4', range: `${q3.toFixed(1)}–10`, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', marks: statsData.marcas.filter(m => m.avg > q3) },
                    ];
                    return (
                      <div style={{ marginBottom: 18 }}>
                        <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Distribución por cuartil</span>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 6 }}>
                          {quartiles.map(q => {
                            const qAvg = q.marks.length > 0 ? q.marks.reduce((s, m) => s + m.avg, 0) / q.marks.length : null;
                            return (
                            <div key={q.label} style={{ background: q.bg, border: `1px solid ${q.color}33`, borderRadius: 8, padding: '8px 10px' }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: q.color }}>{q.label}</span>
                                <span style={{ fontSize: 9, color: '#52525b' }}>{q.range}</span>
                              </div>
                              {qAvg != null && <div style={{ fontSize: 10, color: q.color, fontWeight: 600, marginBottom: 6 }}>media {qAvg.toFixed(1)}</div>}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {q.marks.length === 0 && <span style={{ fontSize: 10, color: '#3f3f46', fontStyle: 'italic' }}>—</span>}
                                {q.marks.map(m => (
                                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 5, filter: m.blurred ? 'blur(4px)' : 'none', userSelect: m.blurred ? 'none' : 'auto' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: q.color, flexShrink: 0, display: 'inline-block' }} />
                                    <span style={{ fontSize: 10, color: 'var(--t-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: q.color, marginLeft: 'auto', flexShrink: 0 }}>{m.avg.toFixed(1)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  {/* Evolución temporal */}
                  {statsData.evolucion.length >= 2 && (() => {
                    const W = 460, H = 200, pad = { t: 16, r: 8, b: 36, l: 36 };
                    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
                    const avgs = statsData.evolucion.map(d => d.avg);
                    const minV = Math.min(...avgs), maxV = Math.max(...avgs);
                    const rangeV = maxV - minV || 1;
                    const xOf = (i) => pad.l + (i / (avgs.length - 1)) * iw;
                    const yOf = (v) => pad.t + ih - ((v - minV) / rangeV) * ih;
                    const pts = avgs.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ');
                    const area = `M${xOf(0)},${yOf(avgs[0])} ` + avgs.slice(1).map((v, i) => `L${xOf(i + 1)},${yOf(v)}`).join(' ') + ` L${xOf(avgs.length - 1)},${pad.t + ih} L${xOf(0)},${pad.t + ih} Z`;
                    const labelStep = Math.ceil(statsData.evolucion.length / 6);
                    return (
                      <div style={{ marginBottom: 18 }}>
                        <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Evolución temporal (media por mes)</span>
                        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                          <defs>
                            <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Grid lines */}
                          {[0, 0.25, 0.5, 0.75, 1].map(t => {
                            const y = pad.t + ih * (1 - t);
                            const val = minV + rangeV * t;
                            return (
                              <g key={t}>
                                <line x1={pad.l} y1={y} x2={pad.l + iw} y2={y} stroke="#27272a" strokeWidth="1" />
                                <text x={pad.l - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#52525b">{val.toFixed(1)}</text>
                              </g>
                            );
                          })}
                          {/* Area */}
                          <path d={area} fill="url(#lg)" />
                          {/* Line */}
                          <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" />
                          {/* Dots + labels */}
                          {statsData.evolucion.map((d, i) => (
                            <g key={d.mes}>
                              <circle cx={xOf(i)} cy={yOf(d.avg)} r="2.5" fill="#6366f1" />
                              {i % labelStep === 0 && (
                                <text x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#52525b">
                                  {d.mes.substring(5)}/{d.mes.substring(2, 4)}
                                </text>
                              )}
                            </g>
                          ))}
                        </svg>
                      </div>
                    );
                  })()}

                  {/* Histograma de distribución */}
                  {(() => {
                    const maxCount = Math.max(...statsData.histograma.map(h => h.count), 1);
                    const W = 460, H = 180, pad = { t: 16, r: 4, b: 28, l: 28 };
                    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
                    const barW = iw / 11 * 0.7, gap = iw / 11;
                    return (
                      <div style={{ marginBottom: 18 }}>
                        <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Distribución de notas</span>
                        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                          {statsData.histograma.map((h, i) => {
                            const bh = (h.count / maxCount) * ih;
                            const x = pad.l + i * gap + (gap - barW) / 2;
                            const y = pad.t + ih - bh;
                            const col = h.score < 5 ? '#ef4444' : h.score < 7.5 ? '#f97316' : '#22c55e';
                            return (
                              <g key={h.score}>
                                {h.count > 0 && <rect x={x} y={y} width={barW} height={bh} fill={col} fillOpacity="0.75" rx="2" />}
                                <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#52525b">{h.score}</text>
                                {h.count > 0 && <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fill={col}>{h.count}</text>}
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    );
                  })()}

                  {/* Campañas vs Automatizaciones */}
                  {(statsData.subcat.campanas.count > 0 || statsData.subcat.automatizaciones.count > 0) && (() => {
                    const items2 = [
                      { label: 'Campañas', ...statsData.subcat.campanas },
                      { label: 'Automatizaciones', ...statsData.subcat.automatizaciones },
                    ].filter(x => x.count > 0);
                    const maxAvg = Math.max(...items2.map(x => x.avg));
                    return (
                      <div style={{ marginBottom: 18 }}>
                        <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Campañas vs Automatizaciones</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {items2.map(x => {
                            const col = x.avg < 5 ? '#ef4444' : x.avg < 7.5 ? '#f97316' : '#22c55e';
                            const pct = (x.avg / 10) * 100;
                            return (
                              <div key={x.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <span style={{ fontSize: 11, color: 'var(--t-text)' }}>{x.label} <span style={{ color: '#52525b' }}>({x.count})</span></span>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: col }}>{x.avg.toFixed(1)}</span>
                                </div>
                                <div style={{ height: 6, background: '#27272a', borderRadius: 99 }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 99, transition: 'width 0.4s ease' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #27272a' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px', color: '#71717a', fontWeight: 500 }}>Marca</th>
                        <th style={{ textAlign: 'center', padding: '6px 8px', color: '#71717a', fontWeight: 500 }}>Emails</th>
                        <th style={{ textAlign: 'center', padding: '6px 8px', color: '#71717a', fontWeight: 500 }}>Media</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.marcas.map(m => {
                        const col = m.avg < 5 ? '#ef4444' : m.avg < 7.5 ? '#f97316' : '#22c55e';
                        return (
                          <tr key={m.name} style={{ borderBottom: '1px solid #1f1f23', filter: m.blurred ? 'blur(5px)' : 'none', userSelect: m.blurred ? 'none' : 'auto' }}>
                            <td style={{ padding: '8px 8px', color: 'var(--t-text)' }}>{m.name}</td>
                            <td style={{ padding: '8px 8px', textAlign: 'center', color: '#71717a' }}>{m.count}</td>
                            <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 700, color: col }}>{m.avg.toFixed(1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <div style={{ marginBottom: 16, background: '#111', border: '1px solid #27272a', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--t-text)', lineHeight: 1.6 }}>
                La puntuación media de los emails es <strong style={{ color: statsData.mediaGeneral < 5 ? '#ef4444' : statsData.mediaGeneral < 7.5 ? '#f97316' : '#22c55e' }}>{statsData.mediaGeneral.toFixed(1)}</strong> <span style={{ fontWeight: 400 }}>(de {statsData.totalEmails} emails evaluados)</span>
                {statsData.cadaXEmails != null && <>, lo que significa que <strong>1 de cada {statsData.cadaXEmails} emails</strong> que se mandan tienen una nota suspensa <span style={{ fontWeight: 400 }}>(un {statsData.pctEmailsSuspensas}%)</span></>}.
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--t-text)', lineHeight: 1.6 }}>
                De las <strong>{statsData.totalMarcas} marcas</strong> que se han analizado, <strong>{statsData.marcasSuspensas}</strong> tienen una media de emails suspensa
                {statsData.cadaZMarcas != null && <>, lo que significa que <strong>1 de cada {statsData.cadaZMarcas} marcas</strong> manda malos emails <span style={{ fontWeight: 400 }}>(un {statsData.pctMarcasSuspensas}%)</span></>}.
              </p>
              <button onClick={() => setShowStatsModal(true)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#6366f1', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                Mostrar análisis completo
              </button>
            </div>
          </>
        )}

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
                    {item.url
                      ? <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.categoria === 'email' ? 'top' : 'center', display: 'block', filter: 'blur(18px) brightness(0.6)', transform: 'scale(1.08)' }} loading="lazy" />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #1e1b2e 0%, #2a1f3d 25%, #1a2640 50%, #2d1b3d 75%, #1e1b2e 100%)' }} />
                    }
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Contenido exclusivo</span>
                      </div>
                    </div>
                  </div>
                  <BibliotecaCardMeta item={item} allTags={allTags} allSectors={allSectors} blurred />
                </div>
              ) : (
                <div key={item.id} onClick={() => { trackClick(`item: ${item.titulo || item.filename || item.id}`); navigate(`/anti-biblioteca/${item.id}`); }} style={{ cursor: 'pointer' }}>
                  <div style={{ aspectRatio: item.categoria === 'email' ? '9/16' : '16/9', backgroundColor: '#18181b', borderRadius: '8px', overflow: 'hidden', border: '1px solid #27272a', transition: 'border-color 0.15s', position: 'relative' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#52525b';
                      const badge = e.currentTarget.querySelector('[data-score-badge]');
                      if (badge) badge.style.transform = 'translateX(calc(-100% - 12px))';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#27272a';
                      const badge = e.currentTarget.querySelector('[data-score-badge]');
                      if (badge) badge.style.transform = 'translateX(0)';
                    }}>
                    {item.url
                      ? <img src={item.url} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.categoria === 'email' ? 'top' : 'center', display: 'block' }} loading="lazy" />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #1e1b2e 0%, #2a1f3d 25%, #1a2640 50%, #2d1b3d 75%, #1e1b2e 100%)' }} />
                    }
                    {item.puntuacion != null && (() => {
                      const s = item.puntuacion;
                      const col = s < 5 ? '#ef4444' : s < 7.5 ? '#f97316' : '#22c55e';
                      return (
                        <div data-score-badge="true" style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.82)', borderRadius: 8, padding: '6px 10px', backdropFilter: 'blur(4px)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 46, transition: 'transform 0.25s ease' }}>
                          <span style={{ fontSize: 17, fontWeight: 800, color: col, lineHeight: 1 }}>{s}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <BibliotecaCardMeta item={item} allTags={allTags} allSectors={allSectors} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
