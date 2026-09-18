import { createPortal } from 'react-dom';
import { fmt } from '../../utils';

export function ModalDetalleModelo({ modDetalle, setModDetalle, setFacturaViewerId }) {
  if (!modDetalle) return null;
  return createPortal(
        <div onClick={() => setModDetalle(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#111', border:'1px solid #3f3f46', borderRadius:12, width:'100%', maxWidth:700, maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{ background:'#1a1a1a', border:'1px solid #52525b', borderRadius:4, color:'#a78bfa', fontSize:11, fontWeight:700, padding:'2px 8px' }}>Mod.{modDetalle.num}</span>
              <span style={{ color:'#e4e4e7', fontSize:14, fontWeight:600 }}>{modDetalle.titulo}</span>
              <button onClick={() => setModDetalle(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 4px' }}>✕</button>
            </div>
            {/* Descripción + valor */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #27272a', flexShrink:0 }}>
              <p style={{ color:'#71717a', fontSize:12, margin:'0 0 8px' }}>{modDetalle.desc}</p>
              {!modDetalle.info && (
                <span style={{ color: modDetalle.valor > 0 ? '#f87171' : modDetalle.valor < 0 ? '#22c55e' : '#52525b', fontSize:22, fontWeight:700 }}>
                  {modDetalle.valor < 0 ? '−' : ''}{fmt(Math.abs(modDetalle.valor))}
                  {modDetalle.valorLabel && <span style={{ color:'#71717a', fontSize:12, fontWeight:400, marginLeft:6 }}>{modDetalle.valorLabel}</span>}
                </span>
              )}
              {modDetalle.info && <span style={{ color:'#52525b', fontSize:14, fontWeight:600 }}>Informativo</span>}
            </div>
            {/* Secciones de facturas */}
            <div style={{ overflowY:'auto', flex:1 }}>
              {modDetalle.secciones?.map((sec, si) => (
                <div key={si}>
                  <div style={{ padding:'8px 16px', background:'#0d0d0d', borderBottom:'1px solid #27272a', position:'sticky', top:0 }}>
                    <span style={{ color:'#a1a1aa', fontSize:11, fontWeight:700 }}>{sec.label}</span>
                  </div>
                  {sec.facturas.length === 0
                    ? <p style={{ color:'#3f3f46', fontSize:12, padding:'10px 16px', margin:0 }}>Sin facturas</p>
                    : sec.facturas.map((f, fi) => (
                      <div key={fi} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 16px', borderBottom:'1px solid #18181b' }}>
                        {/* Doc clicable */}
                        <div style={{ flex:'0 0 20px' }}>
                          {f.archivo_url
                            ? <button onClick={() => setFacturaViewerId(f.id)}
                                style={{ background:'none', border:'none', padding:0, cursor:'pointer', color:'#60a5fa', fontSize:14, lineHeight:1 }} title="Ver documento">📄</button>
                            : <span style={{ color:'#3f3f46', fontSize:14 }}>—</span>
                          }
                        </div>
                        {/* Entidad */}
                        <span style={{ flex:2, color:'#d4d4d8', fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {f.nombre_entidad || f.archivo_nombre || '—'}
                        </span>
                        {/* Fecha */}
                        <span style={{ flex:'0 0 80px', color:'#71717a', fontSize:11 }}>{f.fecha_factura || '—'}</span>
                        {/* Nº factura */}
                        <span style={{ flex:'0 0 90px', color:'#52525b', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.numero_factura || '—'}</span>
                        {/* Importe relevante */}
                        <span style={{ flex:'0 0 80px', textAlign:'right', color:'#a1a1aa', fontSize:12, fontWeight:600 }}>
                          {fmt(Math.abs(f[sec.campoImporte] || 0))}
                        </span>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
  );
}
