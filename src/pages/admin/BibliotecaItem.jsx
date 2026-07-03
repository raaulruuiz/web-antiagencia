import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const API_BASE = 'https://automatizaciones-production-a376.up.railway.app';

// ── Colors ───────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  email: { bg: 'rgba(59,130,246,0.15)', border: '#3b82f6', text: '#93c5fd' },
  ficha: { bg: 'rgba(168,85,247,0.15)', border: '#a855f7', text: '#d8b4fe' },
};
const SUBCAT_COLORS = {
  automatizacion: { bg: 'rgba(34,197,94,0.12)', border: '#22c55e', text: '#86efac' },
  campana:        { bg: 'rgba(249,115,22,0.12)',  border: '#f97316', text: '#fdba74' },
};

const presetBtnStyle = (active) => ({
  padding: '4px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer', transition: 'all 0.1s',
  border: `1px solid ${active ? '#71717a' : '#27272a'}`,
  background: active ? '#27272a' : 'transparent',
  color: active ? 'white' : '#71717a',
});

// ── Tag palette for user-created tags ────────────────────────────────────────
const TAG_PALETTE = ['#6366f1','#8b5cf6','#a855f7','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#14b8a6','#78716c'];

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconEmail = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
  </svg>
);
const IconFicha = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
  </svg>
);
const IconSchema = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="6" height="5" rx="1"/><rect x="16" y="3" width="6" height="5" rx="1"/>
    <rect x="9" y="16" width="6" height="5" rx="1"/>
    <line x1="5" y1="8" x2="12" y2="16"/><line x1="19" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="5.5" x2="16" y2="5.5"/>
  </svg>
);
const IconSend = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconScissors = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconPencil = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconChain = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconImageBlock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IconImageText = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="10" height="10" rx="1"/><line x1="15" y1="6" x2="21" y2="6"/>
    <line x1="15" y1="10" x2="21" y2="10"/><line x1="3" y1="17" x2="21" y2="17"/><line x1="3" y1="21" x2="21" y2="21"/>
  </svg>
);
const IconCorrection = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const IconTrashSm = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);
const IconChevronUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconGrid = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const IconCarousel = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="12" height="16" rx="1"/><line x1="2" y1="9" x2="2" y2="15"/>
    <line x1="22" y1="9" x2="22" y2="15"/>
  </svg>
);

const CATEGORIAS = [
  { value: 'email', label: 'Email',            icon: <IconEmail /> },
  { value: 'ficha', label: 'Ficha de Producto', icon: <IconFicha /> },
];
const SUBCATEGORIAS = [
  { value: 'automatizacion', label: 'Automatización', icon: <IconSchema /> },
  { value: 'campana',        label: 'Campaña',         icon: <IconSend /> },
];

