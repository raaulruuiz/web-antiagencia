import { useState, useEffect, useRef } from 'react';

// ── Dropdown búsqueda de vínculos factura↔movimiento ───────────
export function VinculosDropdown({ seleccionados, opciones, cargando, onToggle, onClose }) {
  const [busqueda, setBusqueda] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  const q = busqueda.toLowerCase().trim();
  const filtradas = opciones.filter(o =>
    !q || (o.nombre||'').toLowerCase().includes(q) || (o.fecha||'').includes(q) || (o.subtitulo||'').toLowerCase().includes(q)
  );
  return (
    <div ref={ref} style={{ position:'absolute', zIndex:600, top:'100%', left:0, width:300, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.6)', padding:8 }}>
      <input autoFocus value={busqueda} onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o fecha…"
        style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'white', borderRadius:6, padding:'5px 8px', fontSize:12, outline:'none', boxSizing:'border-box', marginBottom:6 }} />
      {cargando
        ? <p style={{ color:'#52525b', fontSize:12, textAlign:'center', margin:8 }}>Cargando…</p>
        : <div style={{ maxHeight:240, overflowY:'auto' }}>
            {filtradas.length === 0
              ? <p style={{ color:'#52525b', fontSize:12, textAlign:'center', margin:8 }}>Sin resultados</p>
              : filtradas.map(o => {
                  const sel = seleccionados.includes(o.id);
                  return (
                    <div key={o.id} onClick={() => onToggle(o.id)}
                      style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'5px 6px', borderRadius:5, cursor:'pointer', background: sel ? 'rgba(99,102,241,0.12)' : 'transparent' }}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.background='#27272a'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = sel ? 'rgba(99,102,241,0.12)' : 'transparent'; }}>
                      <input type="checkbox" readOnly checked={sel} style={{ accentColor:'#818cf8', marginTop:2, flexShrink:0 }} />
                      <div>
                        <div style={{ fontSize:12, color: sel ? '#c4b5fd' : '#d4d4d8', fontWeight: sel ? 600 : 400 }}>{o.nombre || '—'}</div>
                        {o.subtitulo ? <div style={{ fontSize:10, color:'#52525b' }}>{o.subtitulo}</div> : o.fecha ? <div style={{ fontSize:11, color:'#52525b' }}>{o.fecha}</div> : null}
                      </div>
                    </div>
                  );
                })}
          </div>}
    </div>
  );
}
