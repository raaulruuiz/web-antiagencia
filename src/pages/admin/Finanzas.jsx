import { useState, useEffect, useCallback, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { supabase } from '@/lib/supabaseClient';
import { BACKEND_URL } from '@/lib/config';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CUENTAS = [
  { key: 'Ingresos',               label: 'Ingresos',            color: '#22c55e' },
  { key: 'Impuestos',              label: 'Impuestos',           color: '#f59e0b' },
  { key: 'Compensación del Dueño', label: 'Com. Dueño',          color: '#3b82f6' },
  { key: 'Gastos de Operación',    label: 'Gastos Operación',    color: '#8b5cf6' },
  { key: 'Ganancia',               label: 'Ganancias',           color: '#10b981' },
  { key: 'Freelancers y Material', label: 'Freelancers',         color: '#ec4899' },
];

const CATEGORIAS = [
  'Agencia','Banco','Causas Benéficas / Donaciones','Compra','Consultoría','Formación',
  'Freelancer','Gestoría','Hacienda','Herramientas / Software','Hoteles / Hostales',
  'Impuestos','Ingresar Dinero','Inversiones','Materiales','Ocio','Piso / Casa',
  'Publicidad','Sacar Dinero','Salud','Transporte y viajes','Traspaso Entre Cuentas',
];

const IVA_OPTS  = ['0%','10%','21%'];
const IRPF_OPTS = ['0%','7%','15%'];
const TIPOS     = ['Ingreso','Gasto'];

const S = {
  card:    { background: '#161616', border: '1px solid #27272a', borderRadius: 12, padding: 20 },
  input:   { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  select:  { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  label:   { color: '#71717a', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 },
  primary: { background: '#0067FD', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  ghost:   { background: 'transparent', color: '#71717a', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' },
  danger:  { background: 'transparent', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' },
};

function fmt(n) {
  if (n == null) return '—';
  const r = Math.round(n);
  const abs = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (r < 0 ? '-' : '') + abs + ' €';
}

function fmtY(v) {
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 10000) return `${(v / 1000).toFixed(0)}k`;
  if (abs >= 1000)  return `${(v / 1000).toFixed(1)}k`;
  return `${Math.round(v)}`;
}

function mesLabel(yyyymm) {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const [, m] = yyyymm.split('-');
  return meses[parseInt(m, 10) - 1];
}

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

const RANGOS_PRESET = () => {
  const h = new Date();
  const a = h.getFullYear();
  const m = h.getMonth();
  const q = Math.floor(m / 3);
  const hoy = toISO(h);
  const manana = toISO(addDays(h, 1));
  const ayer = toISO(addDays(h, -1));
  return [
    { label: 'Hoy',                  desde: hoy,                            hasta: manana },
    { label: 'Ayer',                 desde: ayer,                           hasta: hoy },
    { label: 'Últimos 7 días',       desde: toISO(addDays(h, -7)),          hasta: hoy },
    { label: 'Últimos 30 días',      desde: toISO(addDays(h, -30)),         hasta: hoy },
    { label: 'Mes hasta la fecha',   desde: toISO(new Date(a, m, 1)),       hasta: manana },
    { label: 'Mes anterior',         desde: toISO(new Date(a, m - 1, 1)),   hasta: toISO(new Date(a, m, 1)) },
    { label: 'Trimestre hasta la fecha', desde: toISO(new Date(a, q*3, 1)), hasta: manana },
    { label: 'Trimestre anterior',   desde: toISO(new Date(a, (q-1)*3, 1)), hasta: toISO(new Date(a, q*3, 1)) },
    { label: 'Año hasta la fecha',   desde: `${a}-01-01`,                   hasta: manana },
    { label: 'Año anterior',         desde: `${a - 1}-01-01`,               hasta: `${a}-01-01` },
    { label: 'Máximo',               desde: '2023-01-01',                   hasta: manana },
  ];
};

function fmtRango(desde, hasta) {
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const d = new Date(desde + 'T12:00:00');
  const h = addDays(new Date(hasta + 'T12:00:00'), -1);
  const fmtD = `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  const fmtH = `${h.getDate()} ${meses[h.getMonth()]} ${h.getFullYear()}`;
  return fmtD === fmtH ? fmtD : `${fmtD} – ${fmtH}`;
}

function periodoAnterior(desde, hasta) {
  const d = new Date(desde + 'T12:00:00');
  const h = new Date(hasta + 'T12:00:00');
  // Si desde cae en día 1, usar aritmética de meses para no perder días en años bisiestos
  if (d.getDate() === 1) {
    let shiftMonths;
    if (h.getDate() === 1) {
      // Periodo completo de meses (ej: "Año anterior", "Mes anterior", "Trimestre anterior")
      shiftMonths = (h.getFullYear() - d.getFullYear()) * 12 + (h.getMonth() - d.getMonth());
    } else {
      // "Hasta la fecha": el inicio es día 1 del mes/trimestre/año → determinar unidad
      const m = d.getMonth(); // 0=Ene
      shiftMonths = m === 0 ? 12 : [3, 6, 9].includes(m) ? 3 : 1;
    }
    if (shiftMonths > 0) {
      const nd = new Date(d.getFullYear(), d.getMonth() - shiftMonths, d.getDate());
      const nh = new Date(h.getFullYear(), h.getMonth() - shiftMonths, h.getDate());
      return { desde: toISO(nd), hasta: toISO(nh) };
    }
  }
  // Fallback: mismo número de días hacia atrás
  const diffDays = Math.round((h - d) / 86400000);
  return { desde: toISO(addDays(d, -diffDays)), hasta: desde };
}

const DIM_COLOR = { '#22c55e': '#166534', '#f87171': '#991b1b', '#f59e0b': '#92400e', '#8b5cf6': '#5b21b6' };

function Delta({ value, comp }) {
  if (comp == null || comp === 0 || value == null) return null;
  const pct = Math.round(((value - comp) / Math.abs(comp)) * 100);
  const up = pct >= 0;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: up ? '#22c55e' : '#f87171', marginLeft: 6, whiteSpace: 'nowrap' }}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

// ── Date Range Picker ───────────────────────────────────────────

const dpStyles = `
  .rdp { --rdp-accent-color: #0067FD; --rdp-background-color: #27272a; margin: 0; }
  .rdp-months { background: #0d0d0d; }
  .rdp-caption_label { color: white; font-size: 13px; }
  .rdp-head_cell { color: #71717a; font-size: 11px; font-weight: 600; }
  .rdp-day { color: #a1a1aa; font-size: 13px; border-radius: 6px; }
  .rdp-day:hover:not([disabled]):not(.rdp-day_selected) { background: #27272a; color: white; }
  .rdp-day_today { color: white; font-weight: 700; }
  .rdp-day_selected, .rdp-day_range_start, .rdp-day_range_end { background: #0067FD !important; color: white !important; border-radius: 6px !important; }
  .rdp-day_range_middle { background: #27272a !important; color: white !important; border-radius: 0 !important; }
  .rdp-nav_button { color: #71717a; }
  .rdp-nav_button:hover { background: #27272a; color: white; }
`;

// onApply(desde, hasta) o onApply(desde, hasta, comparar, desdeComp, hastaComp) si showComparar
function DateRangePicker({ desde, hasta, onApply, showComparar, comparar, desdeComp, hastaComp }) {
  const [open, setOpen]           = useState(false);
  const [selected, setSelected]   = useState(undefined);
  const [pendingFrom, setPendingFrom] = useState(null);
  const [compEditando, setCompEditando] = useState(false);
  const ref     = useRef(null);
  const presets = RANGOS_PRESET();

  // Draft state: valores pendientes de aplicar
  const [dDesde, setDDesde]           = useState(desde);
  const [dHasta, setDHasta]           = useState(hasta);
  const [dComparar, setDComparar]     = useState(!!comparar);
  const [dDesdeComp, setDDesdeComp]   = useState(desdeComp || '');
  const [dHastaComp, setDHastaComp]   = useState(hastaComp || '');

  // Click outside → cerrar sin aplicar
  useEffect(() => {
    if (!open) return;
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function openToggle() {
    if (!open) {
      // Reiniciar draft con valores comprometidos actuales
      setDDesde(desde); setDHasta(hasta);
      setDComparar(!!comparar);
      setDDesdeComp(desdeComp || ''); setDHastaComp(hastaComp || '');
      setCompEditando(false);
      const from = new Date(desde + 'T12:00:00');
      const to   = addDays(new Date(hasta + 'T12:00:00'), -1);
      setSelected(from <= to ? { from, to } : undefined);
      setPendingFrom(null);
    }
    setOpen(o => !o);
  }

  function selectPreset(p) {
    setDDesde(p.desde); setDHasta(p.hasta);
    const from = new Date(p.desde + 'T12:00:00');
    const to   = addDays(new Date(p.hasta + 'T12:00:00'), -1);
    setSelected(from <= to ? { from, to } : undefined);
    setPendingFrom(null);
    if (dComparar) {
      const pc = periodoAnterior(p.desde, p.hasta);
      setDDesdeComp(pc.desde); setDHastaComp(pc.hasta);
    }
  }

  function handleDayClick(day, modifiers) {
    if (modifiers.disabled || modifiers.outside) return;
    if (pendingFrom === null) {
      // Primer clic: marcar inicio
      setPendingFrom(day);
      setSelected({ from: day, to: undefined });
    } else {
      // Segundo clic: completar rango
      const [start, end] = pendingFrom <= day ? [pendingFrom, day] : [day, pendingFrom];
      setSelected({ from: start, to: end });
      setPendingFrom(null);
      const nd = toISO(start), nh = toISO(addDays(end, 1));
      setDDesde(nd); setDHasta(nh);
      if (dComparar) {
        const pc = periodoAnterior(nd, nh);
        setDDesdeComp(pc.desde); setDHastaComp(pc.hasta);
      }
    }
  }

  function handleToggleComparar(val) {
    setDComparar(val);
    if (val && !dDesdeComp) {
      const pc = periodoAnterior(dDesde, dHasta);
      setDDesdeComp(pc.desde); setDHastaComp(pc.hasta);
    }
  }

  function handleApply() {
    if (showComparar) onApply(dDesde, dHasta, dComparar, dDesdeComp, dHastaComp);
    else onApply(dDesde, dHasta);
    setOpen(false);
  }

  const draftPreset  = presets.find(p => p.desde === dDesde && p.hasta === dHasta);
  const activePreset = presets.find(p => p.desde === desde  && p.hasta === hasta);
  const hasChanges   = dDesde !== desde || dHasta !== hasta
    || (showComparar && (dComparar !== !!comparar || dDesdeComp !== (desdeComp||'') || dHastaComp !== (hastaComp||'')));

  return (
    <>
      <style>{dpStyles}</style>
      <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
        <button onClick={openToggle}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#27272a', border: '1px solid #3f3f46', borderRadius: 8, color: 'white', padding: '7px 12px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 14 }}>📅</span>
          <span>{activePreset ? `${activePreset.label} (${fmtRango(desde, hasta)})` : fmtRango(desde, hasta)}</span>
          <span style={{ color: '#71717a', fontSize: 10 }}>▾</span>
        </button>

        {open && (
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200, background: '#0d0d0d', border: '1px solid #27272a', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
            <div style={{ display: 'flex' }}>
              {/* Presets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 8px', borderRight: '1px solid #27272a', minWidth: 180 }}>
                {presets.map(p => {
                  const isActive = draftPreset?.label === p.label;
                  return (
                    <button key={p.label} onClick={() => selectPreset(p)}
                      style={{ background: isActive ? '#1a2a3f' : 'transparent', color: isActive ? '#60a5fa' : '#a1a1aa', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      {p.label}
                    </button>
                  );
                })}
              </div>
              {/* Calendar */}
              <div style={{ padding: '8px 4px' }}>
                <DayPicker mode="range" selected={selected} onSelect={() => {}}
                  onDayClick={handleDayClick}
                  numberOfMonths={2} locale={es} weekStartsOn={1} />
              </div>
            </div>

            {/* Comparar */}
            {showComparar && (
              <div style={{ borderTop: '1px solid #27272a', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#a1a1aa', fontSize: 12 }}>
                  <input type="checkbox" checked={dComparar} onChange={e => handleToggleComparar(e.target.checked)} style={{ accentColor: '#0067FD', cursor: 'pointer' }} />
                  Comparar con periodo anterior
                </label>
                {dComparar && dDesdeComp && dHastaComp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: '#52525b', fontSize: 11 }}>vs</span>
                    {compEditando ? (
                      <>
                        <input type="date" value={dDesdeComp} onChange={e => setDDesdeComp(e.target.value)}
                          style={{ background: '#27272a', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '3px 8px', fontSize: 12, outline: 'none' }} />
                        <span style={{ color: '#71717a', fontSize: 11 }}>–</span>
                        <input type="date" value={toISO(addDays(new Date(dHastaComp + 'T12:00:00'), -1))}
                          onChange={e => setDHastaComp(toISO(addDays(new Date(e.target.value + 'T12:00:00'), 1)))}
                          style={{ background: '#27272a', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '3px 8px', fontSize: 12, outline: 'none' }} />
                        <button onClick={() => setCompEditando(false)}
                          style={{ background: '#0067FD', border: 'none', borderRadius: 5, color: 'white', padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                      </>
                    ) : (
                      <>
                        <span style={{ color: '#a1a1aa', fontSize: 12 }}>{fmtRango(dDesdeComp, dHastaComp)}</span>
                        <button onClick={() => setCompEditando(true)}
                          style={{ background: 'none', border: '1px solid #3f3f46', borderRadius: 5, color: '#71717a', padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}>Editar</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer: Aplicar */}
            <div style={{ borderTop: '1px solid #27272a', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#52525b', fontSize: 11 }}>
                {draftPreset ? `${draftPreset.label} · ` : ''}{fmtRango(dDesde, dHasta)}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setOpen(false)}
                  style={{ background: 'none', border: '1px solid #3f3f46', borderRadius: 7, color: '#71717a', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleApply}
                  style={{ background: hasChanges ? '#0067FD' : '#27272a', border: 'none', borderRadius: 7, color: 'white', padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Formulario (nuevo y edición) ────────────────────────────────

function FormularioMovimiento({ inicial, onGuardado, onCancelar }) {
  const esEdicion = !!inicial?.id;
  const [form, setForm] = useState(inicial || {
    nombre: '', fecha: new Date().toISOString().slice(0,10),
    tipo: 'Ingreso', cuenta: 'Ingresos', cantidad: '',
    iva: '21%', irpf: '0%', categorias: [],
  });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function toggleCat(cat) { setForm(f => ({ ...f, categorias: f.categorias.includes(cat) ? f.categorias.filter(c => c !== cat) : [...f.categorias, cat] })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre || !form.cantidad) return;
    setLoading(true);
    try {
      const token = await getToken();
      const url = esEdicion
        ? `${BACKEND_URL}/admin/finanzas/movimiento/${inicial.id}`
        : `${BACKEND_URL}/admin/finanzas/movimiento`;
      const method = esEdicion ? 'PUT' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cantidad: parseFloat(form.cantidad) }),
      });
      if (!r.ok) throw new Error(await r.text());
      setOk(true);
      if (!esEdicion) setForm(f => ({ ...f, nombre: '', cantidad: '', categorias: [] }));
      setTimeout(() => { setOk(false); onGuardado(); }, 1200);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const cuentasPorTipo = form.tipo === 'Ingreso'
    ? ['Ingresos']
    : ['Gastos de Operación','Impuestos','Compensación del Dueño','Ganancia','Freelancers y Material'];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        <div>
          <label style={S.label}>Nombre *</label>
          <input style={S.input} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Factura cliente X" required />
        </div>
        <div>
          <label style={S.label}>Fecha *</label>
          <input style={S.input} type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required />
        </div>
        <div>
          <label style={S.label}>Tipo *</label>
          <select style={S.select} value={form.tipo} onChange={e => { set('tipo', e.target.value); set('cuenta', e.target.value === 'Ingreso' ? 'Ingresos' : 'Gastos de Operación'); }}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>Cuenta *</label>
          <select style={S.select} value={form.cuenta} onChange={e => set('cuenta', e.target.value)}>
            {cuentasPorTipo.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>Cantidad (€) *</label>
          <input style={S.input} type="number" step="0.01" min="0" value={form.cantidad} onChange={e => set('cantidad', e.target.value)} placeholder="0.00" required />
        </div>
        <div>
          <label style={S.label}>IVA</label>
          <select style={S.select} value={form.iva} onChange={e => set('iva', e.target.value)}>
            {IVA_OPTS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>IRPF</label>
          <select style={S.select} value={form.irpf} onChange={e => set('irpf', e.target.value)}>
            {IRPF_OPTS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={S.label}>Categorías</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIAS.map(c => {
            const sel = form.categorias.includes(c);
            return (
              <button key={c} type="button" onClick={() => toggleCat(c)}
                style={{ background: sel ? '#0067FD' : '#27272a', color: sel ? 'white' : '#a1a1aa', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" style={S.primary} disabled={loading}>
          {loading ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Guardar movimiento'}
        </button>
        {onCancelar && <button type="button" style={S.ghost} onClick={onCancelar}>Cancelar</button>}
        {ok && <span style={{ color: '#22c55e', fontSize: 14 }}>✓ Guardado en Notion</span>}
      </div>
    </form>
  );
}

// ── Modal de edición ────────────────────────────────────────────

function ModalEditar({ movimiento, onGuardado, onCerrar }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 12px', overflowY: 'auto' }}>
      <div style={{ ...S.card, width: '100%', maxWidth: 700, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: 0 }}>Editar movimiento</h2>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <FormularioMovimiento
          inicial={movimiento}
          onGuardado={() => { onGuardado(); onCerrar(); }}
          onCancelar={onCerrar}
        />
      </div>
    </div>
  );
}

// ── Fila de movimiento ──────────────────────────────────────────

function FilaMovimiento({ m, onEditar }) {
  const esIngreso = m.tipo === 'Ingreso';
  const [tooltip, setTooltip] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #27272a' }}>
      <span style={{ color: esIngreso ? '#22c55e' : '#f87171', fontSize: 16, flexShrink: 0 }}>{esIngreso ? '↑' : '↓'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ position: 'relative' }}
          onMouseEnter={() => setTooltip(true)}
          onMouseLeave={() => setTooltip(false)}>
          <p style={{ color: 'white', fontSize: 14, margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'default' }}>{m.nombre}</p>
          {tooltip && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, background: '#18181b', border: '1px solid #3f3f46', borderRadius: 6, padding: '5px 10px', fontSize: 13, color: 'white', whiteSpace: 'nowrap', zIndex: 50, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {m.nombre}
            </div>
          )}
        </div>
        <p style={{ color: '#52525b', fontSize: 12, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.fecha} · {m.cuenta}</p>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {m.categorias.slice(0,2).map(c => (
          <span key={c} style={{ background: '#27272a', color: '#a1a1aa', fontSize: 10, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>{c}</span>
        ))}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 70 }}>
        <p style={{ color: esIngreso ? '#22c55e' : '#f87171', fontSize: 14, fontWeight: 700, margin: 0 }}>{esIngreso ? '+' : '-'}{fmt(m.cantidad)}</p>
        {(m.iva !== '0%' || m.irpf !== '0%') && (
          <p style={{ color: '#52525b', fontSize: 11, margin: 0 }}>IVA {m.iva} · IRPF {m.irpf}</p>
        )}
      </div>
      <button onClick={() => onEditar(m)} style={{ background: 'none', border: '1px solid #3f3f46', borderRadius: 6, color: '#71717a', padding: '4px 10px', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
        Editar
      </button>
    </div>
  );
}

// ── Métricas ────────────────────────────────────────────────────

function MetricCard({ label, value, color, sub, compValue }) {
  const numericValue = compValue != null ? parseFloat(String(value).replace(/[^0-9,-]/g, '').replace(',', '.')) : null;
  const antColor = DIM_COLOR[color] || '#52525b';
  return (
    <div style={S.card}>
      <p style={{ color: '#71717a', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</p>
      <p style={{ color: color || 'white', fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{value}</p>
      {compValue != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
          <Delta value={numericValue} comp={compValue} />
          <span style={{ color: antColor, fontSize: 10, fontWeight: 500 }}>ant {fmt(compValue)}</span>
        </div>
      )}
      {sub && <p style={{ color: '#52525b', fontSize: 11, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function SaldoCard({ cuenta, compSaldo }) {
  const color = cuenta.saldo >= 0 ? '#22c55e' : '#f87171';
  const antColor = cuenta.saldo >= 0 ? '#166534' : '#991b1b';
  return (
    <div style={{ ...S.card, borderLeft: `3px solid ${cuenta.color}` }}>
      <p style={{ color: '#71717a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{cuenta.label}</p>
      <p style={{ color, fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{fmt(cuenta.saldo)}</p>
      {compSaldo != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
          <Delta value={cuenta.saldo} comp={compSaldo} />
          <span style={{ color: antColor, fontSize: 10, fontWeight: 500 }}>ant {fmt(compSaldo)}</span>
        </div>
      )}
    </div>
  );
}

// ── Vista fiscal ────────────────────────────────────────────────

function FiscalMetric({ label, value, color, comp }) {
  const pct = comp != null && comp !== 0 ? Math.round(((value - comp) / Math.abs(comp)) * 100) : null;
  const up = pct >= 0;
  return (
    <div>
      <p style={{ color: '#71717a', fontSize: 11, margin: '0 0 2px' }}>{label}</p>
      <p style={{ color, fontSize: 16, fontWeight: 700, margin: 0 }}>{fmt(value)}</p>
      {comp != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          {pct !== null && <span style={{ fontSize: 10, fontWeight: 600, color: up ? '#22c55e' : '#f87171' }}>{up ? '▲' : '▼'} {Math.abs(pct)}%</span>}
          <span style={{ color: '#52525b', fontSize: 10 }}>ant {fmt(comp)}</span>
        </div>
      )}
    </div>
  );
}

function TabFiscal() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [comparar, setComparar] = useState(false);
  const [anioComp, setAnioComp] = useState(null);
  const [datosComp, setDatosComp] = useState(null);
  const [loadingComp, setLoadingComp] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/fiscal?anio=${anio}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (!r.ok) { setErr(data.error || `Error ${r.status}`); return; }
      setDatos(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [anio]);

  const cargarComp = useCallback(async () => {
    if (!comparar || !anioComp) { setDatosComp(null); return; }
    setLoadingComp(true);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/fiscal?anio=${anioComp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (r.ok) setDatosComp(data);
    } catch { /* silencioso */ } finally {
      setLoadingComp(false);
    }
  }, [comparar, anioComp]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { cargarComp(); }, [cargarComp]);

  const anios = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  if (loading) return <p style={{ color: '#52525b' }}>Cargando…</p>;
  if (err)    return <p style={{ color: '#f87171', fontSize: 13, background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px' }}>Error: {err}</p>;
  if (!datos)  return null;

  const { trimestres, anual } = datos;
  const ca = datosComp?.anual;

  return (
    <div>
      {/* Selector año + comparar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {anios.map(a => (
          <button key={a} onClick={() => setAnio(a)}
            style={{ background: anio === a ? '#0067FD' : '#27272a', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
            {a}
          </button>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#a1a1aa', fontSize: 12, marginLeft: 8 }}>
          <input type="checkbox" checked={comparar} onChange={e => { setComparar(e.target.checked); if (!e.target.checked) { setDatosComp(null); setAnioComp(null); } }} style={{ accentColor: '#0067FD', cursor: 'pointer' }} />
          Comparar con
        </label>
        {comparar && anios.filter(a => a !== anio).map(a => (
          <button key={a} onClick={() => setAnioComp(a)}
            style={{ background: anioComp === a ? '#27272a' : 'transparent', color: anioComp === a ? 'white' : '#71717a', border: '1px solid #3f3f46', borderRadius: 8, padding: '5px 12px', fontSize: 13, cursor: 'pointer' }}>
            {a}
          </button>
        ))}
        {loadingComp && <span style={{ color: '#52525b', fontSize: 12 }}>cargando…</span>}
      </div>

      {/* Resumen anual */}
      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Resumen anual {anio}{datosComp ? ` vs ${anioComp}` : ''}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 24 }}>
        <MetricCard label="Facturación"     value={fmt(anual.facturacion)}    color="#22c55e" compValue={ca ? ca.facturacion : null} />
        <MetricCard label="Gastos totales"  value={fmt(anual.totalGastos)}    color="#f87171" compValue={ca ? ca.totalGastos : null} />
        <MetricCard label="IVA repercutido" value={fmt(anual.ivaRepercutido)} color="#f59e0b" compValue={ca ? ca.ivaRepercutido : null} />
        <MetricCard label="IVA soportado"   value={fmt(anual.ivaSoportado)}   color="#f59e0b" compValue={ca ? ca.ivaSoportado : null} />
        <MetricCard label="IVA a pagar"     value={fmt(anual.ivaAPagar)}      color={anual.ivaAPagar > 0 ? '#f59e0b' : '#22c55e'} compValue={ca ? ca.ivaAPagar : null} />
        <MetricCard label="IRPF retenido"   value={fmt(anual.irpfRetenido)}   color="#8b5cf6" compValue={ca ? ca.irpfRetenido : null} />
      </div>

      {/* Detalle por trimestre */}
      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Por trimestre</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {trimestres.map((t, i) => {
          const tc = datosComp?.trimestres?.[i];
          return (
            <div key={i} style={S.card}>
              <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>
                {t.label}{tc ? <span style={{ color: '#52525b', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>vs {anioComp}</span> : null}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <FiscalMetric label="Facturación"      value={t.facturacion}    color="#22c55e" comp={tc ? tc.facturacion : null} />
                <FiscalMetric label="IVA repercutido"  value={t.ivaRepercutido} color="#f59e0b" comp={tc ? tc.ivaRepercutido : null} />
                <FiscalMetric label="IVA soportado"    value={t.ivaSoportado}   color="#f59e0b" comp={tc ? tc.ivaSoportado : null} />
                <FiscalMetric label="IVA a pagar (303)" value={t.ivaAPagar}    color={t.ivaAPagar > 0 ? '#f59e0b' : '#22c55e'} comp={tc ? tc.ivaAPagar : null} />
                <FiscalMetric label="IRPF retenido (130)" value={t.irpfRetenido} color="#8b5cf6" comp={tc ? tc.irpfRetenido : null} />
              </div>

              {/* IRPF por cliente */}
              {Object.keys(t.irpfPorCliente).length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #27272a' }}>
                  <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>IRPF retenido por cliente</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(t.irpfPorCliente).sort(([,a],[,b]) => b - a).map(([nombre, irpf]) => (
                      <div key={nombre} style={{ background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, padding: '6px 10px' }}>
                        <p style={{ color: '#a1a1aa', fontSize: 11, margin: 0 }}>{nombre}</p>
                        <p style={{ color: '#8b5cf6', fontSize: 13, fontWeight: 700, margin: 0 }}>{fmt(irpf)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────

function lsGet(key, fallback) { try { const v = localStorage.getItem(key); return v != null ? JSON.parse(v) : fallback; } catch { return fallback; } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

export default function Finanzas() {
  const initAnio = RANGOS_PRESET().find(p => p.label === 'Año hasta la fecha');
  const [desde, setDesde] = useState(() => lsGet('fin_desde', initAnio.desde));
  const [hasta, setHasta] = useState(() => lsGet('fin_hasta', initAnio.hasta));
  const [tab, setTab]     = useState(() => lsGet('fin_tab', 'dashboard'));
  const [comparar, setComparar]   = useState(() => lsGet('fin_comparar', false));
  const [desdeComp, setDesdeComp] = useState(() => lsGet('fin_desdeComp', ''));
  const [hastaComp, setHastaComp] = useState(() => lsGet('fin_hastaComp', ''));
  const [dashboard, setDashboard] = useState(null);
  const [viewCat, setViewCat] = useState('total');
  const [viewEvol, setViewEvol] = useState('barras');
  const [viewCuenta, setViewCuenta] = useState('barras');
  const [movimientos, setMovimientos] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loadingDash, setLoadingDash] = useState(true);
  const [loadingMovs, setLoadingMovs] = useState(true);
  const [errDash, setErrDash] = useState(null);
  const [errMovs, setErrMovs] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCuenta, setFiltroCuenta] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [pagMovs, setPagMovs] = useState(1);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [movEditando, setMovEditando] = useState(null);
  const [dashComp, setDashComp] = useState(null);
  const [loadingComp, setLoadingComp] = useState(false);
  const [errComp, setErrComp] = useState(null);
  const [sinMovimientosMes, setSinMovimientosMes] = useState(false);

  // Persistir en localStorage cuando cambian
  useEffect(() => { lsSet('fin_desde', desde); }, [desde]);
  useEffect(() => { lsSet('fin_hasta', hasta); }, [hasta]);
  useEffect(() => { lsSet('fin_tab', tab); }, [tab]);
  useEffect(() => { lsSet('fin_comparar', comparar); }, [comparar]);
  useEffect(() => { lsSet('fin_desdeComp', desdeComp); }, [desdeComp]);
  useEffect(() => { lsSet('fin_hastaComp', hastaComp); }, [hastaComp]);

  function handleApplyDashboard(d, h, doComp, dComp, hComp) {
    setDesde(d); setHasta(h);
    setComparar(doComp);
    if (doComp) { setDesdeComp(dComp); setHastaComp(hComp); }
    else { setDashComp(null); }
  }

  function handleApplyMovimientos(d, h) {
    setDesde(d); setHasta(h); setPagMovs(1);
  }

  const cargarDashboard = useCallback(async () => {
    setLoadingDash(true);
    setErrDash(null);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/dashboard?desde=${desde}&hasta=${hasta}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (!r.ok) { setErrDash(data.error || `Error ${r.status}`); return; }
      setDashboard(data);
    } catch (e) {
      setErrDash(e.message);
    } finally {
      setLoadingDash(false);
    }
  }, [desde, hasta]);

  const cargarDashboardComp = useCallback(async () => {
    if (!comparar || !desdeComp || !hastaComp) return;
    setLoadingComp(true);
    setErrComp(null);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/dashboard?desde=${desdeComp}&hasta=${hastaComp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (!r.ok) { setErrComp(data.error || `Error ${r.status}`); return; }
      setDashComp(data);
    } catch (e) {
      setErrComp(e.message);
    } finally {
      setLoadingComp(false);
    }
  }, [comparar, desdeComp, hastaComp]);

  const cargarMovimientos = useCallback(async (page = 1, todos = false) => {
    setLoadingMovs(true);
    setErrMovs(null);
    try {
      const token = await getToken();
      const params = new URLSearchParams({ desde, hasta, page });
      if (filtroTipo) params.set('tipo', filtroTipo);
      if (filtroCuenta) params.set('cuenta', filtroCuenta);
      if (filtroCat) params.set('categoria', filtroCat);
      if (todos) params.set('todos', '1');
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (!r.ok) { setErrMovs(data.error || `Error ${r.status}`); return; }
      setMovimientos(data);
    } catch (e) {
      setErrMovs(e.message);
    } finally {
      setLoadingMovs(false);
    }
  }, [desde, hasta, filtroTipo, filtroCuenta, filtroCat]);

  useEffect(() => { cargarDashboard(); }, [cargarDashboard]);

  useEffect(() => {
    async function checkMovimientosMesActual() {
      try {
        const token = await getToken();
        const hoy = new Date();
        const desdeActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
        const nextMonth = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
        const hastaActual = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
        const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos?desde=${desdeActual}&hasta=${hastaActual}&page=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json();
        setSinMovimientosMes(r.ok && data.total === 0);
      } catch { /* silencioso */ }
    }
    checkMovimientosMesActual();
  }, [dashboard]);
  useEffect(() => { if (tab === 'movimientos') cargarMovimientos(pagMovs, mostrarTodos); }, [tab, pagMovs, mostrarTodos, cargarMovimientos]);
  useEffect(() => {
    if (comparar && desdeComp && hastaComp) cargarDashboardComp();
    else setDashComp(null);
  }, [cargarDashboardComp, comparar, desdeComp, hastaComp]);

  const tabStyle = (t) => ({
    background: tab === t ? '#27272a' : 'transparent',
    color: tab === t ? 'white' : '#71717a',
    border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 14, cursor: 'pointer', fontWeight: tab === t ? 600 : 400,
  });

  const d = dashboard;

  return (
    <div style={{ padding: '16px', maxWidth: 1140, fontFamily: 'inherit' }}>
      {/* Modal edición */}
      {movEditando && (
        <ModalEditar
          movimiento={movEditando}
          onGuardado={() => { cargarMovimientos(pagMovs); cargarDashboard(); }}
          onCerrar={() => setMovEditando(null)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Finanzas</h1>
        <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Ingresos, gastos, saldos y fiscalidad</p>
      </div>

      {/* Alerta trackeo */}
      {sinMovimientosMes && (
        <div style={{ background: '#1c1007', border: '1px solid #92400e', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ color: '#fbbf24', fontSize: 14, fontWeight: 600 }}>Tienes que trackear, no lo olvides</span>
          <span style={{ color: '#78716c', fontSize: 13, marginLeft: 4 }}>— este mes todavía no hay ningún movimiento registrado.</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={tabStyle('dashboard')}   onClick={() => setTab('dashboard')}>Dashboard</button>
        <button style={tabStyle('movimientos')} onClick={() => setTab('movimientos')}>Movimientos</button>
        <button style={tabStyle('fiscal')}      onClick={() => setTab('fiscal')}>Fiscal</button>
        <button onClick={() => setTab('nuevo')}
          style={{ background: '#0067FD', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
          + Nuevo
        </button>
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <>
          <div style={{ marginBottom: comparar && desdeComp ? 8 : 20 }}>
            <DateRangePicker
              desde={desde} hasta={hasta} onApply={handleApplyDashboard}
              showComparar comparar={comparar} desdeComp={desdeComp} hastaComp={hastaComp}
            />
          </div>
          {comparar && desdeComp && hastaComp && (
            <p style={{ color: '#52525b', fontSize: 12, marginBottom: 16 }}>
              Comparando con <span style={{ color: '#71717a', fontWeight: 500 }}>{fmtRango(desdeComp, hastaComp)}</span>
              {loadingComp && <span style={{ marginLeft: 8 }}>·&nbsp;cargando…</span>}
            </p>
          )}

          {loadingDash ? <p style={{ color: '#52525b' }}>Cargando…</p> : errDash ? (
            <p style={{ color: '#f87171', fontSize: 13, background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px' }}>Error: {errDash}</p>
          ) : d?.resumen ? (
            <>
              {(() => { const dc = dashComp?.resumen; return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, marginBottom: 20 }}>
                <MetricCard label="Ingresos"      value={fmt(d.resumen.totalIngresos)}  color="#22c55e" compValue={dc ? dc.totalIngresos : null} />
                <MetricCard label="Gastos"        value={fmt(d.resumen.totalGastos)}    color="#f87171" compValue={dc ? dc.totalGastos : null} />
                <MetricCard label="Beneficio"     value={fmt(d.resumen.beneficioNeto)}  color={d.resumen.beneficioNeto >= 0 ? '#22c55e' : '#f87171'} compValue={dc ? dc.beneficioNeto : null} />
                <MetricCard label="IVA a pagar"   value={fmt(d.resumen.ivaAPagar)}      color="#f59e0b" compValue={dc ? dc.ivaAPagar : null} />
                <MetricCard label="IRPF retenido" value={fmt(d.resumen.irpfRetenido)}   color="#8b5cf6" compValue={dc ? dc.irpfRetenido : null} />
              </div>
              ); })()}

              <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Saldo por cuenta</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: 10, marginBottom: 24 }}>
                {CUENTAS.map(c => <SaldoCard key={c.key} cuenta={{ ...c, saldo: d.saldos[c.key] ?? 0 }} compSaldo={dashComp ? (dashComp.saldos[c.key] ?? 0) : null} />)}
              </div>

              {d.evolucionMensual.length > 1 && (() => {
                const gran = d.granularidad || 'mes';
                const MESES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                const multiAnio = new Set(d.evolucionMensual.map(e => e.mes.slice(0, 4))).size > 1;
                const tituloGran = '';
                const barW = gran === 'dia' ? (dashComp ? 10 : 20) : gran === 'anio' ? (dashComp ? 18 : 36) : (dashComp ? 9 : 18);

                function fmtEjeLabel(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') {
                    const [anio, mes] = key.split('-');
                    const label = mesLabel(key);
                    return multiAnio && mes === '01' ? `${label} '${anio.slice(2)}` : label;
                  }
                  // dia: yyyy-mm-dd
                  const dt = new Date(key + 'T12:00:00');
                  const d2 = dt.getDate();
                  const mo = MESES_CORTO[dt.getMonth()];
                  return multiAnio ? `${d2} ${mo} '${String(dt.getFullYear()).slice(2)}` : `${d2} ${mo}`;
                }

                function fmtTooltipLabel(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') return `${mesLabel(key)} ${key.slice(0, 4)}`;
                  const dt = new Date(key + 'T12:00:00');
                  return `${dt.getDate()} ${MESES_CORTO[dt.getMonth()]} ${dt.getFullYear()}`;
                }

                const evolData = d.evolucionMensual.map((e, i) => {
                  const c = dashComp?.evolucionMensual?.[i];
                  return { mes: e.mes, ingresos: e.ingresos, gastos: e.gastos, beneficio: e.beneficio, ...(c ? { ingresosAnt: c.ingresos, gastosAnt: c.gastos, beneficioAnt: c.beneficio } : {}) };
                });
                const evolTooltip = ({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const curr = payload.filter(p => !String(p.dataKey).endsWith('Ant'));
                  const ant  = payload.filter(p =>  String(p.dataKey).endsWith('Ant'));
                  return (
                    <div style={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                      <p style={{ color: '#71717a', margin: '0 0 6px', fontWeight: 600 }}>{fmtTooltipLabel(label)}</p>
                      {curr.map(e => <p key={e.dataKey} style={{ color: e.color || e.fill || e.stroke, margin: '2px 0' }}>{e.name}: {fmt(e.value)}</p>)}
                      {ant.length > 0 && <><div style={{ borderTop: '1px solid #27272a', margin: '5px 0' }} />{ant.map(e => <p key={e.dataKey} style={{ color: e.color || e.fill || e.stroke, margin: '2px 0' }}>{e.name}: {fmt(e.value)}</p>)}</>}
                    </div>
                  );
                };
                const evolAxes = (
                  <>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" tickFormatter={fmtEjeLabel} />
                    <YAxis tickFormatter={fmtY} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={evolTooltip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>} />
                  </>
                );
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Evolución</h2>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[['barras','Barras'],['lineas','Líneas']].map(([v, label]) => (
                          <button key={v} onClick={() => setViewEvol(v)} style={{ background: viewEvol === v ? '#27272a' : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: viewEvol === v ? '#fff' : '#71717a', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ ...S.card, marginBottom: 24, padding: '16px 8px' }}>
                      <ResponsiveContainer width="100%" height={200}>
                        {viewEvol === 'barras' ? (
                          <BarChart barSize={barW} data={evolData}>
                            {evolAxes}
                            <Bar dataKey="ingresos"    name="Ingresos"      fill="#22c55e" radius={[4,4,0,0]} />
                            <Bar dataKey="gastos"      name="Gastos"        fill="#f87171" radius={[4,4,0,0]} />
                            <Bar dataKey="beneficio"   name="Beneficio"     fill="#60a5fa" radius={[4,4,0,0]} />
                            {dashComp && <Bar dataKey="ingresosAnt"  name="Ingresos ant."  fill="#166534" radius={[3,3,0,0]} />}
                            {dashComp && <Bar dataKey="gastosAnt"    name="Gastos ant."    fill="#991b1b" radius={[3,3,0,0]} />}
                            {dashComp && <Bar dataKey="beneficioAnt" name="Beneficio ant." fill="#1d4ed8" radius={[3,3,0,0]} />}
                          </BarChart>
                        ) : (
                          <LineChart data={evolData}>
                            {evolAxes}
                            <Line dataKey="ingresos"    name="Ingresos"      stroke="#22c55e" strokeWidth={2} dot={false} connectNulls />
                            <Line dataKey="gastos"      name="Gastos"        stroke="#f87171" strokeWidth={2} dot={false} connectNulls />
                            <Line dataKey="beneficio"   name="Beneficio"     stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls />
                            {dashComp && <Line dataKey="ingresosAnt"  name="Ingresos ant."  stroke="#166534" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls />}
                            {dashComp && <Line dataKey="gastosAnt"    name="Gastos ant."    stroke="#991b1b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls />}
                            {dashComp && <Line dataKey="beneficioAnt" name="Beneficio ant." stroke="#1d4ed8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls />}
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </>
                );
              })()}

              {Object.keys(d.gastosPorCategoria).length > 0 && (() => {
                const ROJOS = ['#ef4444','#fca5a5','#dc2626','#fda4af','#b91c1c','#fb7185','#991b1b','#f43f5e','#7f1d1d','#e11d48','#ff6b6b','#be123c','#ff8a80','#9f1239'];
                const gran = d.granularidad || 'mes';
                const MESES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                const multiAnio = new Set((d.evolucionPorCategoria?.datos || []).map(e => e.periodo.slice(0, 4))).size > 1;

                function fmtEjeCat(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') {
                    const [anio, mes] = key.split('-');
                    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                    const label = meses[parseInt(mes, 10) - 1];
                    return multiAnio && mes === '01' ? `${label} '${anio.slice(2)}` : label;
                  }
                  const dt = new Date(key + 'T12:00:00');
                  const mo = MESES_CORTO[dt.getMonth()];
                  return multiAnio ? `${dt.getDate()} ${mo} '${String(dt.getFullYear()).slice(2)}` : `${dt.getDate()} ${mo}`;
                }

                function fmtTipCat(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') {
                    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                    return `${meses[parseInt(key.split('-')[1], 10) - 1]} ${key.slice(0, 4)}`;
                  }
                  const dt = new Date(key + 'T12:00:00');
                  return `${dt.getDate()} ${MESES_CORTO[dt.getMonth()]} ${dt.getFullYear()}`;
                }

                const todasCats = d.todasCategorias || Object.keys(d.gastosPorCategoria).sort((a,b) => (d.gastosPorCategoria[b]||0) - (d.gastosPorCategoria[a]||0));
                const entries = todasCats.map(cat => [cat, d.gastosPorCategoria[cat] || 0]);
                const compCats = dashComp?.gastosPorCategoria || {};
                const allVals = [...entries.map(([,v]) => v), ...entries.map(([cat]) => compCats[cat] || 0)].filter(v => v > 0);
                const max = Math.max(...allVals, 1);
                const cats = d.evolucionPorCategoria?.categorias || [];
                const datosEvo = d.evolucionPorCategoria?.datos || [];

                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Gastos por categoría</h2>
                      {datosEvo.length > 1 && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[['total','Total'],['evolucion','Evolución']].map(([v, label]) => (
                            <button key={v} onClick={() => setViewCat(v)} style={{
                              background: viewCat === v ? '#27272a' : 'transparent',
                              border: '1px solid #27272a', borderRadius: 6,
                              color: viewCat === v ? '#fff' : '#71717a',
                              fontSize: 11, padding: '3px 10px', cursor: 'pointer',
                            }}>{label}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {viewCat === 'total' ? (
                      <div style={S.card}>
                        {entries.map(([cat, total]) => {
                          const pct = Math.round((total / max) * 100);
                          const compTotal = compCats[cat] || 0;
                          const compPct = dashComp ? Math.round((compTotal / max) * 100) : 0;
                          return (
                            <div key={cat} style={{ marginBottom: dashComp ? 14 : 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: dashComp ? 3 : 0 }}>
                                <span style={{ color: '#a1a1aa', fontSize: 12, minWidth: 140, flexShrink: 0 }}>{cat}</span>
                                <div style={{ flex: 1, background: '#27272a', borderRadius: 4, height: 6 }}>
                                  <div style={{ width: `${pct}%`, background: '#f87171', borderRadius: 4, height: 6 }} />
                                </div>
                                <span style={{ color: '#f87171', fontSize: 12, minWidth: 60, textAlign: 'right', flexShrink: 0 }}>{fmt(total)}</span>
                              </div>
                              {dashComp && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ minWidth: 140, flexShrink: 0 }} />
                                  <div style={{ flex: 1, background: '#1f1f1f', borderRadius: 4, height: 4 }}>
                                    <div style={{ width: `${compPct}%`, background: '#991b1b', borderRadius: 4, height: 4 }} />
                                  </div>
                                  <span style={{ color: '#991b1b', fontSize: 11, minWidth: 60, textAlign: 'right', flexShrink: 0 }}>{fmt(compTotal)}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ ...S.card, padding: '16px 8px' }}>
                        <ResponsiveContainer width="100%" height={320}>
                          <LineChart data={datosEvo.map((e, i) => {
                            const c = dashComp?.evolucionPorCategoria?.datos?.[i];
                            return { ...e, ...(c ? cats.reduce((acc, cat) => ({ ...acc, [cat + 'Ant']: c[cat] || 0 }), {}) : {}) };
                          })}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="periodo" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}
                              interval="preserveStartEnd" tickFormatter={fmtEjeCat} />
                            <YAxis tickFormatter={fmtY} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip
                              position={{ y: 10 }}
                              wrapperStyle={{ zIndex: 100 }}
                              content={({ active, label }) => {
                                if (!active) return null;
                                const idx = datosEvo.findIndex(e => e.periodo === label);
                                const punto = datosEvo[idx];
                                const compPunto = dashComp?.evolucionPorCategoria?.datos?.[idx];
                                return (
                                  <div style={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
                                    <p style={{ color: '#71717a', margin: '0 0 8px', fontWeight: 600, fontSize: 12 }}>{fmtTipCat(label)}</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                                      {cats.map((cat, i) => (
                                        <div key={cat} style={{ marginBottom: dashComp ? 6 : 3 }}>
                                          <p style={{ color: ROJOS[i % ROJOS.length], margin: 0 }}>{cat}: {fmt(punto?.[cat] || 0)}</p>
                                          {dashComp && <p style={{ color: ROJOS[i % ROJOS.length], opacity: 0.5, margin: '1px 0 0 6px' }}>ant.: {fmt(compPunto?.[cat] || 0)}</p>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value, entry) => !String(value).endsWith(' ant.') ? <span style={{ color: entry.color }}>{value}</span> : null} />
                            {cats.map((cat, i) => (
                              <Line key={cat} type="monotone" dataKey={cat} name={cat}
                                stroke={ROJOS[i % ROJOS.length]} strokeWidth={2} dot={false} connectNulls />
                            ))}
                            {dashComp && cats.map((cat, i) => (
                              <Line key={cat + 'Ant'} type="monotone" dataKey={cat + 'Ant'} name={cat + ' ant.'}
                                stroke={ROJOS[i % ROJOS.length]} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} dot={false} connectNulls legendType="none" />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                );
              })()}

              {d.evolucionPorCuenta?.datos?.length > 1 && (() => {
                const CUENTA_COLORS = {
                  'Ingresos': '#22c55e', 'Impuestos': '#f59e0b',
                  'Compensación del Dueño': '#3b82f6', 'Gastos de Operación': '#8b5cf6',
                  'Ganancia': '#10b981', 'Freelancers y Material': '#ec4899',
                };
                const CUENTA_LABELS = {
                  'Ingresos': 'Ingresos', 'Impuestos': 'Impuestos',
                  'Compensación del Dueño': 'Comp. Dueño', 'Gastos de Operación': 'Gastos Op.',
                  'Ganancia': 'Ganancias', 'Freelancers y Material': 'Freelancers',
                };
                const gran = d.granularidad || 'mes';
                const MESES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                const cuentas = d.evolucionPorCuenta.cuentas;
                const multiAnio = new Set(d.evolucionPorCuenta.datos.map(e => e.periodo.slice(0, 4))).size > 1;
                const barW = gran === 'dia' ? (dashComp ? 6 : 12) : gran === 'anio' ? (dashComp ? 12 : 24) : (dashComp ? 6 : 12);

                function fmtEjeCta(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') {
                    const [anio, mes] = key.split('-');
                    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                    const label = meses[parseInt(mes, 10) - 1];
                    return multiAnio && mes === '01' ? `${label} '${anio.slice(2)}` : label;
                  }
                  const dt = new Date(key + 'T12:00:00');
                  const mo = MESES_CORTO[dt.getMonth()];
                  return multiAnio ? `${dt.getDate()} ${mo} '${String(dt.getFullYear()).slice(2)}` : `${dt.getDate()} ${mo}`;
                }

                function fmtTipCta(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') {
                    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                    return `${meses[parseInt(key.split('-')[1], 10) - 1]} ${key.slice(0, 4)}`;
                  }
                  const dt = new Date(key + 'T12:00:00');
                  return `${dt.getDate()} ${MESES_CORTO[dt.getMonth()]} ${dt.getFullYear()}`;
                }

                const ctaData = d.evolucionPorCuenta.datos.map((e, i) => {
                  const c = dashComp?.evolucionPorCuenta?.datos?.[i];
                  return { ...e, ...(c ? cuentas.reduce((acc, k) => ({ ...acc, [k + 'Ant']: c[k] || 0 }), {}) : {}) };
                });

                const ctaTooltip = ({ active, label }) => {
                  if (!active) return null;
                  const idx = ctaData.findIndex(e => e.periodo === label);
                  const punto = ctaData[idx];
                  const compPunto = dashComp?.evolucionPorCuenta?.datos?.[idx];
                  return (
                    <div style={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                      <p style={{ color: '#71717a', margin: '0 0 6px', fontWeight: 600 }}>{fmtTipCta(label)}</p>
                      {cuentas.map(c => (
                        <div key={c} style={{ marginBottom: dashComp ? 4 : 2 }}>
                          <p style={{ color: CUENTA_COLORS[c], margin: 0 }}>{CUENTA_LABELS[c]}: {fmt(punto?.[c] || 0)}</p>
                          {dashComp && <p style={{ color: CUENTA_COLORS[c], opacity: 0.5, margin: '1px 0 0 8px', fontSize: 11 }}>ant.: {fmt(compPunto?.[c] || 0)}</p>}
                        </div>
                      ))}
                    </div>
                  );
                };

                const ctaAxes = (
                  <>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="periodo" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" tickFormatter={fmtEjeCta} />
                    <YAxis tickFormatter={fmtY} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={ctaTooltip} />
                    <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value, entry) => !String(value).endsWith(' ant.') ? <span style={{ color: entry.color }}>{value}</span> : null} />
                  </>
                );

                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 24 }}>
                      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Evolución por cuenta</h2>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[['barras','Barras'],['lineas','Líneas']].map(([v, label]) => (
                          <button key={v} onClick={() => setViewCuenta(v)} style={{ background: viewCuenta === v ? '#27272a' : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: viewCuenta === v ? '#fff' : '#71717a', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ ...S.card, marginBottom: 24, padding: '16px 8px' }}>
                      <ResponsiveContainer width="100%" height={220}>
                        {viewCuenta === 'barras' ? (
                          <BarChart barSize={barW} data={ctaData}>
                            {ctaAxes}
                            {cuentas.map(c => <Bar key={c} dataKey={c} name={CUENTA_LABELS[c]} fill={CUENTA_COLORS[c]} radius={[4,4,0,0]} />)}
                            {dashComp && cuentas.map(c => <Bar key={c+'Ant'} dataKey={c+'Ant'} name={CUENTA_LABELS[c]+' ant.'} fill={CUENTA_COLORS[c]} fillOpacity={0.4} radius={[3,3,0,0]} legendType="none" />)}
                          </BarChart>
                        ) : (
                          <LineChart data={ctaData}>
                            {ctaAxes}
                            {cuentas.map(c => <Line key={c} type="monotone" dataKey={c} name={CUENTA_LABELS[c]} stroke={CUENTA_COLORS[c]} strokeWidth={2} dot={false} connectNulls />)}
                            {dashComp && cuentas.map(c => <Line key={c+'Ant'} type="monotone" dataKey={c+'Ant'} name={CUENTA_LABELS[c]+' ant.'} stroke={CUENTA_COLORS[c]} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} dot={false} connectNulls legendType="none" />)}
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </>
                );
              })()}
            </>
          ) : null}
        </>
      )}

      {/* ── MOVIMIENTOS ── */}
      {tab === 'movimientos' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <DateRangePicker desde={desde} hasta={hasta} onApply={handleApplyMovimientos} />
              <button style={S.ghost} onClick={() => cargarMovimientos(pagMovs, mostrarTodos)}>↺</button>
            </div>
            <select style={{ ...S.select, width: 'auto', minWidth: 120 }} value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPagMovs(1); }}>
              <option value="">Todos los tipos</option>
              <option value="Ingreso">Ingresos</option>
              <option value="Gasto">Gastos</option>
            </select>
            <select style={{ ...S.select, width: 'auto', minWidth: 160 }} value={filtroCuenta} onChange={e => { setFiltroCuenta(e.target.value); setPagMovs(1); }}>
              <option value="">Todas las cuentas</option>
              {CUENTAS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <select style={{ ...S.select, width: 'auto', minWidth: 160 }} value={filtroCat} onChange={e => { setFiltroCat(e.target.value); setPagMovs(1); }}>
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={S.card}>
            {loadingMovs ? (
              <p style={{ color: '#52525b', textAlign: 'center', padding: 24 }}>Cargando…</p>
            ) : errMovs ? (
              <p style={{ color: '#f87171', fontSize: 13, padding: 16 }}>Error: {errMovs}</p>
            ) : movimientos.items.length === 0 ? (
              <p style={{ color: '#52525b', textAlign: 'center', padding: 24 }}>Sin movimientos para este periodo</p>
            ) : (() => {
              const normales  = movimientos.items.filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
              const traspasos = movimientos.items.filter(m =>  (m.categorias || []).includes('Traspaso Entre Cuentas'));
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: traspasos.length > 0 ? '1fr 1fr' : '1fr', gap: 24 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Movimientos ({normales.length})</p>
                      {normales.map(m => <FilaMovimiento key={m.id} m={m} onEditar={setMovEditando} />)}
                    </div>
                    {traspasos.length > 0 && (
                      <div style={{ minWidth: 0, borderLeft: '1px solid #27272a', paddingLeft: 24 }}>
                        <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Traspasos ({traspasos.length})</p>
                        {traspasos.map(m => <FilaMovimiento key={m.id} m={m} onEditar={setMovEditando} />)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    {!mostrarTodos && movimientos.pages > 1 && (
                      <>
                        <button style={S.ghost} disabled={pagMovs <= 1} onClick={() => setPagMovs(p => p - 1)}>← Anterior</button>
                        <span style={{ color: '#71717a', fontSize: 13, padding: '8px 0' }}>{pagMovs} / {movimientos.pages}</span>
                        <button style={S.ghost} disabled={pagMovs >= movimientos.pages} onClick={() => setPagMovs(p => p + 1)}>Siguiente →</button>
                      </>
                    )}
                    {movimientos.total > 50 && (
                      <button style={S.ghost} onClick={() => { setMostrarTodos(t => !t); setPagMovs(1); }}>
                        {mostrarTodos ? `Paginar (50/pág)` : `Mostrar todos (${movimientos.total})`}
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* ── FISCAL ── */}
      {tab === 'fiscal' && <TabFiscal />}

      {/* ── NUEVO ── */}
      {tab === 'nuevo' && (
        <div style={S.card}>
          <h2 style={{ color: 'white', fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 20 }}>Nuevo movimiento</h2>
          <FormularioMovimiento onGuardado={() => { setTab('movimientos'); cargarMovimientos(1); cargarDashboard(); }} />
        </div>
      )}
    </div>
  );
}