const ASPECT_PRESETS = [
  { label: '1:1',  ratio: 1 },
  { label: '9:16', ratio: 9 / 16 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '4:5',  ratio: 4 / 5 },
];
const RESIZE_HANDLES = [
  { id: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
  { id: 'n',  style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
  { id: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
  { id: 'e',  style: { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'e-resize' } },
  { id: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
  { id: 's',  style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
  { id: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
  { id: 'w',  style: { top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'w-resize' } },
];

// ── Block types ───────────────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { type: 'enlaces',     label: 'Enlace',          icon: <IconChain /> },
  { type: 'imagen',      label: 'Imagen',          icon: <IconImageBlock /> },
  { type: 'imagen_texto',label: 'Imagen + Texto',  icon: <IconImageText /> },
  { type: 'correccion',  label: 'Corrección',      icon: <IconCorrection /> },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function catLabel(v)    { return CATEGORIAS.find(c => c.value === v)?.label || v; }
function subcatLabel(v) { return SUBCATEGORIAS.find(s => s.value === v)?.label || v; }
function formatDate(v)  {
  if (!v) return '';
  return new Date(v + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Tag ───────────────────────────────────────────────────────────────────────
function Tag({ colors, label, onRemove }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>{label}</span>
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 2, display: 'flex' }} title="Quitar"><IconX /></button>
      )}
    </div>
  );
}

// ── CatButton grid (full-width) ───────────────────────────────────────────────
function CatButtons({ options, colors, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 12, width: '100%' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          style={{ flex: 1, height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px solid #3f3f46', borderRadius: 16, background: 'transparent', color: '#71717a', cursor: 'pointer', transition: 'all 0.15s', minWidth: 0 }}
          onMouseEnter={e => { const c = colors[opt.value]; e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.text; e.currentTarget.style.background = c.bg; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#71717a'; e.currentTarget.style.background = 'transparent'; }}
        >
          {opt.icon}
          <span style={{ fontSize: 13, textAlign: 'center' }}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Field with pencil (display mode) ─────────────────────────────────────────
function FieldRow({ label, savedValue, onSave, required = false, allowEmpty = true, type = 'text', placeholder, suggestions = [] }) {
  const [inputMode, setInputMode] = useState(false);
  const [inputVal, setInputVal]   = useState('');
  const [error, setError]         = useState('');
  const [showSugg, setShowSugg]   = useState(false);
  const inputRef = useRef(null);

  const isSet = savedValue !== null;
  const filteredSugg = suggestions.filter(s => inputVal.length > 0 && s.toLowerCase().includes(inputVal.toLowerCase()) && s !== inputVal);

  useEffect(() => { if (inputMode && inputRef.current) inputRef.current.focus(); }, [inputMode]);

  const startEdit = () => { setInputVal(isSet ? (savedValue || '') : ''); setError(''); setInputMode(true); };

  const handleConfirm = () => {
    const t = inputVal.trim();
    if (type === 'date') { if (!t) { setInputMode(false); return; } onSave(t); setInputMode(false); return; }
    if (required && !t) { setError('Obligatorio'); return; }
    if (!allowEmpty && !t) { setInputMode(false); return; }
    onSave(t); setInputMode(false); setError('');
  };

  const handleCancel = () => { setInputMode(false); setError(''); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleConfirm(); } if (e.key === 'Escape') handleCancel(); };

  if (!isSet && !inputMode) {
    return (
      <button onClick={startEdit}
        style={{ background: 'none', border: '1px dashed #27272a', color: '#3f3f46', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', alignSelf: 'flex-start' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#52525b'; e.currentTarget.style.color = '#71717a'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#3f3f46'; }}>
        <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> {label}
      </button>
    );
  }

  if (isSet && !inputMode) {
    const display = type === 'date' && savedValue ? formatDate(savedValue) : savedValue;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
          <button onClick={startEdit}
            style={{ background: 'none', border: 'none', color: '#3f3f46', cursor: 'pointer', padding: '2px 4px', display: 'flex', borderRadius: 4, transition: 'color 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#71717a'}
            onMouseLeave={e => e.currentTarget.style.color = '#3f3f46'}
            title={`Editar ${label}`}><IconPencil /></button>
        </div>
        <div style={{ fontSize: 13, color: display ? 'white' : '#71717a', padding: '4px 0', fontStyle: display ? 'normal' : 'italic', borderBottom: '1px solid #27272a' }}>
          {display || '(Vacío)'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {isSet && <span style={{ fontSize: 11, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input ref={inputRef} type={type} value={inputVal}
            onChange={e => { setInputVal(e.target.value); setShowSugg(true); setError(''); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSugg(true)}
            onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            placeholder={placeholder || label + '…'}
            style={{ flex: 1, background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '7px 10px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
          <button onClick={handleConfirm} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}><IconCheck /></button>
          <button onClick={handleCancel} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}><IconX /></button>
        </div>
        {showSugg && filteredSugg.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 40, background: '#1a1a1a', border: '1px solid #27272a', borderRadius: 8, marginTop: 4, zIndex: 20, overflow: 'hidden' }}>
            {filteredSugg.slice(0, 6).map(s => (
              <div key={s} onMouseDown={() => { setInputVal(s); setShowSugg(false); }}
                style={{ padding: '7px 12px', fontSize: 13, color: 'white', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{s}</div>
            ))}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>}
    </div>
  );
}

// ── TagColorEditor ────────────────────────────────────────────────────────────
function TagColorEditor({ tag, onUpdate, onClose }) {
  const [hex, setHex] = useState(tag.color);

  const apply = (color) => { onUpdate(tag.id, color); onClose(); };

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #27272a', borderRadius: 10, padding: '12px', marginTop: 6 }}>
      <p style={{ fontSize: 11, color: '#71717a', margin: '0 0 8px' }}>Color de <span style={{ color: 'white' }}>"{tag.name}"</span></p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {TAG_PALETTE.map(c => (
          <button key={c} onClick={() => { setHex(c); apply(c); }}
            style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: `2px solid ${c.toLowerCase() === hex.toLowerCase() ? 'white' : 'transparent'}`, cursor: 'pointer', transition: 'border-color 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.toLowerCase() === hex.toLowerCase() ? 'white' : 'transparent'} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: '#111', border: '1px solid #3f3f46', borderRadius: 7, padding: '5px 8px' }}>
          <label style={{ position: 'relative', width: 14, height: 14, flexShrink: 0, cursor: 'pointer' }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: /^#[0-9a-f]{3,6}$/i.test(hex) ? hex : '#888', display: 'block' }} />
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#888888'} onChange={e => setHex(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none', padding: 0 }} />
          </label>
          <input value={hex} onChange={e => setHex(e.target.value)} placeholder="#6366f1"
            style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} />
        </div>
        <button onClick={() => apply(hex)}
          style={{ background: 'white', color: 'black', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Aplicar</button>
        <button onClick={onClose}
          style={{ background: 'none', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 7, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
}

// ── TagEditor (extends TagColorEditor — adds name field) ──────────────────────
function TagEditor({ tag, onUpdate, onClose }) {
  const [name, setName] = useState(tag.name);
  const [hex, setHex]   = useState(tag.color);

  const apply = (color) => {
    const n = name.trim() || tag.name;
    onUpdate(tag.id, { name: n, color });
    onClose();
  };

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #27272a', borderRadius: 10, padding: '12px', marginTop: 6 }}>
      <p style={{ fontSize: 11, color: '#71717a', margin: '0 0 8px' }}>Editar etiqueta</p>
      {/* Name field */}
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nombre…"
        style={{ width: '100%', background: '#111', border: '1px solid #3f3f46', borderRadius: 7, padding: '5px 8px', fontSize: 12, color: 'white', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {TAG_PALETTE.map(c => (
          <button key={c} onClick={() => setHex(c)}
            style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: `2px solid ${c.toLowerCase() === hex.toLowerCase() ? 'white' : 'transparent'}`, cursor: 'pointer', transition: 'border-color 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.toLowerCase() === hex.toLowerCase() ? 'white' : 'transparent'} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: '#111', border: '1px solid #3f3f46', borderRadius: 7, padding: '5px 8px' }}>
          <label style={{ position: 'relative', width: 14, height: 14, flexShrink: 0, cursor: 'pointer' }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: /^#[0-9a-f]{3,6}$/i.test(hex) ? hex : '#888', display: 'block' }} />
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#888888'} onChange={e => setHex(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none', padding: 0 }} />
          </label>
          <input value={hex} onChange={e => setHex(e.target.value)} placeholder="#6366f1"
            style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} />
        </div>
        <button onClick={() => apply(hex)}
          style={{ background: 'white', color: 'black', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Aplicar</button>
        <button onClick={onClose}
          style={{ background: 'none', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 7, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
}

// ── TagPicker ─────────────────────────────────────────────────────────────────
function TagPicker({ selectedIds, allTags, subcategoria, onAdd, onRemove, onCreateTag, onUpdateTag, onDeleteTag, onUpdateTagColor }) {
  const [input, setInput]       = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [hoverTagId, setHoverTagId] = useState(null);
  const inputRef = useRef(null);

  const scopedTags = subcategoria ? allTags.filter(t => !t.subcategoria || t.subcategoria === subcategoria) : allTags;
  const available  = scopedTags.filter(t => !selectedIds.includes(t.id));
  const filtered   = input.length > 0 ? available.filter(t => t.name.toLowerCase().includes(input.toLowerCase())) : available;
  const exactMatch = scopedTags.find(t => t.name.toLowerCase() === input.trim().toLowerCase());
  const canCreate  = input.trim().length > 0 && !exactMatch;

  const handleSelect = (tag) => { onAdd(tag.id); setInput(''); setShowDrop(false); setShowInput(false); };

  const handleCreate = () => {
    const color = TAG_PALETTE[Math.floor(Math.random() * TAG_PALETTE.length)];
    onCreateTag(input.trim(), color, subcategoria);
    setInput('');
    setShowDrop(false);
    setShowInput(false);
  };

  const openInput = () => {
    setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Selected tags + add button */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
        {selectedIds.map(id => {
          const tag = allTags.find(t => t.id === id);
          if (!tag) return null;
          const isEditing = editingTag?.id === tag.id;
          return (
            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '2px 6px 2px 8px', background: tag.color + '22', border: `1px solid ${tag.color}`, color: tag.color }}>
              {tag.name}
              {(onUpdateTag || onUpdateTagColor) && (
                <button onClick={() => setEditingTag(isEditing ? null : tag)}
                  style={{ background: 'none', border: 'none', color: tag.color, cursor: 'pointer', padding: '0 1px', display: 'flex', opacity: isEditing ? 1 : 0.5, lineHeight: 1 }}
                  title="Editar">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )}
              <button onClick={() => onRemove(id)} style={{ background: 'none', border: 'none', color: tag.color, cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7, lineHeight: 1, fontSize: 14 }}>×</button>
            </span>
          );
        })}
        {!showInput && (
          <button onClick={openInput} title="Añadir etiqueta"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', border: '1px solid #3f3f46', background: 'none', color: '#71717a', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
            +
          </button>
        )}
      </div>
      {/* Editor for selected tag */}
      {editingTag && onUpdateTag && (
        <TagEditor tag={editingTag} onUpdate={onUpdateTag} onClose={() => setEditingTag(null)} />
      )}
      {editingTag && !onUpdateTag && onUpdateTagColor && (
        <TagColorEditor tag={editingTag} onUpdate={onUpdateTagColor} onClose={() => setEditingTag(null)} />
      )}
      {/* Input (shown only when + clicked) */}
      {showInput && <div style={{ position: 'relative' }}>
        <input ref={inputRef} value={input}
          onChange={e => { setInput(e.target.value); setShowDrop(true); }}
          onFocus={() => setShowDrop(true)}
          onBlur={() => setTimeout(() => { setShowDrop(false); if (!input.trim()) setShowInput(false); }, 150)}
          placeholder="Añadir etiqueta…"
          style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: 'white', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
        />
        {showDrop && (filtered.length > 0 || canCreate) && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '1px solid #27272a', borderRadius: 8, marginTop: 4, zIndex: 30, overflow: 'hidden' }}>
            {filtered.slice(0, 6).map(tag => (
              <div key={tag.id}
                onMouseDown={() => handleSelect(tag)}
                onMouseEnter={() => setHoverTagId(tag.id)}
                onMouseLeave={() => setHoverTagId(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 12, background: hoverTagId === tag.id ? '#27272a' : 'transparent' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color, flexShrink: 0 }} />
                <span style={{ color: 'white', flex: 1 }}>{tag.name}</span>
                {hoverTagId === tag.id && (
                  <span style={{ display: 'flex', gap: 4 }}>
                    {onUpdateTag && (
                      <button
                        onMouseDown={e => { e.stopPropagation(); setEditingTag(tag); setShowDrop(false); }}
                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 2, display: 'flex' }}
                        title="Editar">
                        <IconPencil />
                      </button>
                    )}
                    {onDeleteTag && (
                      <button
                        onMouseDown={e => { e.stopPropagation(); onDeleteTag(tag.id); }}
                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 2, display: 'flex' }}
                        title="Eliminar">
                        <IconTrashSm />
                      </button>
                    )}
                  </span>
                )}
              </div>
            ))}
            {canCreate && (
              <div onMouseDown={handleCreate}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 12, borderTop: filtered.length > 0 ? '1px solid #27272a' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ color: '#71717a' }}>Crear</span>
                <span style={{ color: 'white', fontWeight: 500 }}>"{input.trim()}"</span>
                <span style={{ color: '#3f3f46', fontSize: 10, marginLeft: 'auto' }}>color aleatorio</span>
              </div>
            )}
          </div>
        )}
      </div>}
    </div>
  );
}

// ── Crop overlay (dual mode) ──────────────────────────────────────────────────
function CropOverlay({ imageUrl, onCrop, onCancel }) {
  const [mode, setMode]               = useState('libre');
  const [freeDrag, setFreeDrag]       = useState(null);
  const [freeRect, setFreeRect]       = useState(null);
  const [cropBox, setCropBox]         = useState(null);
  const [dragHandle, setDragHandle]   = useState(null);
  const [aspectRatio, setAspectRatio] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const up = () => { setDragHandle(null); setFreeDrag(null); };
    document.addEventListener('mouseup', up);
    return () => document.removeEventListener('mouseup', up);
  }, []);

  const initCropBox = useCallback(() => {
    if (!imgRef.current) return;
    const b = imgRef.current.getBoundingClientRect();
    if (b.width === 0) return;
    const w = b.width * 0.75; const h = b.height * 0.65;
    setCropBox({ x: (b.width - w) / 2, y: (b.height - h) / 2, w, h });
  }, []);

  useEffect(() => {
    if (mode === 'ajustar') { setCropBox(null); setAspectRatio(null); requestAnimationFrame(() => requestAnimationFrame(initCropBox)); }
    else setFreeRect(null);
  }, [mode, initCropBox]);

  const applyPreset = (ratio) => {
    setAspectRatio(ratio);
    if (!imgRef.current) return;
    const b = imgRef.current.getBoundingClientRect();
    const cur = cropBox || { x: b.width*0.1, y: b.height*0.1, w: b.width*0.8, h: b.height*0.8 };
    const cx = cur.x + cur.w/2; const cy = cur.y + cur.h/2;
    let w = cur.w; let h = ratio ? w/ratio : cur.h;
    if (h > b.height*0.95) { h = b.height*0.95; w = ratio ? h*ratio : w; }
    if (w > b.width*0.95)  { w = b.width*0.95;  h = ratio ? w/ratio : h; }
    setCropBox({ x: Math.max(0, Math.min(cx-w/2, b.width-w)), y: Math.max(0, Math.min(cy-h/2, b.height-h)), w, h });
  };

  const handleMouseMove = (e) => {
    if (mode === 'libre') {
      if (!freeDrag || !imgRef.current) return;
      const b = imgRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - b.left, b.width));
      const y = Math.max(0, Math.min(e.clientY - b.top,  b.height));
      setFreeRect({ x: Math.min(freeDrag.sx, x), y: Math.min(freeDrag.sy, y), w: Math.abs(x-freeDrag.sx), h: Math.abs(y-freeDrag.sy) });
    } else {
      if (!dragHandle || !imgRef.current) return;
      const ir = imgRef.current.getBoundingClientRect();
      const dx = (e.clientX - ir.left) - dragHandle.startRelX;
      const dy = (e.clientY - ir.top)  - dragHandle.startRelY;
      const b = dragHandle.startBox; const r = aspectRatio; const MIN = 30;
      let { x, y, w, h } = b;
      switch (dragHandle.type) {
        case 'move': x = Math.max(0,Math.min(b.x+dx,ir.width-b.w)); y = Math.max(0,Math.min(b.y+dy,ir.height-b.h)); break;
        case 'se': w=Math.max(MIN,Math.min(b.w+dx,ir.width-b.x)); h=r?w/r:Math.max(MIN,Math.min(b.h+dy,ir.height-b.y)); if(r&&b.y+h>ir.height){h=ir.height-b.y;w=h*r;} break;
        case 'sw': w=Math.max(MIN,Math.min(b.w-dx,b.x+b.w)); x=b.x+b.w-w; h=r?w/r:Math.max(MIN,Math.min(b.h+dy,ir.height-b.y)); if(r&&b.y+h>ir.height){h=ir.height-b.y;w=h*r;x=b.x+b.w-w;} break;
        case 'ne': w=Math.max(MIN,Math.min(b.w+dx,ir.width-b.x)); h=r?w/r:Math.max(MIN,Math.min(b.h-dy,b.y+b.h)); y=b.y+b.h-h; if(r&&y<0){h=b.y+b.h;w=h*r;y=0;} break;
        case 'nw': w=Math.max(MIN,Math.min(b.w-dx,b.x+b.w)); x=b.x+b.w-w; h=r?w/r:Math.max(MIN,Math.min(b.h-dy,b.y+b.h)); y=b.y+b.h-h; if(r&&y<0){h=b.y+b.h;w=h*r;x=b.x+b.w-w;y=0;} break;
        case 'e': w=Math.max(MIN,Math.min(b.w+dx,ir.width-b.x)); if(r){h=w/r;y=b.y+b.h/2-h/2;} break;
        case 'w': w=Math.max(MIN,Math.min(b.w-dx,b.x+b.w)); x=b.x+b.w-w; if(r){h=w/r;y=b.y+b.h/2-h/2;} break;
        case 'n': h=Math.max(MIN,Math.min(b.h-dy,b.y+b.h)); y=b.y+b.h-h; if(r){w=h*r;x=b.x+b.w/2-w/2;} break;
        case 's': h=Math.max(MIN,Math.min(b.h+dy,ir.height-b.y)); if(r){w=h*r;x=b.x+b.w/2-w/2;} break;
        default: break;
      }
      x=Math.max(0,x); y=Math.max(0,y); w=Math.min(w,ir.width-x); h=Math.min(h,ir.height-y);
      setCropBox({ x, y, w, h });
    }
  };

  const handleMouseUp = () => {
    if (mode === 'libre' && freeDrag && freeRect && freeRect.w >= 10 && freeRect.h >= 10) {
      const b=imgRef.current.getBoundingClientRect();
      const sx=imgRef.current.naturalWidth/b.width; const sy=imgRef.current.naturalHeight/b.height;
      onCrop({ x:Math.round(freeRect.x*sx), y:Math.round(freeRect.y*sy), w:Math.round(freeRect.w*sx), h:Math.round(freeRect.h*sy) });
    }
    setFreeDrag(null); setDragHandle(null);
  };

  const confirmResize = () => {
    if (!cropBox || !imgRef.current) return;
    const b=imgRef.current.getBoundingClientRect();
    const sx=imgRef.current.naturalWidth/b.width; const sy=imgRef.current.naturalHeight/b.height;
    onCrop({ x:Math.round(cropBox.x*sx), y:Math.round(cropBox.y*sy), w:Math.round(cropBox.w*sx), h:Math.round(cropBox.h*sy) });
  };

  const startHandleDrag = (e, type) => {
    e.preventDefault(); e.stopPropagation();
    if (!imgRef.current) return;
    const ir = imgRef.current.getBoundingClientRect();
    setDragHandle({ type, startRelX: e.clientX-ir.left, startRelY: e.clientY-ir.top, startBox: { ...cropBox } });
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.92)', display:'flex', flexDirection:'column', alignItems:'center', userSelect:'none' }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div style={{ padding:'16px 0 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
        <div style={{ display:'flex', background:'#1a1a1a', border:'1px solid #27272a', borderRadius:10, padding:3, gap:2 }}>
          {[{id:'libre',label:'Recorte libre'},{id:'ajustar',label:'Ajustar tamaño'}].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ padding:'5px 14px', fontSize:12, borderRadius:7, border:'none', cursor:'pointer', transition:'all 0.15s', background:mode===m.id?'#27272a':'transparent', color:mode===m.id?'white':'#71717a' }}>{m.label}</button>
          ))}
        </div>
        {mode === 'ajustar' && (
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontSize:11, color:'#52525b' }}>Proporción:</span>
            <button onClick={() => setAspectRatio(null)} style={presetBtnStyle(aspectRatio === null)}>Libre</button>
            {ASPECT_PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p.ratio)} style={presetBtnStyle(Math.abs((aspectRatio||0)-p.ratio)<0.001)}>{p.label}</button>
            ))}
          </div>
        )}
        {mode === 'libre' && <p style={{ color:'#71717a', fontSize:12, margin:0 }}>Arrastra sobre la imagen para seleccionar el área</p>}
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', width:'100%', overflow:'hidden', padding:'0 40px' }}>
        <div style={{ position:'relative', display:'inline-block' }}>
          <img ref={imgRef} src={imageUrl} crossOrigin="anonymous" alt="recortar"
            onLoad={mode==='ajustar'?initCropBox:undefined}
            style={{ maxWidth:'80vw', maxHeight:'62vh', display:'block', cursor:mode==='libre'?'crosshair':'default' }}
            onMouseDown={mode==='libre'?(e)=>{ e.preventDefault(); const b=imgRef.current.getBoundingClientRect(); setFreeDrag({sx:e.clientX-b.left,sy:e.clientY-b.top}); setFreeRect(null); }:undefined}
            draggable={false} />
          {mode==='libre' && freeRect && freeRect.w>0 && freeRect.h>0 && (
            <div style={{ position:'absolute', border:'2px solid white', boxShadow:'0 0 0 9999px rgba(0,0,0,0.5)', pointerEvents:'none', left:freeRect.x, top:freeRect.y, width:freeRect.w, height:freeRect.h }} />
          )}
          {mode==='ajustar' && cropBox && (
            <div onMouseDown={e => startHandleDrag(e,'move')}
              style={{ position:'absolute', left:cropBox.x, top:cropBox.y, width:cropBox.w, height:cropBox.h, border:'2px solid white', boxShadow:'0 0 0 9999px rgba(0,0,0,0.55)', cursor:'move', boxSizing:'border-box' }}>
              <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
                {['33.33%','66.66%'].map(p => <div key={'h'+p} style={{ position:'absolute', top:p, left:0, right:0, borderTop:'1px solid rgba(255,255,255,0.25)' }} />)}
                {['33.33%','66.66%'].map(p => <div key={'v'+p} style={{ position:'absolute', left:p, top:0, bottom:0, borderLeft:'1px solid rgba(255,255,255,0.25)' }} />)}
              </div>
              {RESIZE_HANDLES.map(h => (
                <div key={h.id} onMouseDown={e => startHandleDrag(e,h.id)}
                  style={{ position:'absolute', width:10, height:10, background:'white', borderRadius:2, ...h.style }} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ padding:'12px 0 20px', display:'flex', gap:10, alignItems:'center' }}>
        <button onClick={onCancel} style={{ background:'transparent', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:999, padding:'7px 18px', fontSize:13, cursor:'pointer' }}>Cancelar</button>
        {mode==='ajustar' && cropBox && (
          <button onClick={confirmResize} style={{ background:'white', color:'black', border:'none', borderRadius:999, padding:'7px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Confirmar recorte</button>
        )}
      </div>
    </div>
  );
}

// ── Image modal ───────────────────────────────────────────────────────────────
function ImageModal({ imageUrl, alt, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'32px 24px' }} onClick={onClose}>
      <div style={{ position:'relative', maxWidth:900, width:'100%' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:-36, right:0, background:'transparent', border:'none', color:'#a1a1aa', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6 }}><IconX /> Cerrar</button>
        <img src={imageUrl} alt={alt} style={{ width:'100%', borderRadius:12, display:'block' }} />
      </div>
    </div>
  );
}

// ── Crop confirm modal ────────────────────────────────────────────────────────
function CropConfirmModal({ previewUrl, onConfirm, onCancel, saving }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#1a1a1a', border:'1px solid #27272a', borderRadius:16, padding:24, maxWidth:480, width:'100%', display:'flex', flexDirection:'column', gap:16 }}>
        <p style={{ color:'white', fontSize:15, fontWeight:500, margin:0 }}>¿Guardar este recorte?</p>
        <p style={{ color:'#71717a', fontSize:12, margin:0 }}>Esta acción reemplazará la imagen original.</p>
        <img src={previewUrl} alt="recorte" style={{ width:'100%', borderRadius:8, border:'1px solid #27272a', maxHeight:320, objectFit:'contain' }} />
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} disabled={saving} style={{ background:'transparent', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:999, padding:'7px 18px', fontSize:13, cursor:'pointer' }}>Cancelar</button>
          <button onClick={onConfirm} disabled={saving} style={{ background:saving?'#3f3f46':'white', color:saving?'#a1a1aa':'black', border:'none', borderRadius:999, padding:'7px 18px', fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:6 }}>
            {saving && <div style={{ width:12, height:12, border:'2px solid #71717a', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />}
            {saving ? 'Guardando…' : 'Sí, guardar'}
          </button>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ── Discard confirm modal ─────────────────────────────────────────────────────
function DiscardModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={onCancel}>
      <div style={{ background:'#1a1a1a', border:'1px solid #3f3f46', borderRadius:16, padding:24, maxWidth:320, width:'100%', display:'flex', flexDirection:'column', gap:12 }} onClick={e => e.stopPropagation()}>
        <p style={{ color:'white', fontSize:14, fontWeight:500, margin:0 }}>¿Eliminar esta captura?</p>
        <p style={{ color:'#71717a', fontSize:12, margin:0 }}>Esta acción no se puede deshacer.</p>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ background:'transparent', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:8, padding:'7px 16px', fontSize:12, cursor:'pointer' }}>Cancelar</button>
          <button onClick={onConfirm} style={{ background:'#dc2626', border:'none', color:'white', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ── Auth helper ───────────────────────────────────────────────────────────────
async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// ── Block: divider ────────────────────────────────────────────────────────────
function BlockDivider({ onAdd }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0', cursor: 'pointer', opacity: hover ? 1 : 0, transition: 'opacity 0.15s' }}
      onClick={onAdd}>
      <div style={{ flex: 1, height: 1, background: '#27272a' }} />
      <span style={{ fontSize: 11, color: '#3f3f46', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> bloque
      </span>
      <div style={{ flex: 1, height: 1, background: '#27272a' }} />
    </div>
  );
}

// ── Block: selector panel ─────────────────────────────────────────────────────
const BLOCK_COLORS = { enlaces: '#3b82f6', imagen: '#22c55e', imagen_texto: '#f97316', correccion: '#a855f7' };
const DEFAULT_TITLES = { enlaces: 'Enlaces del Correo', imagen: 'Imágenes del Correo', imagen_texto: 'Análisis y Comentarios', correccion: 'Cómo lo Reescribiría Yo' };

function BlockSelector({ onSelect, hasCorreccion, onClose }) {
  return (
    <div style={{ background: '#111', border: '1px solid #27272a', borderRadius: 14, padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>Añadir bloque</span>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', display: 'flex', padding: 2 }}><IconX /></button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {BLOCK_TYPES.map(bt => {
          const disabled = bt.type === 'correccion' && hasCorreccion;
          const c = BLOCK_COLORS[bt.type];
          return (
            <button key={bt.type} onClick={() => !disabled && onSelect(bt.type)} disabled={disabled}
              style={{ height: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: `1px solid ${disabled ? '#27272a' : '#3f3f46'}`, borderRadius: 12, background: 'transparent', color: disabled ? '#3f3f46' : '#71717a', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: disabled ? 0.4 : 1 }}
              onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = c; e.currentTarget.style.color = c; e.currentTarget.style.background = c + '11'; }}}
              onMouseLeave={e => { if (!disabled) { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#71717a'; e.currentTarget.style.background = 'transparent'; }}}>
              <span style={{ color: 'inherit' }}>{bt.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'inherit' }}>{bt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Block: card ───────────────────────────────────────────────────────────────
function BlockCard({ block, index, total, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const bt = BLOCK_TYPES.find(b => b.type === block.type);
  const c = BLOCK_COLORS[block.type] || '#71717a';
  const isCorreccion = block.type === 'correccion';
  const imgs = block.images || [];

  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 10, overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1a1a1a' }}>
        <span style={{ color: c, display: 'flex', flexShrink: 0 }}>{bt?.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: 'white', fontWeight: 500 }}>{block.titulo || bt?.label}</span>
          {block.subtitulo && <span style={{ fontSize: 11, color: '#52525b', marginLeft: 6 }}>{block.subtitulo}</span>}
        </div>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
          {!isCorreccion && (
            <>
              <button onClick={onMoveUp} disabled={index === 0}
                style={{ background: 'none', border: 'none', color: index === 0 ? '#27272a' : '#52525b', cursor: index === 0 ? 'default' : 'pointer', padding: 3, display: 'flex' }}>
                <IconChevronUp />
              </button>
              <button onClick={onMoveDown} disabled={index === total - 1}
                style={{ background: 'none', border: 'none', color: index === total - 1 ? '#27272a' : '#52525b', cursor: index === total - 1 ? 'default' : 'pointer', padding: 3, display: 'flex' }}>
                <IconChevronDown />
              </button>
            </>
          )}
          <button onClick={onEdit}
            style={{ background: 'none', border: '1px solid #27272a', color: '#71717a', cursor: 'pointer', padding: '3px 8px', borderRadius: 6, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#52525b'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#71717a'; }}>
            <IconPencil /> Editar
          </button>
          <button onClick={onDelete}
            style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 3, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#52525b'}>
            <IconTrashSm />
          </button>
        </div>
      </div>

      {/* Content preview */}
      {block.type === 'enlaces' && (
        <div style={{ padding: '14px 14px 14px' }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{block.titulo || 'Enlace'}</div>
            {block.subtitulo && <div style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>{block.subtitulo}</div>}
          </div>
          {/* Link previews */}
          {(block.links || (block.url ? [{ images: block.images || [], url: block.url }] : [])).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(block.links || (block.url ? [{ images: block.images || [], url: block.url }] : [])).map((link, li) => (
                <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {(link.images || []).map((img, i) => (
                    <a key={i} href={link.url || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', flexShrink: 0 }}>
                      <img src={img.url} alt="" style={{ height: 64, borderRadius: 5, objectFit: 'cover', border: '1px solid #27272a', display: 'block' }} />
                    </a>
                  ))}
                  {link.url && (
                    <>
                      <span style={{ fontSize: 18, color: '#3b82f6', fontWeight: 300 }}>→</span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', wordBreak: 'break-all' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                        {link.url}
                      </a>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: '#3f3f46', fontStyle: 'italic' }}>Sin links configurados</span>
          )}
        </div>
      )}

      {block.type === 'imagen' && imgs.length > 0 && (
        <div style={{ padding: '12px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {imgs.map((img, i) => (
            <img key={i} src={img.url} alt="" style={{ height: 64, borderRadius: 5, objectFit: 'cover', border: '1px solid #27272a' }} />
          ))}
        </div>
      )}

      {block.type === 'imagen_texto' && (
        <div style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {imgs.length > 0 && <img src={imgs[0].url} alt="" style={{ height: 60, borderRadius: 5, objectFit: 'cover', border: '1px solid #27272a', flexShrink: 0 }} />}
          {block.texto && <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{block.texto}</p>}
          {!imgs.length && !block.texto && <span style={{ fontSize: 12, color: '#3f3f46', fontStyle: 'italic' }}>Sin contenido</span>}
        </div>
      )}

      {block.type === 'correccion' && block.nota && (
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{block.nota}</p>
        </div>
      )}
    </div>
  );
}

// ── Block: editor modal ───────────────────────────────────────────────────────
function BlockEditorModal({ block, onSave, onClose, onUploadImage, onCropFromEmail, libraryImages }) {
  const [draft, setDraft] = useState(() => {
    const d = { ...block };
    // Migrate old enlaces structure to new links structure
    if (d.type === 'enlaces' && !d.links?.length) {
      d.links = [{ images: d.images || [], url: d.url || '' }];
    }
    if (d.type === 'enlaces' && !d.links) d.links = [{ images: [], url: '' }];
    return d;
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingLink, setUploadingLink] = useState(null); // linkIdx
  const [urlErrors, setUrlErrors] = useState({});
  const [showLibrary, setShowLibrary] = useState(null); // null | 'global' | linkIdx (number)
  const fileInputRef = useRef(null);
  const linkFileInputRefs = useRef({});

  const update = (field, val) => setDraft(d => ({ ...d, [field]: val }));

  // Global images (for non-enlaces types)
  const addImage = (url) => setDraft(d => ({ ...d, images: [...(d.images || []), { url }] }));
  const removeImage = (idx) => setDraft(d => ({ ...d, images: (d.images || []).filter((_, i) => i !== idx) }));

  // Per-link image management (for enlaces)
  const addLinkImage = (linkIdx, url) => setDraft(d => {
    const links = [...(d.links || [])];
    links[linkIdx] = { ...links[linkIdx], images: [...(links[linkIdx].images || []), { url }] };
    return { ...d, links };
  });
  const removeLinkImage = (linkIdx, imgIdx) => setDraft(d => {
    const links = [...(d.links || [])];
    links[linkIdx] = { ...links[linkIdx], images: (links[linkIdx].images || []).filter((_, i) => i !== imgIdx) };
    return { ...d, links };
  });
  const updateLinkUrl = (linkIdx, url) => {
    setDraft(d => {
      const links = [...(d.links || [])];
      links[linkIdx] = { ...links[linkIdx], url };
      return { ...d, links };
    });
    setUrlErrors(e => { const n = { ...e }; delete n[linkIdx]; return n; });
  };
  const addLink = () => setDraft(d => ({ ...d, links: [...(d.links || []), { images: [], url: '' }] }));
  const removeLink = (linkIdx) => setDraft(d => ({ ...d, links: (d.links || []).filter((_, i) => i !== linkIdx) }));

  // Upload global image
  const handleFile = async (file) => {
    if (!file || uploading) return;
    setUploading(true);
    try { const url = await onUploadImage(file); addImage(url); }
    catch (e) { alert('Error al subir imagen'); }
    finally { setUploading(false); }
  };

  const handleCrop = async () => {
    if (uploading) return;
    setUploading(true);
    try { const url = await onCropFromEmail(); if (url) addImage(url); }
    catch (_) {}
    finally { setUploading(false); }
  };

  // Upload link image
  const handleLinkFile = async (linkIdx, file) => {
    if (!file || uploadingLink !== null) return;
    setUploadingLink(linkIdx);
    try { const url = await onUploadImage(file); addLinkImage(linkIdx, url); }
    catch (e) { alert('Error al subir imagen'); }
    finally { setUploadingLink(null); }
  };

  const handleLinkCrop = async (linkIdx) => {
    if (uploadingLink !== null) return;
    setUploadingLink(linkIdx);
    try { const url = await onCropFromEmail(); if (url) addLinkImage(linkIdx, url); }
    catch (_) {}
    finally { setUploadingLink(null); }
  };

  // URL validation
  const isValidUrl = (url) => {
    if (!url) return true;
    try { new URL(url); return true; } catch { return false; }
  };

  const handleSave = () => {
    if (draft.type === 'enlaces') {
      const errors = {};
      (draft.links || []).forEach((link, i) => {
        if (link.url && !isValidUrl(link.url)) errors[i] = 'URL no válida (debe empezar por https://)';
      });
      if (Object.keys(errors).length > 0) { setUrlErrors(errors); return; }
    }
    onSave(draft);
    onClose();
  };

  const bt = BLOCK_TYPES.find(b => b.type === block.type);
  const c = BLOCK_COLORS[block.type] || '#71717a';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: '#111', border: '1px solid #27272a', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: c, display: 'flex' }}>{bt?.icon}</span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'white' }}>{bt?.label}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', display: 'flex', padding: 2 }}><IconX /></button>
        </div>

        {/* Título */}
        <div>
          <label style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Título</label>
          <input value={draft.titulo || ''} onChange={e => update('titulo', e.target.value)}
            style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
        </div>

        {/* Subtítulo */}
        <div>
          <label style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Subtítulo</label>
          <input value={draft.subtitulo || ''} onChange={e => update('subtitulo', e.target.value)}
            placeholder="Opcional…"
            style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
        </div>

        {/* Imágenes (solo para tipos no-enlaces) */}
        {draft.type !== 'enlaces' && (
          <div>
            <label style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Imágenes</label>
            {(draft.images || []).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6, marginBottom: 8 }}>
                {(draft.images || []).map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', aspectRatio: '1' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                    <button onClick={() => removeImage(idx)}
                      style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.75)', border: 'none', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            {/* Library picker */}
            {showLibrary === 'global' && libraryImages?.length > 0 && (
              <div style={{ border: '1px solid #27272a', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#52525b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seleccionar de biblioteca</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 5 }}>
                  {libraryImages.map((img, i) => (
                    <img key={i} src={img.url} alt="" onClick={() => { addImage(img.url); setShowLibrary(null); }}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 5, cursor: 'pointer', border: '2px solid transparent' }}
                      onMouseEnter={e => e.currentTarget.style.border = '2px solid #3b82f6'}
                      onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'} />
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                style={{ flex: 1, background: 'transparent', border: '1px dashed #3f3f46', borderRadius: 8, padding: '9px 10px', fontSize: 12, color: '#71717a', cursor: uploading ? 'not-allowed' : 'pointer', minWidth: 100 }}
                onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = '#52525b'; }}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#3f3f46'}>
                {uploading ? 'Subiendo…' : '+ Subir imagen'}
              </button>
              <button onClick={handleCrop} disabled={uploading}
                style={{ flex: 1, background: 'transparent', border: '1px dashed #3f3f46', borderRadius: 8, padding: '9px 10px', fontSize: 12, color: '#71717a', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, minWidth: 100 }}
                onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = '#52525b'; }}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#3f3f46'}>
                <IconScissors /> Recortar del email
              </button>
              {libraryImages?.length > 0 && (
                <button onClick={() => setShowLibrary(showLibrary === 'global' ? null : 'global')}
                  style={{ flex: 1, background: showLibrary === 'global' ? '#18181b' : 'transparent', border: '1px dashed #3f3f46', borderRadius: 8, padding: '9px 10px', fontSize: 12, color: '#71717a', cursor: 'pointer', minWidth: 100 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#52525b'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#3f3f46'}>
                  Seleccionar imagen
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
          </div>
        )}

        {/* Campos específicos: enlaces (múltiples links) */}
        {draft.type === 'enlaces' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Links</label>
            {(draft.links || []).map((link, linkIdx) => {
              const linkFileRef = (ref) => { if (ref) linkFileInputRefs.current[linkIdx] = ref; };
              const isUploadingThis = uploadingLink === linkIdx;
              return (
                <div key={linkIdx} style={{ border: '1px solid #27272a', borderRadius: 10, padding: '12px 12px 10px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
                  {draft.links.length > 1 && (
                    <button onClick={() => removeLink(linkIdx)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', display: 'flex', padding: 2 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#52525b'}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                  {/* Images for this link */}
                  {(link.images || []).length > 0 && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {(link.images || []).map((img, imgIdx) => (
                        <div key={imgIdx} style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                          <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5, border: '1px solid #27272a', display: 'block' }} />
                          <button onClick={() => removeLinkImage(linkIdx, imgIdx)}
                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.75)', border: 'none', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Library picker for this link */}
                  {showLibrary === linkIdx && libraryImages?.length > 0 && (
                    <div style={{ border: '1px solid #27272a', borderRadius: 7, padding: 8 }}>
                      <div style={{ fontSize: 10, color: '#52525b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seleccionar de biblioteca</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 4 }}>
                        {libraryImages.map((img, i) => (
                          <img key={i} src={img.url} alt="" onClick={() => { addLinkImage(linkIdx, img.url); setShowLibrary(null); }}
                            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '2px solid transparent' }}
                            onMouseEnter={e => e.currentTarget.style.border = '2px solid #3b82f6'}
                            onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <button onClick={() => linkFileInputRefs.current[linkIdx]?.click()} disabled={uploadingLink !== null}
                      style={{ flex: 1, background: 'transparent', border: '1px dashed #3f3f46', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: '#71717a', cursor: uploadingLink !== null ? 'not-allowed' : 'pointer', minWidth: 80 }}
                      onMouseEnter={e => { if (uploadingLink === null) e.currentTarget.style.borderColor = '#52525b'; }}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#3f3f46'}>
                      {isUploadingThis ? 'Subiendo…' : '+ Imagen'}
                    </button>
                    <button onClick={() => handleLinkCrop(linkIdx)} disabled={uploadingLink !== null}
                      style={{ flex: 1, background: 'transparent', border: '1px dashed #3f3f46', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: '#71717a', cursor: uploadingLink !== null ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 80 }}
                      onMouseEnter={e => { if (uploadingLink === null) e.currentTarget.style.borderColor = '#52525b'; }}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#3f3f46'}>
                      <IconScissors /> Recortar
                    </button>
                    {libraryImages?.length > 0 && (
                      <button onClick={() => setShowLibrary(showLibrary === linkIdx ? null : linkIdx)}
                        style={{ flex: 1, background: showLibrary === linkIdx ? '#18181b' : 'transparent', border: '1px dashed #3f3f46', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: '#71717a', cursor: 'pointer', minWidth: 80 }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#52525b'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#3f3f46'}>
                        Seleccionar
                      </button>
                    )}
                    <input ref={linkFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleLinkFile(linkIdx, f); e.target.value = ''; }} />
                  </div>
                  {/* URL */}
                  <div>
                    <input value={link.url || ''} onChange={e => updateLinkUrl(linkIdx, e.target.value)}
                      placeholder="https://…"
                      style={{ width: '100%', background: '#18181b', border: `1px solid ${urlErrors[linkIdx] ? '#ef4444' : '#3f3f46'}`, borderRadius: 7, padding: '7px 10px', fontSize: 12, color: 'white', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                    {urlErrors[linkIdx] && <span style={{ fontSize: 11, color: '#ef4444', display: 'block', marginTop: 3 }}>{urlErrors[linkIdx]}</span>}
                  </div>
                </div>
              );
            })}
            <button onClick={addLink}
              style={{ background: 'transparent', border: '1px dashed #27272a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#52525b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#71717a'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#52525b'; }}>
              + Añadir otro link
            </button>
          </div>
        )}

        {draft.type === 'imagen_texto' && (
          <div>
            <label style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Texto</label>
            <textarea value={draft.texto || ''} onChange={e => update('texto', e.target.value)}
              rows={4} placeholder="Análisis y comentarios…"
              style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        )}

        {draft.type === 'correccion' && (
          <div>
            <label style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Corrección</label>
            <textarea value={draft.nota || ''} onChange={e => update('nota', e.target.value)}
              rows={5} placeholder="Cómo lo reescribirías…"
              style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        )}

        {/* Guardar / Cancelar */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button onClick={handleSave}
            style={{ flex: 1, background: 'white', color: 'black', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Guardar
          </button>
          <button onClick={onClose}
            style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BibliotecaItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const [saving, setSaving]     = useState(false);
  const [detecting, setDetecting] = useState(false);

  // ── Tags state ───────────────────────────────────────────────────────────
  const [allTags, setAllTags]   = useState([]);
  const [itemTags, setItemTags] = useState([]);
  const [obTags, setObTags]     = useState([]);

  // ── Onboarding state ─────────────────────────────────────────────────────
  const [mode, setMode]             = useState('onboarding');
  const [obStep, setObStep]         = useState('categoria');
  const [obCategoria, setObCategoria] = useState(null);
  const [obSubcat, setObSubcat]     = useState(null);
  const [obMarca, setObMarca]       = useState('');
  const [obAsunto, setObAsunto]     = useState('');
  const [obAdelanto, setObAdelanto] = useState('');
  const [obEnviadoEl, setObEnviadoEl] = useState('');
  const [obMarcaError, setObMarcaError] = useState('');

  // ── Display state ────────────────────────────────────────────────────────
  const [categoria, setCategoria] = useState(null);
  const [subcategoria, setSubcat] = useState(null);
  const [marca, setMarca]         = useState(null);
  const [asunto, setAsunto]       = useState(null);
  const [adelanto, setAdelanto]   = useState(null);
  const [enviadoEl, setEnviadoEl] = useState(null);

  // ── Blocks state ─────────────────────────────────────────────────────────
  const [blocksData, setBlocksData]             = useState([]);
  const [editingBlockId, setEditingBlockId]     = useState(null);
  const [showCropForModal, setShowCropForModal] = useState(false);
  const [showBlockSelectorModal, setShowBlockSelectorModal] = useState(false);
  const [blocksSaving, setBlocksSaving]         = useState(false);
  const cropForModalResolveRef = useRef(null);

  // Misc
  const [allMarcas, setAllMarcas]       = useState([]);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [imageHover, setImageHover]     = useState(false);
  const [showCrop, setShowCrop]         = useState(false);
  const [cropConfirm, setCropConfirm]   = useState(null);
  const [replacing, setReplacing]       = useState(false);
  const [showModal, setShowModal]       = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) { navigate('/admin/login'); return; }
        const res = await fetch(`${API_BASE}/biblioteca/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error(res.status === 404 ? 'Captura no encontrada' : 'Error al cargar');
        const data = await res.json();
        setItem(data);
        setCategoria(data.categoria || null);
        setSubcat(data.subcategoria || null);
        setMarca(data.marca  !== null && data.marca  !== undefined ? data.marca  : null);
        setAsunto(data.asunto !== null && data.asunto !== undefined ? data.asunto : null);
        setAdelanto(data.adelanto !== null && data.adelanto !== undefined ? data.adelanto : null);
        setEnviadoEl(data.enviado_el !== null && data.enviado_el !== undefined ? data.enviado_el : null);
        setBlocksData(data.blocks || []);
        if (data.categoria) setMode('display');
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
    fetch(`${API_BASE}/biblioteca/marcas`).then(r => r.ok ? r.json() : []).then(setAllMarcas).catch(() => {});
    (async () => {
      const token2 = await getToken();
      if (token2) {
        fetch(`${API_BASE}/biblioteca/tags`, { headers: { Authorization: `Bearer ${token2}` } })
          .then(r => r.ok ? r.json() : []).then(setAllTags).catch(() => {});
      }
    })();
  }, [id, navigate]);

  useEffect(() => {
    if (!item || !allTags.length) return;
    setItemTags((item.tags || []).map(id => allTags.find(t => t.id === id)).filter(Boolean));
  }, [item, allTags]);

  const patch = useCallback(async (updates) => {
    const token = await getToken();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/biblioteca/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) setItem(await res.json());
    } finally { setSaving(false); }
  }, [id]);

  const handleDetectarIA = async () => {
    setDetecting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/biblioteca/${id}/detectar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al detectar');
      const data = await res.json();
      if (data.marca)      setObMarca(data.marca);
      if (data.asunto)     setObAsunto(data.asunto);
      if (data.adelanto)   setObAdelanto(data.adelanto);
      if (data.enviado_el) setObEnviadoEl(data.enviado_el);
    } catch (e) { alert(e.message); }
    finally { setDetecting(false); }
  };

  const handleObCategoria = (v) => { setObCategoria(v); setObStep(v === 'email' ? 'subcategoria' : 'campos'); };
  const handleObSubcat    = (v) => { setObSubcat(v);    setObStep('campos'); };

  const handleGuardar = async () => {
    const marcaTrimmed = obMarca.trim();
    if (!marcaTrimmed) { setObMarcaError('La marca es obligatoria'); return; }
    const updates = {
      categoria: obCategoria,
      subcategoria: obCategoria === 'email' ? obSubcat : null,
      marca: marcaTrimmed,
      asunto: obAsunto.trim(),
      adelanto: obAdelanto.trim(),
      enviado_el: obEnviadoEl || null,
      tags: obTags,
    };
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/biblioteca/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setItem(data);
        setCategoria(data.categoria);
        setSubcat(data.subcategoria);
        setMarca(data.marca !== null && data.marca !== undefined ? data.marca : null);
        setAsunto(data.asunto !== null && data.asunto !== undefined ? data.asunto : null);
        setAdelanto(data.adelanto !== null && data.adelanto !== undefined ? data.adelanto : null);
        setEnviadoEl(data.enviado_el !== null && data.enviado_el !== undefined ? data.enviado_el : null);
        setMode('display');
        if (marcaTrimmed && !allMarcas.includes(marcaTrimmed)) {
          setAllMarcas(prev => [...prev, marcaTrimmed].sort((a,b) => a.localeCompare(b)));
        }
      }
    } finally { setSaving(false); }
  };

  const confirmDiscard = async () => {
    setDiscardConfirm(false);
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/biblioteca`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
    } catch (_) {}
    navigate('/admin/biblioteca');
  };

  // ── Tags handlers ────────────────────────────────────────────────────────
  const addTagToItem = useCallback(async (tagId) => {
    const newIds = [...(item.tags || []).filter(id => id !== tagId), tagId];
    setItem(prev => ({ ...prev, tags: newIds }));
    setItemTags(prev => {
      const tag = allTags.find(t => t.id === tagId);
      return tag && !prev.find(t => t.id === tagId) ? [...prev, tag] : prev;
    });
    await patch({ tags: newIds });
  }, [item, allTags, patch]);

  const removeTagFromItem = useCallback(async (tagId) => {
    const newIds = (item.tags || []).filter(id => id !== tagId);
    setItem(prev => ({ ...prev, tags: newIds }));
    setItemTags(prev => prev.filter(t => t.id !== tagId));
    await patch({ tags: newIds });
  }, [item, patch]);

  const createTagAndAdd = useCallback(async (name, color, subcategoriaScope) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/biblioteca/tags`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, subcategoria: subcategoriaScope || null }),
      });
      if (!res.ok) return;
      const newTag = await res.json();
      setAllTags(prev => [...prev, newTag]);
      await addTagToItem(newTag.id);
    } catch (_) {}
  }, [addTagToItem]);

  const updateTag = useCallback(async (tagId, { name, color }) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/biblioteca/tags/${tagId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAllTags(prev => prev.map(t => t.id === tagId ? updated : t));
      }
    } catch (_) {}
  }, []);

  const deleteTag = useCallback(async (tagId) => {
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/biblioteca/tags/${tagId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllTags(prev => prev.filter(t => t.id !== tagId));
      setItem(prev => ({ ...prev, tags: (prev.tags || []).filter(id => id !== tagId) }));
      setItemTags(prev => prev.filter(t => t.id !== tagId));
    } catch (_) {}
  }, []);

  // ── Blocks handlers ──────────────────────────────────────────────────────
  const saveBlocks = useCallback(async (blocks) => {
    setBlocksSaving(true);
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/biblioteca/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
    } catch (_) {}
    finally { setBlocksSaving(false); }
  }, [id]);

  const addBlock = useCallback((type) => {
    const newId = `blk_${Date.now()}`;
    const newBlock = {
      id: newId,
      type,
      titulo: DEFAULT_TITLES[type] || '',
      subtitulo: '',
      images: [],
      url: '',
      texto_boton: '',
      links: type === 'enlaces' ? [{ images: [], url: '' }] : [],
      texto: '',
      nota: '',
    };
    setBlocksData(prev => {
      let next;
      const correccionIdx = prev.findIndex(b => b.type === 'correccion');
      if (type === 'correccion' || correccionIdx === -1) {
        next = [...prev, newBlock];
      } else {
        next = [...prev.slice(0, correccionIdx), newBlock, ...prev.slice(correccionIdx)];
      }
      saveBlocks(next);
      return next;
    });
    setTimeout(() => setEditingBlockId(newId), 50);
  }, [saveBlocks]);

  const updateBlock = useCallback((updatedBlock) => {
    setBlocksData(prev => {
      const next = prev.map(b => b.id === updatedBlock.id ? updatedBlock : b);
      saveBlocks(next);
      return next;
    });
  }, [saveBlocks]);

  const deleteBlock = useCallback((blockId) => {
    setBlocksData(prev => {
      const next = prev.filter(b => b.id !== blockId);
      saveBlocks(next);
      return next;
    });
  }, [saveBlocks]);

  const moveBlock = useCallback((blockId, direction) => {
    setBlocksData(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      if (idx === -1) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      saveBlocks(next);
      return next;
    });
  }, [saveBlocks]);

  const uploadImageForBlock = useCallback(async (fileOrBlob) => {
    const token = await getToken();
    const form = new FormData();
    const name = fileOrBlob instanceof File ? fileOrBlob.name : `block_img_${Date.now()}.png`;
    form.append('file', fileOrBlob, name);
    const res = await fetch(`${API_BASE}/biblioteca/${id}/blocks/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    const { url } = await res.json();
    return url;
  }, [id]);

  const cropFromEmail = useCallback(() => {
    return new Promise((resolve, reject) => {
      cropForModalResolveRef.current = { resolve, reject };
      setShowCropForModal(true);
    });
  }, []);

  const handleCropForModal = useCallback((cropRect) => {
    setShowCropForModal(false);
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropRect.w; canvas.height = cropRect.h;
      canvas.getContext('2d').drawImage(img, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cropRect.w, cropRect.h);
      canvas.toBlob(async blob => {
        if (!blob) { cropForModalResolveRef.current?.reject(new Error('crop failed')); return; }
        try {
          const url = await uploadImageForBlock(blob);
          cropForModalResolveRef.current?.resolve(url);
        } catch (e) {
          cropForModalResolveRef.current?.reject(e);
        } finally {
          cropForModalResolveRef.current = null;
        }
      }, 'image/png');
    };
    img.src = item.url;
  }, [item, uploadImageForBlock]);

  // Crop handlers (main image)
  const handleCrop = useCallback((cropRect) => {
    setShowCrop(false);
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropRect.w; canvas.height = cropRect.h;
      canvas.getContext('2d').drawImage(img, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cropRect.w, cropRect.h);
      canvas.toBlob(blob => setCropConfirm({ blob, url: URL.createObjectURL(blob) }), 'image/png');
    };
    img.src = item.url;
  }, [item]);

  const confirmCrop = async () => {
    if (!cropConfirm?.blob) return;
    setReplacing(true);
    try {
      const token = await getToken();
      const form = new FormData();
      form.append('file', cropConfirm.blob, `recorte_${Date.now()}.png`);
      const res = await fetch(`${API_BASE}/biblioteca/${id}/replace-image`, { method:'POST', headers:{ 'Authorization':`Bearer ${token}` }, body:form });
      if (!res.ok) throw new Error(await res.text());
      setItem(await res.json());
      URL.revokeObjectURL(cropConfirm.url); setCropConfirm(null);
    } catch (e) { alert('Error al guardar recorte: ' + e.message); }
    finally { setReplacing(false); }
  };

  const cancelCrop = () => { if (cropConfirm?.url) URL.revokeObjectURL(cropConfirm.url); setCropConfirm(null); };

  const libraryImages = useMemo(() => {
    const seen = new Set();
    const imgs = [];
    blocksData.forEach(b => {
      (b.images || []).forEach(img => {
        if (!seen.has(img.url)) { seen.add(img.url); imgs.push(img); }
      });
      (b.links || []).forEach(link => {
        (link.images || []).forEach(img => {
          if (!seen.has(img.url)) { seen.add(img.url); imgs.push(img); }
        });
      });
    });
    return imgs;
  }, [blocksData]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#0d0d0d' }}>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={() => navigate('/admin/biblioteca')} className="text-xs text-zinc-400 border border-zinc-700 px-4 py-2 rounded-lg">← Volver</button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>

      {/* Overlays */}
      {showCrop && item && <CropOverlay imageUrl={item.url} onCrop={handleCrop} onCancel={() => setShowCrop(false)} />}
      {cropConfirm && <CropConfirmModal previewUrl={cropConfirm.url} onConfirm={confirmCrop} onCancel={cancelCrop} saving={replacing} />}
      {showModal && item && <ImageModal imageUrl={item.url} alt={item.filename} onClose={() => setShowModal(false)} />}
      {discardConfirm && <DiscardModal onConfirm={confirmDiscard} onCancel={() => setDiscardConfirm(false)} />}
      {editingBlockId && (() => { const eb = blocksData.find(b => b.id === editingBlockId); return eb ? (
        <BlockEditorModal
          block={eb}
          onSave={updateBlock}
          onClose={() => setEditingBlockId(null)}
          onUploadImage={uploadImageForBlock}
          onCropFromEmail={cropFromEmail}
          libraryImages={libraryImages}
        />
      ) : null; })()}
      {showCropForModal && item && <CropOverlay imageUrl={item.url} onCrop={handleCropForModal} onCancel={() => { setShowCropForModal(false); cropForModalResolveRef.current?.reject(new Error('cancelled')); cropForModalResolveRef.current = null; }} />}
      {showBlockSelectorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowBlockSelectorModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480 }}>
            <BlockSelector
              hasCorreccion={blocksData.some(b => b.type === 'correccion')}
              onSelect={(type) => { addBlock(type); setShowBlockSelectorModal(false); }}
              onClose={() => setShowBlockSelectorModal(false)}
            />
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/admin/biblioteca')} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Biblioteca
        </button>
        {(saving || blocksSaving) && <span className="text-xs text-zinc-600">Guardando…</span>}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-8 items-start">

        {/* Left: image */}
        <div style={{ position: 'relative' }}
          onMouseEnter={() => setImageHover(true)}
          onMouseLeave={() => setImageHover(false)}>
          <div className="rounded-xl border border-zinc-800" style={{ height: 560, overflowY: 'auto', overflowX: 'hidden' }}>
            <img src={item.url} alt={item.filename} style={{ width: '100%', display: 'block' }} />
          </div>
          {imageHover && (
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
              <button onClick={() => setShowCrop(true)} title="Recortar"
                style={{ background:'rgba(0,0,0,0.7)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.8)', borderRadius:8, padding:'6px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:12, backdropFilter:'blur(4px)' }}
                onMouseEnter={e => e.currentTarget.style.color='white'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
                <IconScissors /> Recortar
              </button>
              <button onClick={() => setShowModal(true)} title="Ver completa"
                style={{ background:'rgba(0,0,0,0.7)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.8)', borderRadius:8, padding:'6px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:12, backdropFilter:'blur(4px)' }}
                onMouseEnter={e => e.currentTarget.style.color='white'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.8)'}>
                <IconEye /> Ver
              </button>
            </div>
          )}
        </div>

        {/* Right: onboarding OR display */}
        {mode === 'onboarding' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: 400 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {obCategoria && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
                    <Tag colors={CAT_COLORS[obCategoria]} label={catLabel(obCategoria)} onRemove={() => { setObCategoria(null); setObSubcat(null); setObStep('categoria'); }} />
                  </div>
                  {obSubcat && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
                      <Tag colors={SUBCAT_COLORS[obSubcat]} label={subcatLabel(obSubcat)} onRemove={() => { setObSubcat(null); setObStep('subcategoria'); }} />
                    </div>
                  )}
                </div>
              )}

              {obStep === 'categoria' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: 'white' }}>¿Email o Ficha de Producto?</span>
                  <CatButtons options={CATEGORIAS} colors={CAT_COLORS} onSelect={handleObCategoria} />
                </div>
              )}

              {obStep === 'subcategoria' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: 'white' }}>¿Automatización o Campaña?</span>
                  <CatButtons options={SUBCATEGORIAS} colors={SUBCAT_COLORS} onSelect={handleObSubcat} />
                </div>
              )}

              {obStep === 'campos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <button onClick={handleDetectarIA} disabled={detecting}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: detecting ? '#1a1a2e' : 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.4)', color: detecting ? '#818cf8' : '#a5b4fc', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: detecting ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (!detecting) { e.currentTarget.style.background='rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.6)'; }}}
                    onMouseLeave={e => { if (!detecting) { e.currentTarget.style.background='rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; }}}>
                    {detecting ? (
                      <div style={{ width: 12, height: 12, border: '2px solid #4f46e5', borderTopColor: '#a5b4fc', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M18 2v4h4"/>
                      </svg>
                    )}
                    {detecting ? 'Detectando…' : 'Detectar con IA'}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Marca <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input type="text" value={obMarca}
                        onChange={e => { setObMarca(e.target.value); setObMarcaError(''); }}
                        placeholder="Marca…"
                        style={{ width: '100%', background: '#18181b', border: `1px solid ${obMarcaError ? '#f87171' : '#3f3f46'}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                      {obMarca.length > 0 && allMarcas.filter(s => s.toLowerCase().includes(obMarca.toLowerCase()) && s !== obMarca).length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '1px solid #27272a', borderRadius: 8, marginTop: 4, zIndex: 20, overflow: 'hidden' }}>
                          {allMarcas.filter(s => s.toLowerCase().includes(obMarca.toLowerCase()) && s !== obMarca).slice(0, 6).map(s => (
                            <div key={s} onMouseDown={() => setObMarca(s)}
                              style={{ padding: '7px 12px', fontSize: 13, color: 'white', cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{s}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    {obMarcaError && <span style={{ fontSize: 11, color: '#f87171' }}>{obMarcaError}</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Asunto</label>
                    <input type="text" value={obAsunto} onChange={e => setObAsunto(e.target.value)} placeholder="Asunto del email…"
                      style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Adelanto</label>
                    <input type="text" value={obAdelanto} onChange={e => setObAdelanto(e.target.value)} placeholder="Texto de adelanto…"
                      style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                  </div>

                  {obSubcat !== 'automatizacion' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 11, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enviado el Día</label>
                      <input type="date" value={obEnviadoEl} onChange={e => setObEnviadoEl(e.target.value)}
                        style={{ width: '100%', background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etiquetas</label>
                    <TagPicker
                      selectedIds={obTags}
                      allTags={allTags}
                      subcategoria={obSubcat}
                      onAdd={id => setObTags(prev => prev.includes(id) ? prev : [...prev, id])}
                      onRemove={id => setObTags(prev => prev.filter(x => x !== id))}
                      onCreateTag={async (name, color, sub) => {
                        try {
                          const token = await getToken();
                          const res = await fetch(`${API_BASE}/biblioteca/tags`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, color, subcategoria: sub || null }),
                          });
                          if (res.ok) {
                            const newTag = await res.json();
                            setAllTags(prev => [...prev, newTag]);
                            setObTags(prev => [...prev, newTag.id]);
                          }
                        } catch (_) {}
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
              {obStep === 'campos' && (
                <button onClick={handleGuardar} disabled={saving}
                  style={{ width: '100%', background: saving ? '#3f3f46' : 'white', color: saving ? '#a1a1aa' : 'black', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {saving && <div style={{ width: 12, height: 12, border: '2px solid #71717a', borderTopColor: 'black', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              )}
              <button onClick={() => setDiscardConfirm(true)}
                style={{ width: '100%', background: 'transparent', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#71717a'; }}>
                Descartar
              </button>
            </div>
          </div>
        ) : (
          /* Display mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categoria && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
                  <Tag colors={CAT_COLORS[categoria]} label={catLabel(categoria)} onRemove={() => { setCategoria(null); setSubcat(null); patch({ categoria: null, subcategoria: null }); setMode('onboarding'); setObStep('categoria'); setObCategoria(null); setObSubcat(null); }} />
                </div>
              )}
              {subcategoria && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
                  <Tag colors={SUBCAT_COLORS[subcategoria]} label={subcatLabel(subcategoria)} onRemove={() => { setSubcat(null); patch({ subcategoria: null }); setObMarca(marca || ''); setObAsunto(asunto || ''); setObAdelanto(adelanto || ''); setObEnviadoEl(''); setObTags([]); setMode('onboarding'); setObCategoria(categoria); setObSubcat(null); setObStep('subcategoria'); }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etiquetas</span>
              <TagPicker
                selectedIds={(item?.tags || [])}
                allTags={allTags}
                subcategoria={subcategoria}
                onAdd={addTagToItem}
                onRemove={removeTagFromItem}
                onCreateTag={createTagAndAdd}
                onUpdateTag={updateTag}
                onDeleteTag={deleteTag}
              />
            </div>

            <FieldRow label="Marca" savedValue={marca} required
              onSave={v => { setMarca(v); patch({ marca: v }); if (v && !allMarcas.includes(v)) setAllMarcas(p => [...p, v].sort((a,b) => a.localeCompare(b))); }}
              allowEmpty={false} suggestions={allMarcas} />
            <FieldRow label="Asunto"   savedValue={asunto}   onSave={v => { setAsunto(v);   patch({ asunto: v });   }} placeholder="Asunto del email…" />
            <FieldRow label="Adelanto" savedValue={adelanto} onSave={v => { setAdelanto(v); patch({ adelanto: v }); }} placeholder="Texto de adelanto…" />
            {subcategoria !== 'automatizacion' && (
              <FieldRow label="Enviado el Día" savedValue={enviadoEl} onSave={v => { setEnviadoEl(v); patch({ enviado_el: v }); }} allowEmpty={false} type="date" />
            )}
          </div>
        )}
      </div>

      {/* ── Blocks section (display mode, categoria=email) ── */}
      {mode === 'display' && categoria === 'email' && (
        <div style={{ marginTop: 40 }}>
          {blocksSaving && <span style={{ fontSize: 11, color: '#52525b', display: 'block', marginBottom: 8 }}>Guardando…</span>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {blocksData.map((block, idx) => (
              <div key={block.id}>
                <BlockDivider onAdd={() => setShowBlockSelectorModal(true)} />
                <BlockCard
                  block={block}
                  index={idx}
                  total={blocksData.length}
                  onEdit={() => setEditingBlockId(block.id)}
                  onDelete={() => deleteBlock(block.id)}
                  onMoveUp={() => moveBlock(block.id, -1)}
                  onMoveDown={() => moveBlock(block.id, 1)}
                />
              </div>
            ))}
            <BlockDivider onAdd={() => setShowBlockSelectorModal(true)} />
            <button
              onClick={() => setShowBlockSelectorModal(true)}
              style={{ width: '100%', background: 'transparent', border: '1px dashed #27272a', color: '#52525b', borderRadius: 10, padding: '12px 16px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s', marginTop: 4 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#71717a'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#52525b'; }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Añadir bloque
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
