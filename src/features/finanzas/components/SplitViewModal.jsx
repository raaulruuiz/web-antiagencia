import { createPortal } from 'react-dom';
import { fmt } from '../utils';

// ── Split view compartido: movimiento (izq) + documento (der) ──────────────
// Usado tanto desde la tab Movimientos como desde la tab Fiscal.
// Cualquier cambio aquí se refleja en ambos lugares.
export function SplitViewModal({ data, onClose, onEditarMovimiento, onEditarFactura, zIndex = 9200 }) {
  if (!data) return null;
  const { movimiento: m, factura: fac } = data;
  const esIngreso = (m.tipo||'').toLowerCase().includes('ingreso');
  const colMov = esIngreso ? '#22c55e' : '#f87171';
  const esGasto = fac.tipo === 'gasto';
  const base = parseFloat(fac.importe||0)||0;
  const iva  = parseFloat(fac.impuesto||0)||0;
  const irpf = parseFloat(fac.irpf||0)||0;
  const total = parseFloat(fac.importe_total??0)||(base+iva+irpf);
  const colDoc = esGasto ? '#f87171' : '#4ade80';

  const F = ({ label, value, mono }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
      <span style={{ color:'#52525b', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
      <span style={{ color:(value==null||value==='')?'#3f3f46':mono?'#a78bfa':'white', fontSize:12, fontFamily:mono?'monospace':'inherit' }}>
        {(value==null||value==='')?'—':value}
      </span>
    </div>
  );

  const Fd = ({ label, value }) => (value!=null && value!=='' && value!==0) ? (
    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
      <span style={{ color:'#52525b', fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
      <span style={{ color:'#d4d4d8', fontSize:12 }}>{value}</span>
    </div>
  ) : null;

  return createPortal(
    <div onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width:'100%', maxWidth:1400, height:'92vh', display:'flex', gap:0, borderRadius:14, overflow:'hidden', border:'1px solid #3f3f46' }}>

        {/* ── Izquierda: todos los datos del movimiento ── */}
        <div style={{ flex:'0 0 420px', background:'#161616', overflowY:'auto', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderBottom:'1px solid #27272a', flexShrink:0 }}>
            <span style={{ color:'#a1a1aa', fontSize:12, fontWeight:600, flex:1 }}>Movimiento DB</span>
            {onEditarMovimiento && (
              <button onClick={() => onEditarMovimiento(m)}
                style={{ background:'transparent', border:'1px solid #3f3f46', color:'#71717a', borderRadius:6, padding:'2px 10px', fontSize:11, cursor:'pointer' }}>Editar</button>
            )}
          </div>
          <div style={{ padding:14, display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <p style={{ color:'white', fontWeight:700, fontSize:14, margin:'0 0 3px' }}>{m.nombre}</p>
              <p style={{ color:'#71717a', fontSize:11, margin:0 }}>{m.fecha} · {m.cuenta}</p>
            </div>
            {/* Importe / Base / Beneficio */}
            <div style={{ background:'#0d0d0d', borderRadius:10, padding:'10px 12px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <div>
                <p style={{ color:'#71717a', fontSize:10, fontWeight:600, textTransform:'uppercase', margin:'0 0 2px' }}>Importe</p>
                <p style={{ color:colMov, fontSize:18, fontWeight:700, margin:0 }}>{esIngreso?'+':'-'}{fmt(m.cantidad)}</p>
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ color:'#71717a', fontSize:10, fontWeight:600, textTransform:'uppercase', margin:'0 0 2px' }}>Base</p>
                <p style={{ color:'white', fontSize:14, fontWeight:600, margin:0 }}>{fmt(m.base_imponible)}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ color:'#71717a', fontSize:10, fontWeight:600, textTransform:'uppercase', margin:'0 0 2px' }}>Beneficio</p>
                <p style={{ color:(m.beneficio||0)>=0?'#22c55e':'#f87171', fontSize:14, fontWeight:600, margin:0 }}>{fmt(m.beneficio)}</p>
              </div>
            </div>
            {/* Campos en grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 16px' }}>
              <F label="Tipo"                value={m.tipo} />
              <F label="Cuenta"              value={m.cuenta} />
              <F label="IVA %"               value={m.iva} />
              <F label="IVA a pagar"         value={fmt(m.iva_a_pagar)} />
              <F label="IRPF %"              value={m.irpf} />
              <F label="IRPF a pagar"        value={fmt(m.irpf_a_pagar)} />
              <F label="IRPF retenido (yo)"  value={fmt(m.irpf_retenido_yo)} />
              <F label="Importe s/ factura"  value={fmt(m.importe_factura)} />
              <F label="Fecha movimiento"    value={m.fecha} />
              <F label="Fecha factura (DB)"  value={m.fecha_factura} />
              <F label="Clientes"            value={(m.clientes_info||[]).length ? m.clientes_info.map(c=>c.nombre).join(', ') : null} />
              <F label="Equipo"              value={(m.equipo_info||[]).length ? m.equipo_info.map(e=>e.nombre).join(', ') : null} />
            </div>
            {/* Categorías */}
            <div>
              <p style={{ color:'#52525b', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 6px' }}>Categorías</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {(m.categorias||[]).length > 0
                  ? m.categorias.map(c => <span key={c} style={{ background:'#27272a', color:'#a1a1aa', fontSize:11, padding:'2px 8px', borderRadius:5 }}>{c}</span>)
                  : <span style={{ color:'#3f3f46', fontSize:11 }}>—</span>
                }
              </div>
            </div>
            {/* Documentos vinculados */}
            <div>
              <p style={{ color:'#52525b', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 6px' }}>Documentos vinculados</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {(m.facturas_info||[]).length > 0
                  ? m.facturas_info.map(f => (
                      <span key={f.id} style={{ background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.25)', color:'#60a5fa', borderRadius:5, padding:'2px 8px', fontSize:11 }}>📄 {f.nombre}</span>
                    ))
                  : <span style={{ color:'#3f3f46', fontSize:11 }}>—</span>
                }
              </div>
            </div>
          </div>
        </div>

        <div style={{ width:1, background:'#27272a', flexShrink:0 }} />

        {/* ── Derecha: documento completo ── */}
        <div style={{ flex:1, background:'#111', display:'flex', flexDirection:'column', minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderBottom:'1px solid #27272a', flexShrink:0 }}>
            <span style={{ color:'#60a5fa', fontSize:12, fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fac.archivo_nombre}</span>
            {onEditarFactura && (
              <button onClick={() => onEditarFactura(fac)}
                style={{ background:'transparent', border:'1px solid #3f3f46', color:'#71717a', borderRadius:6, padding:'2px 10px', fontSize:11, cursor:'pointer', flexShrink:0 }}>Editar</button>
            )}
            <a href={fac.archivo_url} target="_blank" rel="noreferrer" style={{ color:'#60a5fa', fontSize:11, textDecoration:'none', flexShrink:0 }}>↗</a>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:16, lineHeight:1, padding:'0 4px', flexShrink:0 }}>✕</button>
          </div>
          {/* Metadata completa */}
          <div style={{ background:'#0d0d0d', borderBottom:'1px solid #1f1f1f', flexShrink:0, padding:'10px 14px', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              {fac.tipo && <span style={{ background:esGasto?'#f8717122':'#4ade8022', color:esGasto?'#f87171':'#4ade80', border:`1px solid ${esGasto?'#f8717144':'#4ade8044'}`, borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:600, flexShrink:0 }}>{esGasto?'Compra':'Venta'}</span>}
              {total !== 0 && <span style={{ color:colDoc, fontSize:16, fontWeight:700 }}>{esGasto?'-':'+'}{Math.abs(total).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span>}
              <span style={{ color:'#52525b', fontSize:11 }}>Base <span style={{ color:'#a1a1aa' }}>{Math.abs(base).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span></span>
              {iva !== 0 && <span style={{ color:'#52525b', fontSize:11 }}>IVA <span style={{ color:'#a1a1aa' }}>{Math.abs(iva).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span></span>}
              {irpf !== 0 && <span style={{ color:'#52525b', fontSize:11 }}>IRPF <span style={{ color:'#a1a1aa' }}>{Math.abs(irpf).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span></span>}
              {fac.estado && <span style={{ background:'#27272a', color:'#a1a1aa', fontSize:10, padding:'2px 7px', borderRadius:4, fontWeight:600 }}>{fac.estado}</span>}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'6px 14px' }}>
              <Fd label="Nº Factura"       value={fac.numero_factura} />
              <Fd label="Entidad"           value={fac.nombre_entidad} />
              <Fd label="NIF/CIF"           value={fac.nif_cif} />
              <Fd label="Fecha"             value={fac.fecha_factura} />
              <Fd label="Movs. vinculados"  value={(fac.movimiento_ids||[]).length > 0 ? `${fac.movimiento_ids.length} movimiento${fac.movimiento_ids.length!==1?'s':''}` : null} />
            </div>
          </div>
          {/* PDF o imagen */}
          {/\.(jpg|jpeg|png|gif|webp)$/i.test(fac.archivo_nombre||'')
            ? <img src={fac.archivo_url} alt="" style={{ flex:1, objectFit:'contain', width:'100%', height:'100%' }} />
            : <iframe src={fac.archivo_url} title="factura" style={{ flex:1, width:'100%', border:'none' }} />
          }
        </div>
      </div>
    </div>,
    document.body
  );
}
