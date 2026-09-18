import { DateRangePicker } from './DateRangePicker';
import { PanelFiltros } from './PanelFiltros';
import { PanelOrdenar } from './PanelOrdenar';
import { FilaMovimiento } from './FilaMovimiento';
import { TablaMovimientos } from './TablaMovimientos';
import { CUENTAS_OPTS, IVA_OPTS, IRPF_OPTS, CAMPOS_SORT, S } from '../constants';
import { lsSet } from '../utils';

export function MovimientosTab({
  desde, hasta, qc,
  handleApplyMovimientos, handleVincularFacturasMovimiento, seleccionarTodosLosMovimientos,
  guardarCeldaInline, eliminarBulk, editarBulk, toggleSel, toggleAll, abrirDetalle,
  filtroClientesLista, filtroEquipoLista, filtroProveedoresLista,
  facturasParaVincular, loadingFacsVincular,
  movimientos, loadingMovs, errMovs, pagMovs, setPagMovs,
  movBusqueda, setMovBusqueda, movFiltros, setMovFiltros, movFiltroOp, setMovFiltroOp,
  movSorts, setMovSorts, panelFiltro, setPanelFiltro, panelOrdenar, setPanelOrdenar,
  mostrarTodos, setMostrarTodos, vistaMovs, setVistaMovs, movLimit, setMovLimit,
  seleccionados, setSeleccionados, selTodos, setSelTodos, cargandoTodos,
  bulkCampo, setBulkCampo, bulkValor, setBulkValor, bulkValorMulti, setBulkValorMulti,
  bulkFiltroLista, setBulkFiltroLista, movsErroresResueltos, setMovsErroresResueltos,
}) {
  return (
    <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <DateRangePicker desde={desde} hasta={hasta} onApply={handleApplyMovimientos} />
              <button style={S.ghost} onClick={() => qc.invalidateQueries({ queryKey: movimientoKeys.all })}>↺</button>
            </div>
            {vistaMovs !== 'errores' && (<>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setPanelFiltro(p => !p); setPanelOrdenar(false); }}
              style={{ ...S.ghost, outline: 'none', display: 'flex', alignItems: 'center', gap: 6, ...(movFiltros.length > 0 ? { borderColor: '#0067FD', color: '#0067FD' } : {}) }}>
              ⚡ Filtros
              {movFiltros.length > 0 && (
                <span style={{ background: '#0067FD', color: 'white', borderRadius: 10, fontSize: 11, padding: '1px 7px', fontWeight: 700 }}>
                  {movFiltros.length}
                </span>
              )}
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setPanelOrdenar(p => !p); setPanelFiltro(false); }}
              style={{ ...S.ghost, outline: 'none', display: 'flex', alignItems: 'center', gap: 6, ...(movSorts.length > 0 ? { borderColor: '#8b5cf6', color: '#8b5cf6' } : {}) }}>
              ↕ Ordenar
              {movSorts.length > 0 && (
                <span style={{ color: '#8b5cf6', fontSize: 11, fontWeight: 600 }}>
                  {movSorts.map(s => (CAMPOS_SORT.find(c => c.key === s.campo)?.label || s.campo) + (s.dir === 'asc' ? ' ↑' : ' ↓')).join(', ')}
                </span>
              )}
            </button>
            <input
              type="text"
              placeholder="Buscar..."
              value={movBusqueda}
              onChange={e => { setMovBusqueda(e.target.value); setPagMovs(1); }}
              style={{ ...S.input, width: 180, marginLeft: 'auto' }}
            />
            </>)}
            <div style={{ display:'flex', gap:4, background:'#1c1c1e', padding:3, borderRadius:8, flexShrink:0, marginLeft: vistaMovs === 'errores' ? 'auto' : undefined }}>
              {[['lista','☰'],['tabla','⊞'],['errores','⚠']].map(([v,ic]) => (
                <button key={v} type="button" onClick={() => { setVistaMovs(v); lsSet('fin_vista',v); setSeleccionados(new Set()); }}
                  style={{ background:vistaMovs===v?'#27272a':'transparent', border:'none', color:vistaMovs===v?(v==='errores'?'#f87171':'white'):'#52525b', borderRadius:6, padding:'5px 10px', fontSize:14, cursor:'pointer' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          {/* Barra de acciones bulk */}
          {seleccionados.size > 0 && (() => {
            const BULK_CAMPOS = [
              { key:'tipo',        label:'Tipo',     opts:['Ingreso','Gasto'] },
              { key:'cuenta',      label:'Cuenta',   opts:CUENTAS_OPTS },
              { key:'iva',         label:'IVA',      opts:IVA_OPTS },
              { key:'irpf',        label:'IRPF',     opts:IRPF_OPTS },
              { key:'cliente_ids',   label:'Clientes',    multi:true, lista:filtroClientesLista },
              { key:'equipo_ids',    label:'Equipo',      multi:true, lista:filtroEquipoLista },
              { key:'proveedor_ids', label:'Proveedores', multi:true, lista:filtroProveedoresLista },
            ];
            const closeBulk = () => { setBulkCampo(null); setBulkValor(''); setBulkValorMulti([]); setBulkFiltroLista(''); };
            return (
              <div style={{ background:'#1e293b', border:'1px solid #1d4ed8', borderRadius:10, padding:'10px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', position:'sticky', top:0, zIndex:200 }}>
                <span style={{ color:'#60a5fa', fontSize:13, fontWeight:600, flexShrink:0 }}>{seleccionados.size} seleccionado{seleccionados.size>1?'s':''}</span>
                <button onClick={() => { setSeleccionados(new Set()); setSelTodos(false); }} style={{ background:'none', border:'none', color:'#52525b', fontSize:12, cursor:'pointer', padding:'2px 6px' }}>✕ Deseleccionar</button>
                {!selTodos && seleccionados.size > 0 && movimientos.total > seleccionados.size && (
                  <button onClick={seleccionarTodosLosMovimientos} disabled={cargandoTodos}
                    style={{ background:'none', border:'none', color:'#60a5fa', fontSize:12, cursor:'pointer', textDecoration:'underline', padding:'2px 4px' }}>
                    {cargandoTodos ? 'Cargando…' : `Seleccionar todos (${movimientos.total})`}
                  </button>
                )}
                {selTodos && <span style={{ color:'#a78bfa', fontSize:12 }}>✓ Todos los {seleccionados.size} seleccionados</span>}
                <div style={{ width:1, background:'#27272a', alignSelf:'stretch' }} />
                {BULK_CAMPOS.map(({ key, label, opts, multi, lista }) => (
                  <div key={key} style={{ position:'relative' }}>
                    <button onClick={() => { const open = bulkCampo !== key; closeBulk(); if (open) setBulkCampo(key); }}
                      style={{ background:'#27272a', border:'1px solid #3f3f46', color:'#d4d4d8', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer' }}>
                      {label} ▾
                    </button>
                    {bulkCampo===key && !multi && (
                      <div style={{ position:'absolute', zIndex:500, top:'100%', left:0, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, marginTop:4, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.5)', overflow:'hidden' }}>
                        {opts.map(o => (
                          <button key={o} onClick={() => { editarBulk(key, o); closeBulk(); }}
                            style={{ display:'block', width:'100%', background:'none', border:'none', color:'#d4d4d8', padding:'8px 12px', textAlign:'left', fontSize:13, cursor:'pointer' }}
                            onMouseEnter={e=>e.currentTarget.style.background='#27272a'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                            {o}
                          </button>
                        ))}
                      </div>
                    )}
                    {bulkCampo===key && multi && (
                      <div style={{ position:'absolute', zIndex:500, top:'100%', left:0, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, marginTop:4, minWidth:220, boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding:'6px 8px', borderBottom:'1px solid #27272a' }}>
                          <input autoFocus value={bulkFiltroLista} onChange={e => setBulkFiltroLista(e.target.value)}
                            placeholder="Buscar..." onClick={e => e.stopPropagation()}
                            style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', borderRadius:4, color:'white', fontSize:12, padding:'4px 8px', outline:'none', boxSizing:'border-box' }} />
                        </div>
                        <div style={{ maxHeight:180, overflowY:'auto' }}>
                          {(bulkFiltroLista.trim() ? lista.filter(o => o.nombre.toLowerCase().includes(bulkFiltroLista.toLowerCase())) : lista).map(o => {
                            const sel = bulkValorMulti.includes(o.id);
                            return (
                              <label key={o.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', cursor:'pointer', borderBottom:'1px solid #27272a' }}
                                onMouseEnter={e=>e.currentTarget.style.background='#27272a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                <input type="checkbox" checked={sel}
                                  onChange={() => setBulkValorMulti(prev => sel ? prev.filter(id=>id!==o.id) : [...prev, o.id])}
                                  style={{ accentColor:'#0067FD', flexShrink:0 }} />
                                <span style={{ color:'#d4d4d8', fontSize:12 }}>{o.nombre}</span>
                              </label>
                            );
                          })}
                        </div>
                        <button onClick={() => { if (bulkValorMulti.length) { editarBulk(key, bulkValorMulti); closeBulk(); } }}
                          disabled={bulkValorMulti.length === 0}
                          style={{ width:'100%', background: bulkValorMulti.length ? '#0067FD' : '#27272a', color:'white', border:'none', borderRadius:'0 0 8px 8px', padding:'6px', fontSize:12, cursor: bulkValorMulti.length ? 'pointer' : 'default' }}>
                          Aplicar {bulkValorMulti.length > 0 ? `(${bulkValorMulti.length})` : ''}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={eliminarBulk}
                  style={{ marginLeft:'auto', background:'#450a0a', border:'1px solid #7f1d1d', color:'#f87171', borderRadius:6, padding:'4px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  🗑 Eliminar {seleccionados.size}
                </button>
              </div>
            );
          })()}
          {panelFiltro && (
            <PanelFiltros
              filtros={movFiltros} op={movFiltroOp}
              onChangeFiltros={f => { setMovFiltros(f); setPagMovs(1); }}
              onChangeOp={op => { setMovFiltroOp(op); setPagMovs(1); }}
              listasAsignacion={{ cliente_ids: filtroClientesLista, equipo_ids: filtroEquipoLista, proveedor_ids: filtroProveedoresLista }}
            />
          )}
          {panelOrdenar && (
            <PanelOrdenar
              sorts={movSorts}
              onChange={s => { setMovSorts(s); setPagMovs(1); }}
            />
          )}

          <div style={S.card}>
            {loadingMovs ? (
              <p style={{ color: '#52525b', textAlign: 'center', padding: 24 }}>Cargando…</p>
            ) : errMovs ? (
              <p style={{ color: '#f87171', fontSize: 13, padding: 16 }}>Error: {errMovs}</p>
            ) : movimientos.items.length === 0 ? (
              <p style={{ color: '#52525b', textAlign: 'center', padding: 24 }}>Sin movimientos para este periodo</p>
            ) : (() => {
              const totalPages = movimientos.pages;
              const pageItems  = movimientos.items;

              const paginacion = (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  {!(mostrarTodos || vistaMovs === 'errores') && totalPages > 1 && (
                    <>
                      <button style={S.ghost} disabled={pagMovs <= 1} onClick={() => setPagMovs(p => p - 1)}>← Anterior</button>
                      <span style={{ color: '#71717a', fontSize: 13, padding: '8px 0' }}>{pagMovs} / {totalPages}</span>
                      <button style={S.ghost} disabled={pagMovs >= totalPages} onClick={() => setPagMovs(p => p + 1)}>Siguiente →</button>
                    </>
                  )}
                  <select value={(mostrarTodos || vistaMovs === 'errores') ? 'todos' : String(movLimit)}
                    onChange={e => { const v=e.target.value; if(v==='todos'){setMostrarTodos(true);setPagMovs(1);}else{const n=parseInt(v);setMovLimit(n);setMostrarTodos(false);setPagMovs(1);} }}
                    style={{ ...S.select, width:'auto', fontSize:13, padding:'7px 10px' }}>
                    {[50,100,200].map(n=><option key={n} value={n}>{n} por página</option>)}
                    <option value="todos">Todos ({movimientos.total})</option>
                  </select>
                </div>
              );

              if (vistaMovs === 'tabla') {
                return (
                  <>
                    <TablaMovimientos
                      items={pageItems}
                      seleccionados={seleccionados}
                      onToggleSel={toggleSel}
                      onToggleAll={toggleAll}
                      onGuardarCelda={guardarCeldaInline}
                      onVerDetalle={abrirDetalle}
                      clientesLista={filtroClientesLista}
                      equipoLista={filtroEquipoLista}
                      proveedoresLista={filtroProveedoresLista}
                      facturasDisponibles={facturasParaVincular}
                      loadingFacsVincular={loadingFacsVincular}
                      onVincularFacturas={handleVincularFacturasMovimiento}
                    />
                    {paginacion}
                  </>
                );
              }

              if (vistaMovs === 'errores') {
                const fmt_ = n => Math.abs(n||0).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2});
                // Usar todos los movimientos cargados, no solo la página actual
                const todosMovs = movimientos.items || [];
                const errores = todosMovs
                  .filter(m =>
                    (m.equipo_ids?.length || 0) > 0 &&
                    (m.categorias || []).some(c => c.toLowerCase().includes('freelancer')) &&
                    (m.cliente_ids?.length || 0) === 0
                  )
                  .filter(m => !movsErroresResueltos.has(m.id));
                return (
                  <div style={{ ...S.card, overflow:'hidden' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderBottom:'1px solid #27272a', background:'#111' }}>
                      <span style={{ color:'#f87171', fontSize:13 }}>⚠</span>
                      <span style={{ color:'white', fontWeight:700, fontSize:13 }}>Errores en movimientos</span>
                      <span style={{ color:'#52525b', fontSize:12 }}>{errores.length} error{errores.length!==1?'es':''}</span>
                    </div>
                    {errores.length === 0 ? (
                      <div style={{ padding:'32px 16px', textAlign:'center', color:'#22c55e', fontWeight:600 }}>✓ Sin errores detectados</div>
                    ) : errores.map((m, ci) => {
                      const equipoNombres = (m.equipo_ids || []).map(id => filtroEquipoLista.find(e => e.id === id)?.nombre || id);
                      return (
                        <div key={m.id} style={{ borderBottom:'1px solid #1f1f1f', padding:'12px 18px', background: ci % 2 === 0 ? 'transparent' : '#0a0a0a' }}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                            <span style={{ background:'#1a0505', border:'1px solid #f87171', color:'#f87171', fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px', whiteSpace:'nowrap', flexShrink:0, marginTop:1 }}>Error</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ color:'white', fontWeight:600, fontSize:12, margin:'0 0 2px' }}>Freelancer sin cliente asignado</p>
                              <p style={{ color:'#71717a', fontSize:11, margin:'0 0 8px', lineHeight:1.5 }}>
                                El movimiento tiene miembros de equipo vinculados y categoría Freelancers, pero no tiene ningún cliente asignado. Si es un gasto facturado a un cliente, vincúlalo.
                              </p>
                              <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center', marginBottom:8 }}>
                                <button onClick={() => abrirDetalle(m.id)}
                                  style={{ background:'#1c1c1e', border:'1px solid #3f3f46', color:'#d4d4d8', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                                  📋 {m.nombre} · {m.cantidad < 0 ? '-' : ''}{fmt_(m.cantidad)} €
                                </button>
                                {equipoNombres.map(n => (
                                  <span key={n} style={{ background:'#1e1b4b', border:'1px solid #4338ca', color:'#a5b4fc', borderRadius:6, padding:'2px 8px', fontSize:10 }}>👤 {n}</span>
                                ))}
                              </div>
                              <div style={{ display:'flex', gap:8 }}>
                                <button onClick={() => setMovsErroresResueltos(prev => new Set([...prev, m.id]))}
                                  style={{ background:'transparent', border:'1px solid #22c55e', color:'#22c55e', borderRadius:6, padding:'4px 12px', fontSize:11, cursor:'pointer', fontWeight:600 }}>
                                  ✓ Marcar como revisado
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              const normales  = pageItems.filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
              const traspasos = pageItems.filter(m =>  (m.categorias || []).includes('Traspaso Entre Cuentas'));
              return (
                <>
                  <style>{`
                    .fila-mov-wrap { position: relative; }
                    .fila-mov-cb { opacity: 0; transition: opacity 0.1s; }
                    .fila-mov-wrap:hover .fila-mov-cb { opacity: 1; }
                    .fila-mov-cb.checked { opacity: 1; }
                    .fin-tabla-row .fin-cb { opacity: 0; transition: opacity 0.1s; }
                    .fin-tabla-row:hover .fin-cb { opacity: 1; }
                    .fin-tabla-row .fin-cb.checked { opacity: 1; }
                    .fin-tabla-row th .fin-cb-all { opacity: 0; }
                    .fin-tabla-row th:hover .fin-cb-all { opacity: 1; }
                  `}</style>
                  <div style={{ display: 'grid', gridTemplateColumns: traspasos.length > 0 ? '1fr 1fr' : '1fr', gap: 24 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                        {seleccionados.size > 0 && (
                          <input type="checkbox"
                            checked={normales.length>0&&normales.every(m=>seleccionados.has(m.id))}
                            ref={el=>{if(el)el.indeterminate=normales.some(m=>seleccionados.has(m.id))&&!normales.every(m=>seleccionados.has(m.id));}}
                            onChange={()=>toggleAll(normales,normales.every(m=>seleccionados.has(m.id)))}
                            style={{accentColor:'#0067FD',cursor:'pointer'}}/>
                        )}
                        <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin:0 }}>Movimientos ({normales.length})</p>
                      </div>
                      {normales.map(m => {
                        const sel = seleccionados.has(m.id);
                        return (
                          <div key={m.id} className="fila-mov-wrap" style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <input type="checkbox" checked={sel} onChange={()=>toggleSel(m.id)}
                              className={`fila-mov-cb${sel?' checked':''}`}
                              style={{accentColor:'#0067FD',cursor:'pointer',flexShrink:0}}/>
                            <div style={{flex:1,minWidth:0}}><FilaMovimiento m={m} onVerDetalle={abrirDetalle} /></div>
                          </div>
                        );
                      })}
                    </div>
                    {traspasos.length > 0 && (
                      <div style={{ minWidth: 0, borderLeft: '1px solid #27272a', paddingLeft: 24 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                          {seleccionados.size > 0 && (
                            <input type="checkbox"
                              checked={traspasos.length>0&&traspasos.every(m=>seleccionados.has(m.id))}
                              ref={el=>{if(el)el.indeterminate=traspasos.some(m=>seleccionados.has(m.id))&&!traspasos.every(m=>seleccionados.has(m.id));}}
                              onChange={()=>toggleAll(traspasos,traspasos.every(m=>seleccionados.has(m.id)))}
                              style={{accentColor:'#0067FD',cursor:'pointer'}}/>
                          )}
                          <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin:0 }}>Traspasos ({traspasos.length})</p>
                        </div>
                        {traspasos.map(m => {
                          const sel = seleccionados.has(m.id);
                          return (
                            <div key={m.id} className="fila-mov-wrap" style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <input type="checkbox" checked={sel} onChange={()=>toggleSel(m.id)}
                                className={`fila-mov-cb${sel?' checked':''}`}
                                style={{accentColor:'#0067FD',cursor:'pointer',flexShrink:0}}/>
                              <div style={{flex:1,minWidth:0}}><FilaMovimiento m={m} onVerDetalle={abrirDetalle} /></div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {paginacion}
                </>
              );
            })()}
          </div>
    </>
  );
}
