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
const IconAuto = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 2 13 9 20 9"/>
    <path d="M20 14.5V7l-7-5H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/>
    <path d="m16 19 2 2 4-4"/>
  </svg>
);
const IconCampana = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 13.5a19.79 19.79 0 0 1-3-8.59A2 2 0 0 1 3.68 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.7a16 16 0 0 0 5.9 5.9l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
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
const IconPencil = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
  { value: 'automatizacion', label: 'Automatización', icon: <IconAuto /> },
  { value: 'campana',        label: 'Campaña',         icon: <IconCampana /> },
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

// ── Editable field with pencil toggle ────────────────────────────────────────
function EditableField({ label, value, onChange, onSave, type = 'text', placeholder }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onSave();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  };

  const displayValue = type === 'date' && value
    ? new Date(value + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ background: 'none', border: 'none', color: '#3f3f46', cursor: 'pointer', padding: '2px 4px', display: 'flex', borderRadius: 4, transition: 'color 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#71717a'}
            onMouseLeave={e => e.currentTarget.style.color = '#3f3f46'}
            title={`Editar ${label}`}
          >
            <IconPencil />
          </button>
        )}
        {editing && (
          <button
            onClick={commit}
            style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', padding: '2px 4px', display: 'flex', borderRadius: 4 }}
            title="Guardar"
          >
            <IconCheck />
          </button>
        )}
      </div>
      {editing ? (
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || label + '…'}
          style={{
            background: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: 8,
            padding: '7px 10px',
            fontSize: 13,
            color: 'white',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
            colorScheme: 'dark',
          }}
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          style={{ fontSize: 13, color: value ? 'white' : '#3f3f46', cursor: 'text', padding: '7px 0', minHeight: 32, borderBottom: '1px solid #27272a' }}
        >
          {displayValue || <span style={{ fontStyle: 'italic' }}>{placeholder || label + '…'}</span>}
        </div>
      )}
    </div>
  );
}

