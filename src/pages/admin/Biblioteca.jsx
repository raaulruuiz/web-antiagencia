import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import BibliotecaCardMeta from '@/components/BibliotecaCardMeta';

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

function ConfirmModal({ count, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onCancel}>
      <div className="rounded-xl border border-zinc-700 p-6 flex flex-col gap-4" style={{ backgroundColor: '#1a1a1a', width: '320px' }} onClick={e => e.stopPropagation()}>
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

const btnStyle = (active) => ({
  fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
  borderColor: active ? '#52525b' : '#3f3f46',
  background: active ? '#27272a' : 'transparent',
  color: active ? 'white' : '#a1a1aa',
});

export default function Biblioteca() {
  const navigate = useNavigate();
  const [items, setItems]         = useState([]);
  const [allTags, setAllTags]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected]   = useState(new Set());
  const [deleting, setDeleting]   = useState(false);
  const [confirm, setConfirm]     = useState(null);

  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [showFilters, setShowFilters]       = useState(false);
  const [filterCategoria, setFilterCategoria]   = useState('');
  const [filterSubcat, setFilterSubcat]       = useState('');
  const [filterMarca, setFilterMarca]         = useState('');
  const [filterTagId, setFilterTagId]         = useState('');
  const [filterFechaFrom, setFilterFechaFrom] = useState('');
  const [filterFechaTo, setFilterFechaTo]     = useState('');

  const activeFilterCount = [filterCategoria, filterSubcat, filterMarca, filterTagId, filterFechaFrom, filterFechaTo].filter(Boolean).length;

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

  const inputStyle = { background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: 'white', outline: 'none', colorScheme: 'dark' };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  return (
    <div className="p-4 md:p-8" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>

      {confirm && <ConfirmModal count={confirm.ids.length} onConfirm={() => deleteIds(confirm.ids)} onCancel={() => setConfirm(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Biblioteca</h1>
        <div className="flex items-center gap-2">
          {selecting ? (
            <>
              {selected.size > 0 && (
                <button onClick={() => askDelete([...selected])} disabled={deleting}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                  <TrashIcon /> Eliminar {selected.size}
                </button>
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
                  <span style={{ background: '#6366f1', color: 'white', fontSize: 9, fontWeight: 700, borderRadius: 999, padding: '1px 5px', marginLeft: 2 }}>{activeFilterCount}</span>
                )}
              </button>
              <button onClick={() => setSelecting(true)} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors">Seleccionar</button>
              <button onClick={load} disabled={loading} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Cargando…' : 'Actualizar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#52525b', pointerEvents: 'none', display: 'flex' }}><SearchIcon /></span>
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por marca, asunto, adelanto…"
              style={{ ...inputStyle, width: '100%', paddingLeft: 32, boxSizing: 'border-box', fontSize: 13, padding: '8px 10px 8px 32px' }} />
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', display: 'flex' }}><XIcon /></button>
          )}
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div style={{ marginBottom: 16, background: '#111', border: '1px solid #27272a', borderRadius: 12, padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          {/* Categoría */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
            <select value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)} style={selectStyle}>
              <option value="">Todas</option>
              <option value="email">Email</option>
              <option value="ficha">Ficha de Producto</option>
            </select>
          </div>

          {/* Subcategoría */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
            <select value={filterSubcat} onChange={e => setFilterSubcat(e.target.value)} style={selectStyle}>
              <option value="">Todas</option>
              <option value="automatizacion">Automatización</option>
              <option value="campana">Campaña</option>
            </select>
          </div>

          {/* Marca */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Marca</span>
            <select value={filterMarca} onChange={e => setFilterMarca(e.target.value)} style={selectStyle}>
              <option value="">Todas</option>
              {allMarcas.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Etiqueta */}
          {allTags.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etiqueta</span>
              <select value={filterTagId} onChange={e => setFilterTagId(e.target.value)} style={selectStyle}>
                <option value="">Todas</option>
                {allTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          {/* Fecha desde */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enviado desde</span>
            <input type="date" value={filterFechaFrom} onChange={e => setFilterFechaFrom(e.target.value)} style={selectStyle} />
          </div>

          {/* Fecha hasta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hasta</span>
            <input type="date" value={filterFechaTo} onChange={e => setFilterFechaTo(e.target.value)} style={selectStyle} />
          </div>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters}
              style={{ background: 'none', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#52525b'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.borderColor = '#3f3f46'; }}>
              <XIcon /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Result count when filtered */}
      {(searchQuery || activeFilterCount > 0) && !loading && (
        <p style={{ fontSize: 12, color: '#52525b', marginBottom: 12 }}>
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
                <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden border transition-colors" style={{ borderColor: isSelected ? '#fff' : '#27272a' }}>
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" loading="lazy" />

                  {!selecting && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
                      <button onClick={e => { e.stopPropagation(); askDelete([item.id]); }} disabled={deleting}
                        className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-red-600/80 transition-colors disabled:opacity-50" title="Eliminar">
                        <TrashIcon />
                      </button>
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
    </div>
  );
}
