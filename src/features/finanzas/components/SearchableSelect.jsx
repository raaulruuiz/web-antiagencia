import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function SearchableSelect({ value, onChange, options, placeholder = '— elegir —', style = {}, onClose }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [rect, setRect] = useState(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const selected = options.find(o => o.id === value);
  const filtered = options.filter(o =>
    !q || o.nombre.toLowerCase().includes(q.toLowerCase())
  );

  function openDropdown() {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (triggerRef.current?.contains(e.target) || dropdownRef.current?.contains(e.target)) return;
      setOpen(false); setQ(''); if (onClose) onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onClose]);

  const dropdown = open && rect && createPortal(
    <div ref={dropdownRef} style={{ position: 'fixed', top: rect.bottom + 2, left: rect.left, zIndex: 99999, background: '#1c1c1e', border: '1px solid #3f3f46', borderRadius: 6, minWidth: Math.max(rect.width, 200), width: 'max-content', maxWidth: 320, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..." autoFocus
        onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setQ(''); if (onClose) onClose(); } }}
        style={{ width: '100%', background: '#27272a', border: 'none', borderBottom: '1px solid #3f3f46', color: 'white', padding: '7px 10px', outline: 'none', fontSize: 12, boxSizing: 'border-box', borderRadius: '6px 6px 0 0' }} />
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        <div onMouseDown={e => e.preventDefault()} onClick={() => { onChange(''); setOpen(false); setQ(''); }}
          style={{ padding: '6px 10px', color: '#52525b', cursor: 'pointer', fontSize: 12 }}
          onMouseEnter={e => e.currentTarget.style.background = '#27272a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {placeholder}
        </div>
        {filtered.map(o => (
          <div key={o.id} onMouseDown={e => e.preventDefault()} onClick={() => { onChange(o.id); setOpen(false); setQ(''); }}
            style={{ padding: '6px 10px', color: o.id === value ? '#60a5fa' : '#d4d4d8', cursor: 'pointer', fontSize: 12, background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = '#27272a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {o.nombre}
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: '6px 10px', color: '#52525b', fontSize: 12 }}>Sin resultados</div>}
      </div>
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} style={{ position: 'relative', ...style }}>
      <div onClick={() => open ? (setOpen(false), setQ('')) : openDropdown()}
        style={{ background: '#27272a', border: '1px solid #3f3f46', borderRadius: 6, color: selected ? 'white' : '#52525b', padding: '4px 8px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected ? selected.nombre : placeholder}</span>
        <span style={{ flexShrink: 0, fontSize: 10, color: '#52525b' }}>▾</span>
      </div>
      {dropdown}
    </div>
  );
}
