import { createPortal } from 'react-dom';
import { fmt } from '../../utils';
import { ModalEditar } from '../ModalEditar';
import { ModalMovimiento } from '../ModalMovimiento';
import { SplitViewModal } from '../SplitViewModal';

export function ModalConflictosFiscales({
  erroresModal, setErroresModal, erroresData, setErroresData, errFiltro, setErrFiltro,
  errMovDetailId, setErrMovDetailId, errMovDetail, errMovEditar, setErrMovEditar,
  errSplitView, setErrSplitView,
  abrirMovEnErrores, findBestMatch, toggleMovimientoEnFactura,
  setFacturaViewerId, setFacturaViewerAutoEdit,
}) {
  return (
    <>
      {erroresModal && createPortal(
        <div onClick={() => { setErroresModal(false); setErrMovDetailId(null); setErrMovEditar(null); setErrFiltro('todos'); }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9000, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'24px 16px', overflowY:'auto' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:740, background:'#161616', border:'1px solid #3f3f46', borderRadius:14, overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', borderBottom:'1px solid #27272a', background:'#111', flexWrap:'wrap' }}>
              <span style={{ color:'#f87171', fontSize:14 }}>⚠</span>
              <span style={{ color:'white', fontWeight:700, fontSize:14 }}>Análisis de conflictos</span>
              {/* Filtros */}
              <div style={{ display:'flex', gap:4, marginLeft:8 }}>
                {[
                  ['todos', 'Todos', '#71717a', '#27272a'],
                  ['error', `${erroresData.filter(c=>c.severidad==='error').length} errores`, '#f87171', '#1a0505'],
                  ['warning', `${erroresData.filter(c=>c.severidad==='warning').length} avisos`, '#fbbf24', '#1a1200'],
                  ['info', `${erroresData.filter(c=>c.severidad==='info').length} info`, '#60a5fa', '#050d1a'],
                ].map(([v, l, col, bg]) => (
                  <button key={v} onClick={() => setErrFiltro(v)}
                    style={{ background: errFiltro===v ? bg : 'transparent', border:`1px solid ${errFiltro===v ? col : '#3f3f46'}`, color: errFiltro===v ? col : '#52525b', borderRadius:6, padding:'2px 9px', fontSize:10, cursor:'pointer', fontWeight:600 }}>
                    {l}
                  </button>
                ))}
              </div>
              <button onClick={() => { setErroresModal(false); setErrMovDetailId(null); setErrMovEditar(null); setErrFiltro('todos'); }}
                style={{ background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:18, lineHeight:1, padding:'2px 6px', marginLeft:'auto' }}>✕</button>
            </div>

            {(() => {
              const tipoLabel = {
                sin_contacto:          'Factura sin proveedor/cliente vinculado',
                sin_movimiento_vinculado: 'Sin movimiento vinculado',
                sin_movimiento:        'Sin movimiento en DB con datos de factura',
                sin_factura_subida:    'Sin factura subida',
                cross_trimestre:       'Cobro/pago en trimestre diferente al de la factura',
                desfase_fecha:         'Desfase de fecha (mismo trimestre)',
                fecha_factura_distinta:'Fecha de factura diferente (doc vs DB)',
                iva_faltante_db:       'IVA no registrado en DB',
                iva_en_db_sin_factura: 'IVA en DB sin IVA en factura',
                iva_diferente:         'IVA diferente',
                importe_distinto:      'Importe total ≠ total factura',
              };
              const filtrados = errFiltro === 'todos' ? erroresData : erroresData.filter(c => c.severidad === errFiltro);
              if (!filtrados.length) return <div style={{ padding:32, textAlign:'center', color:'#22c55e', fontWeight:600 }}>✓ Sin conflictos en este filtro</div>;
              return filtrados.map((c, ci) => {
                const sevColor = c.severidad === 'error' ? '#f87171' : c.severidad === 'warning' ? '#fbbf24' : '#60a5fa';
                const sevBg    = c.severidad === 'error' ? '#1a0505' : c.severidad === 'warning' ? '#1a1200' : '#050d1a';
                const sevLabel = c.severidad === 'error' ? 'Error' : c.severidad === 'warning' ? 'Aviso' : 'Info';
                const tienePar = c.movimiento && c.factura?.archivo_url;
                const globalIdx = erroresData.indexOf(c);
                // Recomendación: para facturas sin movimiento vinculado, buscar el mejor match
                const recom = c.tipo === 'sin_movimiento_vinculado' && c.factura ? findBestMatch(c.factura) : null;
                return (
                  <div key={ci} style={{ borderBottom:'1px solid #1f1f1f', padding:'12px 18px', background: ci % 2 === 0 ? 'transparent' : '#0a0a0a' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                      <span style={{ background: sevBg, border:`1px solid ${sevColor}`, color: sevColor, fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px', whiteSpace:'nowrap', flexShrink:0, marginTop:1 }}>{sevLabel}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ color:'white', fontWeight:600, fontSize:12, margin:'0 0 2px' }}>{tipoLabel[c.tipo] || c.tipo}</p>
                        <p style={{ color:'#71717a', fontSize:11, margin:'0 0 8px', lineHeight:1.5 }}>{c.desc}</p>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                          {c.movimiento && (
                            <button onClick={() => abrirMovEnErrores(c.movimiento)}
                              style={{ background:'#18181b', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:260, overflow:'hidden' }}>
                              <span style={{ flexShrink:0 }}>📋</span>
                              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.movimiento.nombre}</span>
                              <span style={{ color: c.movimiento.tipo?.toLowerCase().includes('ingreso') ? '#22c55e' : '#f87171', fontWeight:700, flexShrink:0 }}>{fmt(Math.abs(c.movimiento.cantidad))}€</span>
                            </button>
                          )}
                          {c.factura?.archivo_url && (
                            <button onClick={() => setFacturaViewerId(c.factura.id)}
                              style={{ background:'#050d1a', border:'1px solid #1d4ed8', color:'#60a5fa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:260, overflow:'hidden' }}>
                              <span style={{ flexShrink:0 }}>📄</span>
                              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.factura.archivo_nombre}</span>
                            </button>
                          )}
                          {tienePar && (
                            <button onClick={() => setErrSplitView({ movimiento: c.movimiento, factura: c.factura })}
                              style={{ background:'#0d0d0d', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                              ⬡ Ver ambos
                            </button>
                          )}
                          {/* Recomendación de movimiento para sin_movimiento_vinculado */}
                          {recom && (
                            <>
                              <span style={{ color:'#52525b', fontSize:10, flexShrink:0 }}>→ Recom:</span>
                              <button onClick={() => abrirMovEnErrores(recom)}
                                style={{ background:'#0d1a0d', border:'1px solid #166534', color:'#86efac', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:240, overflow:'hidden' }}>
                                <span style={{ flexShrink:0 }}>📋</span>
                                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{recom.nombre}</span>
                                <span style={{ color: recom.tipo?.toLowerCase().includes('ingreso') ? '#22c55e' : '#f87171', fontWeight:700, flexShrink:0 }}>{fmt(Math.abs(recom.cantidad))}€</span>
                              </button>
                              {c.factura?.archivo_url && (
                                <button onClick={() => setErrSplitView({ movimiento: recom, factura: c.factura })}
                                  style={{ background:'#0d0d0d', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                                  ⬡ Ver ambos
                                </button>
                              )}
                              <button onClick={async () => {
                                await toggleMovimientoEnFactura(c.factura.id, recom.id);
                                setErroresData(prev => prev.filter((_, i) => i !== globalIdx));
                              }}
                                style={{ background:'rgba(139,92,246,0.15)', border:'1px solid #7c3aed', color:'#a78bfa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, fontWeight:600 }}>
                                ⚡ Vincular
                              </button>
                            </>
                          )}
                          <button onClick={() => setErroresData(prev => prev.filter((_, i) => i !== globalIdx))}
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
              });
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Movimiento detalle desde errores — zIndex por encima del modal errores */}
      {errMovDetail && createPortal(
        <ModalMovimiento
          m={errMovDetail}
          onClose={() => { setErrMovDetailId(null); const p = new URLSearchParams(window.location.search); p.delete('mov'); window.history.replaceState({}, '', p.toString() ? `${window.location.pathname}?${p}` : window.location.pathname); }}
          onEditar={m => { setErrMovDetailId(null); setErrMovEditar(m); }}
          onEliminar={null}
          onConfirm={() => {}}
          zIndex={9100}
        />,
        document.body
      )}

      {/* Movimiento editar desde errores */}
      {errMovEditar && createPortal(
        <ModalEditar
          movimiento={errMovEditar}
          zIndex={9200}
          onGuardado={(data) => {
            setErroresData(prev => prev.map(c =>
              c.movimiento?.id === errMovEditar.id ? { ...c, movimiento: { ...c.movimiento, ...data } } : c
            ));
            setErrMovEditar(null);
          }}
          onCerrar={() => setErrMovEditar(null)}
        />,
        document.body
      )}

      {/* Split view compartido: movimiento (izq) + factura (der) */}
      <SplitViewModal
        data={errSplitView}
        onClose={() => setErrSplitView(null)}
        onEditarMovimiento={m => { setErrMovEditar(m); setErrSplitView(null); }}
        onEditarFactura={fac => { setFacturaViewerId(fac.id); setFacturaViewerAutoEdit(true); setErrSplitView(null); }}
        zIndex={9300}
      />
    </>
  );
}
