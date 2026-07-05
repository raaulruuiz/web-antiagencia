import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/lib/ThemeContext';

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
  border: `1px solid ${active ? 'var(--t-text-muted)' : 'var(--t-border)'}`,
  background: active ? 'var(--t-border)' : 'transparent',
  color: active ? 'var(--t-text)' : 'var(--t-text-muted)',
});

// ── Tag palette for user-created tags ────────────────────────────────────────
const TAG_PALETTE = ['#6366f1','#8b5cf6','#a855f7','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#14b8a6','#78716c'];

const isValidHttpUrl = (url) => {
  if (!url) return false;
  try {
    const p = new URL(url);
    if (!['http:', 'https:'].includes(p.protocol)) return false;
    const parts = p.hostname.split('.');
    return parts.length >= 2 && parts.every(seg => seg.length > 0) && parts[parts.length - 1].length >= 2;
  } catch { return false; }
};

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
  { type: 'imagen_texto',label: 'Imagen y/o Texto',  icon: <IconImageText /> },
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
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? colors.text : colors.border;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', background: colors.bg, border: `1px solid ${colors.border}`, color: textColor }}>{label}</span>
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', padding: 2, display: 'flex' }} title="Quitar"><IconX /></button>
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
          style={{ flex: 1, height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px solid var(--t-border-mid)', borderRadius: 16, background: 'transparent', color: 'var(--t-text-muted)', cursor: 'pointer', transition: 'all 0.15s', minWidth: 0 }}
          onMouseEnter={e => { const c = colors[opt.value]; e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.text; e.currentTarget.style.background = c.bg; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border-mid)'; e.currentTarget.style.color = 'var(--t-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          {opt.icon}
          <span style={{ fontSize: 13, textAlign: 'center' }}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Field with pencil (display mode) ─────────────────────────────────────────
function FieldRow({ label, savedValue, onSave, required = false, allowEmpty = true, type = 'text', placeholder, suggestions = [], validate }) {
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
    if (validate) { const err = validate(t); if (err) { setError(err); return; } }
    onSave(t); setInputMode(false); setError('');
  };

  const handleCancel = () => { setInputMode(false); setError(''); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleConfirm(); } if (e.key === 'Escape') handleCancel(); };

  if (!isSet && !inputMode) {
    return (
      <button onClick={startEdit}
        style={{ background: 'none', border: '1px dashed var(--t-border)', color: 'var(--t-text-faint)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', alignSelf: 'flex-start' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-border-muted)'; e.currentTarget.style.color = 'var(--t-text-muted)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border)'; e.currentTarget.style.color = 'var(--t-text-faint)'; }}>
        <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> {label}
      </button>
    );
  }

  if (isSet && !inputMode) {
    const display = type === 'date' && savedValue ? formatDate(savedValue) : savedValue;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--t-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
          <button onClick={startEdit}
            style={{ background: 'none', border: 'none', color: 'var(--t-text-faint)', cursor: 'pointer', padding: '2px 4px', display: 'flex', borderRadius: 4, transition: 'color 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--t-text-muted)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t-text-faint)'}
            title={`Editar ${label}`}><IconPencil /></button>
        </div>
        <div style={{ fontSize: 13, color: display ? 'var(--t-text)' : 'var(--t-text-muted)', padding: '4px 0', fontStyle: display ? 'normal' : 'italic', borderBottom: '1px solid var(--t-border)' }}>
          {display || '(Vacío)'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {isSet && <span style={{ fontSize: 11, color: 'var(--t-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input ref={inputRef} type={type} value={inputVal}
            onChange={e => { setInputVal(e.target.value); setShowSugg(true); setError(''); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSugg(true)}
            onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            placeholder={placeholder || label + '…'}
            style={{ flex: 1, background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '7px 10px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
          <button onClick={handleConfirm} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}><IconCheck /></button>
          <button onClick={handleCancel} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}><IconX /></button>
        </div>
        {showSugg && filteredSugg.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 40, background: 'var(--t-border-s)', border: '1px solid var(--t-border)', borderRadius: 8, marginTop: 4, zIndex: 20, overflow: 'hidden' }}>
            {filteredSugg.slice(0, 6).map(s => (
              <div key={s} onMouseDown={() => { setInputVal(s); setShowSugg(false); }}
                style={{ padding: '7px 12px', fontSize: 13, color: 'var(--t-text)', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--t-border)'}
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
    <div style={{ background: 'var(--t-border-s)', border: '1px solid var(--t-border)', borderRadius: 10, padding: '12px', marginTop: 6 }}>
      <p style={{ fontSize: 11, color: 'var(--t-text-muted)', margin: '0 0 8px' }}>Color de <span style={{ color: 'var(--t-text)' }}>"{tag.name}"</span></p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {TAG_PALETTE.map(c => (
          <button key={c} onClick={() => { setHex(c); apply(c); }}
            style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: `2px solid ${c.toLowerCase() === hex.toLowerCase() ? 'white' : 'transparent'}`, cursor: 'pointer', transition: 'border-color 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.toLowerCase() === hex.toLowerCase() ? 'white' : 'transparent'} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--t-surface)', border: '1px solid var(--t-border-mid)', borderRadius: 7, padding: '5px 8px' }}>
          <label style={{ position: 'relative', width: 14, height: 14, flexShrink: 0, cursor: 'pointer' }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: /^#[0-9a-f]{3,6}$/i.test(hex) ? hex : '#888', display: 'block' }} />
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#888888'} onChange={e => setHex(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none', padding: 0 }} />
          </label>
          <input value={hex} onChange={e => setHex(e.target.value)} placeholder="#6366f1"
            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--t-text)', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} />
        </div>
        <button onClick={() => apply(hex)}
          style={{ background: 'white', color: 'black', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Aplicar</button>
        <button onClick={onClose}
          style={{ background: 'none', border: '1px solid var(--t-border-mid)', color: 'var(--t-text-muted)', borderRadius: 7, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>✕</button>
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
    <div style={{ background: 'var(--t-border-s)', border: '1px solid var(--t-border)', borderRadius: 10, padding: '12px', marginTop: 6 }}>
      <p style={{ fontSize: 11, color: 'var(--t-text-muted)', margin: '0 0 8px' }}>Editar etiqueta</p>
      {/* Name field */}
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nombre…"
        style={{ width: '100%', background: 'var(--t-surface)', border: '1px solid var(--t-border-mid)', borderRadius: 7, padding: '5px 8px', fontSize: 12, color: 'var(--t-text)', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
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
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--t-surface)', border: '1px solid var(--t-border-mid)', borderRadius: 7, padding: '5px 8px' }}>
          <label style={{ position: 'relative', width: 14, height: 14, flexShrink: 0, cursor: 'pointer' }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: /^#[0-9a-f]{3,6}$/i.test(hex) ? hex : '#888', display: 'block' }} />
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#888888'} onChange={e => setHex(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none', padding: 0 }} />
          </label>
          <input value={hex} onChange={e => setHex(e.target.value)} placeholder="#6366f1"
            style={{ flex: 1, background: 'none', border: 'none', color: 'var(--t-text)', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} />
        </div>
        <button onClick={() => apply(hex)}
          style={{ background: 'white', color: 'black', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Aplicar</button>
        <button onClick={onClose}
          style={{ background: 'none', border: '1px solid var(--t-border-mid)', color: 'var(--t-text-muted)', borderRadius: 7, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
}

// ── TagPicker ─────────────────────────────────────────────────────────────────
function TagPicker({ selectedIds, allTags, categoria, subcategoria, onAdd, onRemove, onCreateTag, onUpdateTag, onDeleteTag, onUpdateTagColor }) {
  const [input, setInput]       = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [hoverTagId, setHoverTagId] = useState(null);
  const inputRef = useRef(null);

  // Scope tags: ficha sees only ficha tags; email sees tags scoped to its subcategoria (or global email tags)
  const scopedTags = categoria === 'ficha'
    ? allTags.filter(t => t.subcategoria === 'ficha')
    : subcategoria
      ? allTags.filter(t => t.subcategoria !== 'ficha' && (!t.subcategoria || t.subcategoria === subcategoria))
      : allTags.filter(t => t.subcategoria !== 'ficha');
  const available  = scopedTags.filter(t => !selectedIds.includes(t.id));
  const filtered   = input.length > 0 ? available.filter(t => t.name.toLowerCase().includes(input.toLowerCase())) : available;
  const exactMatch = scopedTags.find(t => t.name.toLowerCase() === input.trim().toLowerCase());
  const canCreate  = input.trim().length > 0 && !exactMatch;

  const handleSelect = (tag) => { onAdd(tag.id); setInput(''); setShowDrop(false); setShowInput(false); };

  const handleCreate = () => {
    const color = TAG_PALETTE[Math.floor(Math.random() * TAG_PALETTE.length)];
    const scope = categoria === 'ficha' ? 'ficha' : subcategoria;
    onCreateTag(input.trim(), color, scope);
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
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--t-border-mid)', background: 'none', color: 'var(--t-text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
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
          style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: 'var(--t-text)', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
        />
        {showDrop && (filtered.length > 0 || canCreate) && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--t-border-s)', border: '1px solid var(--t-border)', borderRadius: 8, marginTop: 4, zIndex: 30, overflow: 'hidden' }}>
            {filtered.slice(0, 6).map(tag => (
              <div key={tag.id}
                onMouseDown={() => handleSelect(tag)}
                onMouseEnter={() => setHoverTagId(tag.id)}
                onMouseLeave={() => setHoverTagId(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 12, background: hoverTagId === tag.id ? 'var(--t-border)' : 'transparent' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--t-text)', flex: 1 }}>{tag.name}</span>
                {hoverTagId === tag.id && (
                  <span style={{ display: 'flex', gap: 4 }}>
                    {onUpdateTag && (
                      <button
                        onMouseDown={e => { e.stopPropagation(); setEditingTag(tag); setShowDrop(false); }}
                        style={{ background: 'none', border: 'none', color: 'var(--t-text-muted)', cursor: 'pointer', padding: 2, display: 'flex' }}
                        title="Editar">
                        <IconPencil />
                      </button>
                    )}
                    {onDeleteTag && (
                      <button
                        onMouseDown={e => { e.stopPropagation(); onDeleteTag(tag.id); }}
                        style={{ background: 'none', border: 'none', color: 'var(--t-text-muted)', cursor: 'pointer', padding: 2, display: 'flex' }}
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
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 12, borderTop: filtered.length > 0 ? '1px solid var(--t-border)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--t-border)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ color: 'var(--t-text-muted)' }}>Crear</span>
                <span style={{ color: 'var(--t-text)', fontWeight: 500 }}>"{input.trim()}"</span>
                <span style={{ color: 'var(--t-text-faint)', fontSize: 10, marginLeft: 'auto' }}>color aleatorio</span>
              </div>
            )}
          </div>
        )}
      </div>}
    </div>
  );
}

// ── Crop overlay (dual mode) ──────────────────────────────────────────────────
const SAVED_RECT_COLORS = ['#3b82f6','#22c55e','#f97316','#a855f7','#ef4444','#eab308','#06b6d4','#ec4899'];
function CropOverlay({ imageUrl, onCrop, onCancel }) {
  const [mode, setMode]               = useState('libre');
  const [freeDrag, setFreeDrag]       = useState(null);
  const [freeRect, setFreeRect]       = useState(null);
  const [savedRects, setSavedRects]   = useState([]); // {display:{x,y,w,h}} — natural coords computed on confirm
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
      setSavedRects(prev => [...prev, { ...freeRect }]);
    }
    setFreeDrag(null); setFreeRect(null); setDragHandle(null);
  };

  const confirmMulti = () => {
    if (!imgRef.current || savedRects.length === 0) return;
    const b = imgRef.current.getBoundingClientRect();
    const sx = imgRef.current.naturalWidth / b.width;
    const sy = imgRef.current.naturalHeight / b.height;
    onCrop(savedRects.map(r => ({ x: Math.round(r.x*sx), y: Math.round(r.y*sy), w: Math.round(r.w*sx), h: Math.round(r.h*sy) })));
  };

  const confirmResize = () => {
    if (!cropBox || !imgRef.current) return;
    const b=imgRef.current.getBoundingClientRect();
    const sx=imgRef.current.naturalWidth/b.width; const sy=imgRef.current.naturalHeight/b.height;
    onCrop([{ x:Math.round(cropBox.x*sx), y:Math.round(cropBox.y*sy), w:Math.round(cropBox.w*sx), h:Math.round(cropBox.h*sy) }]);
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
        <div style={{ display:'flex', background:'var(--t-border-s)', border:'1px solid var(--t-border)', borderRadius:10, padding:3, gap:2 }}>
          {[{id:'libre',label:'Recorte libre'},{id:'ajustar',label:'Ajustar tamaño'}].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ padding:'5px 14px', fontSize:12, borderRadius:7, border:'none', cursor:'pointer', transition:'all 0.15s', background:mode===m.id?'var(--t-border)':'transparent', color:mode===m.id?'var(--t-text)':'var(--t-text-muted)' }}>{m.label}</button>
          ))}
        </div>
        {mode === 'ajustar' && (
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontSize:11, color:'var(--t-text-subtle)' }}>Proporción:</span>
            <button onClick={() => setAspectRatio(null)} style={presetBtnStyle(aspectRatio === null)}>Libre</button>
            {ASPECT_PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p.ratio)} style={presetBtnStyle(Math.abs((aspectRatio||0)-p.ratio)<0.001)}>{p.label}</button>
            ))}
          </div>
        )}
        {mode === 'libre' && <p style={{ color:'var(--t-text-muted)', fontSize:12, margin:0 }}>{savedRects.length === 0 ? 'Arrastra sobre la imagen para seleccionar el área' : `${savedRects.length} recorte${savedRects.length>1?'s':''} seleccionado${savedRects.length>1?'s':''}. Sigue dibujando o confirma.`}</p>}
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', width:'100%', overflow:'hidden', padding:'0 40px' }}>
        <div style={{ position:'relative', display:'inline-block' }}>
          <img ref={imgRef} src={imageUrl} crossOrigin="anonymous" alt="recortar"
            onLoad={mode==='ajustar'?initCropBox:undefined}
            style={{ maxWidth:'80vw', maxHeight:'62vh', display:'block', cursor:mode==='libre'?'crosshair':'default' }}
            onMouseDown={mode==='libre'?(e)=>{ e.preventDefault(); const b=imgRef.current.getBoundingClientRect(); setFreeDrag({sx:e.clientX-b.left,sy:e.clientY-b.top}); setFreeRect(null); }:undefined}
            draggable={false} />
          {mode==='libre' && savedRects.map((r, i) => (
            <div key={i} style={{ position:'absolute', left:r.x, top:r.y, width:r.w, height:r.h, border:`2px solid ${SAVED_RECT_COLORS[i % SAVED_RECT_COLORS.length]}`, boxSizing:'border-box', pointerEvents:'none' }}>
              <div style={{ position:'absolute', top:-1, left:-1, background:SAVED_RECT_COLORS[i % SAVED_RECT_COLORS.length], color:'white', fontSize:10, fontWeight:700, width:18, height:18, borderRadius:'0 0 6px 0', display:'flex', alignItems:'center', justifyContent:'center' }}>{i+1}</div>
              <button onClick={e => { e.stopPropagation(); setSavedRects(prev => prev.filter((_,j) => j!==i)); }}
                style={{ position:'absolute', top:-1, right:-1, background:SAVED_RECT_COLORS[i % SAVED_RECT_COLORS.length], color:'white', border:'none', fontSize:11, width:18, height:18, borderRadius:'0 0 0 6px', cursor:'pointer', lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'all' }}>×</button>
            </div>
          ))}
          {mode==='libre' && freeRect && freeRect.w>0 && freeRect.h>0 && (
            <div style={{ position:'absolute', border:'2px dashed white', boxShadow:'0 0 0 9999px rgba(0,0,0,0.45)', pointerEvents:'none', left:freeRect.x, top:freeRect.y, width:freeRect.w, height:freeRect.h }} />
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
        <button onClick={onCancel} style={{ background:'transparent', border:'1px solid var(--t-border-mid)', color:'var(--t-text-placeholder)', borderRadius:999, padding:'7px 18px', fontSize:13, cursor:'pointer' }}>Cancelar</button>
        {mode==='libre' && savedRects.length > 0 && (
          <button onClick={confirmMulti} style={{ background:'white', color:'black', border:'none', borderRadius:999, padding:'7px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Confirmar {savedRects.length === 1 ? '1 recorte' : `${savedRects.length} recortes`}
          </button>
        )}
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
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'var(--t-overlay)', display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'32px 24px' }} onClick={onClose}>
      <div style={{ position:'relative', maxWidth:900, width:'100%' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:-36, right:0, background:'transparent', border:'none', color:'var(--t-text-placeholder)', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6 }}><IconX /> Cerrar</button>
        <img src={imageUrl} alt={alt} style={{ width:'100%', borderRadius:12, display:'block' }} />
      </div>
    </div>
  );
}

// ── Crop confirm modal ────────────────────────────────────────────────────────
function CropConfirmModal({ previewUrl, onConfirm, onCancel, saving }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'var(--t-overlay)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'var(--t-border-s)', border:'1px solid var(--t-border)', borderRadius:16, padding:24, maxWidth:480, width:'100%', display:'flex', flexDirection:'column', gap:16 }}>
        <p style={{ color:'var(--t-text)', fontSize:15, fontWeight:500, margin:0 }}>¿Guardar este recorte?</p>
        <p style={{ color:'var(--t-text-muted)', fontSize:12, margin:0 }}>Esta acción reemplazará la imagen original.</p>
        <img src={previewUrl} alt="recorte" style={{ width:'100%', borderRadius:8, border:'1px solid var(--t-border)', maxHeight:320, objectFit:'contain' }} />
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} disabled={saving} style={{ background:'transparent', border:'1px solid var(--t-border-mid)', color:'var(--t-text-placeholder)', borderRadius:999, padding:'7px 18px', fontSize:13, cursor:'pointer' }}>Cancelar</button>
          <button onClick={onConfirm} disabled={saving} style={{ background:saving?'var(--t-border-mid)':'white', color:saving?'var(--t-text-placeholder)':'black', border:'none', borderRadius:999, padding:'7px 18px', fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:6 }}>
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
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'var(--t-overlay)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={onCancel}>
      <div style={{ background:'var(--t-border-s)', border:'1px solid var(--t-border-mid)', borderRadius:16, padding:24, maxWidth:320, width:'100%', display:'flex', flexDirection:'column', gap:12 }} onClick={e => e.stopPropagation()}>
        <p style={{ color:'var(--t-text)', fontSize:14, fontWeight:500, margin:0 }}>¿Eliminar esta captura?</p>
        <p style={{ color:'var(--t-text-muted)', fontSize:12, margin:0 }}>Esta acción no se puede deshacer.</p>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ background:'transparent', border:'1px solid var(--t-border-mid)', color:'var(--t-text-placeholder)', borderRadius:8, padding:'7px 16px', fontSize:12, cursor:'pointer' }}>Cancelar</button>
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
      <div style={{ flex: 1, height: 1, background: 'var(--t-border)' }} />
      <span style={{ fontSize: 11, color: 'var(--t-text-faint)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> bloque
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--t-border)' }} />
    </div>
  );
}

// ── Block: selector panel ─────────────────────────────────────────────────────
const BLOCK_COLORS = { enlaces: '#3b82f6', imagen: '#22c55e', imagen_texto: '#f97316', correccion: '#a855f7' };
const DEFAULT_TITLES = { enlaces: 'Enlaces del Correo', imagen: 'Imágenes del Correo', imagen_texto: 'Análisis y Comentarios', correccion: 'Cómo lo Reescribiría Yo' };

function BlockSelector({ onSelect, hasCorreccion, onClose }) {
  return (
    <div style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: 14, padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--t-text-muted)', fontWeight: 500 }}>Añadir bloque</span>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', padding: 2 }}><IconX /></button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {BLOCK_TYPES.map(bt => {
          const disabled = bt.type === 'correccion' && hasCorreccion;
          const c = BLOCK_COLORS[bt.type];
          return (
            <button key={bt.type} onClick={() => !disabled && onSelect(bt.type)} disabled={disabled}
              style={{ height: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: `1px solid ${disabled ? 'var(--t-border)' : 'var(--t-border-mid)'}`, borderRadius: 12, background: 'transparent', color: disabled ? 'var(--t-text-faint)' : 'var(--t-text-muted)', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: disabled ? 0.4 : 1 }}
              onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = c; e.currentTarget.style.color = c; e.currentTarget.style.background = c + '11'; }}}
              onMouseLeave={e => { if (!disabled) { e.currentTarget.style.borderColor = 'var(--t-border-mid)'; e.currentTarget.style.color = 'var(--t-text-muted)'; e.currentTarget.style.background = 'transparent'; }}}>
              <span style={{ color: 'inherit' }}>{bt.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'inherit' }}>{bt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Preview image with lightbox hover ────────────────────────────────────────
function PreviewImg({ src, imgStyle, wrapperStyle, onPreview, href }) {
  const [hov, setHov] = useState(false);
  const imgEl = <img src={src} alt="" style={{ display: 'block', ...imgStyle }} />;
  return (
    <div style={{ position: 'relative', ...wrapperStyle }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>{imgEl}</a>
        : imgEl}
      {hov && (
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onPreview(src); }}
          style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11, fontWeight: 500, backdropFilter: 'blur(4px)' }}>
          <IconEye /> Ver
        </button>
      )}
    </div>
  );
}

// ── Block: card ───────────────────────────────────────────────────────────────
function BlockCard({ block, index, total, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisible }) {
  const bt = BLOCK_TYPES.find(b => b.type === block.type);
  const c = BLOCK_COLORS[block.type] || '#71717a';
  const isCorreccion = block.type === 'correccion';
  const imgs = block.images || [];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const { theme } = useTheme();

  return (
    <div style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border-s)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--t-border-s)' }}>
        <span style={{ color: c, display: 'flex', flexShrink: 0 }}>{bt?.icon}</span>
        <span style={{ flex: 1, fontSize: 12, color: 'var(--t-text)', fontWeight: 500 }}>{bt?.label}</span>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
          {!isCorreccion && (
            <>
              <button onClick={onMoveUp} disabled={index === 0}
                style={{ background: 'none', border: 'none', color: index === 0 ? 'var(--t-text-faint)' : 'var(--t-text)', cursor: index === 0 ? 'default' : 'pointer', padding: 3, display: 'flex' }}>
                <IconChevronUp />
              </button>
              <button onClick={onMoveDown} disabled={index === total - 1}
                style={{ background: 'none', border: 'none', color: index === total - 1 ? 'var(--t-text-faint)' : 'var(--t-text)', cursor: index === total - 1 ? 'default' : 'pointer', padding: 3, display: 'flex' }}>
                <IconChevronDown />
              </button>
            </>
          )}
          <button onClick={onToggleVisible}
            style={block.visible === false
              ? { color: '#f97316', background: 'rgba(234,88,12,0.25)', border: '1px solid rgba(234,88,12,0.5)', cursor: 'pointer', padding: '3px 6px', borderRadius: 6, display: 'flex', alignItems: 'center' }
              : { color: 'var(--t-text-muted)', background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '3px 6px', borderRadius: 6, display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => {
              if (block.visible === false) { e.currentTarget.style.background = 'rgba(234,88,12,0.45)'; }
              else { e.currentTarget.style.color = 'var(--t-text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }
            }}
            onMouseLeave={e => {
              if (block.visible === false) { e.currentTarget.style.background = 'rgba(234,88,12,0.25)'; }
              else { e.currentTarget.style.color = 'var(--t-text-muted)'; e.currentTarget.style.background = 'none'; }
            }}
            title={block.visible === false ? 'Sección oculta en público' : 'Sección visible en público'}>
            {block.visible === false
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
          <button onClick={onEdit}
            style={{ background: 'none', border: '1px solid var(--t-border-muted)', color: 'var(--t-text)', cursor: 'pointer', padding: '3px 8px', borderRadius: 6, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border-muted)'; }}>
            <IconPencil /> Editar
          </button>
          {confirmDelete ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#ef4444' }}>¿Eliminar?</span>
              <button onClick={onDelete}
                style={{ background: '#dc2626', border: 'none', color: 'white', cursor: 'pointer', padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>
                Sí
              </button>
              <button onClick={() => setConfirmDelete(false)}
                style={{ background: 'none', border: '1px solid var(--t-border-mid)', color: 'var(--t-text-placeholder)', cursor: 'pointer', padding: '2px 7px', borderRadius: 5, fontSize: 11 }}>
                No
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              style={{ background: 'none', border: 'none', color: 'var(--t-text-muted)', cursor: 'pointer', padding: 3, display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--t-text-muted)'}>
              <IconTrashSm />
            </button>
          )}
        </div>
      </div>

      {/* Content preview */}
      {block.type === 'enlaces' && (
        <div style={{ padding: '14px 14px 14px' }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2 }}>{block.titulo || 'Enlace'}</div>
            {block.subtitulo && <div style={{ fontSize: 13, color: 'var(--t-text-muted)', marginTop: 4 }}>{block.subtitulo}</div>}
          </div>
          {/* Link previews */}
          {(block.links || (block.url ? [{ images: block.images || [], url: block.url }] : [])).length > 0 ? (
            <div style={
              block.links_layout === 'fila'
                ? { display: 'flex', flexDirection: 'row', gap: 12, overflowX: 'auto' }
                : block.links_layout === 'grid'
                ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }
                : { display: 'flex', flexDirection: 'column', gap: 12 }
            }>
              {(block.links || (block.url ? [{ images: block.images || [], url: block.url }] : [])).map((link, li) => (
                block.links_layout === 'grid' ? (
                  <div key={li} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                    {(link.images || []).map((img, i) => (
                      <PreviewImg key={i} src={img.url}
                        imgStyle={{ width: '100%', aspectRatio: '1', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)' }}
                        wrapperStyle={{ width: '100%' }}
                        href={link.url || undefined}
                        onPreview={setLightbox} />
                    ))}
                    {link.url && (
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: '#3b82f6', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                        {link.url}
                      </a>
                    )}
                  </div>
                ) : block.links_layout === 'fila' ? (
                  /* Fila: imágenes en horizontal dentro del link item */
                  <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, overflow: 'hidden' }}>
                    {(link.images || []).map((img, i) => (
                      <PreviewImg key={i} src={img.url}
                        imgStyle={{ height: 160, borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)' }}
                        wrapperStyle={{ flexShrink: 0 }}
                        href={link.url || undefined}
                        onPreview={setLightbox} />
                    ))}
                    {link.url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, maxWidth: 320 }}>
                        <span style={{ fontSize: 26, color: '#3b82f6', fontWeight: 300, flexShrink: 0 }}>→</span>
                        <a href={link.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                          {link.url}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Columna: imágenes apiladas verticalmente dentro del link item */
                  <div key={li} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(link.images || []).map((img, i) => (
                      <PreviewImg key={i} src={img.url}
                        imgStyle={{ height: 160, width: 'auto', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)' }}
                        wrapperStyle={{ flexShrink: 0 }}
                        href={link.url || undefined}
                        onPreview={setLightbox} />
                    ))}
                    {link.url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 26, color: '#3b82f6', fontWeight: 300, flexShrink: 0 }}>→</span>
                        <a href={link.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none', wordBreak: 'break-all' }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                          {link.url}
                        </a>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--t-text-faint)', fontStyle: 'italic' }}>Sin links configurados</span>
          )}
        </div>
      )}

      {block.type === 'imagen' && imgs.length > 0 && (
        <div style={{ padding: '12px 14px' }}>
          {(block.titulo || block.subtitulo) && (
            <div style={{ marginBottom: 10 }}>
              {block.titulo && <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2 }}>{block.titulo}</div>}
              {block.subtitulo && <div style={{ fontSize: 12, color: 'var(--t-text-muted)', marginTop: 3 }}>{block.subtitulo}</div>}
            </div>
          )}
          <div style={
            block.images_layout === 'fila'
              ? { display: 'flex', flexDirection: 'row', gap: 10, overflowX: 'auto' }
              : block.images_layout === 'grid'
              ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }
              : { display: 'flex', flexDirection: 'column', gap: 10 }
          }>
            {imgs.map((img, i) => (
              block.images_layout === 'grid'
                ? <PreviewImg key={i} src={img.url} imgStyle={{ width: '100%', aspectRatio: '1', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)' }} wrapperStyle={{ width: '100%' }} onPreview={setLightbox} />
                : block.images_layout === 'fila'
                ? <PreviewImg key={i} src={img.url} imgStyle={{ height: 180, width: 'auto', borderRadius: 9, objectFit: 'contain', border: '1px solid var(--t-border)' }} wrapperStyle={{ flexShrink: 0 }} onPreview={setLightbox} />
                : <PreviewImg key={i} src={img.url} imgStyle={{ width: '100%', height: 'auto', maxHeight: 320, borderRadius: 9, objectFit: 'contain', border: '1px solid var(--t-border)' }} wrapperStyle={{ width: '100%' }} onPreview={setLightbox} />
            ))}
          </div>
        </div>
      )}

      {block.type === 'imagen_texto' && (() => {
        const items = block.items || (block.images?.length || block.texto ? [{ image: block.images?.[0] || null, texto: block.texto || '' }] : []);
        const layout  = block.it_layout || 'img-text';
        const isHoriz = layout === 'img-text' || layout === 'text-img';
        const imgFirst = layout === 'img-text' || layout === 'img-top';
        if (!items.length) return <div style={{ padding: '12px 14px' }}><span style={{ fontSize: 12, color: 'var(--t-text-faint)', fontStyle: 'italic' }}>Sin contenido</span></div>;
        return (
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(block.titulo || block.subtitulo) && (
              <div style={{ marginBottom: 2 }}>
                {block.titulo && <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2 }}>{block.titulo}</div>}
                {block.subtitulo && <div style={{ fontSize: 12, color: 'var(--t-text-muted)', marginTop: 3 }}>{block.subtitulo}</div>}
              </div>
            )}
            {items.map((it, i) => {
              const tc = it.text_color;
              const hasImage = it.image?.url;
              const hasText  = it.texto?.trim();
              const imgEl = hasImage ? (
                <PreviewImg src={it.image.url} imgStyle={{ width: '100%', height: 'auto', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)', display: 'block' }} wrapperStyle={{ width: '100%' }} onPreview={setLightbox} />
              ) : null;
              const txtEl = hasText ? (
                <div style={{ padding: '10px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.6, textAlign: it.text_align || 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: tc ? tc + '22' : 'transparent', border: tc ? `1px solid ${tc}` : '1px solid var(--t-border)', color: tc || 'var(--t-text)' }}>{it.texto}</div>
              ) : null;
              const first = imgFirst ? imgEl : txtEl;
              const second = imgFirst ? txtEl : imgEl;
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: isHoriz && hasImage && hasText ? '1fr 1fr' : '1fr', gap: 12, alignItems: 'start' }}>
                  {first}
                  {second}
                </div>
              );
            })}
          </div>
        );
      })()}

      {block.type === 'correccion' && (
        <div style={{ padding: '10px 12px' }}>
          {(block.titulo || block.subtitulo) && (
            <div style={{ marginBottom: 10 }}>
              {block.titulo && <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2 }}>{block.titulo}</div>}
              {block.subtitulo && <div style={{ fontSize: 12, color: 'var(--t-text-muted)', marginTop: 3 }}>{block.subtitulo}</div>}
            </div>
          )}
          {(block.email_blocks || []).length > 0 ? (() => {
            const outerBg = theme === 'dark' ? '#1e1e1e' : '#e0e0e0';
            const emailBg = block.email_bg || '#ffffff';
            const renderEBBlock = (eb, i, colMode) => (
              <div key={i}>
                {eb.type === 'text' && eb.content && (() => {
                  const p = <p style={{ margin: 0, fontSize: eb.size || 14, fontWeight: eb.bold ? 700 : 400, textAlign: eb.align || 'left', color: '#1a1a1a', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{eb.content}</p>;
                  return eb.href ? <a href={eb.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{p}</a> : p;
                })()}
                {eb.type === 'image' && eb.url && (() => {
                  const img = <img src={eb.url} alt="" style={{ display: 'block', maxWidth: '100%', maxHeight: colMode ? 120 : 200, objectFit: 'contain', borderRadius: 6, margin: '0 auto' }} />;
                  return <div style={{ textAlign: 'center' }}>{eb.href ? <a href={eb.href} target="_blank" rel="noopener noreferrer">{img}</a> : img}</div>;
                })()}
                {eb.type === 'button' && eb.text && (
                  <div style={{ textAlign: 'center', padding: '4px 0' }}>
                    <span style={{ display: 'inline-block', background: eb.bg || '#3b82f6', color: eb.color || '#ffffff', borderRadius: 6, padding: '7px 20px', fontSize: 13, fontWeight: 600 }}>{eb.text}</span>
                  </div>
                )}
                {eb.type === 'columns' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {['left','right'].map(side => (
                      <div key={side} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(eb[side] || []).map((sub, j) => renderEBBlock(sub, j, true))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
            return (
              <div style={{ background: outerBg, borderRadius: 8, padding: '10px 8px', maxHeight: 420, overflowY: 'auto' }}>
                <div style={{ background: emailBg, maxWidth: 520, margin: '0 auto', borderRadius: 4, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(block.email_blocks || []).map((eb, i) => renderEBBlock(eb, i, false))}
                </div>
              </div>
            );
          })() : block.nota ? (
            <p style={{ fontSize: 12, color: 'var(--t-text-placeholder)', margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{block.nota}</p>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--t-text-faint)', fontStyle: 'italic' }}>Sin contenido</span>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 10, boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontSize: 18, lineHeight: 1 }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ── InlineColorPicker (tag-style) ─────────────────────────────────────────────
function InlineColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value || '');
  const apply = (color) => { onChange(color); setOpen(false); };
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => setOpen(o => !o)}
          style={{ width: 26, height: 26, borderRadius: 6, background: value || 'transparent', border: value ? `2px solid ${value}` : '1px dashed var(--t-border-mid)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!value && <span style={{ fontSize: 14, color: 'var(--t-text-subtle)' }}>+</span>}
        </button>
        {value && (
          <span style={{ fontSize: 10, borderRadius: 999, padding: '2px 8px', fontWeight: 600, background: value + '22', border: `1px solid ${value}`, color: value }}>Aa</span>
        )}
        {value && <button onClick={() => { onChange(''); setHex(''); }} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', fontSize: 11, padding: 0 }}>✕</button>}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 32, left: 0, zIndex: 50, background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: 10, padding: 12, minWidth: 220, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {TAG_PALETTE.map(c => (
              <button key={c} onClick={() => { setHex(c); apply(c); }}
                style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: `2px solid ${c.toLowerCase() === (hex||'').toLowerCase() ? 'white' : 'transparent'}`, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
                onMouseLeave={e => e.currentTarget.style.borderColor = c.toLowerCase() === (hex||'').toLowerCase() ? 'white' : 'transparent'} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 7, padding: '5px 8px' }}>
              <label style={{ position: 'relative', width: 14, height: 14, flexShrink: 0, cursor: 'pointer' }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: /^#[0-9a-f]{3,6}$/i.test(hex) ? hex : '#888', display: 'block' }} />
                <input type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#888888'} onChange={e => setHex(e.target.value)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none', padding: 0 }} />
              </label>
              <input value={hex} onChange={e => setHex(e.target.value)} placeholder="#6366f1"
                style={{ flex: 1, background: 'none', border: 'none', color: 'var(--t-text)', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} />
            </div>
            <button onClick={() => apply(hex)} style={{ background: 'white', color: 'black', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Aplicar</button>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: '1px solid var(--t-border-mid)', color: 'var(--t-text-muted)', borderRadius: 7, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mini Email Builder (for Corrección block) ─────────────────────────────────
const EB_TYPES = [
  { type: 'text',    label: 'Texto',    icon: '¶' },
  { type: 'image',   label: 'Imagen',   icon: '🖼' },
  { type: 'button',  label: 'Botón',    icon: '□' },
  { type: 'columns', label: 'Columnas', icon: '▥' },
];
const newEB = (type) => {
  const id = `eb_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
  if (type === 'text')    return { id, type, content: '', align: 'left', bold: false, size: 14 };
  if (type === 'image')   return { id, type, url: '' };
  if (type === 'button')  return { id, type, text: 'Haz clic aquí', url: '', bg: '#3b82f6', color: '#ffffff' };
  if (type === 'columns') return { id, type, left: [newEB('text')], right: [newEB('text')] };
  return { id, type };
};

function EBItem({ block, onChange, onDelete, onUpload, onCrop, libImages, nested = false }) {
  const [showLib, setShowLib] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try { const url = await onUpload(file); onChange({ url }); }
    catch { alert('Error al subir imagen'); }
    finally { setUploading(false); }
  };

  const crop = async () => {
    setUploading(true);
    try { const urls = await onCrop(); if (urls?.[0]) onChange({ url: urls[0] }); }
    catch (_) {}
    finally { setUploading(false); }
  };

  const rowStyle = { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 };
  const btnStyle = (active) => ({ background: active ? 'var(--t-border)' : 'transparent', border: `1px solid ${active ? 'var(--t-border-mid)' : 'var(--t-border)'}`, borderRadius: 5, padding: '3px 7px', fontSize: 11, color: active ? 'var(--t-text)' : 'var(--t-text-subtle)', cursor: 'pointer' });

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={onDelete} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '2px 4px', zIndex: 1 }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--t-text-subtle)'}>×</button>

      {block.type === 'text' && (
        <div>
          <div style={rowStyle}>
            {[['left','≡L'],['center','≡C'],['right','≡R'],['justify','≡']].map(([v,l]) => (
              <button key={v} onClick={() => onChange({ align: v })} style={btnStyle(block.align === v || (!block.align && v==='left'))}>{l}</button>
            ))}
            <button onClick={() => onChange({ bold: !block.bold })} style={btnStyle(block.bold)}><b>N</b></button>
            <select value={block.size || 14} onChange={e => onChange({ size: +e.target.value })}
              style={{ background: 'var(--t-surface2)', border: '1px solid var(--t-border)', borderRadius: 5, color: 'var(--t-text)', fontSize: 11, padding: '2px 4px' }}>
              {[11,12,13,14,16,18,20,24,28].map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
          </div>
          <textarea value={block.content || ''} onChange={e => onChange({ content: e.target.value })}
            rows={3} placeholder="Escribe aquí…"
            style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 7, padding: '7px 10px', fontSize: 12, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', textAlign: block.align || 'left', fontWeight: block.bold ? 700 : 400 }} />
          <input value={block.href || ''} onChange={e => onChange({ href: e.target.value })} placeholder="🔗 Link (opcional)"
            style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border)', borderRadius: 6, padding: '5px 9px', fontSize: 11, color: 'var(--t-text-subtle)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box', marginTop: 4 }} />
        </div>
      )}

      {block.type === 'image' && (
        <div>
          {block.url ? (
            <div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={block.url} alt="" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 7, border: '1px solid var(--t-border)', display: 'block' }} />
                <button onClick={() => onChange({ url: '' })}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</button>
              </div>
              <input value={block.href || ''} onChange={e => onChange({ href: e.target.value })} placeholder="🔗 Link al hacer clic (opcional)"
                style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border)', borderRadius: 6, padding: '5px 9px', fontSize: 11, color: 'var(--t-text-subtle)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box', marginTop: 6 }} />
            </div>
          ) : (
            <>
              {showLib && libImages?.length > 0 && (
                <div style={{ border: '1px solid var(--t-border)', borderRadius: 7, padding: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase' }}>Biblioteca</span>
                    <button onClick={() => setShowLib(false)} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', fontSize: 11 }}>Cerrar</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 4 }}>
                    {libImages.map((img, i) => (
                      <img key={i} src={img.url} alt="" onClick={() => { onChange({ url: img.url }); setShowLib(false); }}
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '2px solid transparent' }}
                        onMouseEnter={e => e.currentTarget.style.border = '2px solid #3b82f6'}
                        onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'} />
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '6px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: uploading ? 'not-allowed' : 'pointer', minWidth: 70 }}>
                  {uploading ? 'Subiendo…' : '+ Subir'}
                </button>
                <button onClick={crop} disabled={uploading}
                  style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '6px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 70 }}>
                  <IconScissors /> Recortar
                </button>
                {libImages?.length > 0 && (
                  <button onClick={() => setShowLib(s => !s)}
                    style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '6px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: 'pointer', minWidth: 70 }}>
                    Seleccionar
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) await upload(f); }} />
              </div>
            </>
          )}
        </div>
      )}

      {block.type === 'button' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={block.text || ''} onChange={e => onChange({ text: e.target.value })} placeholder="Texto del botón"
              style={{ flex: 1, background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 7, padding: '6px 10px', fontSize: 12, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={block.url || ''} onChange={e => onChange({ url: e.target.value })} placeholder="https://…"
              style={{ flex: 1, background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 7, padding: '6px 10px', fontSize: 12, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 10, color: 'var(--t-text-subtle)' }}>Fondo</label>
            <input type="color" value={block.bg || '#3b82f6'} onChange={e => onChange({ bg: e.target.value })}
              style={{ width: 26, height: 22, borderRadius: 4, border: '1px solid var(--t-border-mid)', cursor: 'pointer', padding: 1 }} />
            <label style={{ fontSize: 10, color: 'var(--t-text-subtle)' }}>Texto</label>
            <input type="color" value={block.color || '#ffffff'} onChange={e => onChange({ color: e.target.value })}
              style={{ width: 26, height: 22, borderRadius: 4, border: '1px solid var(--t-border-mid)', cursor: 'pointer', padding: 1 }} />
            <div style={{ flex: 1 }}>
              <span style={{ display: 'inline-block', background: block.bg || '#3b82f6', color: block.color || '#ffffff', borderRadius: 6, padding: '4px 14px', fontSize: 12, fontWeight: 600 }}>{block.text || 'Botón'}</span>
            </div>
          </div>
        </div>
      )}

      {block.type === 'columns' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['left','right'].map(side => (
            <div key={side} style={{ border: '1px solid var(--t-border)', borderRadius: 7, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', marginBottom: 2 }}>{side === 'left' ? 'Columna izq.' : 'Columna der.'}</div>
              <EBCanvas blocks={block[side] || []} nested
                onChange={newBlocks => onChange({ [side]: newBlocks })}
                onUpload={onUpload} onCrop={onCrop} libImages={libImages} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EBCanvas({ blocks, onChange, onUpload, onCrop, libImages, nested = false }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const add = (type) => onChange([...blocks, newEB(type)]);
  const del = (idx) => onChange(blocks.filter((_, i) => i !== idx));
  const upd = (idx, changes) => onChange(blocks.map((b, i) => i === idx ? { ...b, ...changes } : b));
  const move = (from, to) => {
    const next = [...blocks];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Palette */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {(nested ? EB_TYPES.filter(t => t.type !== 'columns') : EB_TYPES).map(bt => (
          <button key={bt.type} onClick={() => add(bt.type)}
            style={{ background: 'transparent', border: '1px dashed var(--t-border)', borderRadius: 6, padding: nested ? '3px 6px' : '4px 8px', fontSize: 10, color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span>{bt.icon}</span> {bt.label}
          </button>
        ))}
      </div>

      {/* Blocks */}
      {blocks.map((block, idx) => (
        <div key={block.id}
          draggable
          onDragStart={() => setDragging(idx)}
          onDragOver={e => { e.preventDefault(); setDragOver(idx); }}
          onDrop={e => { e.preventDefault(); if (dragging !== null && dragging !== idx) move(dragging, idx); setDragging(null); setDragOver(null); }}
          onDragEnd={() => { setDragging(null); setDragOver(null); }}
          style={{ border: `1px solid ${dragOver === idx && dragging !== idx ? '#6366f1' : 'var(--t-border)'}`, borderRadius: 8, padding: 10, background: 'var(--t-surface)', cursor: 'grab', opacity: dragging === idx ? 0.4 : 1, transition: 'border-color 0.1s' }}>
          <EBItem block={block}
            onChange={changes => upd(idx, changes)}
            onDelete={() => del(idx)}
            onUpload={onUpload} onCrop={onCrop} libImages={libImages}
            nested={nested} />
        </div>
      ))}

      {blocks.length === 0 && !nested && (
        <div style={{ border: '2px dashed var(--t-border)', borderRadius: 8, padding: 20, textAlign: 'center', color: 'var(--t-text-faint)', fontSize: 12 }}>
          Añade bloques arriba
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
    if (d.type === 'imagen_texto' && !d.items) {
      d.items = [{ image: d.images?.[0] || null, texto: d.texto || '', text_color: '', text_align: 'left' }];
    }
    return d;
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingLink, setUploadingLink] = useState(null); // linkIdx
  const [uploadingItem, setUploadingItem] = useState(null); // itemIdx
  const [urlErrors, setUrlErrors] = useState({});
  const [showLibrary, setShowLibrary] = useState(null); // null | 'global' | linkIdx (number) | 'it-{idx}'
  const fileInputRef = useRef(null);
  const linkFileInputRefs = useRef({});
  const itemFileInputRefs = useRef({});

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

  // imagen_texto items management
  const addItem = () => setDraft(d => ({ ...d, items: [...(d.items || []), { image: null, texto: '', text_color: '', text_align: 'left' }] }));
  const removeItem = (idx) => setDraft(d => ({ ...d, items: (d.items || []).filter((_, i) => i !== idx) }));
  const setItemImage = (idx, url) => setDraft(d => {
    const items = [...(d.items || [])]; items[idx] = { ...items[idx], image: url ? { url } : null }; return { ...d, items };
  });
  const updateItemField = (idx, field, val) => setDraft(d => {
    const items = [...(d.items || [])]; items[idx] = { ...items[idx], [field]: val }; return { ...d, items };
  });
  const handleItemFile = async (idx, file) => {
    if (!file || uploadingItem !== null) return;
    setUploadingItem(idx);
    try { const url = await onUploadImage(file); setItemImage(idx, url); }
    catch { alert('Error al subir imagen'); }
    finally { setUploadingItem(null); }
  };
  const handleItemCrop = async (idx) => {
    if (uploadingItem !== null) return;
    setUploadingItem(idx);
    try { const urls = await onCropFromEmail(); if (urls?.[0]) setItemImage(idx, urls[0]); }
    catch (_) {}
    finally { setUploadingItem(null); }
  };

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
    try { const urls = await onCropFromEmail(); (urls || []).forEach(url => addImage(url)); }
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
    try { const urls = await onCropFromEmail(); (urls || []).forEach(url => addLinkImage(linkIdx, url)); }
    catch (_) {}
    finally { setUploadingLink(null); }
  };

  // URL validation
  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes('.') && parsed.hostname.split('.').every(p => p.length > 0);
    } catch { return false; }
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
    <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: 16, width: '100%', maxWidth: block.type === 'correccion' ? 740 : 560, maxHeight: '90vh', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: c, display: 'flex' }}>{bt?.icon}</span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--t-text)' }}>{bt?.label}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', padding: 2 }}><IconX /></button>
        </div>

        {/* Título */}
        <div>
          <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Título</label>
          <input value={draft.titulo || ''} onChange={e => update('titulo', e.target.value)}
            style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
        </div>

        {/* Subtítulo */}
        <div>
          <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Subtítulo</label>
          <input value={draft.subtitulo || ''} onChange={e => update('subtitulo', e.target.value)}
            placeholder="Opcional…"
            style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
        </div>

        {/* Layout selector para imagen (antes de las imágenes) */}
        {draft.type === 'imagen' && (
          <div>
            <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Disposición</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ value: 'columna', label: 'Columna' }, { value: 'fila', label: 'Fila' }, { value: 'grid', label: 'Grid' }].map(opt => {
                const active = (draft.images_layout || 'columna') === opt.value;
                return (
                  <button key={opt.value} onClick={() => update('images_layout', opt.value)}
                    style={{ flex: 1, background: active ? 'var(--t-surface2)' : 'transparent', border: `1px solid ${active ? '#6366f1' : 'var(--t-border-mid)'}`, borderRadius: 8, padding: '7px 10px', fontSize: 12, color: active ? '#a5b4fc' : 'var(--t-text-muted)', cursor: 'pointer', textAlign: 'center', fontWeight: active ? 600 : 400 }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Imágenes (solo para tipo imagen) */}
        {draft.type === 'imagen' && (
          <div>
            <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Imágenes</label>
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
              <div style={{ border: '1px solid var(--t-border)', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seleccionar de biblioteca</div>
                  <button onClick={() => setShowLibrary(null)} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }}>Cerrar</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 5 }}>
                  {libraryImages.map((libImg, i) => {
                    const alreadyAdded = (draft.images || []).some(existing => existing.url === libImg.url);
                    return (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={libImg.url} alt="" onClick={() => { if (!alreadyAdded) addImage(libImg.url); }}
                          style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 5, cursor: alreadyAdded ? 'default' : 'pointer', border: alreadyAdded ? '2px solid #22c55e' : '2px solid transparent', opacity: alreadyAdded ? 0.5 : 1 }}
                          onMouseEnter={e => { if (!alreadyAdded) e.currentTarget.style.border = '2px solid #3b82f6'; }}
                          onMouseLeave={e => { if (!alreadyAdded) e.currentTarget.style.border = '2px solid transparent'; }} />
                        {alreadyAdded && <div style={{ position: 'absolute', top: 2, right: 2, background: '#22c55e', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCheck /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 8, padding: '9px 10px', fontSize: 12, color: 'var(--t-text-muted)', cursor: uploading ? 'not-allowed' : 'pointer', minWidth: 100 }}
                onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = 'var(--t-border-muted)'; }}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                {uploading ? 'Subiendo…' : '+ Subir imagen'}
              </button>
              <button onClick={handleCrop} disabled={uploading}
                style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 8, padding: '9px 10px', fontSize: 12, color: 'var(--t-text-muted)', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, minWidth: 100 }}
                onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = 'var(--t-border-muted)'; }}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                <IconScissors /> Recortar del email
              </button>
              {libraryImages?.length > 0 && (
                <button onClick={() => setShowLibrary(showLibrary === 'global' ? null : 'global')}
                  style={{ flex: 1, background: showLibrary === 'global' ? 'var(--t-surface2)' : 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 8, padding: '9px 10px', fontSize: 12, color: 'var(--t-text-muted)', cursor: 'pointer', minWidth: 100 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--t-border-muted)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                  Seleccionar imagen
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={async e => {
                const files = Array.from(e.target.files || []);
                e.target.value = '';
                if (!files.length) return;
                setUploading(true);
                try { for (const f of files) { const url = await onUploadImage(f); addImage(url); } }
                catch { alert('Error al subir imagen'); }
                finally { setUploading(false); }
              }} />
          </div>
        )}

        {/* Layout selector para enlaces (antes de los links) */}
        {draft.type === 'enlaces' && (
          <div>
            <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Disposición</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ value: 'columna', label: 'Columna' }, { value: 'fila', label: 'Fila' }, { value: 'grid', label: 'Grid' }].map(opt => {
                const active = (draft.links_layout || 'columna') === opt.value;
                return (
                  <button key={opt.value} onClick={() => update('links_layout', opt.value)}
                    style={{ flex: 1, background: active ? 'var(--t-surface2)' : 'transparent', border: `1px solid ${active ? '#6366f1' : 'var(--t-border-mid)'}`, borderRadius: 8, padding: '7px 10px', fontSize: 12, color: active ? '#a5b4fc' : 'var(--t-text-muted)', cursor: 'pointer', textAlign: 'center', fontWeight: active ? 600 : 400 }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Campos específicos: enlaces (múltiples links) */}
        {draft.type === 'enlaces' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Links</label>
            {(draft.links || []).map((link, linkIdx) => {
              const linkFileRef = (ref) => { if (ref) linkFileInputRefs.current[linkIdx] = ref; };
              const isUploadingThis = uploadingLink === linkIdx;
              return (
                <div key={linkIdx} style={{ border: '1px solid var(--t-border)', borderRadius: 10, padding: '12px 12px 10px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
                  {draft.links.length > 1 && (
                    <button onClick={() => removeLink(linkIdx)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', padding: 2 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--t-text-subtle)'}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                  {/* Images for this link */}
                  {(link.images || []).length > 0 && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {(link.images || []).map((img, imgIdx) => (
                        <div key={imgIdx} style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                          <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5, border: '1px solid var(--t-border)', display: 'block' }} />
                          <button onClick={() => removeLinkImage(linkIdx, imgIdx)}
                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.75)', border: 'none', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Library picker for this link */}
                  {showLibrary === linkIdx && libraryImages?.length > 0 && (
                    <div style={{ border: '1px solid var(--t-border)', borderRadius: 7, padding: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seleccionar de biblioteca</div>
                        <button onClick={() => setShowLibrary(null)} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }}>Cerrar</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 4 }}>
                        {libraryImages.map((libImg, i) => {
                          const alreadyAdded = (draft.links?.[linkIdx]?.images || []).some(existing => existing.url === libImg.url);
                          return (
                            <div key={i} style={{ position: 'relative' }}>
                              <img src={libImg.url} alt="" onClick={() => { if (!alreadyAdded) addLinkImage(linkIdx, libImg.url); }}
                                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 4, cursor: alreadyAdded ? 'default' : 'pointer', border: alreadyAdded ? '2px solid #22c55e' : '2px solid transparent', opacity: alreadyAdded ? 0.5 : 1 }}
                                onMouseEnter={e => { if (!alreadyAdded) e.currentTarget.style.border = '2px solid #3b82f6'; }}
                                onMouseLeave={e => { if (!alreadyAdded) e.currentTarget.style.border = '2px solid transparent'; }} />
                              {alreadyAdded && <div style={{ position: 'absolute', top: 2, right: 2, background: '#22c55e', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconCheck /></div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <button onClick={() => linkFileInputRefs.current[linkIdx]?.click()} disabled={uploadingLink !== null}
                      style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: uploadingLink !== null ? 'not-allowed' : 'pointer', minWidth: 80 }}
                      onMouseEnter={e => { if (uploadingLink === null) e.currentTarget.style.borderColor = 'var(--t-border-muted)'; }}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                      {isUploadingThis ? 'Subiendo…' : '+ Imagen'}
                    </button>
                    <button onClick={() => handleLinkCrop(linkIdx)} disabled={uploadingLink !== null}
                      style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: uploadingLink !== null ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 80 }}
                      onMouseEnter={e => { if (uploadingLink === null) e.currentTarget.style.borderColor = 'var(--t-border-muted)'; }}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                      <IconScissors /> Recortar
                    </button>
                    {libraryImages?.length > 0 && (
                      <button onClick={() => setShowLibrary(showLibrary === linkIdx ? null : linkIdx)}
                        style={{ flex: 1, background: showLibrary === linkIdx ? 'var(--t-surface2)' : 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: 'pointer', minWidth: 80 }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--t-border-muted)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                        Seleccionar
                      </button>
                    )}
                    <input ref={linkFileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                      onChange={async e => {
                        const files = Array.from(e.target.files || []);
                        e.target.value = '';
                        if (!files.length) return;
                        setUploadingLink(linkIdx);
                        try { for (const f of files) { const url = await onUploadImage(f); addLinkImage(linkIdx, url); } }
                        catch { alert('Error al subir imagen'); }
                        finally { setUploadingLink(null); }
                      }} />
                  </div>
                  {/* URL */}
                  <div>
                    <input value={link.url || ''} onChange={e => updateLinkUrl(linkIdx, e.target.value)}
                      placeholder="https://…"
                      style={{ width: '100%', background: 'var(--t-surface2)', border: `1px solid ${urlErrors[linkIdx] ? '#ef4444' : 'var(--t-border-mid)'}`, borderRadius: 7, padding: '7px 10px', fontSize: 12, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                    {urlErrors[linkIdx] && <span style={{ fontSize: 11, color: '#ef4444', display: 'block', marginTop: 3 }}>{urlErrors[linkIdx]}</span>}
                  </div>
                </div>
              );
            })}
            <button onClick={addLink}
              style={{ background: 'transparent', border: '1px dashed var(--t-border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-border-mid)'; e.currentTarget.style.color = 'var(--t-text-muted)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border)'; e.currentTarget.style.color = 'var(--t-text-subtle)'; }}>
              + Añadir otro link
            </button>
          </div>
        )}

        {draft.type === 'imagen_texto' && (
          <>
            {/* Layout selector */}
            <div>
              <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Disposición</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { value: 'img-text', label: 'Imagen | Texto' },
                  { value: 'text-img', label: 'Texto | Imagen' },
                  { value: 'img-top',  label: 'Imagen ↑  Texto ↓' },
                  { value: 'text-top', label: 'Texto ↑  Imagen ↓' },
                ].map(opt => {
                  const active = (draft.it_layout || 'img-text') === opt.value;
                  return (
                    <button key={opt.value} onClick={() => update('it_layout', opt.value)}
                      style={{ background: active ? 'var(--t-surface2)' : 'transparent', border: `1px solid ${active ? '#6366f1' : 'var(--t-border-mid)'}`, borderRadius: 8, padding: '7px 10px', fontSize: 11, color: active ? '#a5b4fc' : 'var(--t-text-muted)', cursor: 'pointer', textAlign: 'center', fontWeight: active ? 600 : 400 }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Elementos</label>
              {(draft.items || []).map((it, itemIdx) => {
                const itFileRef = (ref) => { if (ref) itemFileInputRefs.current[itemIdx] = ref; };
                const isUploadingThis = uploadingItem === itemIdx;
                const libKey = `it-${itemIdx}`;
                return (
                  <div key={itemIdx} style={{ border: '1px solid var(--t-border)', borderRadius: 10, padding: '12px 12px 10px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
                    {(draft.items || []).length > 1 && (
                      <button onClick={() => removeItem(itemIdx)}
                        style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', padding: 2 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--t-text-subtle)'}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}

                    {/* Image (max 1) */}
                    {it.image ? (
                      <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                        <img src={it.image.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1px solid var(--t-border)', display: 'block' }} />
                        <button onClick={() => setItemImage(itemIdx, null)}
                          style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.75)', border: 'none', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>×</button>
                      </div>
                    ) : (
                      <>
                        {showLibrary === libKey && libraryImages?.length > 0 && (
                          <div style={{ border: '1px solid var(--t-border)', borderRadius: 7, padding: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seleccionar de biblioteca</div>
                              <button onClick={() => setShowLibrary(null)} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }}>Cerrar</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 4 }}>
                              {libraryImages.map((libImg, i) => (
                                <img key={i} src={libImg.url} alt="" onClick={() => { setItemImage(itemIdx, libImg.url); setShowLibrary(null); }}
                                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '2px solid transparent' }}
                                  onMouseEnter={e => e.currentTarget.style.border = '2px solid #3b82f6'}
                                  onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'} />
                              ))}
                            </div>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <button onClick={() => itemFileInputRefs.current[itemIdx]?.click()} disabled={isUploadingThis}
                            style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: isUploadingThis ? 'not-allowed' : 'pointer', minWidth: 80 }}>
                            {isUploadingThis ? 'Subiendo…' : '+ Imagen'}
                          </button>
                          <button onClick={() => handleItemCrop(itemIdx)} disabled={isUploadingThis}
                            style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: isUploadingThis ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 80 }}>
                            <IconScissors /> Recortar
                          </button>
                          {libraryImages?.length > 0 && (
                            <button onClick={() => setShowLibrary(showLibrary === libKey ? null : libKey)}
                              style={{ flex: 1, background: showLibrary === libKey ? 'var(--t-surface2)' : 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: 'pointer', minWidth: 80 }}>
                              Seleccionar
                            </button>
                          )}
                        </div>
                        <input ref={itFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={async e => {
                            const file = e.target.files?.[0]; e.target.value = '';
                            if (file) await handleItemFile(itemIdx, file);
                          }} />
                      </>
                    )}

                    {/* Text */}
                    <textarea value={it.texto || ''} onChange={e => updateItemField(itemIdx, 'texto', e.target.value)}
                      rows={3} placeholder="Análisis y comentarios…"
                      style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />

                    {/* Text styling */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <label style={{ fontSize: 10, color: 'var(--t-text-subtle)' }}>Color</label>
                        <InlineColorPicker value={it.text_color || ''} onChange={c => updateItemField(itemIdx, 'text_color', c)} />
                      </div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[['left','≡L'], ['center','≡C'], ['right','≡R'], ['justify','≡']].map(([val, icon]) => {
                          const active = (it.text_align || 'left') === val;
                          return (
                            <button key={val} onClick={() => updateItemField(itemIdx, 'text_align', val)}
                              title={val}
                              style={{ background: active ? 'var(--t-border)' : 'transparent', border: `1px solid ${active ? 'var(--t-text-muted)' : 'var(--t-border)'}`, borderRadius: 5, width: 28, height: 26, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'var(--t-text)' : 'var(--t-text-subtle)', fontWeight: active ? 700 : 400 }}>
                              {icon}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={addItem}
                style={{ background: 'transparent', border: '1px dashed var(--t-border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-border-mid)'; e.currentTarget.style.color = 'var(--t-text-muted)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border)'; e.currentTarget.style.color = 'var(--t-text-subtle)'; }}>
                + Añadir otro elemento
              </button>
            </div>
          </>
        )}

        {draft.type === 'correccion' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email de corrección</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--t-text-subtle)' }}>Fondo email</span>
                <input type="color" value={draft.email_bg || '#ffffff'} onChange={e => update('email_bg', e.target.value)}
                  style={{ width: 26, height: 22, borderRadius: 4, border: '1px solid var(--t-border-mid)', cursor: 'pointer', padding: 1 }} />
              </div>
            </div>
            <EBCanvas
              blocks={draft.email_blocks || []}
              onChange={newBlocks => update('email_blocks', newBlocks)}
              onUpload={onUploadImage}
              onCrop={onCropFromEmail}
              libImages={libraryImages} />
          </div>
        )}

        {/* Guardar / Cancelar */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button onClick={handleSave}
            style={{ flex: 1, background: 'white', color: 'black', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Guardar
          </button>
          <button onClick={onClose}
            style={{ background: 'transparent', border: '1px solid var(--t-border-mid)', color: 'var(--t-text-muted)', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer' }}>
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
  const { theme, toggle } = useTheme();
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
  const [obUrl, setObUrl]           = useState('');
  const [obFechaAnalisis, setObFechaAnalisis] = useState('');
  const [obMarcaError, setObMarcaError] = useState('');
  const [obUrlError, setObUrlError] = useState('');

  // ── Display state ────────────────────────────────────────────────────────
  const [categoria, setCategoria] = useState(null);
  const [subcategoria, setSubcat] = useState(null);
  const [marca, setMarca]         = useState(null);
  const [asunto, setAsunto]       = useState(null);
  const [adelanto, setAdelanto]   = useState(null);
  const [enviadoEl, setEnviadoEl] = useState(null);
  const [itemUrl, setItemUrl]     = useState(null);
  const [fechaAnalisis, setFechaAnalisis] = useState(null);

  // ── Blocks state ─────────────────────────────────────────────────────────
  const [blocksData, setBlocksData]             = useState([]);
  const [blocksLibrary, setBlocksLibrary]       = useState([]);
  const blocksLibraryRef                        = useRef([]);
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
        setMarca(data.marca  ?? null);
        setAsunto(data.asunto ?? null);
        setAdelanto(data.adelanto ?? null);
        setEnviadoEl(data.enviado_el ?? null);
        setItemUrl(data.ficha_url ?? null);
        setFechaAnalisis(data.fecha_analisis ?? null);
        const rawBlocks = data.blocks_data?.blocks || [];
        setBlocksData(rawBlocks.map(b => ({
          ...b,
          visible: b.visible !== undefined ? b.visible : b.type !== 'correccion',
        })));
        const lib = data.blocks_data?.library || [];
        setBlocksLibrary(lib);
        blocksLibraryRef.current = lib;
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria: obCategoria }),
      });
      if (!res.ok) throw new Error('Error al detectar');
      const data = await res.json();
      if (obCategoria === 'ficha') {
        if (data.marca)          setObMarca(data.marca);
        if (data.ficha_url)      setObUrl(data.ficha_url);
        if (data.fecha_analisis) setObFechaAnalisis(data.fecha_analisis);
      } else {
        if (data.marca)      setObMarca(data.marca);
        if (data.asunto)     setObAsunto(data.asunto);
        if (data.adelanto)   setObAdelanto(data.adelanto);
        if (data.enviado_el) setObEnviadoEl(data.enviado_el);
      }
    } catch (e) { alert(e.message); }
    finally { setDetecting(false); }
  };

  const handleObCategoria = (v) => { setObCategoria(v); setObStep(v === 'email' ? 'subcategoria' : 'campos'); };
  const handleObSubcat    = (v) => { setObSubcat(v);    setObStep('campos'); };

  const handleGuardar = async () => {
    const marcaTrimmed = obMarca.trim();
    const urlTrimmed = obUrl.trim();
    if (!marcaTrimmed) { setObMarcaError('La marca es obligatoria'); return; }
    if (obCategoria === 'ficha' && !urlTrimmed) { setObUrlError('La URL es obligatoria'); return; }
    if (obCategoria === 'ficha' && !isValidHttpUrl(urlTrimmed)) { setObUrlError('URL no válida. Ej: https://dominio.com'); return; }
    const updates = {
      categoria: obCategoria,
      subcategoria: obCategoria === 'email' ? obSubcat : null,
      marca: marcaTrimmed,
      asunto: obCategoria === 'email' ? obAsunto.trim() : null,
      adelanto: obCategoria === 'email' ? obAdelanto.trim() : null,
      enviado_el: obCategoria === 'email' ? (obEnviadoEl || null) : null,
      ficha_url: obCategoria === 'ficha' ? (urlTrimmed || null) : null,
      fecha_analisis: obCategoria === 'ficha' ? (obFechaAnalisis || null) : null,
      tags: obTags,
      blocks_data: { blocks: blocksData, library: blocksLibraryRef.current },
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
        setMarca(data.marca ?? null);
        setAsunto(data.asunto ?? null);
        setAdelanto(data.adelanto ?? null);
        setEnviadoEl(data.enviado_el ?? null);
        setItemUrl(data.ficha_url ?? null);
        setFechaAnalisis(data.fecha_analisis ?? null);
        if (data.blocks_data?.blocks) {
          setBlocksData(data.blocks_data.blocks);
          const lib = data.blocks_data.library || [];
          setBlocksLibrary(lib);
          blocksLibraryRef.current = lib;
        }
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
        body: JSON.stringify({ blocks_data: { blocks, library: blocksLibraryRef.current } }),
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
      links_layout: 'columna',
      images_layout: 'columna',
      it_layout: 'img-text',
      items: type === 'imagen_texto' ? [{ image: null, texto: '', text_color: '', text_align: 'left' }] : [],
      email_blocks: [],
      texto: '',
      nota: '',
      visible: type !== 'correccion',
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

  const toggleBlockVisible = useCallback((blockId) => {
    setBlocksData(prev => {
      const next = prev.map(b => b.id === blockId ? { ...b, visible: !b.visible } : b);
      saveBlocks(next);
      return next;
    });
  }, [saveBlocks]);

  const deleteBlock = useCallback((blockId) => {
    setBlocksData(prev => {
      const blockToDelete = prev.find(b => b.id === blockId);
      if (blockToDelete) {
        const libUrls = new Set(blocksLibraryRef.current.map(img => img.url));
        const newImgs = [];
        (blockToDelete.images || []).forEach(img => {
          if (!libUrls.has(img.url)) { newImgs.push(img); libUrls.add(img.url); }
        });
        (blockToDelete.links || []).forEach(link => {
          (link.images || []).forEach(img => {
            if (!libUrls.has(img.url)) { newImgs.push(img); libUrls.add(img.url); }
          });
        });
        (blockToDelete.items || []).forEach(it => {
          if (it.image && !libUrls.has(it.image.url)) { newImgs.push(it.image); libUrls.add(it.image.url); }
        });
        if (newImgs.length) {
          const newLib = [...blocksLibraryRef.current, ...newImgs];
          blocksLibraryRef.current = newLib;
          setBlocksLibrary(newLib);
        }
      }
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

  const handleCropForModal = useCallback((cropRects) => {
    setShowCropForModal(false);
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cropOne = (cropRect) => new Promise(resolve => {
        const canvas = document.createElement('canvas');
        canvas.width = cropRect.w; canvas.height = cropRect.h;
        canvas.getContext('2d').drawImage(img, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cropRect.w, cropRect.h);
        canvas.toBlob(async blob => {
          if (!blob) { resolve(null); return; }
          try { resolve(await uploadImageForBlock(blob)); }
          catch { resolve(null); }
        }, 'image/png');
      });
      Promise.all(cropRects.map(cropOne)).then(urls => {
        const valid = urls.filter(Boolean);
        cropForModalResolveRef.current?.resolve(valid);
        cropForModalResolveRef.current = null;
      });
    };
    img.src = item.url;
  }, [item, uploadImageForBlock]);

  // Crop handlers (main image)
  const handleCrop = useCallback((cropRects) => {
    const cropRect = Array.isArray(cropRects) ? cropRects[0] : cropRects;
    if (!cropRect) return;
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
    const imgs = [...blocksLibrary];
    blocksLibrary.forEach(img => seen.add(img.url));
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
  }, [blocksData, blocksLibrary]);

  if (loading) return (
    <div data-theme={theme} className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--t-bg)' }}>
      <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div data-theme={theme} className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--t-bg)' }}>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={() => navigate('/admin/biblioteca')} className="text-xs text-zinc-400 border border-zinc-700 px-4 py-2 rounded-lg">← Volver</button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div data-theme={theme} className="p-4 md:p-8" style={{ backgroundColor: 'var(--t-bg)', color: 'var(--t-text)', minHeight: '100vh' }}>

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
        <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
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
        {item?.publico === false && (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#f87171', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '3px 8px', letterSpacing: '0.02em' }}>
            Oculto
          </span>
        )}
        {(saving || blocksSaving) && <span className="text-xs text-zinc-600">Guardando…</span>}
        <button onClick={toggle} title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          style={{ marginLeft: 'auto', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
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
                    <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
                    <Tag colors={CAT_COLORS[obCategoria]} label={catLabel(obCategoria)} onRemove={() => { setObCategoria(null); setObSubcat(null); setObStep('categoria'); }} />
                  </div>
                  {obSubcat && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
                      <Tag colors={SUBCAT_COLORS[obSubcat]} label={subcatLabel(obSubcat)} onRemove={() => { setObSubcat(null); setObStep('subcategoria'); }} />
                    </div>
                  )}
                </div>
              )}

              {obStep === 'categoria' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--t-text)' }}>¿Email o Ficha de Producto?</span>
                  <CatButtons options={CATEGORIAS} colors={CAT_COLORS} onSelect={handleObCategoria} />
                </div>
              )}

              {obStep === 'subcategoria' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--t-text)' }}>¿Automatización o Campaña?</span>
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
                    <label style={{ fontSize: 11, color: 'var(--t-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Marca <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input type="text" value={obMarca}
                        onChange={e => { setObMarca(e.target.value); setObMarcaError(''); }}
                        placeholder="Marca…"
                        style={{ width: '100%', background: 'var(--t-surface2)', border: `1px solid ${obMarcaError ? '#f87171' : 'var(--t-border-mid)'}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                      {obMarca.length > 0 && allMarcas.filter(s => s.toLowerCase().includes(obMarca.toLowerCase()) && s !== obMarca).length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--t-border-s)', border: '1px solid var(--t-border)', borderRadius: 8, marginTop: 4, zIndex: 20, overflow: 'hidden' }}>
                          {allMarcas.filter(s => s.toLowerCase().includes(obMarca.toLowerCase()) && s !== obMarca).slice(0, 6).map(s => (
                            <div key={s} onMouseDown={() => setObMarca(s)}
                              style={{ padding: '7px 12px', fontSize: 13, color: 'var(--t-text)', cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--t-border)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{s}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    {obMarcaError && <span style={{ fontSize: 11, color: '#f87171' }}>{obMarcaError}</span>}
                  </div>

                  {obCategoria === 'email' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 11, color: 'var(--t-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Asunto</label>
                      <input type="text" value={obAsunto} onChange={e => setObAsunto(e.target.value)} placeholder="Asunto del email…"
                        style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                    </div>
                  )}

                  {obCategoria === 'email' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 11, color: 'var(--t-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Adelanto</label>
                      <input type="text" value={obAdelanto} onChange={e => setObAdelanto(e.target.value)} placeholder="Texto de adelanto…"
                        style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                    </div>
                  )}

                  {obCategoria === 'email' && obSubcat !== 'automatizacion' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 11, color: 'var(--t-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enviado el Día</label>
                      <input type="date" value={obEnviadoEl} onChange={e => setObEnviadoEl(e.target.value)}
                        style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                    </div>
                  )}

                  {obCategoria === 'ficha' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 11, color: 'var(--t-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>URL <span style={{ color: '#f87171' }}>*</span></label>
                      <input type="text" value={obUrl}
                        onChange={e => { setObUrl(e.target.value); setObUrlError(''); }}
                        onBlur={() => { if (obUrl.trim() && !isValidHttpUrl(obUrl.trim())) setObUrlError('URL no válida. Ej: https://dominio.com'); }}
                        placeholder="https://dominio.com"
                        style={{ width: '100%', background: 'var(--t-surface2)', border: `1px solid ${obUrlError ? '#f87171' : 'var(--t-border-mid)'}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                      {obUrlError && <span style={{ fontSize: 11, color: '#f87171' }}>{obUrlError}</span>}
                    </div>
                  )}

                  {obCategoria === 'ficha' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 11, color: 'var(--t-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fecha de Análisis</label>
                      <input type="date" value={obFechaAnalisis} onChange={e => setObFechaAnalisis(e.target.value)}
                        style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                      <span style={{ fontSize: 11, color: 'var(--t-text-subtle)', fontStyle: 'italic' }}>* La página puede haber sido editada en fechas posteriores</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, color: 'var(--t-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etiquetas</label>
                    <TagPicker
                      selectedIds={obTags}
                      allTags={allTags}
                      categoria={obCategoria}
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
                  style={{ width: '100%', background: saving ? 'var(--t-border-mid)' : 'white', color: saving ? 'var(--t-text-placeholder)' : 'black', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {saving && <div style={{ width: 12, height: 12, border: '2px solid var(--t-text-muted)', borderTopColor: 'black', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              )}
              <button onClick={() => setDiscardConfirm(true)}
                style={{ width: '100%', background: 'transparent', border: '1px solid var(--t-border-mid)', color: 'var(--t-text-muted)', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border-mid)'; e.currentTarget.style.color = 'var(--t-text-muted)'; }}>
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
                  <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
                  <Tag colors={CAT_COLORS[categoria]} label={catLabel(categoria)} onRemove={() => { setCategoria(null); setSubcat(null); patch({ categoria: null, subcategoria: null, ficha_url: null, fecha_analisis: null }); setObMarca(''); setObUrl(''); setObFechaAnalisis(''); setObTags([]); setMode('onboarding'); setObStep('categoria'); setObCategoria(null); setObSubcat(null); }} />
                </div>
              )}
              {subcategoria && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
                  <Tag colors={SUBCAT_COLORS[subcategoria]} label={subcatLabel(subcategoria)} onRemove={() => { setSubcat(null); patch({ subcategoria: null }); setObMarca(marca || ''); setObAsunto(asunto || ''); setObAdelanto(adelanto || ''); setObEnviadoEl(enviadoEl || ''); setObTags(item?.tags || []); setMode('onboarding'); setObCategoria(categoria); setObSubcat(null); setObStep('subcategoria'); }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etiquetas</span>
              <TagPicker
                selectedIds={(item?.tags || [])}
                allTags={allTags}
                categoria={categoria}
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
            {categoria === 'email' && (
              <FieldRow label="Asunto" savedValue={asunto} onSave={v => { setAsunto(v); patch({ asunto: v }); }} placeholder="Asunto del email…" />
            )}
            {categoria === 'email' && (
              <FieldRow label="Adelanto" savedValue={adelanto} onSave={v => { setAdelanto(v); patch({ adelanto: v }); }} placeholder="Texto de adelanto…" />
            )}
            {categoria === 'email' && subcategoria !== 'automatizacion' && (
              <FieldRow label="Enviado el Día" savedValue={enviadoEl} onSave={v => { setEnviadoEl(v); patch({ enviado_el: v }); }} allowEmpty={false} type="date" />
            )}
            {categoria === 'ficha' && (
              <FieldRow label="URL" savedValue={itemUrl} required onSave={v => { setItemUrl(v); patch({ ficha_url: v }); }} placeholder="https://dominio.com" allowEmpty={false}
                validate={v => isValidHttpUrl(v) ? null : 'URL no válida. Ej: https://dominio.com'} />
            )}
            {categoria === 'ficha' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <FieldRow label="Fecha de Análisis" savedValue={fechaAnalisis} onSave={v => { setFechaAnalisis(v); patch({ fecha_analisis: v }); }} type="date" />
                <span style={{ fontSize: 11, color: 'var(--t-text-subtle)', fontStyle: 'italic' }}>* La página puede haber sido editada en fechas posteriores</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Blocks section (display mode) ── */}
      {mode === 'display' && (categoria === 'email' || categoria === 'ficha') && (
        <div style={{ marginTop: 40 }}>
          {blocksSaving && <span style={{ fontSize: 11, color: 'var(--t-text-subtle)', display: 'block', marginBottom: 8 }}>Guardando…</span>}
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
                  onToggleVisible={() => toggleBlockVisible(block.id)}
                />
              </div>
            ))}
            <BlockDivider onAdd={() => setShowBlockSelectorModal(true)} />
            <button
              onClick={() => setShowBlockSelectorModal(true)}
              style={{ width: '100%', background: 'transparent', border: '1px dashed var(--t-border)', color: 'var(--t-text-subtle)', borderRadius: 10, padding: '12px 16px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s', marginTop: 4 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-border-mid)'; e.currentTarget.style.color = 'var(--t-text-muted)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border)'; e.currentTarget.style.color = 'var(--t-text-subtle)'; }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Añadir bloque
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
