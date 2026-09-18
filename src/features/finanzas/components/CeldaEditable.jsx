import { useState, useEffect, useRef } from 'react';
import { CATEGORIAS, IVA_OPTS, IRPF_OPTS, CUENTAS_OPTS } from '../constants';
import { fmt } from '../utils';

export function CeldaEditable({ m, campo, onGuardar, clientesLista = [], equipoLista = [], proveedoresLista = [] }) {
  const [editando, setEditando] = useState(false);
  const [val, setVal] = useState(m[campo]);
  const [nuevaCat, setNuevaCat] = useState(null); // null = oculto, '' = mostrando input
  const [filtroLista, setFiltroLista] = useState('');
  const ref = useRef(null);

  useEffect(() => { if (!editando) setVal(m[campo]); }, [m[campo], editando]);

  useEffect(() => {
    if (!editando) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) confirmar(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editando, val]);

  function confirmar() {
    if (val !== m[campo]) onGuardar(m.id, campo, val);
    setEditando(false);
  }

  const esSelect = ['tipo','cuenta','iva','irpf'].includes(campo);
  const esMulti = campo === 'categorias';
  const esMultiUuid = ['cliente_ids','equipo_ids','proveedor_ids'].includes(campo);

  if (esMulti) {
    const cats = m.categorias || [];
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <div onClick={() => setEditando(o => !o)} style={{ cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: 3, minHeight: 22 }}>
          {cats.length ? cats.slice(0,2).map(c => (
            <span key={c} style={{ background: '#27272a', color: '#71717a', fontSize: 10, padding: '1px 5px', borderRadius: 3 }}>{c}</span>
          )) : <span style={{ color: '#3f3f46', fontSize: 12 }}>—</span>}
          {cats.length > 2 && <span style={{ color: '#52525b', fontSize: 10 }}>+{cats.length-2}</span>}
        </div>
        {editando && (
          <div style={{ position: 'absolute', zIndex: 400, top: '100%', left: 0, background: '#1c1c1e', border: '1px solid #3f3f46', borderRadius: 8, padding: 8, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {CATEGORIAS.map(c => {
                const sel = (val || []).includes(c);
                return (
                  <button key={c} type="button" onClick={() => setVal(prev => sel ? (prev||[]).filter(x=>x!==c) : [...(prev||[]),c])}
                    style={{ background: sel?'#0067FD':'#27272a', color: sel?'white':'#a1a1aa', border:'none', borderRadius:4, padding:'2px 7px', fontSize:11, cursor:'pointer' }}>
                    {c}
                  </button>
                );
              })}
              {/* Categorías personalizadas */}
              {(val||[]).filter(c => !CATEGORIAS.includes(c)).map(c => (
                <button key={c} type="button" onClick={() => setVal(prev => (prev||[]).filter(x=>x!==c))}
                  style={{ background:'#0067FD22', color:'#60a5fa', border:'1px solid #0067FD', borderRadius:4, padding:'2px 7px', fontSize:11, cursor:'pointer' }}>
                  {c} ✕
                </button>
              ))}
              {/* + Nueva categoría */}
              {nuevaCat !== null
                ? <input autoFocus value={nuevaCat}
                    onChange={e => setNuevaCat(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { const c = nuevaCat.trim(); if (c) setVal(prev => [...(prev||[]), c]); setNuevaCat(null); }
                      if (e.key === 'Escape') setNuevaCat(null);
                    }}
                    onBlur={() => { const c = nuevaCat.trim(); if (c) setVal(prev => [...(prev||[]), c]); setNuevaCat(null); }}
                    placeholder="Escribe y Enter"
                    style={{ padding:'2px 7px', borderRadius:4, fontSize:11, background:'#27272a', border:'1px dashed #3f3f46', color:'white', outline:'none', width:110 }}
                  />
                : <button type="button" onClick={() => setNuevaCat('')}
                    style={{ background:'none', border:'1px dashed #3f3f46', color:'#52525b', borderRadius:4, padding:'2px 7px', fontSize:11, cursor:'pointer' }}>
                    + Nueva
                  </button>
              }
            </div>
            <button onClick={confirmar} style={{ marginTop:6, background:'#0067FD', color:'white', border:'none', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer', width:'100%' }}>
              Aplicar
            </button>
          </div>
        )}
      </div>
    );
  }

  if (esMultiUuid) {
    const lista = campo === 'cliente_ids' ? clientesLista : campo === 'proveedor_ids' ? proveedoresLista : equipoLista;
    const selIds = val || [];
    const nombres = selIds.map(id => lista.find(x => x.id === id)?.nombre || '?');
    const listaFiltrada = filtroLista.trim()
      ? lista.filter(o => o.nombre.toLowerCase().includes(filtroLista.toLowerCase()))
      : lista;
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <div onClick={() => { setEditando(o => !o); setFiltroLista(''); }} style={{ cursor:'pointer', minHeight:20 }}>
          {nombres.length ? <span style={{ color:'#d4d4d8', fontSize:12 }}>{nombres.join(', ')}</span> : <span style={{ color:'#3f3f46', fontSize:12 }}>—</span>}
        </div>
        {editando && (
          <div style={{ position:'absolute', zIndex:400, top:'100%', left:0, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, minWidth:200, boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
            <div style={{ padding:'6px 8px', borderBottom:'1px solid #27272a' }}>
              <input
                autoFocus
                value={filtroLista}
                onChange={e => setFiltroLista(e.target.value)}
                placeholder="Buscar..."
                onClick={e => e.stopPropagation()}
                style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', borderRadius:4, color:'white', fontSize:12, padding:'4px 8px', outline:'none', boxSizing:'border-box' }}
              />
            </div>
            <div style={{ maxHeight:180, overflowY:'auto' }}>
              {listaFiltrada.map(o => {
                const sel = (val||[]).includes(o.id);
                return (
                  <label key={o.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', cursor:'pointer', borderBottom:'1px solid #27272a' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#27272a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <input type="checkbox" checked={sel} onChange={() => setVal(prev => sel?(prev||[]).filter(id=>id!==o.id):[...(prev||[]),o.id])}
                      style={{ accentColor:'#0067FD', flexShrink:0 }} />
                    <span style={{ color:'#d4d4d8', fontSize:12 }}>{o.nombre}</span>
                  </label>
                );
              })}
              {listaFiltrada.length === 0 && (
                <p style={{ color:'#52525b', fontSize:12, padding:'8px 10px', margin:0 }}>Sin resultados</p>
              )}
            </div>
            <button onClick={confirmar} style={{ width:'100%', background:'#0067FD', color:'white', border:'none', borderRadius:'0 0 8px 8px', padding:'6px', fontSize:12, cursor:'pointer' }}>Aplicar</button>
          </div>
        )}
      </div>
    );
  }

  const OPTS = campo==='tipo'?['Ingreso','Gasto']:campo==='cuenta'?CUENTAS_OPTS:campo==='iva'?IVA_OPTS:IRPF_OPTS;

  if (esSelect) {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        {editando ? (
          <select autoFocus value={val} onChange={e => { setVal(e.target.value); setEditando(false); onGuardar(m.id, campo, e.target.value); }}
            onBlur={() => setEditando(false)}
            style={{ background:'#1c1c1e', border:'1px solid #0067FD', borderRadius:4, color:'white', fontSize:12, padding:'2px 4px', cursor:'pointer' }}>
            {OPTS.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <div onClick={() => { setEditando(true); setVal(m[campo]); }} style={{ cursor:'pointer' }}>
            {campo==='tipo' ? (
              <span style={{ background: val==='Ingreso'?'#14532d':'#450a0a', color: val==='Ingreso'?'#22c55e':'#f87171', borderRadius:4, padding:'2px 7px', fontSize:11, fontWeight:600 }}>{val}</span>
            ) : (
              <span style={{ color: val?'#d4d4d8':'#3f3f46', fontSize:12 }}>{val||'—'}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Campos bloqueados cuando el movimiento tiene facturas vinculadas
  const camposBloqueados = ['fecha_factura', 'importe_factura'];
  if (camposBloqueados.includes(campo) && (m.factura_ids?.length || 0) > 0) {
    const val_ = m[campo];
    return (
      <div title="Calculado automáticamente desde los documentos vinculados"
        style={{ display:'flex', alignItems:'center', gap:4, color:'#52525b', fontSize:12, cursor:'default' }}>
        <span>{campo === 'importe_factura' ? (val_ != null ? fmt(val_) : '—') : (val_ || '—')}</span>
        <span style={{ fontSize:10 }}>🔒</span>
      </div>
    );
  }

  // text / number / date
  return editando ? (
    <input autoFocus type={campo==='cantidad'||campo==='importe_factura'?'number':campo==='fecha'||campo==='fecha_factura'?'date':'text'} value={val||''}
      onChange={e => setVal(e.target.value)}
      onBlur={confirmar}
      onKeyDown={e => { if(e.key==='Enter') confirmar(); if(e.key==='Escape') setEditando(false); }}
      style={{ background:'#1c1c1e', border:'1px solid #0067FD', borderRadius:4, color:'white', fontSize:12, padding:'2px 6px', width:'100%', colorScheme:'dark' }}
    />
  ) : (
    <div onClick={() => { setEditando(true); setVal(m[campo]); }}
      style={{ cursor:'pointer', color: m[campo]!=null&&m[campo]!==''?'#d4d4d8':'#3f3f46', fontSize:12, minHeight:20 }}>
      {campo==='cantidad'
        ? <span style={{ color: m.tipo==='Ingreso'?'#22c55e':'#f87171', fontWeight:600 }}>{m[campo]!=null ? (m.tipo==='Ingreso'?'+':'-')+fmt(Math.abs(m[campo])):''}</span>
        : campo==='importe_factura'
        ? (m[campo]!=null ? fmt(m[campo]) : '—')
        : (m[campo]||'—')}
    </div>
  );
}
