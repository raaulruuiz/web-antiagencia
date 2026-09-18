import { createPortal } from 'react-dom';
import { DateRangePicker } from './DateRangePicker';
import { SearchableSelect } from './SearchableSelect';
import { PanelFiltros } from './PanelFiltros';
import { PanelOrdenar } from './PanelOrdenar';
import { VinculosDropdown } from './VinculosDropdown';
import { CAMPOS_FILTRO_DOCS, CAMPOS_SORT_DOCS, S } from '../constants';
import { lsSet } from '../utils';

export function DocumentosTab({
  qc, contactosTodos, findBestMatch, abrirDetalle, guardarCeldaDoc,
  toggleMovimientoEnFactura, movimientosParaVincular, loadingMovsVincular,
  editarDocsBulkContacto, contactFiscalUpdates, eliminarDocsBulk, toggleDocSel, toggleDocAll,
  setFacturaViewerId, setDocSplitView,
  documentosList, loadingDocumentos,
  vistaDocumentos, setVistaDocumentos,
  docConflictosFiltro, setDocConflictosFiltro, docConflictosResueltos, setDocConflictosResueltos,
  docTabDesde, setDocTabDesde, docTabHasta, setDocTabHasta,
  docTabBusqueda, setDocTabBusqueda, docTabTipo,
  docTabEditando, setDocTabEditando,
  docFiltros, setDocFiltros, docFiltroOp, setDocFiltroOp, docSorts, setDocSorts,
  docPanelFiltro, setDocPanelFiltro, docPanelOrdenar, setDocPanelOrdenar,
  docSeleccionados, setDocSeleccionados, docPagina, setDocPagina, docLimit, setDocLimit,
  docMostrarTodos, setDocMostrarTodos,
  docColCalcs, docOpenCalcKey, setDocOpenCalcKey, docCalcDropPos, setDocCalcDropPos,
  docEliminandoBulk, docBulkProveedor, setDocBulkProveedor, docBulkCliente, setDocBulkCliente,
  docHoveredRow, setDocHoveredRow, docVinculosEditando, setDocVinculosEditando,
}) {
        const ctodos = contactosTodos;
        const findC = id => ctodos.find(c => c.id === id)?.nombre || '—';

        const COLS_DOCS = [
          { key: 'pdf',                  label: '',           w: 32  },
          { key: 'fecha_factura',        label: 'Fecha',      w: 110 },
          { key: 'numero_factura',       label: 'Nº Factura', w: 145 },
          { key: 'nombre_entidad',       label: 'Entidad',    w: 200 },
          { key: 'tipo',                 label: 'Tipo',       w: 80  },
          { key: 'importe_total',          label: 'Importe',    w: 105, num: true, computed: true },
          { key: 'importe',              label: 'Base Impon.',w: 100, num: true },
          { key: 'impuesto',             label: 'IVA',        w: 90,  num: true },
          { key: 'irpf',                 label: 'IRPF',       w: 95,  num: true },
          { key: 'nif_cif',              label: 'NIF/CIF',    w: 120 },
          { key: 'factura_proveedor_id', label: 'Proveedor',  w: 150 },
          { key: 'factura_cliente_id',   label: 'Cliente',    w: 150 },
          { key: 'movimiento_ids',       label: 'Movimientos',w: 105 },
          { key: 'trimestre',            label: 'Q',          w: 72  },
          { key: 'archivo_nombre',       label: 'Archivo',    w: 220, editable: true },
          { key: 'id',                   label: 'ID',         w: 280 },
        ];

        // Filtering
        let docs = [...documentosList];
        if (docTabTipo !== 'todos') docs = docs.filter(d => d.tipo === docTabTipo);
        if (docTabBusqueda.trim()) {
          const q = docTabBusqueda.toLowerCase();
          docs = docs.filter(d =>
            (d.nombre_entidad||'').toLowerCase().includes(q) ||
            (d.numero_factura||'').toLowerCase().includes(q) ||
            (d.archivo_nombre||'').toLowerCase().includes(q) ||
            (d.nif_cif||'').toLowerCase().includes(q)
          );
        }
        if (docFiltros.length) {
          docs = docs.filter(doc => {
            const check = f => {
              const v = String(doc[f.campo] ?? '');
              // Map display labels to DB values for tipo field (select with array value)
              const mapTipo = lbl => lbl === 'Venta' ? 'ingreso' : lbl === 'Compra' ? 'gasto' : lbl;
              const mappedVals = f.campo === 'tipo' && Array.isArray(f.valor)
                ? f.valor.map(mapTipo)
                : null;
              const rawFv = String(f.valor ?? '');
              const fv = f.campo === 'tipo' ? mapTipo(rawFv) : rawFv;
              // For select with multiple values, check membership
              if (mappedVals && mappedVals.length > 0) {
                if (f.operador === 'eq') return mappedVals.includes(v);
                if (f.operador === 'neq') return !mappedVals.includes(v);
              }
              // Use numeric comparison when both values are valid numbers; otherwise string (handles ISO dates)
              const cmp = (a, b) => { const na = Number(a), nb = Number(b); return (!isNaN(na) && !isNaN(nb)) ? na - nb : a < b ? -1 : a > b ? 1 : 0; };
              switch(f.operador) {
                case 'ilike': return v.toLowerCase().includes(fv.toLowerCase());
                case 'not_ilike': return !v.toLowerCase().includes(fv.toLowerCase());
                case 'eq': return v === fv;
                case 'neq': return v !== fv;
                case 'gt': return cmp(v, fv) > 0;
                case 'gte': return cmp(v, fv) >= 0;
                case 'lt': return cmp(v, fv) < 0;
                case 'lte': return cmp(v, fv) <= 0;
                case 'is_null': return doc[f.campo]==null || doc[f.campo]==='';
                case 'is_not_null': return doc[f.campo]!=null && doc[f.campo]!=='';
                default: return true;
              }
            };
            return docFiltroOp === 'and' ? docFiltros.every(check) : docFiltros.some(check);
          });
        }
        if (docSorts.length) {
          docs = [...docs].sort((a,b) => {
            for (const s of docSorts) {
              const va = a[s.campo]??'', vb = b[s.campo]??'';
              if (va===vb) continue;
              return (va>vb?1:-1)*(s.dir==='asc'?1:-1);
            }
            return 0;
          });
        } else {
          docs = [...docs].sort((a,b) => ((b.fecha_factura||'')>(a.fecha_factura||'')?1:-1));
        }

        const totalDocs = docs.length;
        const totalPages = Math.max(1, Math.ceil(totalDocs / (docMostrarTodos ? totalDocs||1 : docLimit)));
        const safePag = Math.min(docPagina, totalPages);
        const docsPage = docMostrarTodos ? docs : docs.slice((safePag-1)*docLimit, safePag*docLimit);
        const docAllSel = docsPage.length>0 && docsPage.every(d => docSeleccionados.has(d.id));
        const docSomeSel = docsPage.some(d => docSeleccionados.has(d.id)) && !docAllSel;

        // Calc helpers
        const getDocVal = (d, key) => key === 'importe_total'
          ? parseFloat(d.importe_total ?? 0) || 0
          : parseFloat(d[key]);
        const calcDocVal = (key, type) => {
          switch(type) {
            case 'sum': { const vs=docs.map(d=>getDocVal(d,key)).filter(v=>!isNaN(v)); return vs.reduce((a,b)=>a+b,0); }
            case 'average': { const vs=docs.map(d=>getDocVal(d,key)).filter(v=>!isNaN(v)); return vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:null; }
            case 'min': { const vs=docs.map(d=>getDocVal(d,key)).filter(v=>!isNaN(v)); return vs.length?Math.min(...vs):null; }
            case 'max': { const vs=docs.map(d=>getDocVal(d,key)).filter(v=>!isNaN(v)); return vs.length?Math.max(...vs):null; }
            case 'count_all': return docs.length;
            case 'count_values': return docs.filter(d=>d[key]!=null&&d[key]!=='').length;
            case 'count_unique': return new Set(docs.map(d=>d[key]).filter(v=>v!=null&&v!=='')).size;
            case 'count_empty': return docs.filter(d=>d[key]==null||d[key]==='').length;
            default: return null;
          }
        };
        const fmtDocCalc = (key, type, val) => {
          if (val==null) return '—';
          if (['count_all','count_values','count_unique','count_empty'].includes(type)) return String(Math.round(val));
          return ['importe','impuesto','irpf','importe_total'].includes(key) ? `${val.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €` : String(val);
        };
        const CALC_SHORT_D = { sum:'∑', average:'Ø', min:'↓', max:'↑', count_all:'#', count_values:'#v', count_unique:'#u', count_empty:'∅' };
        const getCalcOpts = key => {
          const base = [{val:'none',label:'Ninguno'},{val:'count_all',label:'Contar todo'},{val:'count_values',label:'Contar valores'},{val:'count_unique',label:'Contar únicos'},{val:'count_empty',label:'Contar vacíos'}];
          return ['importe','impuesto','irpf','importe_total'].includes(key) ? [...base,{val:'sum',label:'Suma'},{val:'average',label:'Media'},{val:'min',label:'Mínimo'},{val:'max',label:'Máximo'}] : base;
        };

        const thStyle = { color:'#52525b', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', padding:'8px 10px', borderBottom:'1px solid #27272a', textAlign:'left', whiteSpace:'nowrap' };
        const tdBase = { padding:'6px 10px', fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'#d4d4d8' };

        return (
          <>
            {/* Toolbar */}
            <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
              <DateRangePicker desde={docTabDesde} hasta={docTabHasta} onApply={(d,h) => { setDocTabDesde(d); setDocTabHasta(h); lsSet('fin_doc_desde',d); lsSet('fin_doc_hasta',h); }} />
              <button style={S.ghost} onClick={() => qc.invalidateQueries({ queryKey: facturaKeys.lists() })}>↺</button>
              {vistaDocumentos === 'tabla' && <>
                <button onMouseDown={e=>e.preventDefault()} onClick={() => { setDocPanelFiltro(p=>!p); setDocPanelOrdenar(false); }}
                  style={{ ...S.ghost, outline:'none', display:'flex', alignItems:'center', gap:6, ...(docFiltros.length>0?{borderColor:'#0067FD',color:'#0067FD'}:{}) }}>
                  ⚡ Filtros
                  {docFiltros.length>0 && <span style={{ background:'#0067FD', color:'white', borderRadius:10, fontSize:11, padding:'1px 7px', fontWeight:700 }}>{docFiltros.length}</span>}
                </button>
                <button onMouseDown={e=>e.preventDefault()} onClick={() => { setDocPanelOrdenar(p=>!p); setDocPanelFiltro(false); }}
                  style={{ ...S.ghost, outline:'none', display:'flex', alignItems:'center', gap:6, ...(docSorts.length>0?{borderColor:'#8b5cf6',color:'#8b5cf6'}:{}) }}>
                  ↕ Ordenar
                  {docSorts.length>0 && <span style={{ color:'#8b5cf6', fontSize:11, fontWeight:600 }}>{docSorts.map(s=>(CAMPOS_SORT_DOCS.find(c=>c.key===s.campo)?.label||s.campo)+(s.dir==='asc'?' ↑':' ↓')).join(', ')}</span>}
                </button>
                <input type="text" placeholder="Buscar..." value={docTabBusqueda} onChange={e => { setDocTabBusqueda(e.target.value); setDocPagina(1); }}
                  style={{ ...S.input, width:180, marginLeft:'auto' }} />
              </>}
              <div style={{ display:'flex', gap:4, background:'#1c1c1e', padding:3, borderRadius:8, flexShrink:0, marginLeft: vistaDocumentos === 'conflictos' ? 'auto' : undefined }}>
                {[['tabla','☰'],['conflictos','⚠']].map(([v,ic]) => (
                  <button key={v} type="button" onClick={() => { setVistaDocumentos(v); if (v === 'conflictos') qc.invalidateQueries({ queryKey: facturaKeys.lists() }); }}
                    style={{ background:vistaDocumentos===v?'#27272a':'transparent', border:'none', color:vistaDocumentos===v?'white':'#52525b', borderRadius:6, padding:'5px 10px', fontSize:14, cursor:'pointer', title: v==='conflictos'?'Vista conflictos':'' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {vistaDocumentos === 'tabla' && docPanelFiltro && <PanelFiltros filtros={docFiltros} op={docFiltroOp} onChangeFiltros={f=>{setDocFiltros(f);setDocPagina(1);}} onChangeOp={op=>{setDocFiltroOp(op);setDocPagina(1);}} campos={CAMPOS_FILTRO_DOCS} listasAsignacion={{ factura_proveedor_id: contactosTodos, factura_cliente_id: contactosTodos }} />}
            {vistaDocumentos === 'tabla' && docPanelOrdenar && <PanelOrdenar sorts={docSorts} onChange={s=>{setDocSorts(s);setDocPagina(1);}} campos={CAMPOS_SORT_DOCS} />}

            {/* Vista Conflictos */}
            {vistaDocumentos === 'conflictos' && (() => {
              const tipoLabel = {
                sin_contacto: 'Factura sin proveedor/cliente vinculado',
                sin_movimiento_vinculado: 'Sin movimiento vinculado',
              };
              const fmtC = n => Math.abs(n||0).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2});

              // findBestMatch viene del componente (compartido con tab Fiscal)
              const todosConflictos = [];
              for (const doc of documentosList) {
                const esGasto = doc.tipo === 'gasto';
                const tieneContacto = esGasto ? !!doc.factura_proveedor_id : !!doc.factura_cliente_id;
                const key = `${doc.id}`;
                if (!tieneContacto) {
                  todosConflictos.push({ tipo: 'sin_contacto', doc, severidad: 'error',
                    desc: `Factura de ${fmtC(Math.abs(doc.importe||0))} € sin ${esGasto ? 'proveedor' : 'cliente'} vinculado. Asigna el contacto en la pestaña Documentos.`,
                    key: `${key}-sin_contacto` });
                } else if (!doc.movimiento_ids || doc.movimiento_ids.length === 0) {
                  todosConflictos.push({ tipo: 'sin_movimiento_vinculado', doc, severidad: 'error',
                    desc: `La factura de ${fmtC(Math.abs(doc.importe||0))} € no tiene ningún movimiento vinculado. Vincúlala desde la pestaña Documentos.`,
                    key: `${key}-sin_movimiento_vinculado` });
                }
              }
              const conflictos = todosConflictos.filter(c => !docConflictosResueltos.has(c.key));
              const filtrados = docConflictosFiltro === 'todos' ? conflictos : conflictos.filter(c => c.severidad === docConflictosFiltro);
              return (
                <div style={{ ...S.card, overflow:'hidden' }}>
                  {/* Header con filtros */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderBottom:'1px solid #27272a', background:'#111', flexWrap:'wrap' }}>
                    <span style={{ color:'#f87171', fontSize:13 }}>⚠</span>
                    <span style={{ color:'white', fontWeight:700, fontSize:13 }}>Análisis de conflictos</span>
                    <div style={{ display:'flex', gap:4, marginLeft:8 }}>
                      {[
                        ['todos', 'Todos', '#71717a', '#27272a'],
                        ['error', `${conflictos.filter(c=>c.severidad==='error').length} errores`, '#f87171', '#1a0505'],
                        ['warning', `${conflictos.filter(c=>c.severidad==='warning').length} avisos`, '#fbbf24', '#1a1200'],
                        ['info', `${conflictos.filter(c=>c.severidad==='info').length} info`, '#60a5fa', '#050d1a'],
                      ].map(([v, l, col, bg]) => (
                        <button key={v} onClick={() => setDocConflictosFiltro(v)}
                          style={{ background: docConflictosFiltro===v ? bg : 'transparent', border:`1px solid ${docConflictosFiltro===v ? col : '#3f3f46'}`, color: docConflictosFiltro===v ? col : '#52525b', borderRadius:6, padding:'2px 9px', fontSize:10, cursor:'pointer', fontWeight:600 }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Contenido */}
                  {loadingDocumentos ? (
                    <p style={{ color:'#52525b', padding:24 }}>Cargando…</p>
                  ) : filtrados.length === 0 ? (
                    <div style={{ padding:'32px 16px', textAlign:'center', color:'#22c55e', fontWeight:600 }}>✓ Sin conflictos en este filtro</div>
                  ) : filtrados.map((c, ci) => {
                    const sevColor = c.severidad === 'error' ? '#f87171' : c.severidad === 'warning' ? '#fbbf24' : '#60a5fa';
                    const sevBg    = c.severidad === 'error' ? '#1a0505' : c.severidad === 'warning' ? '#1a1200' : '#050d1a';
                    const sevLabel = c.severidad === 'error' ? 'Error' : c.severidad === 'warning' ? 'Aviso' : 'Info';
                    const recom = c.tipo === 'sin_movimiento_vinculado' ? findBestMatch(c.doc) : null;
                    return (
                      <div key={c.key} style={{ borderBottom:'1px solid #1f1f1f', padding:'12px 18px', background: ci % 2 === 0 ? 'transparent' : '#0a0a0a' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                          <span style={{ background: sevBg, border:`1px solid ${sevColor}`, color: sevColor, fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px', whiteSpace:'nowrap', flexShrink:0, marginTop:1 }}>{sevLabel}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ color:'white', fontWeight:600, fontSize:12, margin:'0 0 2px' }}>{tipoLabel[c.tipo] || c.tipo}</p>
                            <p style={{ color:'#71717a', fontSize:11, margin:'0 0 8px', lineHeight:1.5 }}>{c.desc}</p>
                            {/* Recomendación de matching */}
                            {recom && (
                              <div style={{ marginBottom:8 }}>
                                <span style={{ color:'#a78bfa', fontSize:11, fontWeight:600, display:'block', marginBottom:6 }}>✦ Recomendación</span>
                                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                                  {c.doc?.archivo_url && (
                                    <button onClick={() => setFacturaViewerId(c.doc.id)}
                                      style={{ background:'#050d1a', border:'1px solid #1d4ed8', color:'#60a5fa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:220, overflow:'hidden' }}>
                                      <span style={{ flexShrink:0 }}>📄</span>
                                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.doc.archivo_nombre}</span>
                                    </button>
                                  )}
                                  <button onClick={() => abrirDetalle(recom.id)}
                                    style={{ background:'#18181b', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:220, overflow:'hidden' }}>
                                    <span style={{ flexShrink:0 }}>📋</span>
                                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{recom.nombre}</span>
                                    <span style={{ color: recom.tipo?.toLowerCase().includes('ingreso') ? '#22c55e' : '#f87171', fontWeight:700, flexShrink:0 }}>{fmtC(Math.abs(recom.cantidad||0))}€</span>
                                  </button>
                                  <button onClick={() => setDocSplitView({ movimiento: recom, factura: { ...c.doc, archivo_url: c.doc.url || c.doc.archivo_url } })}
                                    style={{ background:'#0d0d0d', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                                    ⬡ Ver ambos
                                  </button>
                                  <button onClick={async () => { await toggleMovimientoEnFactura(c.doc.id, recom.id); setDocConflictosResueltos(prev => new Set([...prev, c.key])); }}
                                    style={{ background:'rgba(139,92,246,0.15)', border:'1px solid #7c3aed', color:'#a78bfa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, fontWeight:600 }}>
                                    ⚡ Vincular
                                  </button>
                                </div>
                              </div>
                            )}
                            {/* Botones sin recomendación */}
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                              {!recom && c.doc?.archivo_url && (
                                <button onClick={() => setFacturaViewerId(c.doc.id)}
                                  style={{ background:'#050d1a', border:'1px solid #1d4ed8', color:'#60a5fa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:260, overflow:'hidden' }}>
                                  <span style={{ flexShrink:0 }}>📄</span>
                                  <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.doc.archivo_nombre}</span>
                                </button>
                              )}
                              <button onClick={() => setDocConflictosResueltos(prev => new Set([...prev, c.key]))}
                                title="Marcar como resuelto"
                                style={{ marginLeft:'auto', background:'transparent', border:'1px solid #27272a', color:'#52525b', borderRadius:6, padding:'3px 8px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor='#22c55e'; e.currentTarget.style.color='#22c55e'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor='#27272a'; e.currentTarget.style.color='#52525b'; }}>
                                ✓ Resuelto
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Bulk bar */}
            {vistaDocumentos === 'tabla' && docSeleccionados.size>0 && (
              <div style={{ position:'sticky', top:0, zIndex:10, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, padding:'8px 14px', marginBottom:10, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <span style={{ color:'#d4d4d8', fontSize:13 }}>{docSeleccionados.size} seleccionado{docSeleccionados.size!==1?'s':''}</span>
                {docSeleccionados.size < docs.length && (
                  <button onClick={() => setDocSeleccionados(new Set(docs.map(d=>d.id)))}
                    style={{ background:'none', border:'none', color:'#60a5fa', fontSize:12, cursor:'pointer', textDecoration:'underline', padding:0 }}>
                    Seleccionar todos ({docs.length})
                  </button>
                )}
                {/* Bulk proveedor */}
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ color:'#71717a', fontSize:12 }}>Proveedor:</span>
                  <SearchableSelect value={docBulkProveedor} onChange={v => setDocBulkProveedor(v)}
                    options={contactosTodos}
                    placeholder="— elegir —" />
                  {docBulkProveedor && (
                    <button onClick={() => editarDocsBulkContacto('factura_proveedor_id', docBulkProveedor)}
                      style={{ background:'#0067FD', border:'none', borderRadius:6, color:'white', padding:'3px 10px', fontSize:12, cursor:'pointer', fontWeight:600 }}>Aplicar</button>
                  )}
                </div>
                {/* Bulk cliente */}
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ color:'#71717a', fontSize:12 }}>Cliente:</span>
                  <SearchableSelect value={docBulkCliente} onChange={v => setDocBulkCliente(v)}
                    options={contactosTodos}
                    placeholder="— elegir —" />
                  {docBulkCliente && (
                    <button onClick={() => editarDocsBulkContacto('factura_cliente_id', docBulkCliente)}
                      style={{ background:'#0067FD', border:'none', borderRadius:6, color:'white', padding:'3px 10px', fontSize:12, cursor:'pointer', fontWeight:600 }}>Aplicar</button>
                  )}
                </div>
                <button onClick={eliminarDocsBulk} disabled={docEliminandoBulk}
                  style={{ background:'#450a0a', border:'1px solid #7f1d1d', color:'#f87171', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                  {docEliminandoBulk?'Eliminando…':`🗑 Eliminar ${docSeleccionados.size}`}
                </button>
                <button onClick={() => setDocSeleccionados(new Set())}
                  style={{ background:'none', border:'none', color:'#52525b', fontSize:12, cursor:'pointer', marginLeft:'auto' }}>
                  Cancelar selección
                </button>
              </div>
            )}

            {vistaDocumentos === 'tabla' && (loadingDocumentos ? (
              <p style={{ color:'#52525b' }}>Cargando…</p>
            ) : (
              <div style={S.card}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ borderCollapse:'collapse', tableLayout:'fixed', width:'100%', fontSize:13, minWidth:COLS_DOCS.reduce((a,c)=>a+c.w,0)+40 }}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, width:36, minWidth:36, padding:'8px 0 8px 10px' }}>
                          {docSeleccionados.size > 0 && (
                            <input type="checkbox" checked={docAllSel}
                              ref={el=>{ if(el) el.indeterminate=docSomeSel; }}
                              onChange={() => toggleDocAll(docsPage, docAllSel)}
                              style={{ accentColor:'#0067FD', cursor:'pointer' }} />
                          )}
                        </th>
                        {COLS_DOCS.map(col => (
                          <th key={col.key} style={{ ...thStyle, width:col.w, minWidth:col.w, ...(col.key==='pdf' ? {padding:'8px 4px 8px 0'} : {}) }}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {docsPage.map(doc => {
                        const sel = docSeleccionados.has(doc.id);
                        const hov = docHoveredRow === doc.id;
                        const showCb = sel || docSeleccionados.size>0 || hov;
                        return (
                          <tr key={doc.id}
                            onMouseEnter={() => setDocHoveredRow(doc.id)}
                            onMouseLeave={() => setDocHoveredRow(null)}
                            style={{ borderBottom:'1px solid #1c1c1e', background:sel?'#1e293b':hov?'#18181b':'transparent' }}>
                            <td style={{ width:36, padding:'6px 0 6px 10px', verticalAlign:'middle' }}>
                              {showCb
                                ? <input type="checkbox" checked={sel} onChange={() => toggleDocSel(doc.id)} style={{ accentColor:'#0067FD', cursor:'pointer' }} />
                                : <span style={{ display:'inline-block', width:16 }} />}
                            </td>
                            {COLS_DOCS.map(col => {
                              const val = doc[col.key];
                              const isEditing = docTabEditando?.id===doc.id && docTabEditando?.campo===col.key;

                              if (col.key === 'pdf') return (
                                <td key="pdf" style={{ width:32, padding:'6px 4px 6px 0', textAlign:'center', verticalAlign:'middle' }}>
                                  {doc.archivo_url
                                    ? <button onClick={() => setFacturaViewerId(doc.id)}
                                        style={{ background:'none', border:'none', color:'#60a5fa', cursor:'pointer', fontSize:14, padding:0 }} title="Ver PDF">📄</button>
                                    : <span style={{ color:'#3f3f46' }}>—</span>}
                                </td>
                              );

                              if (col.key === 'tipo') return (
                                <td key="tipo" style={{ ...tdBase, width:col.w }}>
                                  {val ? <span style={{ background:val==='ingreso'?'#14532d':'#450a0a', color:val==='ingreso'?'#4ade80':'#f87171', fontSize:10, padding:'2px 6px', borderRadius:4, fontWeight:600 }}>{val==='ingreso'?'Venta':'Compra'}</span> : '—'}
                                </td>
                              );

                              if (col.key==='factura_proveedor_id'||col.key==='factura_cliente_id') return (
                                <td key={col.key} style={{ width:col.w, maxWidth:col.w, padding:'2px 6px', verticalAlign:'middle', overflow:'hidden' }}>
                                  {isEditing ? (
                                    <SearchableSelect value={docTabEditando.valor||''}
                                      options={ctodos}
                                      placeholder="— ninguno —"
                                      style={{ width: '100%' }}
                                      onClose={() => setDocTabEditando(null)}
                                      onChange={async newId => {
                                        const extra = contactFiscalUpdates(newId, ctodos, doc.tipo, col.key);
                                        await guardarCeldaDoc(doc.id, { [col.key]: newId||null, ...extra });
                                        setDocTabEditando(null);
                                      }} />
                                  ) : (
                                    <div onClick={() => setDocTabEditando({ id:doc.id, campo:col.key, valor:val||'' })}
                                      style={{ padding:'3px 4px', color:val?'#d4d4d8':'#3f3f46', cursor:'pointer', borderRadius:4, minHeight:22, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', background:hov?'#27272a':'transparent' }}
                                      onMouseEnter={e=>e.currentTarget.style.background='#27272a'}
                                      onMouseLeave={e=>e.currentTarget.style.background=hov?'#27272a':'transparent'}>
                                      {findC(val)}
                                    </div>
                                  )}
                                </td>
                              );

                              if (col.key === 'movimiento_ids') {
                                const ids = doc.movimiento_ids || [];
                                const abierto = docVinculosEditando === doc.id;
                                return (
                                  <td key="movimiento_ids" style={{ ...tdBase, width:col.w, position:'relative', overflow:'visible' }}>
                                    <div onClick={() => setDocVinculosEditando(abierto ? null : doc.id)} style={{ cursor:'pointer', display:'inline-flex' }}>
                                      {ids.length > 0
                                        ? <span style={{ background:'rgba(34,197,94,0.1)', color:'#4ade80', fontSize:11, padding:'2px 7px', borderRadius:4, fontWeight:600 }}>
                                            {ids.length} mov{ids.length !== 1 ? 's' : ''}
                                          </span>
                                        : <span style={{ color:'#3f3f46', fontSize:12 }}>—</span>}
                                    </div>
                                    {abierto && (
                                      <VinculosDropdown
                                        seleccionados={ids}
                                        opciones={movimientosParaVincular}
                                        cargando={loadingMovsVincular}
                                        onToggle={movId => toggleMovimientoEnFactura(doc.id, movId)}
                                        onClose={() => setDocVinculosEditando(null)}
                                      />
                                    )}
                                  </td>
                                );
                              }

                              if (col.key==='id') return (
                                <td key="id" style={{ ...tdBase, width:col.w, fontFamily:'monospace', fontSize:10, color:'#52525b' }}>{val||'—'}</td>
                              );

                              if (col.key === 'importe_total') {
                                const total = parseFloat(doc.importe_total ?? 0) || 0;
                                const isZero = Math.abs(total) < 0.005;
                                const isVenta = doc.tipo === 'ingreso';
                                const isCompra = doc.tipo === 'gasto';
                                const numColor = isZero ? '#71717a' : isVenta ? '#4ade80' : isCompra ? '#f87171' : '#d4d4d8';
                                const sign = isZero ? '' : isVenta ? '+' : isCompra ? '-' : '';
                                const display = `${sign}${Math.abs(total).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €`;
                                return (
                                  <td key="importe_total" style={{ ...tdBase, width:col.w, color:numColor, textAlign:'right', fontWeight:600 }}>{display}</td>
                                );
                              }

                              if (['importe','impuesto','irpf'].includes(col.key)) {
                                const num = parseFloat(val ?? 0);
                                const isZero = Math.abs(num) < 0.005;
                                const isVenta = doc.tipo === 'ingreso';
                                const isCompra = doc.tipo === 'gasto';
                                const numColor = isZero ? '#71717a' : isVenta ? '#4ade80' : isCompra ? '#f87171' : '#d4d4d8';
                                const sign = isZero ? '' : isVenta ? '+' : isCompra ? '-' : '';
                                const display = `${sign}${Math.abs(num).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €`;
                                return (
                                  <td key={col.key} style={{ ...tdBase, width:col.w, color:numColor, textAlign:'right', cursor:'pointer' }}
                                    onClick={() => setDocTabEditando({ id:doc.id, campo:col.key, valor:String(val??'') })}>
                                    {isEditing
                                      ? <input autoFocus type="number" step="0.01"
                                          defaultValue={val??''}
                                          onBlur={async e => { await guardarCeldaDoc(doc.id, { [col.key]: e.target.value==='' ? null : parseFloat(e.target.value) }); setDocTabEditando(null); }}
                                          onKeyDown={e => { if (e.key==='Enter') e.target.blur(); if (e.key==='Escape') setDocTabEditando(null); }}
                                          style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'white', borderRadius:4, padding:'2px 4px', fontSize:11, textAlign:'right', outline:'none' }} />
                                      : display}
                                  </td>
                                );
                              }

                              if (col.editable) return (
                                <td key={col.key} style={{ width:col.w, maxWidth:col.w, padding:'2px 6px', verticalAlign:'middle', overflow:'hidden' }}>
                                  {isEditing ? (
                                    <input autoFocus value={docTabEditando.valor}
                                      onChange={e => setDocTabEditando(prev=>({...prev, valor:e.target.value}))}
                                      onBlur={() => { guardarCeldaDoc(doc.id, { [col.key]: docTabEditando.valor }); setDocTabEditando(null); }}
                                      onKeyDown={e => { if(e.key==='Enter') e.target.blur(); if(e.key==='Escape') setDocTabEditando(null); }}
                                      style={{ width:'100%', background:'#1c1c1e', border:'1px solid #0067FD', color:'white', borderRadius:4, padding:'3px 6px', fontSize:12, outline:'none', boxSizing:'border-box' }} />
                                  ) : (
                                    <div onClick={() => setDocTabEditando({ id:doc.id, campo:col.key, valor:val??'' })}
                                      style={{ padding:'3px 4px', color:val?'#d4d4d8':'#3f3f46', cursor:'text', borderRadius:4, minHeight:22, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', background:hov?'#27272a':'transparent' }}
                                      onMouseEnter={e=>e.currentTarget.style.background='#27272a'}
                                      onMouseLeave={e=>e.currentTarget.style.background=hov?'#27272a':'transparent'}>
                                      {val||'—'}
                                    </div>
                                  )}
                                </td>
                              );

                              if (col.key === 'trimestre') return (
                                <td key="trimestre" style={{ ...tdBase, width:col.w }}>
                                  {doc.trimestre != null ? `${doc.trimestre}/${doc.anio}` : '—'}
                                </td>
                              );

                              return (
                                <td key={col.key} style={{ ...tdBase, width:col.w }}>{val??'—'}</td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Calc bar */}
                <div style={{ position:'sticky', bottom:0, background:'#0d0d0d', borderTop:'2px solid #27272a', overflowX:'auto' }}>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    <div style={{ width:36, flexShrink:0 }} />
                    {COLS_DOCS.map(col => {
                      const calcType = docColCalcs[col.key];
                      const result = calcType && calcType!=='none' ? calcDocVal(col.key, calcType) : null;
                      const formatted = result!=null ? fmtDocCalc(col.key, calcType, result) : null;
                      const isOpen = docOpenCalcKey===col.key;
                      const canCalc = col.key!=='pdf' && col.key!=='tipo';
                      return (
                        <div key={col.key} style={{ width:col.w, flexShrink:0, padding:'4px 10px', boxSizing:'border-box' }}>
                          {canCalc ? (
                            <button onClick={e => {
                                if (isOpen) { setDocOpenCalcKey(null); setDocCalcDropPos(null); return; }
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDocCalcDropPos({ bottom:window.innerHeight-rect.top+4, left:rect.left });
                                setDocOpenCalcKey(col.key);
                              }}
                              style={{ background:'none', border:'none', cursor:'pointer', padding:0, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
                              {formatted ? (
                                <>
                                  <span style={{ color:'#52525b', fontSize:10, textTransform:'uppercase' }}>{CALC_SHORT_D[calcType]}</span>
                                  <span style={{ color:'#d4d4d8', fontSize:12 }}>{formatted}</span>
                                </>
                              ) : <span style={{ color:'#3f3f46', fontSize:11 }}>Calcular</span>}
                            </button>
                          ) : <span />}
                          {isOpen && docCalcDropPos && createPortal(
                            <div style={{ position:'fixed', bottom:docCalcDropPos.bottom, left:docCalcDropPos.left, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, padding:4, zIndex:9999, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.7)' }}>
                              {getCalcOpts(col.key).map(opt => (
                                <button key={opt.val} onClick={() => { setDocColCalcs(prev=>({...prev,[col.key]:opt.val})); setDocOpenCalcKey(null); setDocCalcDropPos(null); }}
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

                {/* Paginación */}
                <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:16, flexWrap:'wrap', alignItems:'center' }}>
                  {!docMostrarTodos && totalPages>1 && (
                    <>
                      <button style={S.ghost} disabled={safePag<=1} onClick={() => setDocPagina(p=>p-1)}>← Anterior</button>
                      <span style={{ color:'#71717a', fontSize:13, padding:'8px 0' }}>{safePag} / {totalPages}</span>
                      <button style={S.ghost} disabled={safePag>=totalPages} onClick={() => setDocPagina(p=>p+1)}>Siguiente →</button>
                    </>
                  )}
                  <select value={docMostrarTodos?'todos':String(docLimit)}
                    onChange={e => { const v=e.target.value; if(v==='todos'){setDocMostrarTodos(true);setDocPagina(1);}else{setDocLimit(parseInt(v));setDocMostrarTodos(false);setDocPagina(1);} }}
                    style={{ ...S.select, width:'auto', fontSize:13, padding:'7px 10px' }}>
                    {[50,100,200].map(n=><option key={n} value={n}>{n} por página</option>)}
                    <option value="todos">Todos ({totalDocs})</option>
                  </select>
                </div>
              </div>
            ))}
          </>
        );
}
