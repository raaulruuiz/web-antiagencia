import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import BibliotecaCardMeta from '@/components/BibliotecaCardMeta';
import { useTheme } from '@/lib/ThemeContext';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const EyeOpenIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── DateRangePicker ───────────────────────────────────────────────────────────
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
    const [y, m, d] = s.split('-');
    return `${parseInt(d)} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][parseInt(m)-1]}`;
  };
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayMon = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

  const handleDayClick = (ymd) => {
    if (!from || (from && to)) {
      onChange({ from: ymd, to: '' });
    } else {
      if (ymd >= from) { onChange({ from, to: ymd }); }
      else             { onChange({ from: ymd, to: from }); }
    }
  };

  const prevMonth = () => viewMonth === 0  ? (setViewYear(y => y-1), setViewMonth(11)) : setViewMonth(m => m-1);
  const nextMonth = () => viewMonth === 11 ? (setViewYear(y => y+1), setViewMonth(0))  : setViewMonth(m => m+1);

  const hasFilter = from || to;
  const selectingEnd = from && !to;
  const label = hasFilter
    ? (from && to ? `${fmtShort(from)} – ${fmtShort(to)}` : `Desde ${fmtShort(from)}`)
    : null;

  const numDays = daysInMonth(viewYear, viewMonth);
  const offset  = firstDayMon(viewYear, viewMonth);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, fontSize: 12, background: hasFilter ? 'rgba(99,102,241,0.1)' : 'var(--t-surface2)', border: `1px solid ${hasFilter ? '#6366f1' : 'var(--t-border)'}`, color: hasFilter ? '#a5b4fc' : 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>{label || 'Fecha de envío'}</span>
        {hasFilter && <span onMouseDown={e => { e.stopPropagation(); onChange({ from: '', to: '' }); }} style={{ opacity: 0.7, lineHeight: 1, fontSize: 15, marginLeft: 2 }}>×</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: 'var(--t-surface)', border: '1px solid #3f3f46', borderRadius: 12, padding: '14px', zIndex: 100, width: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {selectingEnd && <p style={{ fontSize: 10, color: '#6366f1', margin: '0 0 8px', textAlign: 'center' }}>Ahora selecciona la fecha final</p>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--t-text-muted)', cursor: 'pointer', fontSize: 18, padding: '0 8px', lineHeight: 1 }}>‹</button>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t-text)' }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--t-text-muted)', cursor: 'pointer', fontSize: 18, padding: '0 8px', lineHeight: 1 }}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {WDAYS.map(d => <span key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--t-border-muted)', display: 'block', padding: '1px 0' }}>{d}</span>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: numDays }).map((_, i) => {
              const d = i + 1;
              const ymd = toYMD(viewYear, viewMonth, d);
              const isStart = ymd === from;
              const isEnd   = ymd === to;
              const inRange = from && to && ymd > from && ymd < to;
              return (
                <button key={d} onClick={() => handleDayClick(ymd)} style={{
                  width: '100%', aspectRatio: '1', border: 'none',
                  borderRadius: isStart || isEnd ? '50%' : inRange ? 0 : 4,
                  background: isStart || isEnd ? '#6366f1' : inRange ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: isStart || isEnd ? 'white' : inRange ? '#a5b4fc' : '#d4d4d8',
                  cursor: 'pointer', fontSize: 12, fontWeight: isStart || isEnd ? 700 : 400,
                }}>
                  {d}
                </button>
              );
            })}
          </div>
          {hasFilter && (
            <button onClick={() => { onChange({ from: '', to: '' }); setOpen(false); }}
              style={{ marginTop: 10, width: '100%', background: 'none', border: '1px solid #3f3f46', color: 'var(--t-text)', borderRadius: 8, padding: '5px', fontSize: 11, cursor: 'pointer' }}>
              Limpiar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ count, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onCancel}>
      <div className="rounded-xl border border-zinc-700 p-6 flex flex-col gap-4" style={{ backgroundColor: 'var(--t-surface)', width: '320px' }} onClick={e => e.stopPropagation()}>
        <p className="text-sm text-white font-medium">{count === 1 ? '¿Eliminar esta captura?' : `¿Eliminar ${count} capturas?`}</p>
        <p className="text-xs text-zinc-400">Esta acción no se puede deshacer.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-lg transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="text-xs text-white bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmVisibilidadModal({ count, publico, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onCancel}>
      <div className="rounded-xl border border-zinc-700 p-6 flex flex-col gap-4" style={{ backgroundColor: 'var(--t-surface)', width: '320px' }} onClick={e => e.stopPropagation()}>
        <p className="text-sm text-white font-medium">
          {publico
            ? `¿Mostrar ${count === 1 ? 'esta captura' : `estas ${count} capturas`} en la biblioteca pública?`
            : `¿Ocultar ${count === 1 ? 'esta captura' : `estas ${count} capturas`} de la biblioteca pública?`}
        </p>
        <p className="text-xs text-zinc-400">
          {publico ? 'Aparecerán en la biblioteca pública normalmente.' : 'Aparecerán con blur para los visitantes.'}
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-lg transition-colors">Cancelar</button>
          <button onClick={onConfirm}
            className="text-xs text-white px-4 py-2 rounded-lg transition-colors"
            style={{ background: publico ? '#16a34a' : '#ea580c' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {publico ? 'Mostrar' : 'Ocultar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = (active) => ({
  fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
  borderColor: active ? '#52525b' : '#3f3f46',
  background: active ? '#27272a' : 'transparent',
  color: active ? 'var(--t-text)' : '#a1a1aa',
});

export default function Biblioteca() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [items, setItems]         = useState([]);
  const [allTags, setAllTags]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected]   = useState(new Set());
  const [deleting, setDeleting]   = useState(false);
  const [confirm, setConfirm]     = useState(null);
  const [confirmVis, setConfirmVis] = useState(null); // { publico: boolean }

  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [showFilters, setShowFilters]       = useState(false);
  const [showStats, setShowStats]           = useState(false);
  const [statsData, setStatsData]           = useState(null);
  const [statsLoading, setStatsLoading]     = useState(false);
  const [filterCategoria, setFilterCategoria]   = useState('');
  const [filterSubcat, setFilterSubcat]       = useState('');
  const [filterMarca, setFilterMarca]         = useState('');
  const [filterTagId, setFilterTagId]         = useState('');
  const [filterFechaFrom, setFilterFechaFrom] = useState('');
  const [filterFechaTo, setFilterFechaTo]     = useState('');

  const activeFilterCount = [filterCategoria, filterSubcat, filterMarca, filterTagId, (filterFechaFrom || filterFechaTo) ? '1' : ''].filter(Boolean).length;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Sin sesión');
      const [itemsRes, tagsRes] = await Promise.all([
        fetch(`${API_BASE}/biblioteca`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/biblioteca/tags`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      if (!itemsRes.ok) throw new Error('Error al cargar');
      setItems(await itemsRes.json());
      if (tagsRes.ok) setAllTags(await tagsRes.json());
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived: all distinct marcas for autocomplete
  const allMarcas = useMemo(() => [...new Set(items.map(i => i.marca).filter(Boolean))].sort(), [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        (i.marca || '').toLowerCase().includes(q) ||
        (i.asunto || '').toLowerCase().includes(q) ||
        (i.adelanto || '').toLowerCase().includes(q)
      );
    }
    if (filterCategoria) result = result.filter(i => i.categoria === filterCategoria);
    if (filterSubcat)    result = result.filter(i => i.subcategoria === filterSubcat);
    if (filterMarca)     result = result.filter(i => (i.marca || '').toLowerCase().includes(filterMarca.toLowerCase()));
    if (filterTagId)     result = result.filter(i => (i.tags || []).includes(filterTagId));
    if (filterFechaFrom) result = result.filter(i => i.enviado_el && i.enviado_el >= filterFechaFrom);
    if (filterFechaTo)   result = result.filter(i => i.enviado_el && i.enviado_el <= filterFechaTo);
    return result;
  }, [items, searchQuery, filterCategoria, filterSubcat, filterMarca, filterTagId, filterFechaFrom, filterFechaTo]);

  const clearFilters = () => { setFilterCategoria(''); setFilterSubcat(''); setFilterMarca(''); setFilterTagId(''); setFilterFechaFrom(''); setFilterFechaTo(''); };

  const deleteIds = useCallback(async (ids) => {
    setDeleting(true); setConfirm(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/biblioteca`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
      if (!res.ok) throw new Error('Error al eliminar');
      setItems(prev => prev.filter(i => !ids.includes(i.id)));
      setSelected(new Set());
    } catch(e) { alert(e.message); }
    finally { setDeleting(false); }
  }, []);

  const askDelete = (ids) => setConfirm({ ids });
  const toggleSelect = (id) => { setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };
  const exitSelect = () => { setSelecting(false); setSelected(new Set()); };

  const togglePublico = useCallback(async (id, current) => {
    const next = current === false ? true : false;
    setItems(prev => prev.map(i => i.id === id ? { ...i, publico: next } : i));
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/biblioteca/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ publico: next }),
      });
    } catch { /* optimistic, revert on hard failure is acceptable */ }
  }, []);

  const bulkSetVisibilidad = useCallback(async (publico) => {
    const ids = [...selected];
    setConfirmVis(null);
    setSelecting(false);
    setSelected(new Set());
    setItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, publico } : i));
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/biblioteca/visibilidad`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, publico }),
      });
    } catch { /* optimistic */ }
  }, [selected]);

  const askBulkVisibilidad = (publico) => setConfirmVis({ publico });

  const inputStyle = { background: 'var(--t-surface2)', border: '1px solid #27272a', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark' };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  return (
    <div data-theme={theme} className="p-4 md:p-8" style={{ backgroundColor: 'var(--t-bg)', color: 'var(--t-text)', minHeight: '100vh' }}>

      {confirm && <ConfirmModal count={confirm.ids.length} onConfirm={() => deleteIds(confirm.ids)} onCancel={() => setConfirm(null)} />}
      {confirmVis && <ConfirmVisibilidadModal count={selected.size} publico={confirmVis.publico} onConfirm={() => bulkSetVisibilidad(confirmVis.publico)} onCancel={() => setConfirmVis(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Biblioteca</h1>
        <div className="flex items-center gap-2">
          {selecting ? (
            <>
              {selected.size > 0 && (
                <>
                  <button onClick={() => askDelete([...selected])} disabled={deleting}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    <TrashIcon /> Eliminar {selected.size}
                  </button>
                  <button onClick={() => askBulkVisibilidad(true)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors">
                    <EyeOpenIcon /> Mostrar
                  </button>
                  <button onClick={() => askBulkVisibilidad(false)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors">
                    <EyeOffIcon /> Ocultar
                  </button>
                </>
              )}
              <button onClick={exitSelect} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors">Cancelar</button>
            </>
          ) : (
            <>
              <a href="/anti-biblioteca" target="_blank" rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Enlace público
              </a>
              <button onClick={async () => {
                setShowStats(true);
                if (!statsData) {
                  setStatsLoading(true);
                  try {
                    const token = await getToken();
                    const res = await fetch(`${API_BASE}/api/biblioteca-accesos`, { headers: { 'Authorization': `Bearer ${token}` } });
                    const data = await res.json();
                    setStatsData(data);
                  } catch { setStatsData([]); }
                  setStatsLoading(false);
                }
              }} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Estadísticas
              </button>
              {/* Search */}
              <button onClick={() => { setShowSearch(s => !s); setShowFilters(false); }}
                style={btnStyle(showSearch)}>
                <SearchIcon />
              </button>
              {/* Filter */}
              <button onClick={() => { setShowFilters(s => !s); setShowSearch(false); }}
                style={{ ...btnStyle(showFilters || activeFilterCount > 0), position: 'relative' }}>
                <FilterIcon /> Filtrar
                {activeFilterCount > 0 && (
                  <span style={{ background: '#6366f1', color: 'var(--t-text)', fontSize: 9, fontWeight: 700, borderRadius: 999, padding: '1px 5px', marginLeft: 2 }}>{activeFilterCount}</span>
                )}
              </button>
              <button onClick={() => setSelecting(true)} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors">Seleccionar</button>
              <button onClick={load} disabled={loading} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Cargando…' : 'Actualizar'}
              </button>
              <button onClick={toggle} title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
                style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t-border-muted)', pointerEvents: 'none', display: 'flex' }}><SearchIcon /></span>
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por marca, asunto, adelanto…"
              style={{ ...inputStyle, width: '100%', paddingLeft: 32, boxSizing: 'border-box', fontSize: 13, padding: '8px 10px 8px 32px' }} />
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--t-text-muted)', cursor: 'pointer', display: 'flex' }}><XIcon /></button>
          )}
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div style={{ marginBottom: 16, background: 'var(--t-surface)', border: '1px solid #27272a', borderRadius: 12, padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          {/* Categoría */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--t-border-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
            <select value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)} style={selectStyle}>
              <option value="">Todas</option>
              <option value="email">Email</option>
              <option value="ficha">Ficha de Producto</option>
            </select>
          </div>

          {/* Subcategoría */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--t-border-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
            <select value={filterSubcat} onChange={e => setFilterSubcat(e.target.value)} style={selectStyle}>
              <option value="">Todas</option>
              <option value="automatizacion">Automatización</option>
              <option value="campana">Campaña</option>
            </select>
          </div>

          {/* Marca */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--t-border-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Marca</span>
            <select value={filterMarca} onChange={e => setFilterMarca(e.target.value)} style={selectStyle}>
              <option value="">Todas</option>
              {allMarcas.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Etiqueta */}
          {allTags.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--t-border-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etiqueta</span>
              <select value={filterTagId} onChange={e => setFilterTagId(e.target.value)} style={selectStyle}>
                <option value="">Todas</option>
                {allTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          {/* Fecha rango */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--t-border-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enviado el Día</span>
            <DateRangePicker from={filterFechaFrom} to={filterFechaTo} onChange={({ from, to }) => { setFilterFechaFrom(from); setFilterFechaTo(to); }} />
          </div>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters}
              style={{ background: 'none', border: '1px solid #3f3f46', color: 'var(--t-text-muted)', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--t-border-muted)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.borderColor = 'var(--t-border-mid)'; }}>
              <XIcon /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Result count when filtered */}
      {(searchQuery || activeFilterCount > 0) && !loading && (
        <p style={{ fontSize: 12, color: 'var(--t-border-muted)', marginBottom: 12 }}>
          {filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'}
        </p>
      )}

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-zinc-500 text-sm">Sin capturas todavía. Usa la extensión para capturar páginas.</p>
      )}

      {!loading && filteredItems.length === 0 && items.length > 0 && (
        <p className="text-zinc-500 text-sm">No hay capturas que coincidan con los filtros.</p>
      )}

      {filteredItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredItems.map(item => {
            const isSelected = selected.has(item.id);
            return (
              <div key={item.id} className="group relative cursor-pointer"
                onClick={() => { if (selecting) { toggleSelect(item.id); return; } navigate(`/admin/biblioteca/${item.id}`); }}>
                {item.categoria === 'email' && item.asunto && (
                  <p style={{ fontSize: 11, color: 'var(--t-text-muted)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.asunto}>{item.asunto}</p>
                )}
                {item.categoria === 'ficha' && item.ficha_url && (
                  <p style={{ fontSize: 11, color: 'var(--t-text-muted)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.ficha_url}>{item.ficha_url}</p>
                )}
                <div className="bg-zinc-900 rounded-lg overflow-hidden border transition-colors relative" style={{ aspectRatio: item.categoria === 'email' ? '9/16' : '16/9', borderColor: isSelected ? '#fff' : 'var(--t-border)' }}>
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" style={{ objectPosition: item.categoria === 'email' ? 'top' : 'center' }} loading="lazy" />

                  {/* Permanent badge — visible at a glance when item is hidden */}
                  {item.publico === false && (
                    <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(234,88,12,0.9)', borderRadius: 6, padding: '3px 5px', display: 'flex', alignItems: 'center', backdropFilter: 'blur(4px)', pointerEvents: 'none' }}>
                      <EyeOffIcon />
                    </div>
                  )}

                  {!selecting && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={e => { e.stopPropagation(); togglePublico(item.id, item.publico); }}
                          className="p-1.5 rounded-md transition-colors"
                          style={item.publico === false
                            ? { color: '#f97316', background: 'rgba(234,88,12,0.25)', border: '1px solid rgba(234,88,12,0.5)' }
                            : { color: 'rgba(255,255,255,0.7)', background: 'transparent', border: '1px solid transparent' }}
                          onMouseEnter={e => {
                            if (item.publico === false) {
                              e.currentTarget.style.background = 'rgba(234,88,12,0.45)';
                            } else {
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (item.publico === false) {
                              e.currentTarget.style.background = 'rgba(234,88,12,0.25)';
                            } else {
                              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                          title={item.publico === false ? 'Oculto en público (con blur)' : 'Visible en público'}>
                          {item.publico === false ? <EyeOffIcon /> : <EyeOpenIcon />}
                        </button>
                        <button onClick={e => { e.stopPropagation(); askDelete([item.id]); }} disabled={deleting}
                          className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-red-600/80 transition-colors disabled:opacity-50" title="Eliminar">
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  )}

                  {selecting && (
                    <div className="absolute top-2 left-2">
                      <div className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                        style={{ borderColor: isSelected ? '#fff' : 'rgba(255,255,255,0.5)', backgroundColor: isSelected ? '#fff' : 'rgba(0,0,0,0.4)' }}>
                        {isSelected && <span style={{ color: '#000' }}><CheckIcon /></span>}
                      </div>
                    </div>
                  )}
                </div>
                <BibliotecaCardMeta item={item} allTags={allTags} />
              </div>
            );
          })}
        </div>
      )}

      {showStats && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={e => { if (e.target === e.currentTarget) setShowStats(false); }}>
          <div style={{ background:'var(--t-surface)', border:'1px solid var(--t-border)', borderRadius:12, padding:24, width:'100%', maxWidth:540, maxHeight:'80vh', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h3 style={{ fontSize:15, fontWeight:600, color:'var(--t-text)', margin:0 }}>Accesos a la Anti-Biblioteca</h3>
              <button onClick={() => setShowStats(false)} style={{ background:'none', border:'none', color:'var(--t-text-subtle)', cursor:'pointer', fontSize:18, lineHeight:1 }}>×</button>
            </div>
            <div style={{ overflowY:'auto', flex:1 }}>
              {statsLoading && <p style={{ fontSize:13, color:'var(--t-text-muted)', textAlign:'center', padding:'20px 0' }}>Cargando...</p>}
              {!statsLoading && statsData && statsData.length === 0 && <p style={{ fontSize:13, color:'var(--t-text-muted)', textAlign:'center', padding:'20px 0' }}>Sin accesos registrados todavía.</p>}
              {!statsLoading && statsData && statsData.length > 0 && (
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--t-border)' }}>
                      <th style={{ textAlign:'left', padding:'6px 8px', color:'var(--t-text-subtle)', fontWeight:600, textTransform:'uppercase', fontSize:10, letterSpacing:'0.06em' }}>Email</th>
                      <th style={{ textAlign:'left', padding:'6px 8px', color:'var(--t-text-subtle)', fontWeight:600, textTransform:'uppercase', fontSize:10, letterSpacing:'0.06em' }}>Fecha y hora</th>
                      <th style={{ textAlign:'center', padding:'6px 8px', color:'var(--t-text-subtle)', fontWeight:600, textTransform:'uppercase', fontSize:10, letterSpacing:'0.06em' }}>Válido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.map((row, i) => (
                      <tr key={i} style={{ borderBottom:'1px solid var(--t-border-s)' }}>
                        <td style={{ padding:'7px 8px', color:'var(--t-text)' }}>{row.email}</td>
                        <td style={{ padding:'7px 8px', color:'var(--t-text-muted)', whiteSpace:'nowrap' }}>{new Date(row.accessed_at).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</td>
                        <td style={{ padding:'7px 8px', textAlign:'center' }}>{row.valid ? <span style={{ color:'#22c55e', fontSize:14 }}>✓</span> : <span style={{ color:'#71717a', fontSize:14 }}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {!statsLoading && statsData && <p style={{ fontSize:11, color:'var(--t-text-subtle)', margin:0 }}>{statsData.length} registro{statsData.length !== 1 ? 's' : ''} · ✓ = email en lista</p>}
          </div>
        </div>
      )}
    </div>
  );
}
