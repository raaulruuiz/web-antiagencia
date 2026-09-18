import { S } from '../../constants';
import { fmt } from '../../utils';
import { FiscalMetric } from '../FiscalMetric';
import { FacturaRow } from './FacturaRow';

export function TrimestresFiscal({
  trimestres, datosComp, anioComp, trimestreAbierto, toggleTrimestre,
  facturasActivasTrimestre, detectando, detectarErrores,
  pendientes, setPendientes, selFacturas, setSelFacturas,
  facturaFiltro, setFacturaFiltro, facturaOrden, setFacturaOrden,
  subirAbierto, setSubirAbierto, tipoActivo, setTipoActivo, dragOver, setDragOver,
  extrayendo, guardando, fileInputRef, handleFiles, guardarPendientes,
  eliminarFacturasBulk, _bulkDeleteFacMut, eliminarFactura,
  setFacturaViewerId, setModDetalle,
}) {
  return (
    <>
      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Por trimestre</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {trimestres.map((t, i) => {
          const tc = datosComp?.trimestres?.[i];
          const abierto = trimestreAbierto === i;
          // Fase 9: facturas del trimestre activo desde TQ; el resto están vacías (no cargadas)
          const facturasGuardadas = abierto ? facturasActivasTrimestre : [];
          return (
            <div key={i} style={S.card}>
              {/* Cabecera trimestre — clickable */}
              <div onClick={() => toggleTrimestre(i)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom: abierto ? 12 : 0 }}>
                <span style={{ color:'#52525b', fontSize:11, transition:'transform 0.2s', display:'inline-block', transform: abierto ? 'rotate(90deg)' : 'none' }}>▶</span>
                <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: 0, flex:1 }}>
                  {t.label}{tc ? <span style={{ color: '#52525b', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>vs {anioComp}</span> : null}
                </p>
              </div>

              {/* Métricas fiscales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: abierto ? 16 : 0 }}>
                <FiscalMetric label="Facturación"         value={t.facturacion}                    color="#22c55e" comp={tc ? tc.facturacion : null} />
                <FiscalMetric label="Gastos"              value={t.totalGastos}                    color="#f87171" comp={tc ? tc.totalGastos : null} />
                <FiscalMetric label="Beneficio"           value={t.facturacion - t.totalGastos}    color={(t.facturacion - t.totalGastos) >= 0 ? '#10b981' : '#f87171'} comp={tc ? tc.facturacion - tc.totalGastos : null} />
                <FiscalMetric label="IVA repercutido"     value={t.ivaRepercutido}                 color="#f59e0b" comp={tc ? tc.ivaRepercutido : null} />
                <FiscalMetric label="IVA soportado"       value={t.ivaSoportado}                   color="#f59e0b" comp={tc ? tc.ivaSoportado : null} />
                <FiscalMetric label="IVA a pagar (303)"   value={t.ivaAPagar}                      color={t.ivaAPagar > 0 ? '#f59e0b' : '#22c55e'} comp={tc ? tc.ivaAPagar : null} />
                <FiscalMetric label="IRPF retenido (130)" value={t.irpfRetenido}                   color="#8b5cf6" comp={tc ? tc.irpfRetenido : null} />
              </div>

              {/* IRPF por cliente */}
              {Object.keys(t.irpfPorCliente).length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #27272a' }}>
                  <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>IRPF retenido por cliente</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(t.irpfPorCliente).sort(([,a],[,b]) => b - a).map(([nombre, irpf]) => (
                      <div key={nombre} style={{ background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, padding: '6px 10px' }}>
                        <p style={{ color: '#a1a1aa', fontSize: 11, margin: 0 }}>{nombre}</p>
                        <p style={{ color: '#8b5cf6', fontSize: 13, fontWeight: 700, margin: 0 }}>{fmt(irpf)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección facturas (solo si abierto) */}
              {abierto && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #27272a' }}>
                  {/* Comparativa DB vs Con Factura DB vs Facturas subidas */}
                  {facturasGuardadas.length > 0 && (() => {
                    // Facturas subidas (año actual)
                    const fIng  = facturasGuardadas.filter(f => f.tipo === 'ingreso').reduce((s, f) => s + (f.importe || 0), 0);
                    const fGas  = facturasGuardadas.filter(f => f.tipo === 'gasto').reduce((s, f)   => s + Math.abs(f.importe || 0), 0);
                    const fIvaR = facturasGuardadas.filter(f => f.tipo === 'ingreso').reduce((s, f) => s + (f.impuesto || 0), 0);
                    const fIvaS = facturasGuardadas.filter(f => f.tipo === 'gasto').reduce((s, f)   => s + Math.abs(f.impuesto || 0), 0);
                    // DB total (año actual)
                    const dbIng = t.facturacion; const dbGas = t.totalGastos;
                    const dbIvaR = t.ivaRepercutido; const dbIvaS = t.ivaSoportado;
                    // DB con factura (año actual)
                    const cf = t.conFactura || {};
                    const cfIng = cf.facturacion || 0; const cfGas = cf.totalGastos || 0;
                    const cfIvaR = cf.ivaRepercutido || 0; const cfIvaS = cf.ivaSoportado || 0;
                    // Comparativa (año anterior — solo DB)
                    const cfc = tc?.conFactura || {};

                    const dc = v => v === 0 ? '#52525b' : v > 0 ? '#22c55e' : '#f87171';
                    const dl = v => v === 0 ? '±0' : (v > 0 ? '+' : '') + fmt(v);
                    const Col = ({ v, color, comp }) => (
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:1 }}>
                        <span style={{ color: color || '#d4d4d8', fontWeight:600 }}>{fmt(v)}</span>
                        {comp != null && <span style={{ color:'#3f3f46', fontSize:10 }}>ant. {fmt(comp)}</span>}
                      </div>
                    );
                    const DCol = ({v}) => <span style={{ color: dc(v), fontWeight:700, fontSize:11 }}>{dl(v)}</span>;
                    const cols = ['Ingresos','IVA rep.','Gastos','IVA sop.'];
                    const rows = [
                      { label:'Total movimientos', vals:[dbIng, dbIvaR, dbGas, dbIvaS], colors:['#22c55e','#f59e0b','#f87171','#f59e0b'],
                        comps: tc ? [tc.facturacion, tc.ivaRepercutido, tc.totalGastos, tc.ivaSoportado] : null },
                      { label:'Con factura (DB)',  vals:[cfIng, cfIvaR, cfGas, cfIvaS], colors:['#22c55e','#f59e0b','#f87171','#f59e0b'],
                        comps: tc ? [cfc.facturacion||0, cfc.ivaRepercutido||0, cfc.totalGastos||0, cfc.ivaSoportado||0] : null },
                      { label:'Facturas subidas',  vals:[fIng, fIvaR, fGas, fIvaS], colors:['#22c55e','#f59e0b','#f87171','#f59e0b'], comps: null },
                      { label:'Diferencia (sub−DB fact)', diff: true, vals:[fIng-cfIng, fIvaR-cfIvaR, fGas-cfGas, fIvaS-cfIvaS], comps: null },
                    ];
                    return (
                      <div style={{ background:'#0d0d0d', border:'1px solid #27272a', borderRadius:8, padding:'10px 14px', marginBottom:14, overflowX:'auto' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                          <p style={{ color:'#52525b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', margin:0 }}>
                            Conciliación facturas vs movimientos{tc ? <span style={{ color:'#3f3f46', fontWeight:400 }}> — ant. {anioComp}</span> : null}
                          </p>
                          <button onClick={detectarErrores} disabled={detectando}
                            style={{ background:'#1a0a0a', border:'1px solid #7f1d1d', color:'#f87171', borderRadius:6, padding:'2px 10px', fontSize:10, cursor: detectando ? 'not-allowed' : 'pointer', fontWeight:600, opacity: detectando ? 0.7 : 1, flexShrink:0 }}>
                            {detectando ? 'Analizando…' : '⚠ Detectar errores'}
                          </button>
                        </div>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                          <thead>
                            <tr>
                              <th style={{ color:'#52525b', fontWeight:600, fontSize:10, textAlign:'left', paddingRight:16, paddingBottom:6, whiteSpace:'nowrap' }}></th>
                              {cols.map(c => <th key={c} style={{ color:'#52525b', fontWeight:600, fontSize:10, textAlign:'right', paddingRight:12, paddingBottom:6, whiteSpace:'nowrap' }}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map(({ label, vals, colors, diff, comps }) => (
                              <tr key={label} style={{ borderTop:'1px solid #1f1f1f' }}>
                                <td style={{ color: diff ? '#52525b' : '#71717a', fontSize:11, paddingRight:16, paddingTop:5, paddingBottom:5, whiteSpace:'nowrap', verticalAlign:'top' }}>{label}</td>
                                {vals.map((v, vi) => (
                                  <td key={vi} style={{ textAlign:'right', paddingRight:12, paddingTop:5, paddingBottom:5, verticalAlign:'top' }}>
                                    {diff ? <DCol v={v} /> : <Col v={v} color={colors[vi]} comp={comps?.[vi]} />}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {/* Modelos de Hacienda (calculados desde facturas subidas) */}
                  {facturasGuardadas.length > 0 && (() => {
                    const ing = facturasGuardadas.filter(f => f.tipo === 'ingreso');
                    const gas = facturasGuardadas.filter(f => f.tipo === 'gasto');
                    // Mod.303
                    const ivaRep = ing.reduce((s, f) => s + (f.impuesto || 0), 0);
                    const ivaSop = gas.reduce((s, f) => s + Math.abs(f.impuesto || 0), 0);
                    const mod303 = ivaRep - ivaSop;
                    // Mod.111 — IRPF retenido EN gastos (lo que el usuario retiene al pagar freelancers)
                    const irpf111 = gas.filter(f => (f.irpf || 0) > 0).reduce((s, f) => s + (f.irpf || 0), 0);
                    // Mod.130 — Estimación 20% beneficio neto (estimación directa)
                    const ingBase = ing.reduce((s, f) => s + (f.importe || 0), 0);
                    const gasBase = gas.reduce((s, f) => s + Math.abs(f.importe || 0), 0);
                    const mod130 = Math.max(0, (ingBase - gasBase) * 0.20);
                    // Mod.349 — Intracomunitarias: gastos con NIF de país EU y sin IVA
                    const euRe = /^(IE|FR|DE|IT|NL|BE|PT|AT|FI|SE|DK|PL|CZ|RO|HU|SK|SI|HR|BG|EE|LV|LT|LU|MT|CY|EL|GR)/i;
                    const intracom = gas.filter(f => f.nif_cif && euRe.test(f.nif_cif) && !(f.impuesto > 0));
                    const base349 = intracom.reduce((s, f) => s + Math.abs(f.importe || 0), 0);

                    // Comparativa modelos desde DB del año anterior
                    const tcMod303 = tc ? tc.ivaAPagar : null;
                    const tcMod111 = tc ? tc.irpfRetenido : null;
                    const tcMod130 = tc ? Math.max(0, (tc.facturacion - tc.totalGastos) * 0.20) : null;

                    const ModCard = ({ num, titulo, desc, valor, valorLabel, info, comp, compLabel, secciones }) => (
                      <div style={{ background:'#0d0d0d', border:'1px solid #27272a', borderRadius:8, padding:'10px 14px', flex:'1 1 180px', minWidth:160 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                          <span onClick={() => secciones && setModDetalle({ num, titulo, desc, valor, valorLabel, info, secciones })}
                            style={{ background:'#1a1a1a', border:'1px solid #3f3f46', borderRadius:4, color: secciones ? '#a78bfa' : '#a1a1aa', fontSize:10, fontWeight:700, padding:'1px 6px', cursor: secciones ? 'pointer' : 'default' }}>Mod.{num}</span>
                          <span style={{ color:'#52525b', fontSize:10 }}>{titulo}</span>
                        </div>
                        <p style={{ color:'#71717a', fontSize:10, margin:'0 0 6px' }}>{desc}</p>
                        {info
                          ? <span style={{ color:'#52525b', fontSize:12, fontWeight:600 }}>Informativo</span>
                          : <>
                              <span style={{ color: valor > 0 ? '#f87171' : valor < 0 ? '#22c55e' : '#52525b', fontSize:16, fontWeight:700 }}>
                                {valor > 0 ? '' : valor < 0 ? '−' : ''}{fmt(Math.abs(valor))}
                                {valorLabel && <span style={{ color:'#52525b', fontSize:10, fontWeight:400, marginLeft:4 }}>{valorLabel}</span>}
                              </span>
                              {comp != null && (
                                <p style={{ color:'#3f3f46', fontSize:10, margin:'4px 0 0' }}>
                                  ant. {fmt(Math.abs(comp))}{compLabel ? ` ${compLabel}` : ''}
                                  {comp !== 0 && valor !== 0 && <span style={{ color: valor < comp ? '#22c55e' : '#f87171', marginLeft:4 }}>
                                    ({valor < comp ? '↓' : '↑'}{Math.round(Math.abs((valor - comp) / comp) * 100)}%)
                                  </span>}
                                </p>
                              )}
                            </>
                        }
                        {num === '349' && base349 > 0 && (
                          <p style={{ color:'#71717a', fontSize:10, margin:'4px 0 0' }}>Base: {fmt(base349)} ({intracom.length} ops.)</p>
                        )}
                      </div>
                    );

                    return (
                      <div style={{ marginBottom:14 }}>
                        <p style={{ color:'#52525b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 8px' }}>
                          Modelos de Hacienda (según facturas){tc ? <span style={{ color:'#3f3f46', fontWeight:400 }}> — ant. {anioComp} desde DB</span> : null}
                        </p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          <ModCard num="303" titulo="IVA trimestral" desc={`IVA rep. ${fmt(ivaRep)} − IVA sop. ${fmt(ivaSop)}`} valor={mod303} valorLabel={mod303 > 0 ? 'a pagar' : mod303 < 0 ? 'a compensar' : ''} comp={tcMod303} compLabel={tcMod303 > 0 ? 'a pagar' : tcMod303 < 0 ? 'a compensar' : ''}
                            secciones={[
                              { label: `IVA repercutido — ${fmt(ivaRep)}`, facturas: ing.filter(f => f.impuesto), campoImporte: 'impuesto' },
                              { label: `IVA soportado — ${fmt(ivaSop)}`, facturas: gas.filter(f => f.impuesto), campoImporte: 'impuesto' },
                            ]} />
                          <ModCard num="111" titulo="Retenc. IRPF" desc="IRPF retenido al pagar a terceros" valor={irpf111} valorLabel={irpf111 > 0 ? 'a ingresar' : ''} info={irpf111 === 0} comp={tcMod111}
                            secciones={[
                              { label: 'Gastos con IRPF retenido', facturas: gas.filter(f => (f.irpf || 0) > 0), campoImporte: 'irpf' },
                            ]} />
                          <ModCard num="130" titulo="IRPF fraccionado" desc={`20% s/ beneficio ${fmt(ingBase - gasBase)} (est.)`} valor={mod130} valorLabel="estimado" info={mod130 === 0} comp={tcMod130} compLabel="estimado"
                            secciones={[
                              { label: `Ingresos — base ${fmt(ingBase)}`, facturas: ing, campoImporte: 'importe' },
                              { label: `Gastos — base ${fmt(gasBase)}`, facturas: gas, campoImporte: 'importe' },
                            ]} />
                          <ModCard num="349" titulo="Intracomunitarias" desc="Servicios EU sin IVA (Google, Meta…)" valor={0} info={base349 === 0}
                            secciones={base349 === 0 ? undefined : [{ label: 'Operaciones intracomunitarias', facturas: intracom, campoImporte: 'importe' }]} />
                          {base349 > 0 && <ModCard num="349" titulo="Intracomunitarias" desc={`${intracom.length} operaciones EU`} valor={base349} valorLabel="base declarable"
                            secciones={[{ label: 'Operaciones intracomunitarias', facturas: intracom, campoImporte: 'importe' }]} />}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Input file oculto */}
                  <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" style={{ display:'none' }}
                    onChange={e => { handleFiles(e.target.files, tipoActivo); e.target.value = ''; }} />

                  {/* Botón + Añadir / zonas de drop */}
                  {!subirAbierto
                    ? <button onClick={() => setSubirAbierto(true)} style={{ background:'#18181b', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:8, padding:'8px 18px', fontSize:13, cursor:'pointer', fontWeight:600, marginBottom:12 }}>＋ Añadir facturas</button>
                    : (
                      <div style={{ marginBottom:12 }}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:6 }}>
                          {[
                            { tipo:'ingreso', label:'＋ Ingresos', bg:'#052e16', border:'#166534', color:'#22c55e', bgHover:'#0a3f20' },
                            { tipo:'gasto',   label:'＋ Gastos',   bg:'#1a0a0a', border:'#7f1d1d', color:'#f87171', bgHover:'#2a0f0f' },
                          ].map(({ tipo, label, bg, border, color, bgHover }) => (
                            <div key={tipo}
                              onClick={() => { if (!extrayendo) { setTipoActivo(tipo); fileInputRef.current?.click(); } }}
                              onDragOver={e => { e.preventDefault(); setDragOver(tipo); }}
                              onDragLeave={() => setDragOver(null)}
                              onDrop={e => { e.preventDefault(); setDragOver(null); if (!extrayendo) handleFiles(e.dataTransfer.files, tipo); }}
                              style={{ background: dragOver === tipo ? bgHover : bg, border: `2px dashed ${dragOver === tipo ? color : border}`, color, borderRadius:10, padding:'18px 14px', fontSize:13, cursor: extrayendo ? 'not-allowed' : 'pointer', fontWeight:600, textAlign:'center', transition:'all 0.15s', opacity: extrayendo ? 0.6 : 1 }}>
                              {extrayendo && tipoActivo === tipo ? 'Extrayendo…' : label}
                              <div style={{ fontSize:11, fontWeight:400, color: dragOver === tipo ? color : '#52525b', marginTop:4 }}>
                                {dragOver === tipo ? 'Suelta aquí' : 'Haz clic o arrastra PDFs / imágenes'}
                              </div>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => setSubirAbierto(false)} style={{ background:'none', border:'none', color:'#52525b', fontSize:11, cursor:'pointer', padding:0 }}>Ocultar</button>
                      </div>
                    )
                  }

                  {/* Facturas pendientes de guardar */}
                  {pendientes.length > 0 && (
                    <div style={{ background:'#0d0d0d', border:'1px solid #3f3f46', borderRadius:8, marginBottom:12, overflow:'hidden' }}>
                      <div style={{ padding:'8px 10px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        {(() => { const listos = pendientes.filter(p => !p._procesando && !p._error).length; const proc = pendientes.filter(p => p._procesando).length; return (<>
                          <span style={{ color:'#a78bfa', fontSize:12, fontWeight:600, flex:1 }}>
                            {proc > 0 ? `Procesando ${proc}…` : ''}{proc > 0 && listos > 0 ? ' · ' : ''}{listos > 0 ? `${listos} listo${listos > 1 ? 's' : ''}` : ''}
                          </span>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => setPendientes([])} disabled={guardando}
                              style={{ background:'transparent', color:'#71717a', border:'1px solid #3f3f46', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                              Cancelar
                            </button>
                            {listos > 0 && <button onClick={guardarPendientes} disabled={guardando}
                              style={{ background:'#0067FD', color:'white', border:'none', borderRadius:6, padding:'4px 14px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                              {guardando ? 'Guardando…' : `Guardar ${listos}`}
                            </button>}
                          </div>
                        </>); })()}
                      </div>
                      {pendientes.map((f, pi) => (
                        <FacturaRow key={pi} f={f} onDelete={() => setPendientes(prev => prev.filter((_,j) => j !== pi))}
                          selFacturas={selFacturas} setSelFacturas={setSelFacturas}
                          setFacturaViewerId={setFacturaViewerId} eliminarFactura={eliminarFactura} />
                      ))}
                    </div>
                  )}

                  {/* Facturas ya guardadas */}
                  {facturasGuardadas.length > 0 && (() => {
                    const filtradas = facturasGuardadas
                      .filter(f => facturaFiltro === 'todos' || f.tipo === facturaFiltro)
                      .sort((a, b) => {
                        if (facturaOrden === 'fecha_desc') return (b.fecha_factura || '').localeCompare(a.fecha_factura || '');
                        if (facturaOrden === 'fecha_asc')  return (a.fecha_factura || '').localeCompare(b.fecha_factura || '');
                        if (facturaOrden === 'importe_desc') return (b.importe || 0) - (a.importe || 0);
                        if (facturaOrden === 'importe_asc')  return (a.importe || 0) - (b.importe || 0);
                        return 0;
                      });
                    return (
                    <div style={{ background:'#0d0d0d', border:'1px solid #3f3f46', borderRadius:8, overflow:'hidden' }}>
                      {/* Header con controles */}
                      <div style={{ padding:'8px 10px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <input type="checkbox"
                          checked={filtradas.length > 0 && filtradas.every(f => selFacturas.has(f.id))}
                          onChange={e => {
                            setSelFacturas(prev => {
                              const s = new Set(prev);
                              filtradas.forEach(f => e.target.checked ? s.add(f.id) : s.delete(f.id));
                              return s;
                            });
                          }}
                          style={{ accentColor:'#0067FD', cursor:'pointer', opacity: selFacturas.size > 0 ? 1 : 0.3, transition:'opacity 0.15s' }} />
                        <span style={{ color:'#71717a', fontSize:12, fontWeight:600 }}>
                          Guardadas ({filtradas.length}{filtradas.length !== facturasGuardadas.length ? `/${facturasGuardadas.length}` : ''})
                        </span>
                        {/* Filtro tipo */}
                        <div style={{ display:'flex', gap:4, marginLeft:'auto' }}>
                          {[['todos','Todos'],['ingreso','Ingresos'],['gasto','Gastos']].map(([v,l]) => (
                            <button key={v} onClick={() => setFacturaFiltro(v)}
                              style={{ background: facturaFiltro===v ? (v==='ingreso'?'#052e16':v==='gasto'?'#1a0a0a':'#27272a') : 'transparent', color: facturaFiltro===v ? (v==='ingreso'?'#22c55e':v==='gasto'?'#f87171':'white') : '#52525b', border: `1px solid ${facturaFiltro===v?(v==='ingreso'?'#166534':v==='gasto'?'#7f1d1d':'#3f3f46'):'transparent'}`, borderRadius:6, padding:'2px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>
                              {l}
                            </button>
                          ))}
                        </div>
                        {/* Ordenación */}
                        <select value={facturaOrden} onChange={e => setFacturaOrden(e.target.value)}
                          style={{ background:'#18181b', color:'#a1a1aa', border:'1px solid #3f3f46', borderRadius:6, padding:'2px 6px', fontSize:11, cursor:'pointer' }}>
                          <option value="fecha_desc">Fecha ↓</option>
                          <option value="fecha_asc">Fecha ↑</option>
                          <option value="importe_desc">Importe ↓</option>
                          <option value="importe_asc">Importe ↑</option>
                        </select>
                        {selFacturas.size > 0 && (
                          <button onClick={eliminarFacturasBulk} disabled={_bulkDeleteFacMut.isPending}
                            style={{ background:'#7f1d1d', border:'1px solid #991b1b', color:'#f87171', borderRadius:6, padding:'3px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                            {_bulkDeleteFacMut.isPending ? 'Eliminando…' : `Eliminar ${selFacturas.size}`}
                          </button>
                        )}
                      </div>
                      {filtradas.map(f => <FacturaRow key={f.id} f={f} selectable
                        selFacturas={selFacturas} setSelFacturas={setSelFacturas}
                        setFacturaViewerId={setFacturaViewerId} eliminarFactura={eliminarFactura} />)}
                    </div>
                    );
                  })()}

                  {pendientes.length === 0 && facturasGuardadas.length === 0 && !extrayendo && (
                    <p style={{ color:'#3f3f46', fontSize:13, margin:0 }}>Sin facturas. Usa los botones para subir PDFs o imágenes.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
