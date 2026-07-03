import { useEffect, useState, useRef, useCallback } from 'react';
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

// ── Icons (SVG) ───────────────────────────────────────────────────────────────
const IconEmail = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <polyline points="2,4 12,13 22,4"/>
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
    <rect x="2" y="3" width="6" height="5" rx="1"/>
    <rect x="16" y="3" width="6" height="5" rx="1"/>
    <rect x="9" y="16" width="6" height="5" rx="1"/>
    <line x1="5" y1="8" x2="12" y2="16"/>
    <line x1="19" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="5.5" x2="16" y2="5.5"/>
  </svg>
);
const IconSend = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconScissors = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
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

// ── Tag component ─────────────────────────────────────────────────────────────
function Tag({ colors, label, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '3px 10px', background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>
        {label}
      </span>
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 2, display: 'flex' }} title="Quitar">
          <IconX />
        </button>
      )}
    </div>
  );
}

// ── Category buttons ──────────────────────────────────────────────────────────
function CatButtons({ options, colors, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          style={{ flex: 1, height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px solid #3f3f46', borderRadius: 16, background: 'transparent', color: '#71717a', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { const c = colors[opt.value]; e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.text; e.currentTarget.style.background = c.bg; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#71717a'; e.currentTarget.style.background = 'transparent'; }}
        >
          {opt.icon}
          <span style={{ fontSize: 13 }}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Field row with check/X confirm and optional autocomplete ──────────────────
function FieldRow({ label, savedValue, onSave, required = false, allowEmpty = true, type = 'text', placeholder, suggestions = [] }) {
  const [inputMode, setInputMode] = useState(false);
  const [inputVal, setInputVal]   = useState('');
  const [error, setError]         = useState('');
  const [showSugg, setShowSugg]   = useState(false);
  const inputRef = useRef(null);

  const isSet = savedValue !== null;
  const filteredSugg = suggestions.filter(s =>
    inputVal.length > 0 && s.toLowerCase().includes(inputVal.toLowerCase()) && s !== inputVal
  );

  useEffect(() => {
    if (inputMode && inputRef.current) inputRef.current.focus();
  }, [inputMode]);

  const startEdit = () => {
    setInputVal(isSet ? (savedValue || '') : '');
    setError('');
    setInputMode(true);
  };

  const handleConfirm = () => {
    const trimmed = inputVal.trim();
    if (type === 'date') {
      if (!trimmed) { setInputMode(false); return; }
      onSave(trimmed);
      setInputMode(false);
      return;
    }
    if (required && !trimmed) { setError('Este campo es obligatorio'); return; }
    if (!allowEmpty && !trimmed) { setInputMode(false); return; }
    onSave(trimmed);
    setInputMode(false);
    setError('');
  };

  const handleCancel = () => { setInputMode(false); setError(''); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleConfirm(); }
    if (e.key === 'Escape') handleCancel();
  };

  if (!isSet && !inputMode) {
    return (
      <button
        onClick={startEdit}
        style={{ background: 'none', border: '1px dashed #27272a', color: '#3f3f46', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', alignSelf: 'flex-start' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#52525b'; e.currentTarget.style.color = '#71717a'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#3f3f46'; }}
      >
        <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> {label}
      </button>
    );
  }

  if (isSet && !inputMode) {
    const displayValue = type === 'date' && savedValue
      ? new Date(savedValue + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
      : savedValue;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <div onClick={startEdit} title="Haz clic para editar"
          style={{ fontSize: 13, color: displayValue ? 'white' : '#71717a', cursor: 'text', padding: '4px 0', fontStyle: displayValue ? 'normal' : 'italic', borderBottom: '1px solid #27272a' }}>
          {displayValue || '(Vacío)'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {isSet && <span style={{ fontSize: 11, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            ref={inputRef}
            type={type}
            value={inputVal}
            onChange={e => { setInputVal(e.target.value); setShowSugg(true); setError(''); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSugg(true)}
            onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            placeholder={placeholder || label + '…'}
            style={{ flex: 1, background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '7px 10px', fontSize: 13, color: 'white', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }}
          />
          <button onClick={handleConfirm} title="Confirmar" style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}><IconCheck /></button>
          <button onClick={handleCancel} title="Cancelar" style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}><IconX /></button>
        </div>
        {showSugg && filteredSugg.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 40, background: '#1a1a1a', border: '1px solid #27272a', borderRadius: 8, marginTop: 4, zIndex: 20, overflow: 'hidden' }}>
            {filteredSugg.slice(0, 6).map(s => (
              <div key={s} onMouseDown={() => { setInputVal(s); setShowSugg(false); }}
                style={{ padding: '7px 12px', fontSize: 13, color: 'white', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>}
    </div>
  );
}

// ── Crop overlay (two modes) ──────────────────────────────────────────────────
function CropOverlay({ imageUrl, onCrop, onCancel }) {
  const [mode, setMode]           = useState('libre');
  // Free crop
  const [freeDrag, setFreeDrag]   = useState(null);
  const [freeRect, setFreeRect]   = useState(null);
  // Resize crop
  const [cropBox, setCropBox]     = useState(null); // { x, y, w, h } display px relative to image
  const [dragHandle, setDragHandle] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(null);
  const imgRef = useRef(null);

  // Global mouseup to handle dragging outside overlay
  useEffect(() => {
    const up = () => { setDragHandle(null); setFreeDrag(null); };
    document.addEventListener('mouseup', up);
    return () => document.removeEventListener('mouseup', up);
  }, []);

  const initCropBox = useCallback(() => {
    if (!imgRef.current) return;
    const b = imgRef.current.getBoundingClientRect();
    if (b.width === 0) return;
    const w = b.width * 0.75;
    const h = b.height * 0.65;
    setCropBox({ x: (b.width - w) / 2, y: (b.height - h) / 2, w, h });
  }, []);

  useEffect(() => {
    if (mode === 'ajustar') {
      setCropBox(null);
      setAspectRatio(null);
      requestAnimationFrame(() => requestAnimationFrame(initCropBox));
    } else {
      setFreeRect(null);
    }
  }, [mode, initCropBox]);

  const applyPreset = (ratio) => {
    setAspectRatio(ratio);
    if (!imgRef.current) return;
    const b = imgRef.current.getBoundingClientRect();
    const current = cropBox || { x: b.width * 0.1, y: b.height * 0.1, w: b.width * 0.8, h: b.height * 0.8 };
    const cx = current.x + current.w / 2;
    const cy = current.y + current.h / 2;
    let w = current.w;
    let h = ratio ? w / ratio : current.h;
    if (h > b.height * 0.95) { h = b.height * 0.95; w = ratio ? h * ratio : w; }
    if (w > b.width  * 0.95) { w = b.width  * 0.95; h = ratio ? w / ratio : h; }
    const x = Math.max(0, Math.min(cx - w / 2, b.width  - w));
    const y = Math.max(0, Math.min(cy - h / 2, b.height - h));
    setCropBox({ x, y, w, h });
  };

  const handleMouseMove = (e) => {
    if (mode === 'libre') {
      if (!freeDrag || !imgRef.current) return;
      const b = imgRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - b.left, b.width));
      const y = Math.max(0, Math.min(e.clientY - b.top,  b.height));
      setFreeRect({ x: Math.min(freeDrag.sx, x), y: Math.min(freeDrag.sy, y), w: Math.abs(x - freeDrag.sx), h: Math.abs(y - freeDrag.sy) });
    } else {
      if (!dragHandle || !imgRef.current) return;
      const imgRect = imgRef.current.getBoundingClientRect();
      const dx = (e.clientX - imgRect.left) - dragHandle.startRelX;
      const dy = (e.clientY - imgRect.top)  - dragHandle.startRelY;
      const b  = dragHandle.startBox;
      const imgW = imgRect.width;
      const imgH = imgRect.height;
      const ratio = aspectRatio;
      const MIN = 30;
      let { x, y, w, h } = b;

      switch (dragHandle.type) {
        case 'move':
          x = Math.max(0, Math.min(b.x + dx, imgW - b.w));
          y = Math.max(0, Math.min(b.y + dy, imgH - b.h));
          break;
        case 'se':
          w = Math.max(MIN, Math.min(b.w + dx, imgW - b.x));
          h = ratio ? w / ratio : Math.max(MIN, Math.min(b.h + dy, imgH - b.y));
          if (ratio && b.y + h > imgH) { h = imgH - b.y; w = h * ratio; }
          break;
        case 'sw':
          w = Math.max(MIN, Math.min(b.w - dx, b.x + b.w));
          x = b.x + b.w - w;
          h = ratio ? w / ratio : Math.max(MIN, Math.min(b.h + dy, imgH - b.y));
          if (ratio && b.y + h > imgH) { h = imgH - b.y; w = h * ratio; x = b.x + b.w - w; }
          break;
        case 'ne':
          w = Math.max(MIN, Math.min(b.w + dx, imgW - b.x));
          h = ratio ? w / ratio : Math.max(MIN, Math.min(b.h - dy, b.y + b.h));
          y = b.y + b.h - h;
          if (ratio && y < 0) { h = b.y + b.h; w = h * ratio; y = 0; }
          break;
        case 'nw':
          w = Math.max(MIN, Math.min(b.w - dx, b.x + b.w));
          x = b.x + b.w - w;
          h = ratio ? w / ratio : Math.max(MIN, Math.min(b.h - dy, b.y + b.h));
          y = b.y + b.h - h;
          if (ratio && y < 0) { h = b.y + b.h; w = h * ratio; x = b.x + b.w - w; y = 0; }
          break;
        case 'e':
          w = Math.max(MIN, Math.min(b.w + dx, imgW - b.x));
          if (ratio) { h = w / ratio; y = b.y + b.h / 2 - h / 2; }
          break;
        case 'w':
          w = Math.max(MIN, Math.min(b.w - dx, b.x + b.w));
          x = b.x + b.w - w;
          if (ratio) { h = w / ratio; y = b.y + b.h / 2 - h / 2; }
          break;
        case 'n':
          h = Math.max(MIN, Math.min(b.h - dy, b.y + b.h));
          y = b.y + b.h - h;
          if (ratio) { w = h * ratio; x = b.x + b.w / 2 - w / 2; }
          break;
        case 's':
          h = Math.max(MIN, Math.min(b.h + dy, imgH - b.y));
          if (ratio) { w = h * ratio; x = b.x + b.w / 2 - w / 2; }
          break;
        default: break;
      }
      // Clamp to image bounds
      x = Math.max(0, x); y = Math.max(0, y);
      w = Math.min(w, imgW - x); h = Math.min(h, imgH - y);
      setCropBox({ x, y, w, h });
    }
  };

  const handleMouseUp = () => {
    if (mode === 'libre' && freeDrag && freeRect && freeRect.w >= 10 && freeRect.h >= 10) {
      const b  = imgRef.current.getBoundingClientRect();
      const sx = imgRef.current.naturalWidth  / b.width;
      const sy = imgRef.current.naturalHeight / b.height;
      onCrop({ x: Math.round(freeRect.x * sx), y: Math.round(freeRect.y * sy), w: Math.round(freeRect.w * sx), h: Math.round(freeRect.h * sy) });
    }
    setFreeDrag(null);
    setDragHandle(null);
  };

  const confirmResize = () => {
    if (!cropBox || !imgRef.current) return;
    const b  = imgRef.current.getBoundingClientRect();
    const sx = imgRef.current.naturalWidth  / b.width;
    const sy = imgRef.current.naturalHeight / b.height;
    onCrop({ x: Math.round(cropBox.x * sx), y: Math.round(cropBox.y * sy), w: Math.round(cropBox.w * sx), h: Math.round(cropBox.h * sy) });
  };

  const startHandleDrag = (e, handleType) => {
    e.preventDefault(); e.stopPropagation();
    if (!imgRef.current) return;
    const imgRect = imgRef.current.getBoundingClientRect();
    setDragHandle({
      type:      handleType,
      startRelX: e.clientX - imgRect.left,
      startRelY: e.clientY - imgRect.top,
      startBox:  { ...cropBox },
    });
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top controls */}
      <div style={{ padding: '16px 0 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', background: '#1a1a1a', border: '1px solid #27272a', borderRadius: 10, padding: 3, gap: 2 }}>
          {[{ id: 'libre', label: 'Recorte libre' }, { id: 'ajustar', label: 'Ajustar tamaño' }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ padding: '5px 14px', fontSize: 12, borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: mode === m.id ? '#27272a' : 'transparent', color: mode === m.id ? 'white' : '#71717a' }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Aspect ratio presets (ajustar mode) */}
        {mode === 'ajustar' && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#52525b' }}>Proporción:</span>
            <button onClick={() => { setAspectRatio(null); }} style={presetBtnStyle(aspectRatio === null)}>Libre</button>
            {ASPECT_PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p.ratio)} style={presetBtnStyle(Math.abs((aspectRatio || 0) - p.ratio) < 0.001)}>{p.label}</button>
            ))}
          </div>
        )}

        {mode === 'libre' && (
          <p style={{ color: '#71717a', fontSize: 12, margin: 0 }}>Arrastra sobre la imagen para seleccionar el área</p>
        )}
      </div>

      {/* Image area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden', padding: '0 40px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            ref={imgRef}
            src={imageUrl}
            crossOrigin="anonymous"
            alt="recortar"
            onLoad={mode === 'ajustar' ? initCropBox : undefined}
            style={{ maxWidth: '80vw', maxHeight: '62vh', display: 'block', cursor: mode === 'libre' ? 'crosshair' : 'default' }}
            onMouseDown={mode === 'libre' ? (e) => {
              e.preventDefault();
              const b = imgRef.current.getBoundingClientRect();
              setFreeDrag({ sx: e.clientX - b.left, sy: e.clientY - b.top });
              setFreeRect(null);
            } : undefined}
            draggable={false}
          />

          {/* Free crop selection rect */}
          {mode === 'libre' && freeRect && freeRect.w > 0 && freeRect.h > 0 && (
            <div style={{ position: 'absolute', border: '2px solid white', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)', pointerEvents: 'none', left: freeRect.x, top: freeRect.y, width: freeRect.w, height: freeRect.h }} />
          )}

          {/* Resize crop box */}
          {mode === 'ajustar' && cropBox && (
            <div
              onMouseDown={e => startHandleDrag(e, 'move')}
              style={{ position: 'absolute', left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h, border: '2px solid white', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)', cursor: 'move', boxSizing: 'border-box' }}
            >
              {/* Grid lines (rule of thirds) */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {['33.33%', '66.66%'].map(p => (
                  <div key={'h' + p} style={{ position: 'absolute', top: p, left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.25)' }} />
                ))}
                {['33.33%', '66.66%'].map(p => (
                  <div key={'v' + p} style={{ position: 'absolute', left: p, top: 0, bottom: 0, borderLeft: '1px solid rgba(255,255,255,0.25)' }} />
                ))}
              </div>

              {/* Resize handles */}
              {RESIZE_HANDLES.map(h => (
                <div
                  key={h.id}
                  onMouseDown={e => startHandleDrag(e, h.id)}
                  style={{ position: 'absolute', width: 10, height: 10, background: 'white', borderRadius: 2, ...h.style }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: '12px 0 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={onCancel}
          style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 999, padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>
          Cancelar
        </button>
        {mode === 'ajustar' && cropBox && (
          <button onClick={confirmResize}
            style={{ background: 'white', color: 'black', border: 'none', borderRadius: 999, padding: '7px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Confirmar recorte
          </button>
        )}
      </div>
    </div>
  );
}

// ── Image modal ───────────────────────────────────────────────────────────────
function ImageModal({ imageUrl, alt, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '32px 24px' }}
      onClick={onClose}>
      <div style={{ position: 'relative', maxWidth: 900, width: '100%' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: -36, right: 0, background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconX /> Cerrar
        </button>
        <img src={imageUrl} alt={alt} style={{ width: '100%', borderRadius: 12, display: 'block' }} />
      </div>
    </div>
  );
}

// ── Crop confirm modal ────────────────────────────────────────────────────────
function CropConfirmModal({ previewUrl, onConfirm, onCancel, saving }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#1a1a1a', border: '1px solid #27272a', borderRadius: 16, padding: 24, maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'white', fontSize: 15, fontWeight: 500, margin: 0 }}>¿Guardar este recorte?</p>
        <p style={{ color: '#71717a', fontSize: 12, margin: 0 }}>Esta acción reemplazará la imagen original.</p>
        <img src={previewUrl} alt="recorte" style={{ width: '100%', borderRadius: 8, border: '1px solid #27272a', maxHeight: 320, objectFit: 'contain' }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} disabled={saving} style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 999, padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={onConfirm} disabled={saving}
            style={{ background: saving ? '#3f3f46' : 'white', color: saving ? '#a1a1aa' : 'black', border: 'none', borderRadius: 999, padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {saving && <div style={{ width: 12, height: 12, border: '2px solid #71717a', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
            {saving ? 'Guardando…' : 'Sí, guardar'}
          </button>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ── Auth helper ───────────────────────────────────────────────────────────────
async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BibliotecaItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nombre, setNombre]       = useState('');
  const [categoria, setCategoria] = useState(null);
  const [subcategoria, setSubcat] = useState(null);
  const [marca, setMarca]         = useState(null);
  const [asunto, setAsunto]       = useState(null);
  const [adelanto, setAdelanto]   = useState(null);
  const [enviadoEl, setEnviadoEl] = useState(null);
  const [saving, setSaving]       = useState(false);
  const saveTimeout = useRef(null);

  const [allMarcas, setAllMarcas] = useState([]);

  const [imageHover, setImageHover]   = useState(false);
  const [showCrop, setShowCrop]       = useState(false);
  const [cropConfirm, setCropConfirm] = useState(null);
  const [replacing, setReplacing]     = useState(false);
  const [showModal, setShowModal]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) { navigate('/admin/login'); return; }
        const res = await fetch(`${API_BASE}/biblioteca/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error(res.status === 404 ? 'Captura no encontrada' : 'Error al cargar');
        const data = await res.json();
        setItem(data);
        setNombre(data.nombre || '');
        setCategoria(data.categoria || null);
        setSubcat(data.subcategoria || null);
        setMarca(data.marca  !== null && data.marca  !== undefined ? data.marca  : null);
        setAsunto(data.asunto !== null && data.asunto !== undefined ? data.asunto : null);
        setAdelanto(data.adelanto !== null && data.adelanto !== undefined ? data.adelanto : null);
        setEnviadoEl(data.enviado_el !== null && data.enviado_el !== undefined ? data.enviado_el : null);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();

    fetch(`${API_BASE}/biblioteca/marcas`)
      .then(r => r.ok ? r.json() : [])
      .then(setAllMarcas)
      .catch(() => {});
  }, [id, navigate]);

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

  const handleCategoria = (v) => { setCategoria(v); setSubcat(null); patch({ categoria: v, subcategoria: null }); };
  const handleSubcat    = (v) => { setSubcat(v); patch({ subcategoria: v }); };

  const handleCrop = useCallback((cropRect) => {
    setShowCrop(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
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
      const res = await fetch(`${API_BASE}/biblioteca/${id}/replace-image`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      setItem(await res.json());
      URL.revokeObjectURL(cropConfirm.url);
      setCropConfirm(null);
    } catch (e) {
      alert('Error al guardar recorte: ' + e.message);
    } finally { setReplacing(false); }
  };

  const cancelCrop = () => {
    if (cropConfirm?.url) URL.revokeObjectURL(cropConfirm.url);
    setCropConfirm(null);
  };

  const debounceNombre = (value) => {
    setNombre(value);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => patch({ nombre: value }), 800);
  };

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

  const showSubcatQuestion = categoria === 'email' && !subcategoria;
  const showFields = categoria === 'email' && subcategoria;

  return (
    <div className="p-4 md:p-8" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>

      {showCrop && item && <CropOverlay imageUrl={item.url} onCrop={handleCrop} onCancel={() => setShowCrop(false)} />}
      {cropConfirm && <CropConfirmModal previewUrl={cropConfirm.url} onConfirm={confirmCrop} onCancel={cancelCrop} saving={replacing} />}
      {showModal && item && <ImageModal imageUrl={item.url} alt={nombre || item.filename} onClose={() => setShowModal(false)} />}

      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/admin/biblioteca')} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Biblioteca
        </button>
        {saving && <span className="text-xs text-zinc-600">Guardando…</span>}
      </div>

      <input
        type="text" value={nombre}
        onChange={e => debounceNombre(e.target.value)}
        placeholder="Nombre…"
        className="w-full bg-transparent border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-base text-white outline-none transition-colors mb-5"
      />

      <div className="grid grid-cols-2 gap-8 items-start">

        {/* Left: image */}
        <div style={{ position: 'relative' }}
          onMouseEnter={() => setImageHover(true)}
          onMouseLeave={() => setImageHover(false)}>
          <div className="rounded-xl border border-zinc-800" style={{ height: 560, overflowY: 'auto', overflowX: 'hidden' }}>
            <img src={item.url} alt={nombre || item.filename} style={{ width: '100%', display: 'block' }} />
          </div>
          {imageHover && (
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
              <button onClick={() => setShowCrop(true)} title="Recortar"
                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, backdropFilter: 'blur(4px)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
                <IconScissors /> Recortar
              </button>
              <button onClick={() => setShowModal(true)} title="Ver completa"
                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, backdropFilter: 'blur(4px)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
                <IconEye /> Ver
              </button>
            </div>
          )}
        </div>

        {/* Right: metadata */}
        <div className="flex flex-col gap-5">

          {(categoria || subcategoria) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categoria && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categoría</span>
                  <Tag colors={CAT_COLORS[categoria]} label={CATEGORIAS.find(c => c.value === categoria)?.label} onRemove={() => handleCategoria(null)} />
                </div>
              )}
              {subcategoria && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subcategoría</span>
                  <Tag colors={SUBCAT_COLORS[subcategoria]} label={SUBCATEGORIAS.find(s => s.value === subcategoria)?.label} onRemove={() => { setSubcat(null); patch({ subcategoria: null }); }} />
                </div>
              )}
            </div>
          )}

          {!categoria && (
            <div className="flex flex-col items-center gap-8 pt-4">
              <span className="text-xl font-medium text-white text-center">¿Email o Ficha de Producto?</span>
              <CatButtons options={CATEGORIAS} colors={CAT_COLORS} onSelect={handleCategoria} />
            </div>
          )}

          {showSubcatQuestion && (
            <div className="flex flex-col gap-6 pt-2">
              <span className="text-xl font-medium text-white">¿Automatización o Campaña?</span>
              <CatButtons options={SUBCATEGORIAS} colors={SUBCAT_COLORS} onSelect={handleSubcat} />
            </div>
          )}

          {showFields && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
              <FieldRow
                label="Marca"
                savedValue={marca}
                onSave={v => {
                  setMarca(v); patch({ marca: v });
                  setAllMarcas(prev => prev.includes(v) ? prev : [...prev, v].sort((a, b) => a.localeCompare(b)));
                }}
                required allowEmpty={false}
                suggestions={allMarcas}
              />
              <FieldRow label="Asunto"   savedValue={asunto}   onSave={v => { setAsunto(v);   patch({ asunto: v });   }} placeholder="Asunto del email…" />
              <FieldRow label="Adelanto" savedValue={adelanto} onSave={v => { setAdelanto(v); patch({ adelanto: v }); }} placeholder="Texto de adelanto…" />
              <FieldRow label="Enviado el Día" savedValue={enviadoEl} onSave={v => { setEnviadoEl(v); patch({ enviado_el: v }); }} allowEmpty={false} type="date" />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
