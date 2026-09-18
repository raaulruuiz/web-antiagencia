import { useState } from 'react';

export function MultiCheckboxDropdown({ opciones, valores, onChange }) {
  const [open, setOpen] = useState(false);
  const vals = Array.isArray(valores) ? valores : [];
  const label = vals.length === 0 ? '— elige —' : vals.length === 1 ? vals[0] : `${vals.length} seleccionados`;
  return (
    <div style={{ position: 'relative' }}>
      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />}
      <button onClick={() => setOpen(p => !p)}
        style={{ background: '#161616', border: `1px solid ${vals.length > 0 ? '#0067FD' : '#3f3f46'}`, borderRadius: 6, color: vals.length > 0 ? '#0067FD' : '#a1a1aa', padding: '5px 10px', fontSize: 12, cursor: 'pointer', minWidth: 130, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 100, top: '100%', left: 0, marginTop: 4, background: '#161616', border: '1px solid #3f3f46', borderRadius: 8, minWidth: 200, maxHeight: 260, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {opciones.map(op => {
            const checked = vals.includes(op);
            return (
              <label key={op} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', cursor: 'pointer', background: checked ? '#1a1a2e' : 'transparent' }}
                onMouseEnter={e => { if (!checked) e.currentTarget.style.background = '#1f1f1f'; }}
                onMouseLeave={e => { e.currentTarget.style.background = checked ? '#1a1a2e' : 'transparent'; }}>
                <input type="checkbox" checked={checked} onChange={e => {
                  onChange(e.target.checked ? [...vals, op] : vals.filter(v => v !== op));
                }} style={{ accentColor: '#0067FD', cursor: 'pointer' }} />
                <span style={{ color: checked ? '#0067FD' : 'white', fontSize: 12 }}>{op}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
