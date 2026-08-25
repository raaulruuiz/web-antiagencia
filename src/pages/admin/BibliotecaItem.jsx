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
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
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
const IconAsuntoAdelanto = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="15" y2="12"/>
    <line x1="3" y1="18" x2="18" y2="18"/>
  </svg>
);
const IconChip = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="7" width="10" height="10" rx="1"/>
    <path d="M7 9H4"/><path d="M7 12H4"/><path d="M7 15H4"/>
    <path d="M17 9h3"/><path d="M17 12h3"/><path d="M17 15h3"/>
    <path d="M9 7V4"/><path d="M12 7V4"/><path d="M15 7V4"/>
    <path d="M9 17v3"/><path d="M12 17v3"/><path d="M15 17v3"/>
  </svg>
);
const IconChipSm = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="7" width="10" height="10" rx="1"/>
    <path d="M7 9H4"/><path d="M7 12H4"/><path d="M7 15H4"/>
    <path d="M17 9h3"/><path d="M17 12h3"/><path d="M17 15h3"/>
    <path d="M9 7V4"/><path d="M12 7V4"/><path d="M15 7V4"/>
    <path d="M9 17v3"/><path d="M12 17v3"/><path d="M15 17v3"/>
  </svg>
);
const IconColumns = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/><rect x="16" y="3" width="6" height="18" rx="1"/>
  </svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconAudio = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
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
  { type: 'enlaces',      label: 'Enlace',          icon: <IconChain /> },
  { type: 'imagen',       label: 'Imagen',           icon: <IconImageBlock /> },
  { type: 'imagen_texto', label: 'Imagen y/o Texto', icon: <IconImageText /> },
  { type: 'transcribir',  label: 'Transcribir',      icon: <IconChipSm /> },
  { type: 'columnas',     label: 'Columnas',         icon: <IconColumns /> },
];
// Includes all types (for display/lookup in BlockCard, not for BlockSelector grid)
const ALL_BLOCK_META = [
  ...BLOCK_TYPES,
  { type: 'asunto_adelanto', label: 'Asunto y/o Adelanto', icon: <IconAsuntoAdelanto /> },
  { type: 'correccion',      label: 'Corrección',          icon: <IconCorrection /> },
  { type: 'puntuacion',      label: 'Puntuación',          icon: <IconStar /> },
  { type: 'audio',           label: 'Audio',               icon: <IconAudio /> },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function catLabel(v)    { return CATEGORIAS.find(c => c.value === v)?.label || v; }
function subcatLabel(v) { return SUBCATEGORIAS.find(s => s.value === v)?.label || v; }
function formatDate(v)  {
  if (!v) return '';
  const s = new Date(v + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
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

// ── DisplaySectorPicker ───────────────────────────────────────────────────────
function DisplaySectorPicker({ allSectors, selectedIds, onToggle, onCreateSector }) {
  const [showDrop, setShowDrop] = useState(false);
  const [input, setInput] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const available = allSectors.filter(s => !selectedIds.includes(s.id));
  const filtered = input.length > 0 ? allSectors.filter(s => s.name.toLowerCase().includes(input.toLowerCase())) : available;
  const exactMatch = allSectors.find(s => s.name.toLowerCase() === input.trim().toLowerCase());
  const canCreate = input.trim().length > 0 && !exactMatch;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sector</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
        {selectedIds.map(sid => {
          const s = allSectors.find(x => x.id === sid);
          if (!s) return null;
          return (
            <span key={sid} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '2px 6px 2px 8px', background: s.color + '22', border: `1px solid ${s.color}`, color: s.color }}>
              {s.name}
              <button onClick={() => onToggle(sid)} style={{ background: 'none', border: 'none', color: s.color, cursor: 'pointer', padding: 0, opacity: 0.7, lineHeight: 1, fontSize: 14 }}>×</button>
            </span>
          );
        })}
        <div ref={ref} style={{ position: 'relative' }}>
          <button onClick={() => setShowDrop(v => !v)}
            style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--t-border-mid)', background: 'transparent', color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, lineHeight: 1 }}>+</button>
          {showDrop && (
            <div style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--t-surface2)', border: '1px solid var(--t-border)', borderRadius: 8, marginTop: 4, zIndex: 20, minWidth: 160, overflow: 'hidden' }}>
              <input autoFocus value={input} onChange={e => setInput(e.target.value)} placeholder="Buscar o crear…"
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--t-border)', padding: '7px 10px', fontSize: 12, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }}
                onKeyDown={e => { if (e.key === 'Enter' && canCreate) { onCreateSector(input.trim()); setInput(''); setShowDrop(false); } }} />
              {filtered.map(s => (
                <div key={s.id} onMouseDown={() => { onToggle(s.id); setShowDrop(false); setInput(''); }}
                  style={{ padding: '6px 10px', fontSize: 12, color: s.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--t-border)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />{s.name}
                </div>
              ))}
              {canCreate && (
                <div onMouseDown={() => { onCreateSector(input.trim()); setInput(''); setShowDrop(false); }}
                  style={{ padding: '6px 10px', fontSize: 12, color: 'var(--t-text-muted)', cursor: 'pointer', borderTop: filtered.length ? '1px solid var(--t-border)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--t-border)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  + Crear "{input.trim()}"
                </div>
              )}
            </div>
          )}
        </div>
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

  // Scope tags by categoria: ficha sees only ficha tags; email sees email tags (shared across all subcategories)
  const scopedTags = categoria === 'ficha'
    ? allTags.filter(t => t.subcategoria === 'ficha')
    : allTags.filter(t => t.subcategoria === 'email' || !t.subcategoria);
  const available  = scopedTags.filter(t => !selectedIds.includes(t.id));
  const filtered   = input.length > 0 ? available.filter(t => t.name.toLowerCase().includes(input.toLowerCase())) : available;
  const exactMatch = scopedTags.find(t => t.name.toLowerCase() === input.trim().toLowerCase());
  const canCreate  = input.trim().length > 0 && !exactMatch;

  const handleSelect = (tag) => { onAdd(tag.id); setInput(''); setShowDrop(false); setShowInput(false); };

  const handleCreate = () => {
    const color = TAG_PALETTE[Math.floor(Math.random() * TAG_PALETTE.length)];
    const scope = categoria === 'ficha' ? 'ficha' : 'email';
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
  const [zoom, setZoom]               = useState(1);
  const [baseSize, setBaseSize]       = useState(null);
  const imgRef = useRef(null);
  const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3, 4];

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

  const changeZoom = useCallback((dir) => {
    setZoom(prev => {
      const idx = ZOOM_STEPS.findIndex(z => Math.abs(z - prev) < 0.01);
      const ni = dir > 0 ? Math.min(idx + 1, ZOOM_STEPS.length - 1) : Math.max(idx - 1, 0);
      return ZOOM_STEPS[ni];
    });
    setSavedRects([]);
    setCropBox(null);
  }, []);

  useEffect(() => {
    if (mode === 'ajustar' && imgRef.current) {
      requestAnimationFrame(() => requestAnimationFrame(initCropBox));
    }
  }, [zoom, mode, initCropBox]);

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
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <button onClick={() => changeZoom(-1)} disabled={zoom <= ZOOM_STEPS[0]}
            style={{ width:26, height:26, background:'var(--t-border-s)', border:'1px solid var(--t-border)', borderRadius:6, color:'var(--t-text)', fontSize:16, cursor: zoom <= ZOOM_STEPS[0] ? 'not-allowed' : 'pointer', opacity: zoom <= ZOOM_STEPS[0] ? 0.4 : 1, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>−</button>
          <span style={{ fontSize:11, color:'var(--t-text-muted)', minWidth:38, textAlign:'center' }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => changeZoom(1)} disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
            style={{ width:26, height:26, background:'var(--t-border-s)', border:'1px solid var(--t-border)', borderRadius:6, color:'var(--t-text)', fontSize:16, cursor: zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1] ? 'not-allowed' : 'pointer', opacity: zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1] ? 0.4 : 1, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>+</button>
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
      <div style={{ flex:1, display:'flex', width:'100%', overflow:'auto' }}>
        <div style={{ margin:'auto', padding:'20px 40px', flexShrink:0 }}>
        <div style={{ position:'relative', display:'inline-block' }}>
          <img ref={imgRef} src={imageUrl} crossOrigin="anonymous" alt="recortar"
            onLoad={e => {
              setBaseSize(prev => prev || (e.target.offsetWidth > 0 ? { w: e.target.offsetWidth, h: e.target.offsetHeight } : null));
              if (mode === 'ajustar') initCropBox();
            }}
            style={{ width: baseSize ? Math.round(baseSize.w * zoom) : undefined, height: baseSize ? Math.round(baseSize.h * zoom) : undefined, maxWidth: baseSize ? 'none' : '80vw', maxHeight: baseSize ? 'none' : '62vh', display:'block', cursor:mode==='libre'?'crosshair':'default' }}
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

// ── Social networks ───────────────────────────────────────────────────────────
const SOCIAL_NETWORKS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2' },
  { id: 'x',         label: 'X',         color: '#000000' },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023' },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000' },
  { id: 'tiktok',    label: 'TikTok',    color: '#010101' },
];

function SocialIcon({ network, color = 'currentColor', size = 24 }) {
  const c = color; const s = size;
  if (network === 'instagram') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke={c} strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2" fill={c}/></svg>;
  if (network === 'facebook')  return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
  if (network === 'x')         return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
  if (network === 'pinterest')  return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>;
  if (network === 'youtube')   return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
  if (network === 'tiktok')    return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.26 8.26 0 0 0 4.83 1.56V6.59a4.85 4.85 0 0 1-1.06-.1z"/></svg>;
  return null;
}

// ── Block: selector panel ─────────────────────────────────────────────────────
const BLOCK_COLORS = { enlaces: '#3b82f6', imagen: '#22c55e', imagen_texto: '#f97316', correccion: '#a855f7', asunto_adelanto: '#f59e0b', transcribir: '#06b6d4', columnas: '#14b8a6', puntuacion: '#e879f9', audio: '#f43f5e' };
const DEFAULT_TITLES = { enlaces: 'Enlaces del Correo', imagen: 'Imágenes del Correo', imagen_texto: 'Análisis y Comentarios', correccion: 'Cómo lo Reescribiría Yo', asunto_adelanto: 'Asunto y Adelanto', transcribir: 'Transcripción', columnas: 'Columnas', puntuacion: 'Puntuación', audio: 'Audio' };

const PLANTILLA_TYPES = {
  completo: ['puntuacion', 'audio', 'imagen', 'enlaces', 'transcribir', 'asunto_adelanto', 'imagen_texto', 'correccion'],
  simple:   ['puntuacion', 'asunto_adelanto', 'imagen_texto', 'correccion'],
};

function makeTemplateBlocks(plantilla) {
  const types = PLANTILLA_TYPES[plantilla] || [];
  return types.map((type, i) => ({
    id: `blk_${Date.now()}_${i}`,
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
    items: type === 'imagen_texto'    ? [{ image: null, texto: '', text_color: '', text_align: 'left' }]
         : type === 'asunto_adelanto' ? [{ show_asunto: false, show_adelanto: false, texto: '', text_color: '', text_align: 'left' }]
         : [],
    email_blocks: [],
    texto: '',
    nota: '',
    visible: type !== 'correccion' && type !== 'audio',
    ...(type === 'puntuacion' ? { autocalcular: true } : {}),
  }));
}
function scoreColor(s) { if (s == null) return '#71717a'; if (s < 5) return '#ef4444'; if (s < 7.5) return '#f97316'; return '#22c55e'; }

function calcularPuntuacion(blocks) {
  const TARGET = new Set(['imagen_texto', 'asunto_adelanto']);
  let total = 0, verdes = 0, amarillos = 0;
  for (const block of (blocks || [])) {
    if (!TARGET.has(block.type)) continue;
    for (const it of (block.items || [])) {
      if (!it.texto?.trim()) continue;
      total++;
      if (it.text_color === '#22c55e') verdes++;
      else if (it.text_color === '#eab308') amarillos++;
    }
  }
  if (total === 0) return null;
  const raw = (verdes * 10 + amarillos * 5) / total;
  return Math.round(raw * 100) / 100;
}

function BlockSelector({ onSelect, hasCorreccion, hasPuntuacion, onClose, categoria }) {
  const gridTypes = [
    ...BLOCK_TYPES,
    ...(categoria === 'email' ? [{ type: 'asunto_adelanto', label: 'Asunto y/o Adelanto', icon: <IconAsuntoAdelanto /> }] : []),
  ];
  const correccionBt  = { type: 'correccion',  label: 'Corrección',  icon: <IconCorrection /> };
  const puntuacionBt  = { type: 'puntuacion',  label: 'Puntuación',  icon: <IconStar /> };
  const audioBt       = { type: 'audio',        label: 'Audio',       icon: <IconAudio /> };
  const isOdd = gridTypes.length % 2 !== 0;
  const gridItems = isOdd ? gridTypes.slice(0, -1) : gridTypes;
  const midFullWidth = isOdd ? gridTypes[gridTypes.length - 1] : null;

  const renderFullWidthBtn = (bt) => {
    const disabled = (bt.type === 'correccion' && hasCorreccion) || (bt.type === 'puntuacion' && hasPuntuacion);
    const c = BLOCK_COLORS[bt.type];
    return (
      <button key={bt.type} onClick={() => !disabled && onSelect(bt.type)} disabled={disabled}
        style={{ width: '100%', height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, border: `1px solid ${disabled ? 'var(--t-border)' : 'var(--t-border-mid)'}`, borderRadius: 12, background: 'transparent', color: disabled ? 'var(--t-text-faint)' : 'var(--t-text-muted)', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: disabled ? 0.4 : 1 }}
        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = c; e.currentTarget.style.color = c; e.currentTarget.style.background = c + '11'; }}}
        onMouseLeave={e => { if (!disabled) { e.currentTarget.style.borderColor = 'var(--t-border-mid)'; e.currentTarget.style.color = 'var(--t-text-muted)'; e.currentTarget.style.background = 'transparent'; }}}>
        <span style={{ color: 'inherit' }}>{bt.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'inherit' }}>{bt.label}</span>
      </button>
    );
  };

  return (
    <div style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: 14, padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--t-text-muted)', fontWeight: 500 }}>Añadir bloque</span>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', padding: 2 }}><IconX /></button>}
      </div>
      {renderFullWidthBtn(puntuacionBt)}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {gridItems.map(bt => {
          const c = BLOCK_COLORS[bt.type];
          return (
            <button key={bt.type} onClick={() => onSelect(bt.type)}
              style={{ height: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px solid var(--t-border-mid)', borderRadius: 12, background: 'transparent', color: 'var(--t-text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c; e.currentTarget.style.color = c; e.currentTarget.style.background = c + '11'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border-mid)'; e.currentTarget.style.color = 'var(--t-text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ color: 'inherit' }}>{bt.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'inherit' }}>{bt.label}</span>
            </button>
          );
        })}
      </div>
      {midFullWidth && renderFullWidthBtn(midFullWidth)}
      {renderFullWidthBtn(audioBt)}
      {renderFullWidthBtn(correccionBt)}
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
function BlockCard({ block, index, total, onEdit, onDelete, onMoveUp, onMoveDown, onMoveLeft, onMoveRight, onToggleVisible, itemAsunto, itemAdelanto, onUpdateBlock, onExtract, categoria, onUploadImage, onCropFromEmail, libraryImages, isMobile }) {
  const bt = ALL_BLOCK_META.find(b => b.type === block.type) || { label: block.type };
  const c = BLOCK_COLORS[block.type] || '#71717a';
  const isCorreccion = block.type === 'correccion';
  const isPuntuacion = block.type === 'puntuacion';
  const imgs = block.images || [];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showColumnaModal, setShowColumnaModal] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [addingToCol, setAddingToCol] = useState(null); // eslint-disable-line no-unused-vars
  const [colPickerIdx, setColPickerIdx] = useState(null);
  const [editingNestedBlock, setEditingNestedBlock] = useState(null);
  const { theme } = useTheme();
  const nestedCount = block.type === 'columnas' ? (block.columns || []).flat().filter(Boolean).length : 0;

  const moveNestedLR = (colIdx, blockIdx, dir) => {
    const cols = block.columns || [];
    const newColIdx = colIdx + dir;
    if (newColIdx < 0 || newColIdx >= cols.length) return;
    const sourceCol = [...(cols[colIdx] || [])];
    const targetCol = [...(cols[newColIdx] || [])];
    const [movedBlock] = sourceCol.splice(blockIdx, 1);
    targetCol.push(movedBlock);
    const newCols = cols.map((col, i) => i === colIdx ? sourceCol : i === newColIdx ? targetCol : [...(col || [])]);
    onUpdateBlock?.({ ...block, columns: newCols });
  };

  const moveNestedUD = (colIdx, blockIdx, dir) => {
    const cols = block.columns || [];
    const col = [...(cols[colIdx] || [])];
    const newIdx = blockIdx + dir;
    if (newIdx < 0) {
      // Extract block and place it BEFORE the columnas block in the main list
      const [extracted] = col.splice(blockIdx, 1);
      const newCols = cols.map((c, i) => i === colIdx ? col : [...(c || [])]);
      onUpdateBlock?.({ ...block, columns: newCols, _extractBefore: extracted });
      return;
    }
    if (newIdx >= col.length) {
      // Extract block and place it AFTER the columnas block in the main list
      const [extracted] = col.splice(blockIdx, 1);
      const newCols = cols.map((c, i) => i === colIdx ? col : [...(c || [])]);
      onUpdateBlock?.({ ...block, columns: newCols, _extractAfter: extracted });
      return;
    }
    [col[blockIdx], col[newIdx]] = [col[newIdx], col[blockIdx]];
    const newCols = cols.map((c, i) => i === colIdx ? col : [...(c || [])]);
    onUpdateBlock?.({ ...block, columns: newCols });
  };

  const removeNested = (colIdx, blockIdx) => {
    const cols = block.columns || [];
    const newCol = (cols[colIdx] || []).filter((_, i) => i !== blockIdx);
    const newCols = cols.map((col, i) => i === colIdx ? newCol : [...(col || [])]);
    onUpdateBlock?.({ ...block, columns: newCols });
  };

  const updateNestedBlock = (colIdx, blockIdx, updatedNestedBlock) => {
    const cols = block.columns || [];
    const newCol = (cols[colIdx] || []).map((b, i) => i === blockIdx ? updatedNestedBlock : b);
    const newCols = cols.map((col, i) => i === colIdx ? newCol : [...(col || [])]);
    onUpdateBlock?.({ ...block, columns: newCols });
  };

  const saveNestedBlock = (colIdx, blockIdx, updatedNestedBlock) => {
    updateNestedBlock(colIdx, blockIdx, updatedNestedBlock);
    setEditingNestedBlock(null);
  };

  const addBlockToColumn = (colIdx, type) => {
    const newBlock = {
      id: `col_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
      type, titulo: DEFAULT_TITLES[type] || '', subtitulo: '', images: [],
      links: type === 'enlaces' ? [{ images: [], url: '' }] : [],
      links_layout: 'columna', images_layout: 'columna', it_layout: 'img-text',
      items: type === 'imagen_texto' ? [{ image: null, texto: '', text_color: '', text_align: 'left' }]
           : type === 'asunto_adelanto' ? [{ show_asunto: false, show_adelanto: false, texto: '', text_color: '', text_align: 'left' }] : [],
      email_blocks: [], texto: '', nota: '', visible: true,
    };
    const newBlockIdx = ((block.columns || [])[colIdx] || []).length;
    const updatedBlock = {
      ...block,
      columns: (block.columns || []).map((col, i) => i === colIdx ? [...(col || []), newBlock] : (col || [])),
    };
    onUpdateBlock?.(updatedBlock);
    setColPickerIdx(null);
    setTimeout(() => setEditingNestedBlock({ colIdx, blockIdx: newBlockIdx }), 50);
  };

  return (
    <div style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border-s)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--t-border-s)', minWidth: 0 }}>
        <span style={{ color: c, display: 'flex', flexShrink: 0 }}>{bt?.icon}</span>
        <span style={{ flex: 1, fontSize: 12, color: 'var(--t-text)', fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0 }}>{bt?.label}</span>
        <div style={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {!isCorreccion && !isPuntuacion && (
            <>
              {(() => {
                const isNested = onMoveLeft !== undefined || onMoveRight !== undefined;
                const upDis = !isNested && !onMoveUp;
                const downDis = !isNested && !onMoveDown;
                return (
                  <>
                    <button onClick={onMoveUp} disabled={upDis}
                      style={{ background: 'none', border: 'none', color: upDis ? 'var(--t-text-faint)' : 'var(--t-text)', cursor: upDis ? 'default' : 'pointer', padding: 3, display: 'flex' }}>
                      <IconChevronUp />
                    </button>
                    <button onClick={onMoveDown} disabled={downDis}
                      style={{ background: 'none', border: 'none', color: downDis ? 'var(--t-text-faint)' : 'var(--t-text)', cursor: downDis ? 'default' : 'pointer', padding: 3, display: 'flex' }}>
                      <IconChevronDown />
                    </button>
                  </>
                );
              })()}
              {(onMoveLeft !== undefined || onMoveRight !== undefined) && (
                <>
                  <button onClick={onMoveLeft || undefined} disabled={!onMoveLeft}
                    style={{ background: 'none', border: 'none', color: onMoveLeft ? 'var(--t-text)' : 'var(--t-text-faint)', cursor: onMoveLeft ? 'pointer' : 'default', padding: 3, fontSize: 13, lineHeight: 1 }}>←</button>
                  <button onClick={onMoveRight || undefined} disabled={!onMoveRight}
                    style={{ background: 'none', border: 'none', color: onMoveRight ? 'var(--t-text)' : 'var(--t-text-faint)', cursor: onMoveRight ? 'pointer' : 'default', padding: 3, fontSize: 13, lineHeight: 1 }}>→</button>
                </>
              )}
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
            <button onClick={() => block.type === 'columnas' && nestedCount > 0 ? setShowColumnaModal(true) : setConfirmDelete(true)}
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
                      img.isSocial ? (
                        <a key={i} href={link.url || undefined} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', aspectRatio: '1', borderRadius: 9, background: 'var(--t-surface2)', border: '1px solid var(--t-border)', textDecoration: 'none' }}>
                          <SocialIcon network={img.network} color={img.color} size={40} />
                        </a>
                      ) : (
                        <PreviewImg key={i} src={img.url}
                          imgStyle={{ width: '100%', aspectRatio: '1', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)' }}
                          wrapperStyle={{ width: '100%' }}
                          href={link.url || undefined}
                          onPreview={setLightbox} />
                      )
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
                      img.isSocial ? (
                        <a key={i} href={link.url || undefined} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 9, background: 'var(--t-surface2)', border: '1px solid var(--t-border)', textDecoration: 'none', flexShrink: 0 }}>
                          <SocialIcon network={img.network} color={img.color} size={36} />
                        </a>
                      ) : (
                        <PreviewImg key={i} src={img.url}
                          imgStyle={{ height: 160, borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)' }}
                          wrapperStyle={{ flexShrink: 0 }}
                          href={link.url || undefined}
                          onPreview={setLightbox} />
                      )
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
                      img.isSocial ? (
                        <a key={i} href={link.url || undefined} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 9, background: 'var(--t-surface2)', border: '1px solid var(--t-border)', textDecoration: 'none', flexShrink: 0 }}>
                          <SocialIcon network={img.network} color={img.color} size={36} />
                        </a>
                      ) : (
                        <PreviewImg key={i} src={img.url}
                          imgStyle={{ height: 160, width: 'auto', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)' }}
                          wrapperStyle={{ flexShrink: 0 }}
                          href={link.url || undefined}
                          onPreview={setLightbox} />
                      )
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

      {block.type === 'imagen' && (
        <div style={{ padding: '12px 14px' }}>
          <div style={{ marginBottom: imgs.length > 0 ? 10 : 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2 }}>{block.titulo || 'Imagen'}</div>
            {block.subtitulo && <div style={{ fontSize: 12, color: 'var(--t-text-muted)', marginTop: 3 }}>{block.subtitulo}</div>}
          </div>
          {imgs.length > 0 && (
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
          )}
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
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2 }}>{block.titulo || 'Imagen y/o Texto'}</div>
              {block.subtitulo && <div style={{ fontSize: 12, color: 'var(--t-text-muted)', marginTop: 3 }}>{block.subtitulo}</div>}
            </div>
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
                <div key={i} style={{ display: 'grid', gridTemplateColumns: isHoriz && hasImage && hasText && !isMobile ? '1fr 1fr' : '1fr', gap: 12, alignItems: 'start' }}>
                  {first}
                  {second}
                </div>
              );
            })}
          </div>
        );
      })()}

      {block.type === 'asunto_adelanto' && (() => {
        const items = block.items || [];
        const layout   = block.it_layout || 'img-text';
        const isHoriz  = layout === 'img-text' || layout === 'text-img';
        const fieldFirst = layout === 'img-text' || layout === 'img-top';
        if (!items.length) return <div style={{ padding: '12px 14px' }}><span style={{ fontSize: 12, color: 'var(--t-text-faint)', fontStyle: 'italic' }}>Sin contenido</span></div>;
        return (
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2 }}>{block.titulo || 'Asunto y/o Adelanto'}</div>
              {block.subtitulo && <div style={{ fontSize: 12, color: 'var(--t-text-muted)', marginTop: 3 }}>{block.subtitulo}</div>}
            </div>
            {items.map((it, i) => {
              const tc = it.text_color;
              const hasField = it.show_asunto || it.show_adelanto;
              const hasText  = it.texto?.trim();
              const fieldEl = hasField ? (
                <div style={{ padding: '8px 10px', borderRadius: 7, fontSize: 11, background: 'var(--t-surface2)', border: '1px solid var(--t-border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {it.show_asunto && <><span style={{ fontSize: 16, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asunto</span>{itemAsunto && <span style={{ fontSize: 24, color: '#ffffff', marginTop: 4, lineHeight: 1.3 }}>{itemAsunto}</span>}</>}
                  {it.show_adelanto && <><span style={{ fontSize: 16, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Adelanto</span>{itemAdelanto && <span style={{ fontSize: 24, color: '#ffffff', marginTop: 4, lineHeight: 1.3 }}>{itemAdelanto}</span>}</>}
                </div>
              ) : null;
              const txtEl = hasText ? (
                <div style={{ padding: '10px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.6, textAlign: it.text_align || 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: tc ? tc + '22' : 'transparent', border: tc ? `1px solid ${tc}` : '1px solid var(--t-border)', color: tc || 'var(--t-text)' }}>{it.texto}</div>
              ) : null;
              const first = fieldFirst ? fieldEl : txtEl;
              const second = fieldFirst ? txtEl : fieldEl;
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: isHoriz && hasField && hasText && !isMobile ? '1fr 1fr' : '1fr', gap: 12, alignItems: 'start' }}>
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
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2 }}>{block.titulo || 'Corrección'}</div>
            {block.subtitulo && <div style={{ fontSize: 12, color: 'var(--t-text-muted)', marginTop: 3 }}>{block.subtitulo}</div>}
          </div>
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
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
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

      {block.type === 'audio' && (
        <div style={{ padding: '14px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2, marginBottom: block.subtitulo || block.audio_url ? 8 : 0 }}>{block.titulo || 'Audio'}</div>
          {block.subtitulo && <div style={{ fontSize: 13, color: 'var(--t-text-muted)', marginBottom: 10 }}>{block.subtitulo}</div>}
          {block.audio_url && <AudioPlayer url={block.audio_url} color={block.color || BLOCK_COLORS.audio} />}
        </div>
      )}

      {block.type === 'transcribir' && (
        <div style={{ padding: '14px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2, marginBottom: block.subtitulo || block.texto ? 8 : 0 }}>{block.titulo || 'Transcripción'}</div>
          {block.subtitulo && <div style={{ fontSize: 13, color: 'var(--t-text-muted)', marginBottom: 8 }}>{block.subtitulo}</div>}
          {block.texto && (() => {
            const col = block.text_color || '#06b6d4';
            return (
              <div style={{ background: col + '18', border: `1px solid ${col}44`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 12, color: col, margin: 0, lineHeight: 1.6, textAlign: block.text_align || 'left', whiteSpace: 'pre-wrap' }}>
                  {block.texto}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {block.type === 'columnas' && (
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2, marginBottom: 8 }}>{block.titulo || 'Columnas'}</div>
          {block.num_columnas && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${block.num_columnas}, 1fr)`, gap: 6 }}>
              {Array.from({ length: block.num_columnas }, (_, ci) => {
                const col = (block.columns || [])[ci] || [];
                const colColor = '#14b8a6';
                const numCols = block.num_columnas;
                return (
                  <div key={ci} style={{ border: `1px solid ${addingToCol === ci ? colColor + '66' : 'var(--t-border)'}`, borderRadius: 6, padding: 4, minHeight: 48, display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--t-bg)', minWidth: 0, overflow: 'hidden' }}>
                    {col.map((nb, bi) => (
                      <BlockCard
                        key={nb.id || bi}
                        block={nb}
                        index={bi}
                        total={col.length}
                        onEdit={() => setEditingNestedBlock({ colIdx: ci, blockIdx: bi })}
                        onDelete={() => removeNested(ci, bi)}
                        onMoveUp={() => moveNestedUD(ci, bi, -1)}
                        onMoveDown={() => moveNestedUD(ci, bi, 1)}
                        onMoveLeft={ci > 0 ? () => moveNestedLR(ci, bi, -1) : null}
                        onMoveRight={ci < numCols - 1 ? () => moveNestedLR(ci, bi, 1) : null}
                        onToggleVisible={() => updateNestedBlock(ci, bi, { ...nb, visible: nb.visible === false ? true : false })}
                        onUpdateBlock={updated => updateNestedBlock(ci, bi, updated)}
                        categoria={categoria}
                        onUploadImage={onUploadImage}
                        onCropFromEmail={onCropFromEmail}
                        libraryImages={libraryImages}
                      />
                    ))}
                    <button onClick={() => setColPickerIdx(ci)}
                      style={{ background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 4, padding: '4px 0', fontSize: 9, color: 'var(--t-text-subtle)', cursor: 'pointer', width: '100%', marginTop: 'auto' }}>
                      + bloque
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {colPickerIdx !== null && (
            <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
              onClick={() => setColPickerIdx(null)}>
              <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480 }}>
                <BlockSelector
                  hasCorreccion={false}
                  onSelect={(type) => addBlockToColumn(colPickerIdx, type)}
                  onClose={() => setColPickerIdx(null)}
                  categoria={categoria}
                />
              </div>
            </div>
          )}
          {editingNestedBlock !== null && (() => {
            const { colIdx, blockIdx } = editingNestedBlock;
            const nestedBlock = ((block.columns || [])[colIdx] || [])[blockIdx];
            if (!nestedBlock) return null;
            return (
              <BlockEditorModal
                block={nestedBlock}
                onSave={updated => saveNestedBlock(colIdx, blockIdx, updated)}
                onClose={() => setEditingNestedBlock(null)}
                onUploadImage={onUploadImage}
                onCropFromEmail={onCropFromEmail}
                libraryImages={libraryImages}
                categoria={categoria}
              />
            );
          })()}
        </div>
      )}

      {block.type === 'puntuacion' && (() => {
        const align = block.text_align || 'center';
        const alignItems = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
        return (
        <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems, gap: 10 }}>
          {block.titulo && <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2, textAlign: align }}>{block.titulo}</div>}
          {block.subtitulo && <div style={{ fontSize: 12, color: 'var(--t-text-muted)', textAlign: align, marginTop: block.titulo ? -4 : 0 }}>{block.subtitulo}</div>}
          {block.valor != null ? (() => {
            const col = scoreColor(block.valor);
            const label = block.valor < 5 ? 'Suspenso' : block.valor < 7.5 ? 'Notable' : 'Sobresaliente';
            return (
              <>
                <div style={{ border: `2px solid ${col}44`, borderRadius: 14, padding: '14px 24px', background: col + '0d', display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 52, fontWeight: 800, color: col, lineHeight: 1 }}>{block.valor}</span>
                  <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--t-text-muted)' }}>/10</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: col, opacity: 0.8 }}>{label}</span>
              </>
            );
          })() : (
            <span style={{ fontSize: 12, color: 'var(--t-text-faint)', fontStyle: 'italic' }}>Sin puntuación</span>
          )}
        </div>
        );
      })()}

      {/* Columnas delete modal */}
      {showColumnaModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowColumnaModal(false)}>
          <div style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: 12, padding: '24px 28px', maxWidth: 360, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t-text)' }}>Eliminar bloque Columnas</div>
            <div style={{ fontSize: 13, color: 'var(--t-text-muted)', lineHeight: 1.5 }}>
              Este bloque contiene <strong style={{ color: 'var(--t-text)' }}>{nestedCount} bloque{nestedCount !== 1 ? 's' : ''}</strong> dentro. ¿Qué quieres hacer con ellos?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => { onExtract?.(); setShowColumnaModal(false); }}
                style={{ background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', color: 'var(--t-text)', cursor: 'pointer', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--t-text-muted)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                Eliminar solo la columna
              </button>
              <button
                onClick={() => { onDelete(); setShowColumnaModal(false); }}
                style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.4)', color: '#ef4444', cursor: 'pointer', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.22)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.12)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'; }}>
                Eliminar todo (columna + bloques dentro)
              </button>
              <button
                onClick={() => setShowColumnaModal(false)}
                style={{ background: 'none', border: '1px solid var(--t-border)', color: 'var(--t-text-muted)', cursor: 'pointer', padding: '7px 16px', borderRadius: 8, fontSize: 13 }}>
                Cancelar
              </button>
            </div>
          </div>
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
const RESTRICTED_COLORS = ['#22c55e', '#eab308', '#ef4444'];

function InlineColorPicker({ value, onChange, restricted = false }) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value || '');
  const apply = (color) => { onChange(color); setOpen(false); };

  if (restricted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {RESTRICTED_COLORS.map(c => (
          <button key={c} onClick={() => onChange(value === c ? '' : c)}
            style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: `2px solid ${value === c ? 'white' : 'transparent'}`, cursor: 'pointer', flexShrink: 0 }}
            title={c} />
        ))}
        {value && (
          <>
            <span style={{ fontSize: 10, borderRadius: 999, padding: '2px 8px', fontWeight: 600, background: value + '22', border: `1px solid ${value}`, color: value }}>Aa</span>
            <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', fontSize: 11, padding: 0 }}>✕</button>
          </>
        )}
      </div>
    );
  }

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
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.outline = '2px dashed #3b82f6'; e.currentTarget.style.borderRadius = '6px'; }}
                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.style.outline = ''; }}
                onDrop={async e => { e.preventDefault(); e.currentTarget.style.outline = ''; const f = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/')); if (f && !uploading) await upload(f); }}>
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

// ── Library image cell (con checkbox GLOBAL en hover) ────────────────────────
function AudioPlayer({ url, color = '#6366f1' }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const setSpeedVal = (s) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audioRef.current && duration) {
      audioRef.current.currentTime = ratio * duration;
      setProgress(ratio);
      setCurrentTime(ratio * duration);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <audio ref={audioRef} src={url} preload="metadata"
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onTimeUpdate={e => { const a = e.target; setCurrentTime(a.currentTime); setProgress(a.duration ? a.currentTime / a.duration : 0); }}
        onEnded={() => setPlaying(false)} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Play/pause button */}
        <button onClick={toggle}
          style={{ width: 40, height: 40, borderRadius: '50%', background: color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {playing
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
          }
        </button>
        {/* Progress bar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div onClick={handleSeek} style={{ height: 4, background: 'var(--t-border)', borderRadius: 99, cursor: 'pointer', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress * 100}%`, background: color, borderRadius: 99 }} />
            <div style={{ position: 'absolute', top: '50%', left: `${progress * 100}%`, transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: '0 0 0 2px var(--t-bg)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t-text-subtle)' }}>
            <span>{fmt(currentTime)}</span>
            <span>{duration ? fmt(duration) : '--:--'}</span>
          </div>
        </div>
        {/* Speed controls */}
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          {[1, 1.5, 2].map(s => (
            <button key={s} onClick={() => setSpeedVal(s)}
              style={{ background: speed === s ? color : 'transparent', border: `1px solid ${speed === s ? color : 'var(--t-border)'}`, borderRadius: 5, padding: '2px 6px', fontSize: 10, color: speed === s ? 'white' : 'var(--t-text-subtle)', cursor: 'pointer', fontWeight: speed === s ? 700 : 400 }}>
              {s === 1 ? '1x' : `${s}x`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LibImgCell({ libImg, alreadyAdded, isSource, color, onSelect, onToggleGlobal }) {
  const [hov, setHov] = useState(false);
  const isGlobal = !!libImg.isGlobal;
  const mainBorder = libImg.isMain && !alreadyAdded ? `2px solid ${color}` : null;
  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <img src={libImg.url} alt=""
        onClick={() => { if (!alreadyAdded) onSelect(libImg.url); }}
        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 5,
          cursor: alreadyAdded ? 'default' : 'pointer',
          border: alreadyAdded ? '2px solid #22c55e' : mainBorder || '2px solid transparent',
          opacity: alreadyAdded ? 0.5 : 1 }}
        onMouseEnter={e => { if (!alreadyAdded) e.currentTarget.style.border = '2px solid #3b82f6'; }}
        onMouseLeave={e => { if (!alreadyAdded) e.currentTarget.style.border = mainBorder || '2px solid transparent'; }} />
      {alreadyAdded && (
        <div style={{ position: 'absolute', top: 2, right: 2, background: '#22c55e', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconCheck />
        </div>
      )}
      {libImg.isMain && !alreadyAdded && (
        <div style={{ position: 'absolute', bottom: 2, left: 2, background: color, borderRadius: 3, fontSize: 8, color: 'white', padding: '1px 4px', fontWeight: 700, lineHeight: 1.4 }}>MAIN</div>
      )}
      {isGlobal && (
        <div style={{ position: 'absolute', bottom: 2, right: 2, background: '#7c3aed', borderRadius: 3, fontSize: 8, color: 'white', padding: '1px 4px', fontWeight: 700, lineHeight: 1.4 }}>GLOBAL</div>
      )}
      {/* Checkbox GLOBAL: solo en imágenes de este item (isSource), visible en hover */}
      {isSource && !libImg.isMain && (hov || isGlobal) && onToggleGlobal && (
        <div style={{ position: 'absolute', top: 3, left: 3 }}
          onClick={e => { e.stopPropagation(); onToggleGlobal(libImg.url, !isGlobal); }}>
          <div style={{ width: 15, height: 15, borderRadius: 3, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
            background: isGlobal ? '#7c3aed' : 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {isGlobal && <svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1,4.5 3.5,7.5 8,1.5" fill="none" stroke="white" strokeWidth="1.8"/></svg>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AudioRecorderWidget (module-level to avoid React hook rules violation) ────
function AudioRecorderWidget({ draft, update, id, pendingBlobRef }) {
  const [recState, setRecState] = useState(draft.audio_url ? 'uploaded' : 'idle');
  const [blobUrl, setBlobUrl] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const mrRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mrRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const b = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(b);
        if (pendingBlobRef) pendingBlobRef.current = b;
        setBlobUrl(url); setRecState('previewing');
      };
      mr.start();
      setRecState('recording');
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } catch { alert('No se pudo acceder al micrófono'); }
  };

  const stopRec = () => {
    clearInterval(timerRef.current);
    mrRef.current?.stop();
  };

  const discard = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    if (pendingBlobRef) pendingBlobRef.current = null;
    setBlobUrl(null); setRecState('idle'); setElapsed(0);
  };

  const removeAudio = () => { update('audio_url', null); setRecState('idle'); };
  const fmt = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  if (recState === 'uploaded' && draft.audio_url) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <AudioPlayer url={draft.audio_url} color={draft.color || BLOCK_COLORS.audio} />
      <button onClick={removeAudio}
        style={{ background: 'transparent', border: '1px solid var(--t-border)', borderRadius: 7, padding: '7px 12px', fontSize: 12, color: 'var(--t-text-muted)', cursor: 'pointer' }}>
        Descartar y grabar nuevo
      </button>
    </div>
  );

  if (recState === 'previewing' && blobUrl) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <AudioPlayer url={blobUrl} color={draft.color || BLOCK_COLORS.audio} />
      <button onClick={discard}
        style={{ width: '100%', background: 'transparent', border: '1px solid var(--t-border)', borderRadius: 7, padding: '8px 12px', fontSize: 12, color: 'var(--t-text-muted)', cursor: 'pointer' }}>
        Descartar y repetir
      </button>
    </div>
  );

  if (recState === 'recording') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1s infinite' }} />
        <span style={{ fontSize: 13, color: 'var(--t-text-muted)' }}>Grabando</span>
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--t-text)' }}>{fmt(elapsed)}</span>
      </div>
      <button onClick={stopRec}
        style={{ background: '#ef4444', border: 'none', borderRadius: 999, padding: '9px 24px', fontSize: 13, color: 'white', cursor: 'pointer', fontWeight: 600 }}>
        Detener
      </button>
    </div>
  );

  return (
    <button onClick={startRec}
      style={{ width: '100%', background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 8, padding: '14px', fontSize: 13, color: 'var(--t-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      Grabar audio
    </button>
  );
}

// ── Block: editor modal ───────────────────────────────────────────────────────
function BlockEditorModal({ block, onSave, onClose, onUploadImage, onCropFromEmail, libraryImages, categoria, allBlocks = [], itemId, onToggleGlobalImage }) {
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
  const [showSocialPicker, setShowSocialPicker] = useState(null); // null | linkIdx
  const [socialDraft, setSocialDraft] = useState({ network: 'instagram', color: '#E1306C' });
  const [transcribing, setTranscribing] = useState(false);
  const fileInputRef = useRef(null);
  const transcribeFileInputRef = useRef(null);
  const linkFileInputRefs = useRef({});
  const itemFileInputRefs = useRef({});
  const pendingAudioBlobRef = useRef(null);

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
  const addLinkSocial = (linkIdx, network, color) => setDraft(d => {
    const links = [...(d.links || [])];
    links[linkIdx] = { ...links[linkIdx], images: [...(links[linkIdx].images || []), { isSocial: true, network, color }] };
    return { ...d, links };
  });
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

  const handleSave = async () => {
    if (draft.type === 'enlaces') {
      const errors = {};
      (draft.links || []).forEach((link, i) => {
        if (link.url && !isValidUrl(link.url)) errors[i] = 'URL no válida (debe empezar por https://)';
      });
      if (Object.keys(errors).length > 0) { setUrlErrors(errors); return; }
    }
    let finalDraft = draft;
    if (draft.type === 'audio' && pendingAudioBlobRef.current) {
      try {
        const token = await getToken();
        const form = new FormData();
        form.append('file', pendingAudioBlobRef.current, `audio_${Date.now()}.webm`);
        const res = await fetch(`${API_BASE}/biblioteca/${itemId}/blocks/upload`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
        });
        if (!res.ok) throw new Error(await res.text());
        const { url } = await res.json();
        finalDraft = { ...draft, audio_url: url };
        pendingAudioBlobRef.current = null;
      } catch (e) { alert('Error al subir audio: ' + e.message); return; }
    }
    onSave(finalDraft);
    onClose();
  };

  const bt = ALL_BLOCK_META.find(b => b.type === block.type);
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

        {/* Puntuación — número + alineación */}
        {draft.type === 'puntuacion' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '12px 0' }}>
              <input
                type="number" min="0" max="10" step="0.01"
                value={draft.valor ?? ''}
                disabled={!!draft.autocalcular}
                onChange={e => {
                  if (draft.autocalcular) return;
                  const raw = e.target.value;
                  if (raw === '') { update('valor', null); return; }
                  const n = Math.min(10, Math.max(0, parseFloat(parseFloat(raw).toFixed(2))));
                  update('valor', isNaN(n) ? null : n);
                }}
                placeholder="0 – 10"
                style={{ width: 140, background: draft.autocalcular ? 'var(--t-surface2)' : 'var(--t-surface2)', border: `2px solid ${scoreColor(draft.valor)}`, borderRadius: 12, padding: '14px 18px', fontSize: 36, fontWeight: 800, color: draft.autocalcular ? scoreColor(draft.valor) + 'aa' : scoreColor(draft.valor), outline: 'none', colorScheme: 'dark', textAlign: 'center', boxSizing: 'border-box', opacity: draft.autocalcular ? 0.7 : 1, cursor: draft.autocalcular ? 'default' : 'text' }}
              />
              {draft.valor != null && (
                <span style={{ fontSize: 13, color: scoreColor(draft.valor), fontWeight: 600 }}>
                  {draft.valor < 5 ? 'Suspenso' : draft.valor < 7.5 ? 'Notable' : 'Sobresaliente'}
                </span>
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                <div onClick={() => {
                  const next = !draft.autocalcular;
                  update('autocalcular', next);
                  if (next) update('valor', calcularPuntuacion(allBlocks));
                }}
                  style={{ width: 36, height: 20, borderRadius: 10, background: draft.autocalcular ? '#6366f1' : 'var(--t-border-mid)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: draft.autocalcular ? 19 : 3, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: 12, color: draft.autocalcular ? '#a5b4fc' : 'var(--t-text-muted)', fontWeight: draft.autocalcular ? 600 : 400 }}>Autocalcular</span>
              </label>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Alineación</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[{ value: 'left', label: 'Izquierda' }, { value: 'center', label: 'Centro' }, { value: 'right', label: 'Derecha' }].map(opt => {
                  const active = (draft.text_align || 'center') === opt.value;
                  return (
                    <button key={opt.value} onClick={() => update('text_align', opt.value)}
                      style={{ flex: 1, background: active ? 'var(--t-surface2)' : 'transparent', border: `1px solid ${active ? '#6366f1' : 'var(--t-border-mid)'}`, borderRadius: 8, padding: '7px 10px', fontSize: 12, color: active ? '#a5b4fc' : 'var(--t-text-muted)', cursor: 'pointer', fontWeight: active ? 600 : 400 }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

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
                  {libraryImages.map((libImg, i) => (
                    <LibImgCell key={i}
                      libImg={libImg}
                      alreadyAdded={(draft.images || []).some(e => e.url === libImg.url)}
                      isSource={!libImg.sourceItemId || libImg.sourceItemId === itemId}
                      color={c}
                      onSelect={url => addImage(url)}
                      onToggleGlobal={onToggleGlobalImage}
                    />
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.outline = '2px dashed #3b82f6'; e.currentTarget.style.borderRadius = '8px'; }}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.style.outline = ''; }}
              onDrop={async e => { e.preventDefault(); e.currentTarget.style.outline = ''; const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')); if (!files.length || uploading) return; setUploading(true); try { for (const f of files) { const url = await onUploadImage(f); addImage(url); } } catch { alert('Error al subir imagen'); } finally { setUploading(false); } }}>
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
                          {img.isSocial ? (
                            <div style={{ width: '100%', height: '100%', borderRadius: 5, border: '1px solid var(--t-border)', background: 'var(--t-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <SocialIcon network={img.network} color={img.color} size={36} />
                            </div>
                          ) : (
                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5, border: '1px solid var(--t-border)', display: 'block' }} />
                          )}
                          <button onClick={() => removeLinkImage(linkIdx, imgIdx)}
                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.75)', border: 'none', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Social picker for this link */}
                  {showSocialPicker === linkIdx && (
                    <div style={{ border: '1px solid var(--t-border)', borderRadius: 7, padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Red social</div>
                        <button onClick={() => setShowSocialPicker(null)} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }}>Cerrar</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                        {SOCIAL_NETWORKS.map(sn => {
                          const active = socialDraft.network === sn.id;
                          return (
                            <button key={sn.id} onClick={() => setSocialDraft(d => ({ ...d, network: sn.id, color: sn.color }))}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, border: `1px solid ${active ? '#6366f1' : 'var(--t-border)'}`, background: active ? 'var(--t-surface2)' : 'transparent', cursor: 'pointer', fontSize: 11, color: active ? '#a5b4fc' : 'var(--t-text-muted)', fontWeight: active ? 600 : 400 }}>
                              <SocialIcon network={sn.id} color={active ? socialDraft.color : 'var(--t-text-subtle)'} size={16} />
                              {sn.label}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--t-text-subtle)' }}>Color</span>
                        <InlineColorPicker value={socialDraft.color} onChange={color => setSocialDraft(d => ({ ...d, color }))} />
                      </div>
                      <button onClick={() => { addLinkSocial(linkIdx, socialDraft.network, socialDraft.color); setShowSocialPicker(null); }}
                        style={{ background: '#6366f1', border: 'none', borderRadius: 6, padding: '7px 12px', fontSize: 12, color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                        Añadir icono
                      </button>
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
                        {libraryImages.map((libImg, i) => (
                          <LibImgCell key={i}
                            libImg={libImg}
                            alreadyAdded={(draft.links?.[linkIdx]?.images || []).some(e => e.url === libImg.url)}
                            isSource={!libImg.sourceItemId || libImg.sourceItemId === itemId}
                            color={c}
                            onSelect={url => addLinkImage(linkIdx, url)}
                            onToggleGlobal={onToggleGlobalImage}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.outline = '2px dashed #3b82f6'; e.currentTarget.style.borderRadius = '6px'; }}
                    onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.style.outline = ''; }}
                    onDrop={async e => { e.preventDefault(); e.currentTarget.style.outline = ''; const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')); if (!files.length || uploadingLink !== null) return; setUploadingLink(linkIdx); try { for (const f of files) { const url = await onUploadImage(f); addLinkImage(linkIdx, url); } } catch { alert('Error al subir imagen'); } finally { setUploadingLink(null); } }}>
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
                    <button onClick={() => { setShowSocialPicker(showSocialPicker === linkIdx ? null : linkIdx); setShowLibrary(null); }}
                      style={{ flex: 1, background: showSocialPicker === linkIdx ? 'var(--t-surface2)' : 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: 'pointer', minWidth: 80 }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--t-border-muted)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                      Social
                    </button>
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
                        {showLibrary === libKey && (
                          <div style={{ border: '1px solid var(--t-border)', borderRadius: 7, padding: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seleccionar de biblioteca</div>
                              <button onClick={() => setShowLibrary(null)} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }}>Cerrar</button>
                            </div>
                            {libraryImages?.length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 4 }}>
                                {libraryImages.map((libImg, i) => (
                                  <LibImgCell key={i}
                                    libImg={libImg}
                                    alreadyAdded={false}
                                    isSource={!libImg.sourceItemId || libImg.sourceItemId === itemId}
                                    color={c}
                                    onSelect={url => { setItemImage(itemIdx, url); setShowLibrary(null); }}
                                    onToggleGlobal={onToggleGlobalImage}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: 11, color: 'var(--t-text-subtle)', padding: '4px 0' }}>No hay imágenes en la biblioteca todavía.</div>
                            )}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}
                          onDragOver={e => { e.preventDefault(); e.currentTarget.style.outline = '2px dashed #3b82f6'; e.currentTarget.style.borderRadius = '6px'; }}
                          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.style.outline = ''; }}
                          onDrop={async e => { e.preventDefault(); e.currentTarget.style.outline = ''; const f = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/')); if (f && !isUploadingThis) await handleItemFile(itemIdx, f); }}>
                          <button onClick={() => itemFileInputRefs.current[itemIdx]?.click()} disabled={isUploadingThis}
                            style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: isUploadingThis ? 'not-allowed' : 'pointer', minWidth: 80 }}>
                            {isUploadingThis ? 'Subiendo…' : '+ Imagen'}
                          </button>
                          <button onClick={() => handleItemCrop(itemIdx)} disabled={isUploadingThis}
                            style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: isUploadingThis ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 80 }}>
                            <IconScissors /> Recortar
                          </button>
                          <button onClick={() => setShowLibrary(showLibrary === libKey ? null : libKey)}
                            style={{ flex: 1, background: showLibrary === libKey ? 'var(--t-surface2)' : 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 6, padding: '7px 8px', fontSize: 11, color: 'var(--t-text-muted)', cursor: 'pointer', minWidth: 80 }}>
                            Seleccionar
                          </button>
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
                        <InlineColorPicker value={it.text_color || ''} onChange={c => updateItemField(itemIdx, 'text_color', c)} restricted />
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

        {draft.type === 'asunto_adelanto' && (() => {
          const asuntoUsed = (draft.items || []).some(it => it.show_asunto);
          const adelantoUsed = (draft.items || []).some(it => it.show_adelanto);
          const canAddMore = !asuntoUsed || !adelantoUsed;
          const updateAsItem = (idx, field, value) => {
            const newItems = [...(draft.items || [])];
            newItems[idx] = { ...newItems[idx], [field]: value };
            update('items', newItems);
          };
          const addAsItem = () => {
            update('items', [...(draft.items || []), { show_asunto: false, show_adelanto: false, texto: '', text_color: '', text_align: 'left' }]);
          };
          const removeAsItem = (idx) => {
            update('items', (draft.items || []).filter((_, i) => i !== idx));
          };
          return (
            <>
              {/* Layout selector */}
              <div>
                <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Disposición</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    { value: 'img-text',  label: 'Campo | Texto' },
                    { value: 'text-img',  label: 'Texto | Campo' },
                    { value: 'img-top',   label: 'Campo ↑  Texto ↓' },
                    { value: 'text-top',  label: 'Texto ↑  Campo ↓' },
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
                  const isAsuntoActive = it.show_asunto;
                  const isAdelantoActive = it.show_adelanto;
                  const asuntoDisabledByOther = !it.show_asunto && asuntoUsed;
                  const adelantoDisabledByOther = !it.show_adelanto && adelantoUsed;
                  // Prevent deselecting if it's the only field selected in this item
                  const asuntoCanDeselect = !(isAsuntoActive && !isAdelantoActive);
                  const adelantoCanDeselect = !(isAdelantoActive && !isAsuntoActive);
                  return (
                    <div key={itemIdx} style={{ border: '1px solid var(--t-border)', borderRadius: 10, padding: '12px 12px 10px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
                      {(draft.items || []).length > 1 && (
                        <button onClick={() => removeAsItem(itemIdx)}
                          style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', padding: 2 }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--t-text-subtle)'}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}

                      {/* Toggle buttons: Asunto / Adelanto */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          disabled={asuntoDisabledByOther || (isAsuntoActive && !asuntoCanDeselect)}
                          onClick={() => !asuntoDisabledByOther && asuntoCanDeselect && updateAsItem(itemIdx, 'show_asunto', !it.show_asunto)}
                          style={{ flex: 1, background: isAsuntoActive ? 'var(--t-surface2)' : 'transparent', border: `1px dashed ${isAsuntoActive ? '#f59e0b' : 'var(--t-border-mid)'}`, borderRadius: 6, padding: '7px 8px', fontSize: 11, color: isAsuntoActive ? '#fcd34d' : 'var(--t-text-muted)', cursor: asuntoDisabledByOther ? 'not-allowed' : 'pointer', opacity: asuntoDisabledByOther ? 0.4 : 1, fontWeight: isAsuntoActive ? 600 : 400 }}>
                          Asunto
                        </button>
                        <button
                          disabled={adelantoDisabledByOther || (isAdelantoActive && !adelantoCanDeselect)}
                          onClick={() => !adelantoDisabledByOther && adelantoCanDeselect && updateAsItem(itemIdx, 'show_adelanto', !it.show_adelanto)}
                          style={{ flex: 1, background: isAdelantoActive ? 'var(--t-surface2)' : 'transparent', border: `1px dashed ${isAdelantoActive ? '#f59e0b' : 'var(--t-border-mid)'}`, borderRadius: 6, padding: '7px 8px', fontSize: 11, color: isAdelantoActive ? '#fcd34d' : 'var(--t-text-muted)', cursor: adelantoDisabledByOther ? 'not-allowed' : 'pointer', opacity: adelantoDisabledByOther ? 0.4 : 1, fontWeight: isAdelantoActive ? 600 : 400 }}>
                          Adelanto
                        </button>
                      </div>

                      {/* Text */}
                      <textarea value={it.texto || ''} onChange={e => updateAsItem(itemIdx, 'texto', e.target.value)}
                        rows={3} placeholder="Análisis y comentarios…"
                        style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />

                      {/* Text styling */}
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <label style={{ fontSize: 10, color: 'var(--t-text-subtle)' }}>Color</label>
                          <InlineColorPicker value={it.text_color || ''} onChange={c => updateAsItem(itemIdx, 'text_color', c)} restricted />
                        </div>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {[['left','≡L'], ['center','≡C'], ['right','≡R'], ['justify','≡']].map(([val, icon]) => {
                            const active = (it.text_align || 'left') === val;
                            return (
                              <button key={val} onClick={() => updateAsItem(itemIdx, 'text_align', val)}
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
                {canAddMore && (
                  <button onClick={addAsItem}
                    style={{ background: 'transparent', border: '1px dashed var(--t-border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--t-text-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-border-mid)'; e.currentTarget.style.color = 'var(--t-text-muted)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border)'; e.currentTarget.style.color = 'var(--t-text-subtle)'; }}>
                    + Añadir otro elemento
                  </button>
                )}
              </div>
            </>
          );
        })()}

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

        {/* Audio block editor */}
        {draft.type === 'audio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Audio</label>
              <AudioRecorderWidget draft={draft} update={update} id={itemId} pendingBlobRef={pendingAudioBlobRef} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Color</label>
              <InlineColorPicker value={draft.color || ''} onChange={v => update('color', v)} />
            </div>
          </div>
        )}

        {draft.type === 'transcribir' && (() => {
          const imgs = draft.images || [];
          const doneImgs = imgs.filter(i => i.transcribed);
          const pendingImgs = imgs.filter(i => !i.transcribed);
          const hasText = !!(draft.texto && draft.texto.trim());

          const handleTranscribe = async (mode) => {
            if (!pendingImgs.length || transcribing) return;
            setTranscribing(true);
            try {
              const token = await getToken();
              const res = await fetch(`${API_BASE}/biblioteca/transcribe-images`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: pendingImgs.map(i => i.url) }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
              if (data.texto) {
                const pendingUrls = new Set(pendingImgs.map(i => i.url));
                const newTexto = mode === 'append'
                  ? (draft.texto?.trim() ? draft.texto.trim() + '\n\n' : '') + data.texto
                  : data.texto;
                setDraft(d => ({
                  ...d,
                  texto: newTexto,
                  images: (d.images || []).map(img => pendingUrls.has(img.url) ? { ...img, transcribed: true } : img),
                }));
              }
            } catch (err) { alert('Error al transcribir: ' + (err.message || err)); }
            finally { setTranscribing(false); }
          };

          return (
            <>
              {/* Imágenes transcritas */}
              {doneImgs.length > 0 && (
                <div>
                  <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Imágenes transcritas</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 6, marginBottom: 8 }}>
                    {doneImgs.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', aspectRatio: '1' }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, display: 'block', opacity: 0.6 }} />
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 6, background: 'rgba(6,182,212,0.15)', border: '2px solid #06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <button onClick={() => removeImage(imgs.indexOf(img))}
                          style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.75)', border: 'none', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Imágenes a transcribir */}
              <div>
                <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Imágenes a transcribir</label>
                {pendingImgs.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 6, marginBottom: 8 }}>
                    {pendingImgs.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', aspectRatio: '1' }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                        <button onClick={() => removeImage(imgs.indexOf(img))}
                          style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.75)', border: 'none', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Library picker */}
                {showLibrary === 'transcribir' && libraryImages?.length > 0 && (
                  <div style={{ border: '1px solid var(--t-border)', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seleccionar de biblioteca</div>
                      <button onClick={() => setShowLibrary(null)} style={{ background: 'none', border: 'none', color: 'var(--t-text-subtle)', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }}>Cerrar</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 5 }}>
                      {libraryImages.map((libImg, i) => (
                        <LibImgCell key={i}
                          libImg={libImg}
                          alreadyAdded={imgs.some(e => e.url === libImg.url)}
                          isSource={!libImg.sourceItemId || libImg.sourceItemId === itemId}
                          color={c}
                          onSelect={url => addImage(url)}
                          onToggleGlobal={onToggleGlobalImage}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.outline = '2px dashed #3b82f6'; e.currentTarget.style.borderRadius = '8px'; }}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.style.outline = ''; }}
                  onDrop={async e => { e.preventDefault(); e.currentTarget.style.outline = ''; const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')); if (!files.length || uploading) return; setUploading(true); try { for (const f of files) { const url = await onUploadImage(f); addImage(url); } } catch { alert('Error al subir imagen'); } finally { setUploading(false); } }}>
                  <button onClick={() => transcribeFileInputRef.current?.click()} disabled={uploading}
                    style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 8, padding: '9px 10px', fontSize: 12, color: 'var(--t-text-muted)', cursor: uploading ? 'not-allowed' : 'pointer', minWidth: 100 }}
                    onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = 'var(--t-border-muted)'; }}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                    {uploading ? 'Subiendo…' : '+ Imagen'}
                  </button>
                  <button onClick={handleCrop} disabled={uploading}
                    style={{ flex: 1, background: 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 8, padding: '9px 10px', fontSize: 12, color: 'var(--t-text-muted)', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, minWidth: 100 }}
                    onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = 'var(--t-border-muted)'; }}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                    <IconScissors /> Recortar
                  </button>
                  {libraryImages?.length > 0 && (
                    <button onClick={() => setShowLibrary(showLibrary === 'transcribir' ? null : 'transcribir')}
                      style={{ flex: 1, background: showLibrary === 'transcribir' ? 'var(--t-surface2)' : 'transparent', border: '1px dashed var(--t-border-mid)', borderRadius: 8, padding: '9px 10px', fontSize: 12, color: 'var(--t-text-muted)', cursor: 'pointer', minWidth: 100 }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--t-border-muted)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--t-border-mid)'}>
                      Seleccionar
                    </button>
                  )}
                  <input ref={transcribeFileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
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
              </div>

              {/* Transcribe buttons */}
              {pendingImgs.length > 0 && (
                transcribing ? (
                  <button disabled style={{ width: '100%', background: 'var(--t-surface2)', color: 'var(--t-text-muted)', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.7s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Transcribiendo…
                  </button>
                ) : hasText ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleTranscribe('replace')}
                      style={{ flex: 1, background: '#06b6d4', color: 'white', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0891b2'}
                      onMouseLeave={e => e.currentTarget.style.background = '#06b6d4'}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Transcribir y sustituir
                    </button>
                    <button onClick={() => handleTranscribe('append')}
                      style={{ flex: 1, background: 'transparent', color: '#06b6d4', border: '1px solid #06b6d4', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#06b6d418'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Transcribir y añadir
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleTranscribe('replace')}
                    style={{ width: '100%', background: '#06b6d4', color: 'white', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0891b2'}
                    onMouseLeave={e => e.currentTarget.style.background = '#06b6d4'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Confirmar y transcribir
                  </button>
                )
              )}

              {/* Texto transcrito editable */}
              {draft.texto !== undefined && draft.texto !== null && (
                <div>
                  <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Texto transcrito</label>
                  <textarea value={draft.texto || ''} onChange={e => { const v = e.target.value; if (!v.trim()) { setDraft(d => ({ ...d, texto: v, images: (d.images || []).map(img => ({ ...img, transcribed: false })) })); } else { update('texto', v); } }}
                    rows={8} placeholder="El texto transcrito aparecerá aquí. Puedes editarlo."
                    style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }} />
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <label style={{ fontSize: 10, color: 'var(--t-text-subtle)' }}>Color</label>
                      <InlineColorPicker value={draft.text_color || ''} onChange={c => update('text_color', c)} />
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[['left','≡L'], ['center','≡C'], ['right','≡R'], ['justify','≡']].map(([val, icon]) => {
                        const active = (draft.text_align || 'left') === val;
                        return (
                          <button key={val} onClick={() => update('text_align', val)} title={val}
                            style={{ background: active ? 'var(--t-border)' : 'transparent', border: `1px solid ${active ? 'var(--t-text-muted)' : 'var(--t-border)'}`, borderRadius: 5, width: 28, height: 26, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'var(--t-text)' : 'var(--t-text-subtle)', fontWeight: active ? 700 : 400 }}>
                            {icon}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {draft.type === 'columnas' && (() => {
          const numCols = draft.num_columnas || 0;
          const colIcons = [null,null,
            <svg key={2} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="9" height="18" rx="1"/><rect x="13" y="3" width="9" height="18" rx="1"/></svg>,
            <svg key={3} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/><rect x="16" y="3" width="6" height="18" rx="1"/></svg>,
            <svg key={4} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="5" height="18" rx="1"/><rect x="7" y="3" width="4" height="18" rx="1"/><rect x="13" y="3" width="4" height="18" rx="1"/><rect x="19" y="3" width="4" height="18" rx="1"/></svg>,
          ];
          return (
            <>
              <div>
                <label style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Número de columnas</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[2, 3, 4].map(n => (
                    <button key={n} onClick={() => {
                      const currentCols = draft.columns || [];
                      const nc = Array.from({ length: n }, (_, i) => currentCols[i] || []);
                      const removed = [];
                      for (let i = n; i < currentCols.length; i++) {
                        (currentCols[i] || []).forEach(b => removed.push({ ...b, id: `blk_${Date.now()}_${Math.random().toString(36).substr(2,5)}` }));
                      }
                      setDraft(d => ({ ...d, num_columnas: n, columns: nc, ...(removed.length ? { _extractAfter: [...(d._extractAfter || []), ...removed] } : {}) }));
                    }}
                      style={{ flex: 1, padding: '10px 6px', border: `1px solid ${numCols === n ? '#14b8a6' : 'var(--t-border-mid)'}`, borderRadius: 8, background: numCols === n ? '#14b8a611' : 'transparent', color: numCols === n ? '#14b8a6' : 'var(--t-text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500 }}>
                      {colIcons[n]}{n} Columnas
                    </button>
                  ))}
                </div>
              </div>
              {/* Preview only — editing via main view */}
              {numCols > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)`, gap: 8 }}>
                  {Array.from({ length: numCols }, (_, colIdx) => {
                    const col = (draft.columns || [])[colIdx] || [];
                    return (
                      <div key={colIdx} style={{ border: '1px solid var(--t-border)', borderRadius: 8, padding: 8, minHeight: 40 }}>
                        <div style={{ fontSize: 9, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', paddingBottom: 4, borderBottom: '1px solid var(--t-border-s)', marginBottom: 4 }}>Col. {colIdx + 1}</div>
                        {col.map((nb, bi) => {
                          const bcolor = BLOCK_COLORS[nb.type] || '#71717a';
                          return (
                            <div key={bi} style={{ fontSize: 10, color: 'var(--t-text-muted)', padding: '3px 6px', borderRadius: 4, background: bcolor + '18', marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                              {nb.titulo || BLOCK_TYPES.find(b => b.type === nb.type)?.label || nb.type}
                            </div>
                          );
                        })}
                        {col.length === 0 && <div style={{ fontSize: 9, color: 'var(--t-text-faint)', textAlign: 'center', paddingTop: 4 }}>vacía</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}

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

  // ── Sectors state ────────────────────────────────────────────────────────
  const [allSectors, setAllSectors] = useState([]);
  const [sector, setSector]         = useState([]);   // display mode: uuid[]
  const [obSector, setObSector]     = useState([]);   // onboarding: uuid[]
  const [obPlantilla, setObPlantilla] = useState(null); // null | 'completo' | 'simple'
  const [sectorInput, setSectorInput] = useState('');

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
  const [insertAtIndex, setInsertAtIndex] = useState(null);
  const [blocksSaving, setBlocksSaving]         = useState(false);
  const [blocksSaveError, setBlocksSaveError]   = useState(false);
  const cropForModalResolveRef = useRef(null);

  // Misc
  const [allMarcas, setAllMarcas]       = useState([]);
  const [marcaSectorMap, setMarcaSectorMap] = useState({});
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [imageHover, setImageHover]     = useState(false);
  const [showCrop, setShowCrop]         = useState(false);
  const [cropConfirm, setCropConfirm]   = useState(null);
  const [replacing, setReplacing]       = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < 640);
  const [autopublish]                   = useState(() => localStorage.getItem('biblioteca_autopublish') === 'true');
  const [hasPendingItem, setHasPendingItem] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        setSector(data.sector || []);
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
        const pending = JSON.parse(localStorage.getItem('biblioteca_pending_publish') || '[]');
        setHasPendingItem(pending.includes(id));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
    fetch(`${API_BASE}/biblioteca/marcas`).then(r => r.ok ? r.json() : []).then(data => {
      setAllMarcas(data.map(m => m.name));
      const map = {};
      for (const m of data) map[m.name] = m.sectors || [];
      setMarcaSectorMap(map);
    }).catch(() => {});
    (async () => {
      const token2 = await getToken();
      if (token2) {
        fetch(`${API_BASE}/biblioteca/tags`, { headers: { Authorization: `Bearer ${token2}` } })
          .then(r => r.ok ? r.json() : []).then(setAllTags).catch(() => {});
        fetch(`${API_BASE}/biblioteca/sectores`, { headers: { Authorization: `Bearer ${token2}` } })
          .then(r => r.ok ? r.json() : []).then(setAllSectors).catch(() => {});
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

  const handleObCategoria = (v) => { setObCategoria(v); setObStep('sector'); };
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
      sector: obSector,
      marca: marcaTrimmed,
      asunto: obCategoria === 'email' ? obAsunto.trim() : null,
      adelanto: obCategoria === 'email' ? obAdelanto.trim() : null,
      enviado_el: obCategoria === 'email' ? (obEnviadoEl || null) : null,
      ficha_url: obCategoria === 'ficha' ? (urlTrimmed || null) : null,
      fecha_analisis: obCategoria === 'ficha' ? (obFechaAnalisis || null) : null,
      tags: obTags,
      blocks_data: { blocks: makeTemplateBlocks(obPlantilla), library: blocksLibraryRef.current },
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
        setSector(data.sector || []);
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
          setMarcaSectorMap(prev => ({ ...prev, [marcaTrimmed]: obSector }));
        } else if (marcaTrimmed) {
          setMarcaSectorMap(prev => ({
            ...prev,
            [marcaTrimmed]: [...new Set([...(prev[marcaTrimmed] || []), ...obSector])],
          }));
        }
      }
    } finally { setSaving(false); }
  };

  const togglePublico = async () => {
    const next = item?.publico === false ? true : false;
    setItem(prev => ({ ...prev, publico: next }));
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/biblioteca/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ publico: next }),
      });
    } catch (_) {}
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
    setBlocksSaveError(false);
    try {
      const token = await getToken();
      const autopublish = localStorage.getItem('biblioteca_autopublish') === 'true';
      const blocksData = { blocks, library: blocksLibraryRef.current };
      const puntuacionBlk = blocks.find(b => b.type === 'puntuacion');
      const body = { blocks_data: blocksData };
      if (autopublish) {
        // When autopublishing, sync score and published blocks together
        body.puntuacion = puntuacionBlk?.valor != null ? Number(puntuacionBlk.valor) : null;
        body.blocks_data_published = blocksData;
        // Remove from pending if autopublish is on
        try {
          const pending = new Set(JSON.parse(localStorage.getItem('biblioteca_pending_publish') || '[]'));
          pending.delete(id);
          localStorage.setItem('biblioteca_pending_publish', JSON.stringify([...pending]));
          setHasPendingItem(false);
        } catch (_) {}
      } else {
        // Mark this item as having unpublished changes
        try {
          const pending = new Set(JSON.parse(localStorage.getItem('biblioteca_pending_publish') || '[]'));
          pending.add(id);
          localStorage.setItem('biblioteca_pending_publish', JSON.stringify([...pending]));
          setHasPendingItem(true);
        } catch (_) {}
      }
      const res = await fetch(`${API_BASE}/biblioteca/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) setBlocksSaveError(true);
    } catch (_) { setBlocksSaveError(true); }
    finally { setBlocksSaving(false); }
  }, [id]);

  const addBlock = useCallback((type, atIndex = null) => {
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
      items: type === 'imagen_texto' ? [{ image: null, texto: '', text_color: '', text_align: 'left' }] : type === 'asunto_adelanto' ? [{ show_asunto: false, show_adelanto: false, texto: '', text_color: '', text_align: 'left' }] : [],
      email_blocks: [],
      texto: '',
      nota: '',
      visible: type !== 'correccion' && type !== 'audio',
      ...(type === 'columnas' ? { num_columnas: 2, columns: [[], []] } : {}),
    };
    setBlocksData(prev => {
      let next;
      if (type === 'puntuacion') {
        const autoValor = calcularPuntuacion(prev);
        const punBlock = { ...newBlock, autocalcular: true, valor: autoValor ?? null };
        next = [punBlock, ...prev];
      } else if (atIndex !== null && type !== 'correccion') {
        next = [...prev.slice(0, atIndex), newBlock, ...prev.slice(atIndex)];
      } else {
        const correccionIdx = prev.findIndex(b => b.type === 'correccion');
        if (type === 'correccion' || correccionIdx === -1) {
          next = [...prev, newBlock];
        } else {
          next = [...prev.slice(0, correccionIdx), newBlock, ...prev.slice(correccionIdx)];
        }
      }
      saveBlocks(next);
      return next;
    });
    setTimeout(() => setEditingBlockId(newId), 50);
  }, [saveBlocks]);

  const updateBlock = useCallback((updatedBlock) => {
    const { _extractBefore, _extractAfter, ...block } = updatedBlock;
    setBlocksData(prev => {
      let next = prev.map(b => b.id === block.id ? block : b);
      if (_extractBefore || _extractAfter) {
        const idx = next.findIndex(b => b.id === block.id);
        if (_extractAfter) [].concat(_extractAfter).forEach((b, i) => next.splice(idx + 1 + i, 0, b));
        if (_extractBefore) [].concat(_extractBefore).reverse().forEach(b => next.splice(idx, 0, b));
      }
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

  const extractColumnas = useCallback((blockId) => {
    setBlocksData(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      if (idx === -1) return prev;
      const colBlock = prev[idx];
      const nestedBlocks = (colBlock.columns || []).flat().filter(Boolean);
      const next = [...prev.slice(0, idx), ...nestedBlocks, ...prev.slice(idx + 1)];
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

      // Moving into a Columnas block with empty columns → insert instead of swap
      const target = prev[newIdx];
      if (target.type === 'columnas') {
        const cols = target.columns || [];
        const emptyColIdx = cols.findIndex(col => !col || col.length === 0);
        if (emptyColIdx !== -1) {
          const blockToInsert = { ...prev[idx], id: `col_${Date.now()}_${Math.random().toString(36).substr(2,5)}` };
          const updatedTarget = {
            ...target,
            columns: cols.map((col, i) => i === emptyColIdx ? [...(col || []), blockToInsert] : (col || [])),
          };
          const next = prev.filter((_, i) => i !== idx);
          const targetIdx = next.findIndex(b => b.id === target.id);
          next[targetIdx] = updatedTarget;
          saveBlocks(next);
          return next;
        }
      }

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

  const toggleGlobalImage = useCallback(async (url, makeGlobal) => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`${API_BASE}/biblioteca/${id}/images/toggle-global`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, global: makeGlobal }),
    });
    const data = await res.json();
    if (data.library) {
      blocksLibraryRef.current = data.library;
      setBlocksLibrary(data.library);
    }
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
    const imgs = [];
    // La imagen principal del item (screenshot) va siempre primera
    const mainUrl = item?.url;
    if (mainUrl) { imgs.push({ url: mainUrl, isMain: true }); seen.add(mainUrl); }
    blocksLibrary.forEach(img => { if (!seen.has(img.url)) { imgs.push(img); seen.add(img.url); } });
    blocksData.forEach(b => {
      (b.images || []).forEach(img => {
        if (!seen.has(img.url)) { seen.add(img.url); imgs.push(img); }
      });
      (b.links || []).forEach(link => {
        (link.images || []).forEach(img => {
          if (!seen.has(img.url)) { seen.add(img.url); imgs.push(img); }
        });
      });
      (b.items || []).forEach(item => {
        if (item.image?.url && !seen.has(item.image.url)) {
          seen.add(item.image.url); imgs.push(item.image);
        }
      });
    });
    return imgs;
  }, [blocksData, blocksLibrary, item?.url]);

  // Auto-recalculate puntuacion in real time when autocalcular is ON
  useEffect(() => {
    const punBlk = blocksData.find(b => b.type === 'puntuacion' && b.autocalcular);
    if (!punBlk) return;
    const newValor = calcularPuntuacion(blocksData);
    if (newValor === punBlk.valor) return;
    const next = blocksData.map(b => b.id === punBlk.id ? { ...b, valor: newValor } : b);
    setBlocksData(next);
    saveBlocks(next);
  }, [blocksData, saveBlocks]);

  const publishItem = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    await fetch(`${API_BASE}/biblioteca/${id}/publish`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    const raw = JSON.parse(localStorage.getItem('biblioteca_pending_publish') || '[]');
    localStorage.setItem('biblioteca_pending_publish', JSON.stringify(raw.filter(x => x !== id)));
    setHasPendingItem(false);
  }, [id]);

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
          categoria={categoria}
          allBlocks={blocksData}
          itemId={id}
          onToggleGlobalImage={toggleGlobalImage}
        />
      ) : null; })()}
      {showCropForModal && item && <CropOverlay imageUrl={item.url} onCrop={handleCropForModal} onCancel={() => { setShowCropForModal(false); cropForModalResolveRef.current?.reject(new Error('cancelled')); cropForModalResolveRef.current = null; }} />}
      {showBlockSelectorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--t-overlay)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => { setShowBlockSelectorModal(false); setInsertAtIndex(null); }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480 }}>
            <BlockSelector
              hasCorreccion={blocksData.some(b => b.type === 'correccion')}
              hasPuntuacion={blocksData.some(b => b.type === 'puntuacion')}
              onSelect={(type) => { addBlock(type, insertAtIndex); setInsertAtIndex(null); setShowBlockSelectorModal(false); }}
              onClose={() => { setShowBlockSelectorModal(false); setInsertAtIndex(null); }}
              categoria={categoria}
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
        <button onClick={togglePublico} title={item?.publico === false ? 'Hacer visible' : 'Ocultar'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '3px 8px',
            cursor: 'pointer', border: 'none', transition: 'opacity 0.15s',
            ...(item?.publico === false
              ? { color: '#f87171', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }
              : { color: '#71717a', background: 'transparent', border: '1px solid transparent' }),
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          {item?.publico === false ? <IconEyeOff /> : <IconEye />}
          {item?.publico === false ? 'Oculto' : 'Visible'}
        </button>
        {(saving || blocksSaving) && <span className="text-xs text-zinc-600">Guardando…</span>}
        {!autopublish && hasPendingItem && (
          <button onClick={publishItem}
            style={{ fontSize: 12, fontWeight: 600, background: '#3b82f6', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
            Publicar
          </button>
        )}
        <button onClick={toggle} title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          style={{ marginLeft: 'auto', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Two columns */}
      <div className={isMobile ? 'flex flex-col gap-6' : 'grid grid-cols-2 gap-8 items-start'}>

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
                    <Tag colors={CAT_COLORS[obCategoria]} label={catLabel(obCategoria)} onRemove={() => { setObCategoria(null); setObSubcat(null); setObSector([]); setObPlantilla(null); setObStep('categoria'); }} />
                  </div>
                  {obSector.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sector</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {obSector.map(sid => { const s = allSectors.find(x => x.id === sid); if (!s) return null; return (
                          <Tag key={sid} colors={{ bg: s.color + '22', border: s.color, text: s.color }} label={s.name} onRemove={() => setObSector(prev => prev.filter(x => x !== sid))} />
                        ); })}
                      </div>
                    </div>
                  )}
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

              {obStep === 'sector' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--t-text)' }}>Elige Sector</span>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={sectorInput}
                      onChange={e => setSectorInput(e.target.value)}
                      placeholder="Añadir nuevo sector…"
                      style={{ width: '100%', background: 'var(--t-surface2)', border: '1px solid var(--t-border-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--t-text)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }}
                      onKeyDown={async e => {
                        if (e.key === 'Enter' && sectorInput.trim()) {
                          const name = sectorInput.trim();
                          const exists = allSectors.find(s => s.name.toLowerCase() === name.toLowerCase());
                          if (exists) {
                            if (!obSector.includes(exists.id)) setObSector(prev => [...prev, exists.id]);
                          } else {
                            try {
                              const token = await getToken();
                              const res = await fetch(`${API_BASE}/biblioteca/sectores`, {
                                method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name, color: '#6366f1' }),
                              });
                              if (res.ok) { const ns = await res.json(); setAllSectors(prev => [...prev, ns]); setObSector(prev => [...prev, ns.id]); }
                            } catch (_) {}
                          }
                          setSectorInput('');
                        }
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {allSectors.map(s => {
                      const selected = obSector.includes(s.id);
                      return (
                        <button key={s.id} onClick={() => setObSector(prev => selected ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, border: `1px solid ${selected ? s.color : 'var(--t-border)'}`, background: selected ? s.color + '22' : 'transparent', color: selected ? s.color : 'var(--t-text)', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}>
                          <span>{s.name}</span>
                          {selected && <span style={{ fontSize: 14 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  {/* Selector de plantilla */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--t-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Plantilla de bloques</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {[
                        { id: 'completo', label: 'Análisis Completo', icon: (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="17" width="18" height="4" rx="1"/>
                          </svg>
                        )},
                        { id: 'simple', label: 'Análisis Simple', icon: (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="5" rx="1"/><rect x="3" y="13" width="18" height="5" rx="1"/>
                          </svg>
                        )},
                        { id: null, label: 'En Blanco', icon: (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                          </svg>
                        )},
                      ].map(({ id, label, icon }) => {
                        const active = obPlantilla === id;
                        return (
                          <button key={String(id)} onClick={() => setObPlantilla(id)}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 6px', borderRadius: 8, border: `1px solid ${active ? '#6366f1' : 'var(--t-border)'}`, background: active ? 'rgba(99,102,241,0.12)' : 'transparent', color: active ? '#a5b4fc' : 'var(--t-text-muted)', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center', lineHeight: 1.3 }}>
                            {icon}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => setObStep(obCategoria === 'email' ? 'subcategoria' : 'campos')}
                    disabled={obSector.length === 0}
                    style={{ width: '100%', background: obSector.length === 0 ? 'var(--t-border-mid)' : 'white', color: obSector.length === 0 ? 'var(--t-text-placeholder)' : 'black', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: obSector.length === 0 ? 'not-allowed' : 'pointer' }}>
                    Continuar
                  </button>
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
                            <div key={s} onMouseDown={() => {
                              setObMarca(s);
                              const sectorIds = marcaSectorMap[s] || [];
                              if (sectorIds.length) {
                                setObSector(prev => [...new Set([...prev, ...sectorIds])]);
                              }
                            }}
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
              {obStep !== 'categoria' && obStep !== 'sector' && (
                <button
                  onClick={() => {
                    if (obStep === 'subcategoria') {
                      setObStep('sector');
                    } else if (obStep === 'campos') {
                      if (obCategoria === 'email') {
                        setObStep('subcategoria');
                      } else {
                        setObStep('sector');
                      }
                    }
                  }}
                  style={{ width: '100%', background: 'transparent', border: '1px solid var(--t-border-mid)', color: 'var(--t-text-muted)', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#f87171'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-border-mid)'; e.currentTarget.style.color = 'var(--t-text-muted)'; }}>
                  ← Volver
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
                  <Tag colors={CAT_COLORS[categoria]} label={catLabel(categoria)} onRemove={() => { setCategoria(null); setSubcat(null); setSector([]); patch({ categoria: null, subcategoria: null, sector: [], ficha_url: null, fecha_analisis: null }); setObMarca(''); setObUrl(''); setObFechaAnalisis(''); setObTags([]); setObSector([]); setObPlantilla(null); setMode('onboarding'); setObStep('categoria'); setObCategoria(null); setObSubcat(null); }} />
                </div>
              )}
              {categoria && (
                <DisplaySectorPicker
                  allSectors={allSectors}
                  selectedIds={sector}
                  onToggle={(sid) => { const ns = sector.includes(sid) ? sector.filter(x => x !== sid) : [...sector, sid]; setSector(ns); patch({ sector: ns }); }}
                  onCreateSector={async (name) => {
                    try {
                      const token = await getToken();
                      const res = await fetch(`${API_BASE}/biblioteca/sectores`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color: '#6366f1' }) });
                      if (res.ok) { const ns2 = await res.json(); setAllSectors(prev => [...prev, ns2]); const newS = [...sector, ns2.id]; setSector(newS); patch({ sector: newS }); }
                    } catch (_) {}
                  }}
                />
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
              onSave={v => {
                setMarca(v);
                patch({ marca: v });
                if (v && !allMarcas.includes(v)) setAllMarcas(p => [...p, v].sort((a,b) => a.localeCompare(b)));
                // Auto-fill sectors from this brand if current item has none
                if (v && marcaSectorMap[v]?.length && !sector.length) {
                  const ns = marcaSectorMap[v];
                  setSector(ns);
                  patch({ sector: ns });
                }
              }}
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
          {!blocksSaving && blocksSaveError && (
            <span style={{ fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Error al guardar. Recarga la página y vuelve a intentarlo.
            </span>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {blocksData.map((block, idx) => {
              const hasPuntuacionFirst = blocksData[0]?.type === 'puntuacion';
              const correccionIdx = blocksData.findIndex(b => b.type === 'correccion');
              const canMoveUp = idx > 0 && !(hasPuntuacionFirst && idx === 1);
              const canMoveDown = idx < blocksData.length - 1 && !(correccionIdx !== -1 && idx === correccionIdx - 1);
              return (
              <div key={block.id}>
                <BlockDivider onAdd={() => { setInsertAtIndex(idx); setShowBlockSelectorModal(true); }} />
                <BlockCard
                  block={block}
                  index={idx}
                  total={blocksData.length}
                  onEdit={() => setEditingBlockId(block.id)}
                  onDelete={() => deleteBlock(block.id)}
                  onMoveUp={canMoveUp ? () => moveBlock(block.id, -1) : null}
                  onMoveDown={canMoveDown ? () => moveBlock(block.id, 1) : null}
                  onToggleVisible={() => toggleBlockVisible(block.id)}
                  itemAsunto={asunto}
                  itemAdelanto={adelanto}
                  onUpdateBlock={updateBlock}
                  onExtract={() => extractColumnas(block.id)}
                  categoria={categoria}
                  onUploadImage={uploadImageForBlock}
                  onCropFromEmail={cropFromEmail}
                  libraryImages={libraryImages}
                  isMobile={isMobile}
                />
              </div>
              );
            })}
            <BlockDivider onAdd={() => { setInsertAtIndex(blocksData.length); setShowBlockSelectorModal(true); }} />
            <button
              onClick={() => { setInsertAtIndex(null); setShowBlockSelectorModal(true); }}
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