// ── Crop overlay ──────────────────────────────────────────────────────────────
function CropOverlay({ imageUrl, onCrop, onCancel }) {
  const [drag, setDrag] = useState(null);
  const [rect, setRect] = useState(null);
  const imgRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const b = imgRef.current.getBoundingClientRect();
    setDrag({ sx: e.clientX - b.left, sy: e.clientY - b.top });
    setRect(null);
  };
  const handleMouseMove = (e) => {
    if (!drag) return;
    const b = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - b.left, b.width));
    const y = Math.max(0, Math.min(e.clientY - b.top, b.height));
    setRect({ x: Math.min(drag.sx, x), y: Math.min(drag.sy, y), w: Math.abs(x - drag.sx), h: Math.abs(y - drag.sy) });
  };
  const handleMouseUp = () => {
    if (!drag || !rect || rect.w < 10 || rect.h < 10) { setDrag(null); return; }
    const b = imgRef.current.getBoundingClientRect();
    const sx = imgRef.current.naturalWidth / b.width;
    const sy = imgRef.current.naturalHeight / b.height;
    onCrop({ x: Math.round(rect.x * sx), y: Math.round(rect.y * sy), w: Math.round(rect.w * sx), h: Math.round(rect.h * sy) });
    setDrag(null);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <p style={{ color: '#a1a1aa', fontSize: 13, userSelect: 'none' }}>Arrastra para seleccionar el área a recortar</p>
      <div style={{ position: 'relative', cursor: 'crosshair', maxHeight: '80vh', overflowY: 'auto' }}>
        <img ref={imgRef} src={imageUrl} crossOrigin="anonymous" alt="recortar"
          style={{ maxWidth: '80vw', display: 'block', userSelect: 'none' }}
          onMouseDown={handleMouseDown} draggable={false} />
        {rect && rect.w > 0 && rect.h > 0 && (
          <div style={{ position: 'absolute', border: '2px solid white', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)', pointerEvents: 'none', left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />
        )}
      </div>
      <button onClick={onCancel} style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 999, padding: '6px 18px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
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
          <button onClick={onConfirm} disabled={saving} style={{ background: saving ? '#3f3f46' : 'white', color: saving ? '#a1a1aa' : 'black', border: 'none', borderRadius: 999, padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
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

  // Editable fields
  const [nombre, setNombre]           = useState('');
  const [categoria, setCategoria]     = useState(null);
  const [subcategoria, setSubcat]     = useState(null);
  const [marca, setMarca]             = useState('');
  const [asunto, setAsunto]           = useState('');
  const [adelanto, setAdelanto]       = useState('');
  const [enviadoEl, setEnviadoEl]     = useState('');
  const [saving, setSaving]           = useState(false);
  const saveTimeout = useRef(null);

  // Image overlay state
  const [imageHover, setImageHover]   = useState(false);
  const [showCrop, setShowCrop]       = useState(false);
  const [cropConfirm, setCropConfirm] = useState(null); // { blob, url }
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
        setMarca(data.marca || '');
        setAsunto(data.asunto || '');
        setAdelanto(data.adelanto || '');
        setEnviadoEl(data.enviado_el || '');
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
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

  const debounce = (field, value, setter) => {
    setter(value);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => patch({ [field]: value }), 800);
  };

  const handleCategoria = (v) => { setCategoria(v); setSubcat(null); patch({ categoria: v, subcategoria: null }); };
  const handleSubcat    = (v) => { setSubcat(v); patch({ subcategoria: v }); };

  // ── Crop ────────────────────────────────────────────────────────────────────
  const handleCrop = useCallback((cropRect) => {
    setShowCrop(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropRect.w; canvas.height = cropRect.h;
      canvas.getContext('2d').drawImage(img, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cropRect.w, cropRect.h);
      canvas.toBlob(blob => {
        setCropConfirm({ blob, url: URL.createObjectURL(blob) });
      }, 'image/png');
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
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setItem(updated);
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

      {/* Overlays */}
      {showCrop && item && <CropOverlay imageUrl={item.url} onCrop={handleCrop} onCancel={() => setShowCrop(false)} />}
      {cropConfirm && <CropConfirmModal previewUrl={cropConfirm.url} onConfirm={confirmCrop} onCancel={cancelCrop} saving={replacing} />}
      {showModal && item && <ImageModal imageUrl={item.url} alt={nombre || item.filename} onClose={() => setShowModal(false)} />}

      {/* Back */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/admin/biblioteca')} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Biblioteca
        </button>
        {saving && <span className="text-xs text-zinc-600">Guardando…</span>}
      </div>

      {/* Nombre — full width */}
      <input
        type="text" value={nombre}
        onChange={e => debounce('nombre', e.target.value, setNombre)}
        placeholder="Nombre…"
        className="w-full bg-transparent border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-base text-white outline-none transition-colors mb-5"
      />

      {/* Two equal columns */}
      <div className="grid grid-cols-2 gap-8 items-start">

        {/* Left: image with hover overlay */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setImageHover(true)}
          onMouseLeave={() => setImageHover(false)}
        >
          <div className="rounded-xl border border-zinc-800" style={{ height: 560, overflowY: 'auto', overflowX: 'hidden' }}>
            <img src={item.url} alt={nombre || item.filename} style={{ width: '100%', display: 'block' }} />
          </div>
          {imageHover && (
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
              <button
                onClick={() => setShowCrop(true)}
                title="Recortar"
                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, backdropFilter: 'blur(4px)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                <IconScissors /> Recortar
              </button>
              <button
                onClick={() => setShowModal(true)}
                title="Ver completa"
                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, backdropFilter: 'blur(4px)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                <IconEye /> Ver
              </button>
            </div>
          )}
        </div>

        {/* Right: metadata */}
        <div className="flex flex-col gap-5">

          {/* Tags row */}
          {(categoria || subcategoria) && (
            <div className="flex flex-col gap-2">
              {categoria && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600 uppercase tracking-widest w-20">Categoría</span>
                  <Tag colors={CAT_COLORS[categoria]} label={CATEGORIAS.find(c => c.value === categoria)?.label} onRemove={() => handleCategoria(null)} />
                </div>
              )}
              {subcategoria && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600 uppercase tracking-widest w-20">Subcategoría</span>
                  <Tag colors={SUBCAT_COLORS[subcategoria]} label={SUBCATEGORIAS.find(s => s.value === subcategoria)?.label} onRemove={() => { setSubcat(null); patch({ subcategoria: null }); }} />
                </div>
              )}
            </div>
          )}

          {/* Category question */}
          {!categoria && (
            <div className="flex flex-col items-center gap-8 pt-4">
              <span className="text-xl font-medium text-white text-center">¿Email o Ficha de Producto?</span>
              <CatButtons options={CATEGORIAS} colors={CAT_COLORS} onSelect={handleCategoria} />
            </div>
          )}

          {/* Subcategory question (email only) */}
          {showSubcatQuestion && (
            <div className="flex flex-col gap-6 pt-2">
              <span className="text-xl font-medium text-white">¿Automatización o Campaña?</span>
              <CatButtons options={SUBCATEGORIAS} colors={SUBCAT_COLORS} onSelect={handleSubcat} />
            </div>
          )}

          {/* Fields (email + subcategory selected) */}
          {showFields && (
            <div className="flex flex-col gap-5 pt-2">
              <EditableField
                label="Marca"
                value={marca}
                onChange={v => { setMarca(v); clearTimeout(saveTimeout.current); saveTimeout.current = setTimeout(() => patch({ marca: v }), 800); }}
                onSave={() => patch({ marca })}
                placeholder="Marca…"
              />
              <EditableField
                label="Asunto"
                value={asunto}
                onChange={v => { setAsunto(v); clearTimeout(saveTimeout.current); saveTimeout.current = setTimeout(() => patch({ asunto: v }), 800); }}
                onSave={() => patch({ asunto })}
                placeholder="Asunto del email…"
              />
              <EditableField
                label="Adelanto"
                value={adelanto}
                onChange={v => { setAdelanto(v); clearTimeout(saveTimeout.current); saveTimeout.current = setTimeout(() => patch({ adelanto: v }), 800); }}
                onSave={() => patch({ adelanto })}
                placeholder="Texto de adelanto…"
              />
              <EditableField
                label="Enviado el Día"
                value={enviadoEl}
                onChange={v => { setEnviadoEl(v); patch({ enviado_el: v || null }); }}
                onSave={() => patch({ enviado_el: enviadoEl || null })}
                type="date"
                placeholder="Selecciona una fecha"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
