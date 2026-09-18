import { useState, useEffect, useRef } from 'react';

// ── Desplegable multiselect con checkboxes ──────────────────────
export function MultiCheckDrop({ label, opciones, seleccionados, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    if (!open) { setQ(''); return; }
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  const etiqueta = seleccionados.length === 0 ? 'Ninguno'
    : seleccionados.length === 1
      ? (opciones.find(o => o.id === seleccionados[0])?.label || '1 seleccionado')
      : `${seleccionados.length} seleccionados`;
  const opcionesFiltradas = q ? opciones.filter(o => o.label.toLowerCase().includes(q.toLowerCase())) : opciones;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>{label}</label>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: '#27272a', border: '1px solid #3f3f46', color: seleccionados.length ? 'white' : '#71717a', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{etiqueta}</span>
        <span style={{ color: '#52525b', fontSize: 10, flexShrink: 0, marginLeft: 6 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 300, top: '100%', left: 0, right: 0, background: '#1c1c1e', border: '1px solid #3f3f46', borderRadius: 8, marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #27272a' }}>
            <input ref={inputRef} type="text" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Buscar..." onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'white', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {opcionesFiltradas.length === 0
              ? <p style={{ color: '#52525b', fontSize: 12, textAlign: 'center', padding: '12px 0', margin: 0 }}>Sin resultados</p>
              : opcionesFiltradas.map(o => {
                  const sel = seleccionados.includes(o.id);
                  return (
                    <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #27272a', background: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <input type="checkbox" checked={sel}
                        onChange={() => onChange(sel ? seleccionados.filter(id => id !== o.id) : [...seleccionados, o.id])}
                        style={{ accentColor: '#0067FD', width: 14, height: 14, flexShrink: 0 }} />
                      <span style={{ color: sel ? 'white' : '#a1a1aa', fontSize: 13 }}>{o.label}</span>
                    </label>
                  );
                })
            }
          </div>
        </div>
      )}
    </div>
  );
}
