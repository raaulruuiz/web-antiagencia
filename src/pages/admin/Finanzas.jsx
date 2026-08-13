import { useState, useEffect, useCallback, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { supabase } from '@/lib/supabaseClient';
import { BACKEND_URL } from '@/lib/config';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CUENTAS = [
  { key: 'Ingresos',               label: 'Ingresos',            color: '#22c55e' },
  { key: 'Impuestos',              label: 'Impuestos',           color: '#f59e0b' },
  { key: 'Compensación del Dueño', label: 'Compensación Dueño',  color: '#3b82f6' },
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
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
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

function toISO(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

const RANGOS_PRESET = () => {
  const h = new Date();
  const a = h.getFullYear();
  const m = h.getMonth();
  const q = Math.floor(m / 3);
  return [
    { label: 'Este mes',            desde: toISO(new Date(a, m, 1)),     hasta: toISO(new Date(a, m + 1, 1)) },
    { label: 'Mes anterior',        desde: toISO(new Date(a, m - 1, 1)), hasta: toISO(new Date(a, m, 1)) },
    { label: 'Este trimestre',      desde: toISO(new Date(a, q*3, 1)),   hasta: toISO(new Date(a, q*3 + 3, 1)) },
    { label: 'Trimestre anterior',  desde: toISO(new Date(a, (q-1)*3, 1)), hasta: toISO(new Date(a, q*3, 1)) },
    { label: 'Este año',            desde: `${a}-01-01`,                 hasta: `${a + 1}-01-01` },
    { label: 'Año anterior',        desde: `${a - 1}-01-01`,             hasta: `${a}-01-01` },
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

function DateRangePicker({ desde, hasta, onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(undefined);
  const ref = useRef(null);
  const presets = RANGOS_PRESET();

  // Sync selected from props
  useEffect(() => {
    const from = new Date(desde + 'T12:00:00');
    const to   = addDays(new Date(hasta + 'T12:00:00'), -1);
    setSelected({ from, to });
  }, [desde, hasta]);

  // Click outside → close
  useEffect(() => {
    if (!open) return;
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function applyPreset(p) {
    onChange(p.desde, p.hasta);
    setOpen(false);
  }

  function handleSelect(range) {
    setSelected(range);
    if (range?.from && range?.to) {
      const desde = toISO(range.from);
      const hasta = toISO(addDays(range.to, 1));
      onChange(desde, hasta);
      setOpen(false);
    }
  }

  const activePreset = presets.find(p => p.desde === desde && p.hasta === hasta);

  return (
    <>
      <style>{dpStyles}</style>
      <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#27272a', border: '1px solid #3f3f46', borderRadius: 8, color: 'white', padding: '7px 12px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          <span style={{ fontSize: 14 }}>📅</span>
          <span>{activePreset ? activePreset.label : fmtRango(desde, hasta)}</span>
          <span style={{ color: '#71717a', fontSize: 10 }}>▾</span>
        </button>

        {open && (
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200, display: 'flex', background: '#0d0d0d', border: '1px solid #27272a', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
            {/* Presets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 8px', borderRight: '1px solid #27272a', minWidth: 160 }}>
              {presets.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)}
                  style={{ background: (activePreset?.label === p.label) ? '#1a2a3f' : 'transparent', color: (activePreset?.label === p.label) ? '#60a5fa' : '#a1a1aa', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {p.label}
                </button>
              ))}
            </div>
            {/* Calendar */}
            <div style={{ padding: '8px 4px' }}>
              <DayPicker
                mode="range"
                selected={selected}
                onSelect={handleSelect}
                numberOfMonths={2}
                locale={es}
                weekStartsOn={1}
              />
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
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #27272a', flexWrap: 'wrap' }}>
      <span style={{ color: esIngreso ? '#22c55e' : '#f87171', fontSize: 16, flexShrink: 0 }}>{esIngreso ? '↑' : '↓'}</span>
      <div style={{ flex: 1, minWidth: 120 }}>
        <p style={{ color: 'white', fontSize: 14, margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nombre}</p>
        <p style={{ color: '#52525b', fontSize: 12, margin: 0 }}>{m.fecha} · {m.cuenta}</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ color: esIngreso ? '#22c55e' : '#f87171', fontSize: 14, fontWeight: 700, margin: 0 }}>{esIngreso ? '+' : '-'}{fmt(m.cantidad)}</p>
        {(m.iva !== '0%' || m.irpf !== '0%') && (
          <p style={{ color: '#52525b', fontSize: 11, margin: 0 }}>IVA {m.iva} · IRPF {m.irpf}</p>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {m.categorias.slice(0,2).map(c => (
          <span key={c} style={{ background: '#27272a', color: '#a1a1aa', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>{c}</span>
        ))}
      </div>
      <button onClick={() => onEditar(m)} style={{ background: 'none', border: '1px solid #3f3f46', borderRadius: 6, color: '#71717a', padding: '4px 10px', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
        Editar
      </button>
    </div>
  );
}

// ── Métricas ────────────────────────────────────────────────────

function MetricCard({ label, value, color, sub }) {
  return (
    <div style={S.card}>
      <p style={{ color: '#71717a', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
      <p style={{ color: color || 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>{value}</p>
      {sub && <p style={{ color: '#52525b', fontSize: 12, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function SaldoCard({ cuenta }) {
  const color = cuenta.saldo >= 0 ? '#22c55e' : '#f87171';
  return (
    <div style={{ ...S.card, borderLeft: `3px solid ${cuenta.color}` }}>
      <p style={{ color: '#71717a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{cuenta.label}</p>
      <p style={{ color, fontSize: 20, fontWeight: 700, margin: 0 }}>{fmt(cuenta.saldo)}</p>
    </div>
  );
}

// ── Vista fiscal ────────────────────────────────────────────────

function TabFiscal() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

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

  useEffect(() => { cargar(); }, [cargar]);

  const anios = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  if (loading) return <p style={{ color: '#52525b' }}>Cargando…</p>;
  if (err)    return <p style={{ color: '#f87171', fontSize: 13, background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px' }}>Error: {err}</p>;
  if (!datos)  return null;

  const { trimestres, anual } = datos;

  return (
    <div>
      {/* Selector año */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {anios.map(a => (
          <button key={a} onClick={() => setAnio(a)}
            style={{ background: anio === a ? '#0067FD' : '#27272a', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
            {a}
          </button>
        ))}
      </div>

      {/* Resumen anual */}
      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Resumen anual {anio}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 24 }}>
        <MetricCard label="Facturación"    value={fmt(anual.facturacion)}    color="#22c55e" />
        <MetricCard label="Gastos totales" value={fmt(anual.totalGastos)}    color="#f87171" />
        <MetricCard label="IVA repercutido" value={fmt(anual.ivaRepercutido)} color="#f59e0b" />
        <MetricCard label="IVA soportado"  value={fmt(anual.ivaSoportado)}   color="#f59e0b" />
        <MetricCard label="IVA a pagar"    value={fmt(anual.ivaAPagar)}      color={anual.ivaAPagar > 0 ? '#f59e0b' : '#22c55e'} />
        <MetricCard label="IRPF retenido"  value={fmt(anual.irpfRetenido)}   color="#8b5cf6" />
      </div>

      {/* Detalle por trimestre */}
      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Por trimestre</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {trimestres.map((t, i) => (
          <div key={i} style={S.card}>
            <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>{t.label}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              <div>
                <p style={{ color: '#71717a', fontSize: 11, margin: '0 0 2px' }}>Facturación</p>
                <p style={{ color: '#22c55e', fontSize: 16, fontWeight: 700, margin: 0 }}>{fmt(t.facturacion)}</p>
              </div>
              <div>
                <p style={{ color: '#71717a', fontSize: 11, margin: '0 0 2px' }}>IVA repercutido</p>
                <p style={{ color: '#f59e0b', fontSize: 16, fontWeight: 700, margin: 0 }}>{fmt(t.ivaRepercutido)}</p>
              </div>
              <div>
                <p style={{ color: '#71717a', fontSize: 11, margin: '0 0 2px' }}>IVA soportado</p>
                <p style={{ color: '#f59e0b', fontSize: 16, fontWeight: 700, margin: 0 }}>{fmt(t.ivaSoportado)}</p>
              </div>
              <div>
                <p style={{ color: '#71717a', fontSize: 11, margin: '0 0 2px' }}>IVA a pagar (303)</p>
                <p style={{ color: t.ivaAPagar > 0 ? '#f59e0b' : '#22c55e', fontSize: 16, fontWeight: 700, margin: 0 }}>{fmt(t.ivaAPagar)}</p>
              </div>
              <div>
                <p style={{ color: '#71717a', fontSize: 11, margin: '0 0 2px' }}>IRPF retenido (130)</p>
                <p style={{ color: '#8b5cf6', fontSize: 16, fontWeight: 700, margin: 0 }}>{fmt(t.irpfRetenido)}</p>
              </div>
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
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────

export default function Finanzas() {
  const initAnio = RANGOS_PRESET().find(p => p.label === 'Este año');
  const [desde, setDesde] = useState(initAnio.desde);
  const [hasta, setHasta] = useState(initAnio.hasta);
  const [dashboard, setDashboard] = useState(null);
  const [movimientos, setMovimientos] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loadingDash, setLoadingDash] = useState(true);
  const [loadingMovs, setLoadingMovs] = useState(true);
  const [errDash, setErrDash] = useState(null);
  const [errMovs, setErrMovs] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCuenta, setFiltroCuenta] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [pagMovs, setPagMovs] = useState(1);
  const [tab, setTab] = useState('dashboard');
  const [movEditando, setMovEditando] = useState(null);

  function handleRangoChange(d, h) { setDesde(d); setHasta(h); }

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

  const cargarMovimientos = useCallback(async (page = 1) => {
    setLoadingMovs(true);
    setErrMovs(null);
    try {
      const token = await getToken();
      const params = new URLSearchParams({ desde, hasta, page });
      if (filtroTipo) params.set('tipo', filtroTipo);
      if (filtroCuenta) params.set('cuenta', filtroCuenta);
      if (filtroCat) params.set('categoria', filtroCat);
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
  useEffect(() => { if (tab === 'movimientos') cargarMovimientos(pagMovs); }, [tab, pagMovs, cargarMovimientos]);

  const tabStyle = (t) => ({
    background: tab === t ? '#27272a' : 'transparent',
    color: tab === t ? 'white' : '#71717a',
    border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 14, cursor: 'pointer', fontWeight: tab === t ? 600 : 400,
  });

  const d = dashboard;

  return (
    <div style={{ padding: '16px', maxWidth: 960, fontFamily: 'inherit' }}>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={tabStyle('dashboard')}   onClick={() => setTab('dashboard')}>Dashboard</button>
        <button style={tabStyle('movimientos')} onClick={() => setTab('movimientos')}>Movimientos</button>
        <button style={tabStyle('fiscal')}      onClick={() => setTab('fiscal')}>Fiscal</button>
        <button style={tabStyle('nuevo')}       onClick={() => setTab('nuevo')}>+ Nuevo</button>
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <>
          <div style={{ marginBottom: 20 }}>
            <DateRangePicker desde={desde} hasta={hasta} onChange={handleRangoChange} />
          </div>

          {loadingDash ? <p style={{ color: '#52525b' }}>Cargando…</p> : errDash ? (
            <p style={{ color: '#f87171', fontSize: 13, background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px' }}>Error: {errDash}</p>
          ) : d?.resumen ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, marginBottom: 20 }}>
                <MetricCard label="Ingresos"      value={fmt(d.resumen.totalIngresos)}  color="#22c55e" />
                <MetricCard label="Gastos"        value={fmt(d.resumen.totalGastos)}    color="#f87171" />
                <MetricCard label="Beneficio"     value={fmt(d.resumen.beneficioNeto)}  color={d.resumen.beneficioNeto >= 0 ? '#22c55e' : '#f87171'} />
                <MetricCard label="IVA a pagar"   value={fmt(d.resumen.ivaAPagar)}      color="#f59e0b" sub={`Rep: ${fmt(d.resumen.ivaRepercutido)} · Sop: ${fmt(d.resumen.ivaSoportado)}`} />
                <MetricCard label="IRPF retenido" value={fmt(d.resumen.irpfRetenido)}   color="#8b5cf6" />
              </div>

              <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Saldo por cuenta</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: 10, marginBottom: 24 }}>
                {CUENTAS.map(c => <SaldoCard key={c.key} cuenta={{ ...c, saldo: d.saldos[c.key] ?? 0 }} />)}
              </div>

              {d.evolucionMensual.length > 1 && (
                <>
                  <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Evolución mensual</h2>
                  <div style={{ ...S.card, marginBottom: 24, padding: '16px 8px' }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={d.evolucionMensual.map(e => ({ ...e, mes: mesLabel(e.mes) }))} barSize={18}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, color: 'white' }} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#71717a' }} />
                        <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4,4,0,0]} />
                        <Bar dataKey="gastos"   name="Gastos"   fill="#f87171" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {Object.keys(d.gastosPorCategoria).length > 0 && (
                <>
                  <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Gastos por categoría</h2>
                  <div style={S.card}>
                    {Object.entries(d.gastosPorCategoria).filter(([,v]) => v > 0).sort(([,a],[,b]) => b - a).slice(0, 8).map(([cat, total]) => {
                      const max = Math.max(...Object.values(d.gastosPorCategoria).filter(v => v > 0));
                      const pct = Math.round((total / max) * 100);
                      return (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <span style={{ color: '#a1a1aa', fontSize: 12, minWidth: 140, flexShrink: 0 }}>{cat}</span>
                          <div style={{ flex: 1, background: '#27272a', borderRadius: 4, height: 6 }}>
                            <div style={{ width: `${pct}%`, background: '#f87171', borderRadius: 4, height: 6 }} />
                          </div>
                          <span style={{ color: '#f87171', fontSize: 12, minWidth: 60, textAlign: 'right', flexShrink: 0 }}>{fmt(total)}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : null}
        </>
      )}

      {/* ── MOVIMIENTOS ── */}
      {tab === 'movimientos' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <DateRangePicker desde={desde} hasta={hasta} onChange={(d, h) => { handleRangoChange(d, h); setPagMovs(1); }} />
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
            <button style={S.ghost} onClick={() => cargarMovimientos(pagMovs)}>↺</button>
          </div>

          <div style={S.card}>
            {loadingMovs ? (
              <p style={{ color: '#52525b', textAlign: 'center', padding: 24 }}>Cargando…</p>
            ) : errMovs ? (
              <p style={{ color: '#f87171', fontSize: 13, padding: 16 }}>Error: {errMovs}</p>
            ) : movimientos.items.length === 0 ? (
              <p style={{ color: '#52525b', textAlign: 'center', padding: 24 }}>Sin movimientos para este periodo</p>
            ) : (
              <>
                <p style={{ color: '#52525b', fontSize: 12, marginBottom: 12 }}>{movimientos.total} movimientos</p>
                {movimientos.items.map(m => <FilaMovimiento key={m.id} m={m} onEditar={setMovEditando} />)}
                {movimientos.pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                    <button style={S.ghost} disabled={pagMovs <= 1} onClick={() => setPagMovs(p => p - 1)}>← Anterior</button>
                    <span style={{ color: '#71717a', fontSize: 13, padding: '8px 0' }}>{pagMovs} / {movimientos.pages}</span>
                    <button style={S.ghost} disabled={pagMovs >= movimientos.pages} onClick={() => setPagMovs(p => p + 1)}>Siguiente →</button>
                  </div>
                )}
              </>
            )}
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
