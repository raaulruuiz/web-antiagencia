import { useState } from 'react';
import { fmt } from '../../utils';

export function FacturaRow({ f, onDelete, selectable, selFacturas, setSelFacturas, setFacturaViewerId, eliminarFactura }) {
    const [hovered, setHovered] = useState(false);
    if (f._procesando) return (
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderBottom:'1px solid #27272a', fontSize:12 }}>
        <span style={{ color:'#52525b', fontSize:11 }}>📄</span>
        <span style={{ flex:1, color:'#71717a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.archivo_nombre}</span>
        <span style={{ color:'#f59e0b', fontSize:11, display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
          <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', border:'2px solid #f59e0b', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
          Extrayendo…
        </span>
        {onDelete && <button onClick={onDelete} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:14, padding:'0 2px', flexShrink:0 }}>✕</button>}
      </div>
    );
    if (f._error) return (
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderBottom:'1px solid #27272a', fontSize:12 }}>
        <span style={{ color:'#f87171', fontSize:11 }}>⚠️</span>
        <span style={{ flex:1, color:'#71717a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.archivo_nombre}</span>
        <span style={{ color:'#f87171', fontSize:11, flexShrink:0 }}>{f._error}</span>
        {onDelete && <button onClick={onDelete} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:14, padding:'0 2px', flexShrink:0 }}>✕</button>}
      </div>
    );
    const checked = selectable && selFacturas.has(f.id);
    return (
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderBottom:'1px solid #27272a', fontSize:12, flexWrap:'wrap', background: checked ? '#1a1a2e' : 'transparent' }}>
        {selectable && (
          <input type="checkbox" checked={checked} onChange={e => {
            setSelFacturas(prev => { const s = new Set(prev); e.target.checked ? s.add(f.id) : s.delete(f.id); return s; });
          }} style={{ accentColor:'#0067FD', cursor:'pointer', flexShrink:0, opacity: hovered || checked ? 1 : 0, transition:'opacity 0.15s' }} />
        )}
        <span style={{ color: f._warning ? '#f59e0b' : '#52525b', fontSize:11, minWidth:16 }} title={f._warning || undefined}>{f._warning ? '⚠️' : '📄'}</span>
        {f.archivo_url
          ? <button onClick={() => setFacturaViewerId(f.id)} style={{ flex:1, background:'none', border:'none', padding:0, color: f._warning ? '#fbbf24' : '#60a5fa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:100, textAlign:'left', cursor:'pointer', fontSize:12 }} title={f._warning || 'Ver documento'}>{f.archivo_nombre || '—'}</button>
          : <span style={{ flex:1, color: f._warning ? '#fbbf24' : '#a1a1aa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:100 }} title={f._warning || undefined}>{f.archivo_nombre || '—'}</span>
        }
        <span style={{ background: f.tipo==='ingreso' ? '#052e16' : '#1a0a0a', color: f.tipo==='ingreso' ? '#22c55e' : '#f87171', border: `1px solid ${f.tipo==='ingreso'?'#166534':'#7f1d1d'}`, borderRadius:4, padding:'1px 7px', fontSize:11, flexShrink:0 }}>
          {f.tipo === 'ingreso' ? 'Venta' : 'Compra'}
        </span>
        <span style={{ color:'#71717a', minWidth:88, flexShrink:0 }}>{f.fecha_factura || '—'}</span>
        <span style={{ color:'#d4d4d8', minWidth:60, flexShrink:0 }}>Nº {f.numero_factura || '—'}</span>
        <span style={{ color:'#71717a', minWidth:90, flexShrink:0 }}>{f.nif_cif || '—'}</span>
        <span style={{ color:'white', fontWeight:600, minWidth:75, textAlign:'right', flexShrink:0 }}>{f.importe != null ? fmt(f.importe)+' €' : '—'}</span>
        <span style={{ color:'#f59e0b', minWidth:65, textAlign:'right', flexShrink:0 }}>IVA {f.impuesto != null ? fmt(f.impuesto)+' €' : '—'}</span>
        {onDelete && <button onClick={onDelete} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:14, padding:'0 2px', flexShrink:0 }}>✕</button>}
        {!onDelete && f.id && <button onClick={() => eliminarFactura(f.id)} style={{ background:'none', border:'none', color:'#3f3f46', cursor:'pointer', fontSize:12, padding:'0 2px', flexShrink:0 }}>🗑</button>}
      </div>
    );
}
