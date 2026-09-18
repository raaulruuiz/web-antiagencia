import { createPortal } from 'react-dom';
import { SearchableSelect } from './SearchableSelect';
import { VinculosDropdown } from './VinculosDropdown';

export function ModalDocumentoViewer({
  facturaViewerId, facturaViewerData, facturaViewerLoading, facturaViewerError,
  setFacturaViewerId, setFacturaViewerAutoEdit,
  viewerEditando, setViewerEditando, viewerDraft, setViewerDraft,
  viewerVincOpen, setViewerVincOpen,
  contactosTodos, movimientosParaVincular, loadingMovsVincular,
  toggleMovimientoEnFactura, contactFiscalUpdates, guardarCeldaDoc, qc,
}) {
  if (facturaViewerId === null) return null;
  return createPortal(
        <div onClick={() => { setFacturaViewerId(null); setViewerEditando(false); setFacturaViewerAutoEdit(false); }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:960, height:'92vh', background:'#1a1a1a', borderRadius:12, border:'1px solid #3f3f46', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderBottom:'1px solid #27272a', flexShrink:0 }}>
              <span style={{ color:'#a1a1aa', fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {facturaViewerData?.archivo_nombre || (facturaViewerLoading ? 'Cargando…' : facturaViewerError ? 'Error al cargar' : '—')}
              </span>
              <span style={{ color:'#52525b', fontSize:11, fontFamily:'monospace', flexShrink:0 }}>{facturaViewerId.slice(0,8)}…</span>
              {facturaViewerData && !viewerEditando && (
                <button onClick={() => setViewerEditando(true) || setViewerDraft({ archivo_nombre: facturaViewerData.archivo_nombre||'', factura_proveedor_id: facturaViewerData.factura_proveedor_id||'', factura_cliente_id: facturaViewerData.factura_cliente_id||'', importe: facturaViewerData.importe??'', impuesto: facturaViewerData.impuesto??'', irpf: facturaViewerData.irpf??'' })}
                  style={{ background:'transparent', border:'1px solid #3f3f46', borderRadius:6, color:'#71717a', padding:'5px 12px', fontSize:12, cursor:'pointer', flexShrink:0 }}>Editar</button>
              )}
              {facturaViewerData?.archivo_url && (
                <a href={facturaViewerData.archivo_url} target="_blank" rel="noreferrer" style={{ color:'#60a5fa', fontSize:12, textDecoration:'none', flexShrink:0 }}>↗ Abrir en nueva pestaña</a>
              )}
              <button onClick={() => { setFacturaViewerId(null); setViewerEditando(false); setFacturaViewerAutoEdit(false); }} style={{ background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 4px', flexShrink:0 }}>✕</button>
            </div>
            {/* Loading / error */}
            {facturaViewerLoading && (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#52525b', fontSize:14 }}>
                Cargando documento…
              </div>
            )}
            {facturaViewerError && !facturaViewerLoading && (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#ef4444', fontSize:14 }}>
                Error al cargar el documento
              </div>
            )}
            {/* Metadata */}
            {facturaViewerData && !facturaViewerLoading && (() => {
              const fv = facturaViewerData;
              const ctodos = contactosTodos;
              const findC = id => ctodos.find(c => c.id === id)?.nombre || id?.slice(0,8) || '—';
              const pill = (txt, color) => <span style={{ background: color+'22', color, border:`1px solid ${color}44`, borderRadius:4, padding:'1px 7px', fontSize:11, fontWeight:600, flexShrink:0 }}>{txt}</span>;
              return (
                <div style={{ display:'flex', gap:20, padding:'10px 16px', borderBottom:'1px solid #27272a', flexShrink:0, flexWrap:'wrap', alignItems:'center' }}>
                  {fv.tipo && pill(fv.tipo === 'ingreso' ? 'Venta' : 'Compra', fv.tipo === 'ingreso' ? '#4ade80' : '#f87171')}
                  {fv.fecha_factura && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Fecha</span> {fv.fecha_factura}</span>}
                  {fv.numero_factura && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Nº</span> {fv.numero_factura}</span>}
                  {fv.nombre_entidad && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Entidad</span> {fv.nombre_entidad}</span>}
                  {fv.nif_cif && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>NIF</span> {fv.nif_cif}</span>}
                  {fv.importe != null && (() => { const base=parseFloat(fv.importe)||0; const total=parseFloat(fv.importe_total??0)||(base+(parseFloat(fv.impuesto)||0)+(parseFloat(fv.irpf)||0)); const isV=fv.tipo==='ingreso'; const colBase=Math.abs(base)<0.005?'#71717a':isV?'#4ade80':'#f87171'; const colTot=Math.abs(total)<0.005?'#71717a':isV?'#4ade80':'#f87171'; const signBase=Math.abs(base)<0.005?'':(isV?'+':'-'); const signTot=Math.abs(total)<0.005?'':(isV?'+':'-'); return (<><span style={{ color:colTot, fontSize:13, fontWeight:700 }}><span style={{ color:'#52525b', fontWeight:400, fontSize:11, marginRight:2 }}>Importe</span>{signTot}{Math.abs(total).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span><span style={{ color:colBase, fontSize:12 }}><span style={{ color:'#52525b' }}>Base </span>{signBase}{Math.abs(base).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span></>); })()}
                  {fv.impuesto != null && fv.impuesto !== 0 && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>IVA</span> {parseFloat(fv.impuesto).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span>}
                  {fv.irpf != null && fv.irpf !== 0 && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>IRPF</span> {parseFloat(fv.irpf).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span>}
                  {fv.factura_proveedor_id && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Proveedor</span> {findC(fv.factura_proveedor_id)}</span>}
                  {fv.factura_cliente_id && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Cliente</span> {findC(fv.factura_cliente_id)}</span>}
                  {fv.trimestre && <span style={{ color:'#52525b', fontSize:12 }}>Q{fv.trimestre}/{fv.anio}</span>}
                </div>
              );
            })()}
            {/* Movimientos vinculados — solo modo lectura */}
            {facturaViewerData && !facturaViewerLoading && !viewerEditando && (() => {
              const ids = facturaViewerData.movimiento_ids || [];
              return (
                <div style={{ padding:'8px 16px', borderBottom:'1px solid #27272a', flexShrink:0, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  <span style={{ color:'#52525b', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', flexShrink:0 }}>Movimientos vinculados</span>
                  <div style={{ position:'relative', display:'inline-flex', alignItems:'center' }}>
                    <div onClick={() => setViewerVincOpen(o => !o)}
                      style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      {ids.length > 0
                        ? ids.map(mid => {
                            const mov = movimientosParaVincular.find(m => m.id === mid);
                            return (
                              <span key={mid} style={{ background:'rgba(34,197,94,0.1)', color:'#4ade80', fontSize:11, padding:'2px 8px', borderRadius:4, fontWeight:600 }}>
                                {mov ? `${mov.nombre} · ${mov.fecha}` : mid.slice(0,8)}
                              </span>
                            );
                          })
                        : <span style={{ color:'#52525b', fontSize:12 }}>Ninguno — click para vincular</span>}
                    </div>
                    {viewerVincOpen && (
                      <VinculosDropdown
                        seleccionados={ids}
                        opciones={movimientosParaVincular}
                        cargando={loadingMovsVincular}
                        onToggle={movId => toggleMovimientoEnFactura(facturaViewerId, movId)}
                        onClose={() => setViewerVincOpen(false)}
                      />
                    )}
                  </div>
                </div>
              );
            })()}
            {/* Panel edición */}
            {viewerEditando && facturaViewerData && (() => {
              const ctodos = contactosTodos;
              const fv = facturaViewerData;
              const selStyle = { background:'#27272a', border:'1px solid #3f3f46', borderRadius:6, color:'white', padding:'5px 8px', fontSize:12, outline:'none', flex:1 };
              const lblStyle = { color:'#52525b', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' };
              const handleContactChange = (campo, newId) => {
                const extra = contactFiscalUpdates(newId, ctodos, fv.tipo, campo);
                setViewerDraft(prev => ({ ...prev, [campo]: newId, ...extra }));
              };
              const handleSave = async () => {
                const payload = { ...viewerDraft };
                if (payload.importe  !== '') payload.importe  = payload.importe  != null ? parseFloat(payload.importe)  : null;
                if (payload.impuesto !== '') payload.impuesto = payload.impuesto != null ? parseFloat(payload.impuesto) : null;
                if (payload.irpf     !== '') payload.irpf     = payload.irpf     != null ? parseFloat(payload.irpf)     : null;
                const contactoCambiado = payload.factura_proveedor_id !== fv.factura_proveedor_id || payload.factura_cliente_id !== fv.factura_cliente_id;
                await guardarCeldaDoc(facturaViewerId, payload);
                // viewer se actualiza automáticamente via useFactura(facturaViewerId)
                setViewerEditando(false);
                if (contactoCambiado) qc.invalidateQueries({ queryKey: contactoKeys.all });
              };
              return (
                <div style={{ padding:'12px 16px', borderBottom:'1px solid #27272a', background:'#111', flexShrink:0, display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:4, flex:'2 1 200px' }}>
                      <span style={lblStyle}>Nombre archivo</span>
                      <input value={viewerDraft.archivo_nombre||''} onChange={e => setViewerDraft(prev=>({...prev, archivo_nombre:e.target.value}))}
                        style={{ ...selStyle }} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4, flex:'1 1 160px' }}>
                      <span style={lblStyle}>Proveedor</span>
                      <SearchableSelect value={viewerDraft.factura_proveedor_id||''}
                        onChange={v => handleContactChange('factura_proveedor_id', v)}
                        options={ctodos} placeholder="— ninguno —" style={{ flex: 1 }} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4, flex:'1 1 160px' }}>
                      <span style={lblStyle}>Cliente</span>
                      <SearchableSelect value={viewerDraft.factura_cliente_id||''}
                        onChange={v => handleContactChange('factura_cliente_id', v)}
                        options={ctodos} placeholder="— ninguno —" style={{ flex: 1 }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      <span style={lblStyle}>Base Impon. (€)</span>
                      <input type="number" step="0.01" value={viewerDraft.importe??''} onChange={e => setViewerDraft(prev=>({...prev, importe:e.target.value}))}
                        style={{ ...selStyle, width:110 }} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      <span style={lblStyle}>IVA (€)</span>
                      <input type="number" step="0.01" value={viewerDraft.impuesto??''} onChange={e => setViewerDraft(prev=>({...prev, impuesto:e.target.value}))}
                        style={{ ...selStyle, width:90 }} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      <span style={lblStyle}>IRPF (€)</span>
                      <input type="number" step="0.01" value={viewerDraft.irpf??''} onChange={e => setViewerDraft(prev=>({...prev, irpf:e.target.value}))}
                        style={{ ...selStyle, width:90 }} />
                    </div>
                  </div>
                  {(viewerDraft.nombre_entidad || viewerDraft.nif_cif) && (
                    <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                      <span style={{ color:'#52525b', fontSize:11 }}>Se actualizará →</span>
                      {viewerDraft.nombre_entidad && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Entidad</span> {viewerDraft.nombre_entidad}</span>}
                      {viewerDraft.nif_cif && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>NIF</span> {viewerDraft.nif_cif}</span>}
                    </div>
                  )}
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <span style={lblStyle}>Movimientos vinculados</span>
                    <div style={{ position:'relative', display:'inline-flex', alignItems:'center' }}>
                      <div onClick={() => setViewerVincOpen(o => !o)}
                        style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', minHeight:30, padding:'4px 8px', background:'#27272a', border:'1px solid #3f3f46', borderRadius:6 }}>
                        {(fv.movimiento_ids||[]).length > 0
                          ? (fv.movimiento_ids).map(mid => {
                              const mov = movimientosParaVincular.find(m => m.id === mid);
                              return (
                                <span key={mid} style={{ background:'rgba(34,197,94,0.1)', color:'#4ade80', fontSize:11, padding:'2px 8px', borderRadius:4, fontWeight:600 }}>
                                  {mov ? `${mov.nombre} · ${mov.fecha}` : mid.slice(0,8)}
                                </span>
                              );
                            })
                          : <span style={{ color:'#52525b', fontSize:12 }}>Ninguno — click para vincular</span>}
                      </div>
                      {viewerVincOpen && (
                        <VinculosDropdown
                          seleccionados={fv.movimiento_ids||[]}
                          opciones={movimientosParaVincular}
                          cargando={loadingMovsVincular}
                          onToggle={movId => toggleMovimientoEnFactura(facturaViewerId, movId)}
                          onClose={() => setViewerVincOpen(false)}
                        />
                      )}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={handleSave} style={{ background:'#0067FD', border:'none', borderRadius:6, color:'white', padding:'6px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Guardar</button>
                    <button onClick={() => setViewerEditando(false)} style={{ background:'transparent', border:'1px solid #3f3f46', borderRadius:6, color:'#71717a', padding:'6px 14px', fontSize:12, cursor:'pointer' }}>Cancelar</button>
                  </div>
                </div>
              );
            })()}
            {/* Contenido — solo cuando hay datos */}
            {facturaViewerData?.archivo_url && !facturaViewerLoading && (
              /\.(jpg|jpeg|png|gif|webp)$/i.test(facturaViewerData.archivo_nombre||'')
                ? <img src={facturaViewerData.archivo_url} alt={facturaViewerData.archivo_nombre} style={{ flex:1, objectFit:'contain', width:'100%', height:'100%' }} />
                : <iframe src={facturaViewerData.archivo_url} title={facturaViewerData.archivo_nombre||'Documento'} style={{ flex:1, width:'100%', border:'none' }} />
            )}
          </div>
        </div>,
        document.body
  );
}
