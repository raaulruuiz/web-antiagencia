import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fmt } from '../utils';
import { VinculosDropdown } from './VinculosDropdown';
import { CeldaEditable } from './CeldaEditable';

// ── Tabla de movimientos ────────────────────────────────────────
export function TablaMovimientos({ items, seleccionados, onToggleSel, onToggleAll, onGuardarCelda, onVerDetalle, clientesLista, equipoLista, proveedoresLista, facturasDisponibles = [], loadingFacsVincular = false, onVincularFacturas }) {
  const allSel = items.length > 0 && items.every(m => seleccionados.has(m.id));
  const someSel = !allSel && items.some(m => seleccionados.has(m.id));
  const [editNombreId, setEditNombreId] = useState(null);
  const [editNombreVal, setEditNombreVal] = useState('');
  const nombreInputRef = useRef(null);
  const [colCalcs, setColCalcs] = useState(() => { try { const v = localStorage.getItem('fin-col-calcs'); return v ? JSON.parse(v) : {}; } catch { return {}; } });
  const [openCalcKey, setOpenCalcKey] = useState(null);
  const [calcDropPos, setCalcDropPos] = useState(null);
  const [colWidths, setColWidths] = useState([]);
  const [vinculosMovId, setVinculosMovId] = useState(null); // qué movimiento tiene el dropdown de facturas abierto
  const tableWrapRef = useRef(null);
  const calcBarRef = useRef(null);
  const theadRef = useRef(null);

  useEffect(() => {
    if (editNombreId && nombreInputRef.current) nombreInputRef.current.focus();
  }, [editNombreId]);

  function guardarNombre() {
    if (editNombreVal.trim() && editNombreVal !== items.find(m => m.id === editNombreId)?.nombre) {
      onGuardarCelda(editNombreId, 'nombre', editNombreVal.trim());
    }
    setEditNombreId(null);
  }

  useEffect(() => {
    if (!openCalcKey) return;
    function handler(e) {
      if (e.target.closest('.fin-calc-dropdown')) return; // clic dentro del portal
      if (calcBarRef.current && !calcBarRef.current.contains(e.target)) { setOpenCalcKey(null); setCalcDropPos(null); }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openCalcKey]);

  // Medir anchos reales de columnas del header para alinear la barra de cálculo
  useEffect(() => {
    function measure() {
      if (!theadRef.current) return;
      const ths = Array.from(theadRef.current.querySelectorAll('th'));
      if (ths.length) setColWidths(ths.map(th => th.offsetWidth));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (theadRef.current) ro.observe(theadRef.current);
    return () => ro.disconnect();
  }, []);

  function setColCalc(key, val) {
    const next = { ...colCalcs, [key]: val };
    setColCalcs(next);
    try { localStorage.setItem('fin-col-calcs', JSON.stringify(next)); } catch {}
  }

  const CALC_NUMERIC_KEYS = ['cantidad','importe_factura','base_imponible','beneficio','ivaAPagar','irpfAPagar','irpf_retenido_yo'];
  const CALC_DATE_KEYS = ['fecha','fecha_factura','created_at','updated_at'];
  const CALC_NUMERIC_OPTS = [
    { val:'sum', label:'Suma' }, { val:'average', label:'Media' }, { val:'median', label:'Mediana' },
    { val:'min', label:'Mínimo' }, { val:'max', label:'Máximo' }, { val:'range', label:'Rango' },
  ];
  const CALC_DATE_OPTS = [
    { val:'earliest', label:'Fecha más antigua' }, { val:'latest', label:'Fecha más reciente' }, { val:'date_range', label:'Rango de fechas' },
  ];
  const CALC_COMMON_OPTS = [
    { val:'none', label:'Ninguno' }, { val:'count_all', label:'Contar todo' },
    { val:'count_values', label:'Contar valores' }, { val:'count_unique', label:'Contar únicos' },
    { val:'count_empty', label:'Contar vacíos' }, { val:'count_not_empty', label:'Contar no vacíos' },
    { val:'pct_empty', label:'% vacíos' }, { val:'pct_not_empty', label:'% rellenos' },
  ];
  const CALC_SHORT = { sum:'SUMA', average:'MEDIA', median:'MEDIANA', min:'MÍN', max:'MÁX', range:'RANGO', count_all:'TOTAL', count_values:'VALORES', count_unique:'ÚNICOS', count_empty:'VACÍOS', count_not_empty:'NO VACÍOS', pct_empty:'% VACÍOS', pct_not_empty:'% RELLENOS', earliest:'MÁS ANTIGUA', latest:'MÁS RECIENTE', date_range:'RANGO FECHAS' };

  function getCalcOpts(key) {
    const none = CALC_COMMON_OPTS[0]; // { val:'none', label:'Ninguno' }
    const rest = CALC_COMMON_OPTS.slice(1);
    if (CALC_NUMERIC_KEYS.includes(key)) return [none, ...CALC_NUMERIC_OPTS, ...rest];
    if (CALC_DATE_KEYS.includes(key)) return [none, ...CALC_DATE_OPTS, ...rest];
    return CALC_COMMON_OPTS;
  }

  function calcVal(key, type) {
    if (!type || type === 'none') return null;
    const vals = items.map(m => m[key]);
    const notEmpty = v => v != null && v !== '' && !(Array.isArray(v) && v.length === 0);
    switch(type) {
      case 'count_all':       return items.length;
      case 'count_values':    return vals.filter(notEmpty).length;
      case 'count_unique':    return new Set(vals.filter(v=>v!=null).map(v=>JSON.stringify(v))).size;
      case 'count_empty':     return vals.filter(v=>!notEmpty(v)).length;
      case 'count_not_empty': return vals.filter(notEmpty).length;
      case 'pct_empty':       return items.length ? +(vals.filter(v=>!notEmpty(v)).length/items.length*100).toFixed(1) : 0;
      case 'pct_not_empty':   return items.length ? +(vals.filter(notEmpty).length/items.length*100).toFixed(1) : 0;
      case 'sum':     { const ns=vals.filter(v=>v!=null); return ns.reduce((a,b)=>a+b,0); }
      case 'average': { const ns=vals.filter(v=>v!=null); return ns.length?ns.reduce((a,b)=>a+b,0)/ns.length:null; }
      case 'median':  { const ns=vals.filter(v=>v!=null).sort((a,b)=>a-b); if(!ns.length) return null; const mid=Math.floor(ns.length/2); return ns.length%2?ns[mid]:(ns[mid-1]+ns[mid])/2; }
      case 'min':     { const ns=vals.filter(v=>v!=null); return ns.length?Math.min(...ns):null; }
      case 'max':     { const ns=vals.filter(v=>v!=null); return ns.length?Math.max(...ns):null; }
      case 'range':   { const ns=vals.filter(v=>v!=null); return ns.length?Math.max(...ns)-Math.min(...ns):null; }
      case 'earliest':   { const ds=vals.filter(v=>v).sort(); return ds.length?ds[0].slice(0,10):null; }
      case 'latest':     { const ds=vals.filter(v=>v).sort(); return ds.length?ds[ds.length-1].slice(0,10):null; }
      case 'date_range': { const ds=vals.filter(v=>v).sort(); if(ds.length<2) return null; return Math.round((new Date(ds[ds.length-1])-new Date(ds[0]))/864e5)+' días'; }
      default: return null;
    }
  }

  function fmtCalc(key, type, val) {
    if (val == null) return null;
    if (['pct_empty','pct_not_empty'].includes(type)) return val + '%';
    if (['count_all','count_values','count_unique','count_empty','count_not_empty'].includes(type)) return String(val);
    if (CALC_NUMERIC_KEYS.includes(key)) return fmt(val);
    return String(val);
  }

  const COLS = [
    { key:'fecha',            label:'Fecha',          w:95 },
    { key:'nombre',           label:'Nombre',         flex:1 },
    { key:'cantidad',         label:'Cantidad',       w:90 },
    { key:'tipo',             label:'Tipo',           w:80 },
    { key:'cuenta',           label:'Cuenta',         w:160 },
    { key:'iva',              label:'IVA',            w:55 },
    { key:'irpf',             label:'IRPF',           w:55 },
    { key:'categorias',       label:'Categorías',     w:150 },
    { key:'cliente_ids',      label:'Clientes',       w:130 },
    { key:'equipo_ids',       label:'Equipo',         w:120 },
    { key:'proveedor_ids',    label:'Proveedores',    w:130 },
    { key:'factura_ids',      label:'Documentos',     w:100 },
    { key:'fecha_factura',    label:'F. Factura',     w:100 },
    { key:'importe_factura',  label:'Imp. s/Factura', w:110 },
    { key:'base_imponible',   label:'Base Impon.',    w:95,  readonly:true },
    { key:'beneficio',        label:'Beneficio',      w:90,  readonly:true },
    { key:'ivaAPagar',        label:'IVA a Pagar',    w:90,  readonly:true },
    { key:'irpfAPagar',       label:'IRPF a Pagar',   w:95,  readonly:true },
    { key:'irpf_retenido_yo', label:'IRPF Ret.',      w:80,  readonly:true },
    { key:'created_at',       label:'Creado',         w:100, readonly:'date' },
    { key:'updated_at',       label:'Modificado',     w:100, readonly:'date' },
    { key:'id',               label:'ID',             w:290, readonly:'text' },
    { key:'notion_id',        label:'Notion ID',      w:290, readonly:'text' },
  ];
  function calcColMinW(col) {
    const type = colCalcs[col.key];
    if (!type || type === 'none') return col.w || 80;
    if (['sum','average','median','min','max','range'].includes(type)) return Math.max(col.w||0, 155);
    if (['earliest','latest','date_range'].includes(type)) return Math.max(col.w||0, 165);
    if (['pct_empty','pct_not_empty'].includes(type)) return Math.max(col.w||0, 115);
    return Math.max(col.w||0, 100); // count types
  }

  const th = { padding:'8px 10px', color:'#52525b', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #27272a', whiteSpace:'nowrap', textAlign:'left' };
  const td = { padding:'6px 10px', borderBottom:'1px solid #1c1c1e', verticalAlign:'middle', whiteSpace:'nowrap' };

  const haySeleccionados = items.some(m => seleccionados.has(m.id));
  // Ancho mínimo compartido entre tabla y barra de cálculo para alinear columnas
  const tblMinW = 36 + COLS.reduce((s, c) => s + (c.w || 150), 0);
  return (
    <div>
      <style>{`
        .fin-tabla-row .fin-cb { opacity:0; transition:opacity 0.1s; }
        .fin-tabla-row:hover .fin-cb { opacity:1; }
        .fin-tabla-row .fin-cb.checked { opacity:1; }
        .fin-tabla-row .fin-nombre-btn { opacity:0; transition:opacity 0.1s; }
        .fin-tabla-row:hover .fin-nombre-btn { opacity:1; }
        .fin-calc-btn:hover span { opacity:0.7; }
        .fin-calc-bar::-webkit-scrollbar { display:none; }
        .fin-calc-bar { scrollbar-width:none; }
      `}</style>
      <div ref={tableWrapRef} style={{ overflowX:'auto' }}
        onScroll={e => { if(calcBarRef.current) calcBarRef.current.scrollLeft = e.currentTarget.scrollLeft; }}>
        <table style={{ width:'100%', minWidth:tblMinW, borderCollapse:'collapse', fontSize:13 }}>
          <thead ref={theadRef}>
            <tr>
              <th style={{ ...th, width:36, paddingRight:0 }}>
                {haySeleccionados && (
                  <input type="checkbox" checked={allSel} ref={el => { if(el) el.indeterminate=someSel; }}
                    onChange={() => onToggleAll(items, allSel)} style={{ accentColor:'#0067FD', cursor:'pointer' }} />
                )}
              </th>
              {COLS.map(col => <th key={col.key} style={{ ...th, width:col.w, minWidth:calcColMinW(col) }}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map(m => {
              const sel = seleccionados.has(m.id);
              return (
                <tr key={m.id} className="fin-tabla-row" style={{ background: sel?'#1e293b':'transparent' }}
                  onMouseEnter={e => { if(!sel) e.currentTarget.style.background='#1c1c1e'; }}
                  onMouseLeave={e => { e.currentTarget.style.background=sel?'#1e293b':'transparent'; }}>
                  <td style={{ ...td, width:36, paddingRight:0 }}>
                    <input type="checkbox" checked={sel} onChange={() => onToggleSel(m.id)}
                      className={`fin-cb${sel?' checked':''}`}
                      style={{ accentColor:'#0067FD', cursor:'pointer' }} />
                  </td>
                  {COLS.map(col => {
                    if (col.key === 'factura_ids') {
                      const ids = m.factura_ids || [];
                      const abierto = vinculosMovId === m.id;
                      return (
                        <td key="factura_ids" style={{ ...td, width:col.w, position:'relative' }}>
                          <div onClick={() => setVinculosMovId(abierto ? null : m.id)} style={{ cursor:'pointer', display:'inline-flex' }}>
                            {ids.length > 0
                              ? <span style={{ background:'rgba(99,102,241,0.15)', color:'#818cf8', fontSize:11, padding:'2px 7px', borderRadius:4, fontWeight:600 }}>
                                  {ids.length} doc{ids.length !== 1 ? 's' : ''}
                                </span>
                              : <span style={{ color:'#3f3f46', fontSize:12 }}>—</span>}
                          </div>
                          {abierto && onVincularFacturas && (
                            <VinculosDropdown
                              seleccionados={ids}
                              opciones={facturasDisponibles}
                              cargando={loadingFacsVincular}
                              onToggle={facId => {
                                const newIds = ids.includes(facId) ? ids.filter(x => x !== facId) : [...ids, facId];
                                onVincularFacturas(m.id, newIds);
                              }}
                              onClose={() => setVinculosMovId(null)}
                            />
                          )}
                        </td>
                      );
                    }
                    return (
                    <td key={col.key} style={{ ...td, width:col.w, maxWidth:col.flex?260:col.w, overflow:col.flex?'hidden':undefined }}>
                      {col.key==='nombre' ? (
                        editNombreId === m.id ? (
                          <input ref={nombreInputRef} value={editNombreVal}
                            onChange={e => setEditNombreVal(e.target.value)}
                            onBlur={guardarNombre}
                            onKeyDown={e => { if(e.key==='Enter') guardarNombre(); if(e.key==='Escape') setEditNombreId(null); }}
                            style={{ background:'#27272a', border:'1px solid #0067FD', borderRadius:4, color:'white', fontSize:13, padding:'2px 6px', width:'100%', outline:'none' }} />
                        ) : (
                          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <span onClick={() => onVerDetalle(m.id)} style={{ color:'#d4d4d8', fontSize:13, cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}
                              onMouseEnter={e=>e.target.style.color='#0067FD'} onMouseLeave={e=>e.target.style.color='#d4d4d8'}>
                              {m.nombre}
                            </span>
                            <button className="fin-nombre-btn" onClick={e => { e.stopPropagation(); setEditNombreId(m.id); setEditNombreVal(m.nombre); }}
                              style={{ background:'none', border:'none', cursor:'pointer', color:'#71717a', padding:'0 2px', lineHeight:1, flexShrink:0, display:'flex', alignItems:'center' }}
                              title="Editar nombre">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          </div>
                        )
                      ) : col.readonly === 'date' ? (
                        <span style={{ color:'#71717a', fontSize:12, fontFamily:'monospace' }}>
                          {m[col.key] ? m[col.key].slice(0,10) : '—'}
                        </span>
                      ) : col.readonly === 'text' ? (
                        <span style={{ color:'#52525b', fontSize:11, fontFamily:'monospace' }}>
                          {m[col.key] || '—'}
                        </span>
                      ) : col.readonly ? (
                        <span style={{ color: m[col.key] < 0 ? '#f87171' : m[col.key] > 0 ? '#4ade80' : '#52525b', fontSize:13 }}>
                          {m[col.key] != null ? (m[col.key] > 0 ? '+' : '') + fmt(m[col.key]) : '—'}
                        </span>
                      ) : (
                        <CeldaEditable m={m} campo={col.key} onGuardar={onGuardarCelda} clientesLista={clientesLista} equipoLista={equipoLista} proveedoresLista={proveedoresLista} />
                      )}
                    </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Barra de cálculo — fuera del overflow-x para que position:sticky funcione respecto al viewport */}
      <div ref={calcBarRef} className="fin-calc-bar"
        style={{ position:'sticky', bottom:0, zIndex:20, overflowX:'auto', background:'#0d0d0d', borderTop:'2px solid #27272a' }}
        onScroll={e => { if(tableWrapRef.current) tableWrapRef.current.scrollLeft = e.currentTarget.scrollLeft; }}>
        <div style={{ display:'flex' }}>
          {/* celda checkbox — mismo ancho que th[0] medido */}
          <div style={{ width: colWidths[0] || 36, flexShrink:0 }} />
          {COLS.map((col, i) => {
            const w = colWidths[i + 1];
            const calcType = colCalcs[col.key];
            const result = calcType && calcType !== 'none' ? calcVal(col.key, calcType) : null;
            const formatted = result != null ? fmtCalc(col.key, calcType, result) : null;
            const isOpen = openCalcKey === col.key;
            const opts = getCalcOpts(col.key);
            return (
              <div key={col.key} style={{ width: w || col.w || 80, flexShrink:0, padding:'5px 10px', boxSizing:'border-box' }}>
                <button className="fin-calc-btn"
                  onClick={e => {
                    if (isOpen) { setOpenCalcKey(null); setCalcDropPos(null); return; }
                    const rect = e.currentTarget.getBoundingClientRect();
                    setCalcDropPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left });
                    setOpenCalcKey(col.key);
                  }}
                  style={{ background:'none', border:'none', cursor:'pointer', padding:0, fontWeight:600, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
                  {formatted ? (
                    <>
                      <span style={{ color:'#52525b', fontSize:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>{CALC_SHORT[calcType]}</span>
                      <span style={{ color:'#d4d4d8', fontSize:12 }}>{formatted}</span>
                    </>
                  ) : (
                    <span style={{ color:'#3f3f46', fontSize:11 }}>Calcular</span>
                  )}
                </button>
                {isOpen && calcDropPos && createPortal(
                  <div className="fin-calc-dropdown" style={{ position:'fixed', bottom:calcDropPos.bottom, left:calcDropPos.left, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, padding:'4px', zIndex:9999, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.7)' }}>
                    {opts.map(opt => (
                      <button key={opt.val} onClick={() => { setColCalc(col.key, opt.val); setOpenCalcKey(null); setCalcDropPos(null); }}
                        style={{ display:'block', width:'100%', textAlign:'left', background:calcType===opt.val?'#27272a':'transparent', border:'none', color:calcType===opt.val?'#fff':'#a1a1aa', fontSize:12, padding:'6px 10px', borderRadius:4, cursor:'pointer' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
