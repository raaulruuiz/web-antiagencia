import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BACKEND_URL } from '@/lib/config';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CUENTAS = [
  { key: 'Ingresos',              label: 'Ingresos',            color: '#22c55e' },
  { key: 'Impuestos',             label: 'Impuestos',           color: '#f59e0b' },
  { key: 'Compensación del Dueño', label: 'Compensación Dueño', color: '#3b82f6' },
  { key: 'Gastos de Operación',   label: 'Gastos Operación',    color: '#8b5cf6' },
  { key: 'Ganancia',              label: 'Ganancias',           color: '#10b981' },
  { key: 'Freelancers y Material', label: 'Freelancers',        color: '#ec4899' },
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

function getRangoAnio() {
  const anio = new Date().getFullYear();
  return { desde: `${anio}-01-01`, hasta: `${anio + 1}-01-01` };
}

function getRangoMes() {
  const hoy = new Date();
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1).toISOString().slice(0, 10);
  return { desde, hasta };
}

function getRangoTrimestre() {
  const hoy = new Date();
  const q = Math.floor(hoy.getMonth() / 3);
  const desde = new Date(hoy.getFullYear(), q * 3, 1).toISOString().slice(0, 10);
  const hasta = new Date(hoy.getFullYear(), q * 3 + 3, 1).toISOString().slice(0, 10);
  return { desde, hasta };
}

// ── Subcomponentes ──────────────────────────────────────────────

function MetricCard({ label, value, color, sub }) {
  return (
    <div style={S.card}>
      <p style={{ color: '#71717a', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
      <p style={{ color: color || 'white', fontSize: 24, fontWeight: 700, margin: 0 }}>{value}</p>
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

function FilaMovimiento({ m }) {
  const esIngreso = m.tipo === 'Ingreso';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #27272a', flexWrap: 'wrap' }}>
      <span style={{ color: esIngreso ? '#22c55e' : '#f87171', fontSize: 16, flexShrink: 0 }}>{esIngreso ? '↑' : '↓'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
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
        {m.categorias.slice(0, 2).map(c => (
          <span key={c} style={{ background: '#27272a', color: '#a1a1aa', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

function FormularioMovimiento({ onCreado }) {
  const [form, setForm] = useState({
    nombre: '', fecha: new Date().toISOString().slice(0, 10),
    tipo: 'Ingreso', cuenta: 'Ingresos', cantidad: '',
    iva: '21%', irpf: '0%', categorias: [],
  });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function toggleCat(cat) {
    setForm(f => ({
      ...f,
      categorias: f.categorias.includes(cat) ? f.categorias.filter(c => c !== cat) : [...f.categorias, cat],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre || !form.cantidad) return;
    setLoading(true);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimiento`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cantidad: parseFloat(form.cantidad) }),
      });
      if (!r.ok) throw new Error(await r.text());
      setOk(true);
      setForm(f => ({ ...f, nombre: '', cantidad: '', categorias: [] }));
      setTimeout(() => { setOk(false); onCreado(); }, 1500);
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
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

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button type="submit" style={S.primary} disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar movimiento'}
        </button>
        {ok && <span style={{ color: '#22c55e', fontSize: 14 }}>✓ Guardado en Notion</span>}
      </div>
    </form>
  );
}

// ── Componente principal ────────────────────────────────────────

export default function Finanzas() {
  const [periodo, setPeriodo] = useState('anio');
  const [dashboard, setDashboard] = useState(null);
  const [movimientos, setMovimientos] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loadingDash, setLoadingDash] = useState(true);
  const [loadingMovs, setLoadingMovs] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCuenta, setFiltroCuenta] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [pagMovs, setPagMovs] = useState(1);
  const [tab, setTab] = useState('dashboard'); // 'dashboard' | 'movimientos' | 'nuevo'

  function getRango() {
    if (periodo === 'mes') return getRangoMes();
    if (periodo === 'trimestre') return getRangoTrimestre();
    return getRangoAnio();
  }

  const cargarDashboard = useCallback(async () => {
    setLoadingDash(true);
    try {
      const token = await getToken();
      const { desde, hasta } = getRango();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/dashboard?desde=${desde}&hasta=${hasta}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(await r.json());
    } finally {
      setLoadingDash(false);
    }
  }, [periodo]);

  const cargarMovimientos = useCallback(async (page = 1) => {
    setLoadingMovs(true);
    try {
      const token = await getToken();
      const { desde, hasta } = getRango();
      const params = new URLSearchParams({ desde, hasta, page });
      if (filtroTipo) params.set('tipo', filtroTipo);
      if (filtroCuenta) params.set('cuenta', filtroCuenta);
      if (filtroCat) params.set('categoria', filtroCat);
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMovimientos(await r.json());
    } finally {
      setLoadingMovs(false);
    }
  }, [periodo, filtroTipo, filtroCuenta, filtroCat]);

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
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Finanzas</h1>
        <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Ingresos, gastos, saldos y fiscalidad</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={tabStyle('dashboard')}  onClick={() => setTab('dashboard')}>Dashboard</button>
        <button style={tabStyle('movimientos')} onClick={() => { setTab('movimientos'); }}>Movimientos</button>
        <button style={tabStyle('nuevo')}      onClick={() => setTab('nuevo')}>+ Nuevo</button>
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <>
          {/* Selector periodo */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {[['mes','Este mes'],['trimestre','Este trimestre'],['anio','Este año']].map(([k,l]) => (
              <button key={k} onClick={() => setPeriodo(k)}
                style={{ background: periodo === k ? '#0067FD' : '#27272a', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
                {l}
              </button>
            ))}
          </div>

          {loadingDash ? (
            <p style={{ color: '#52525b' }}>Cargando…</p>
          ) : d ? (
            <>
              {/* Métricas principales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                <MetricCard label="Ingresos"     value={fmt(d.resumen.totalIngresos)} color="#22c55e" />
                <MetricCard label="Gastos"       value={fmt(d.resumen.totalGastos)}   color="#f87171" />
                <MetricCard label="Beneficio neto" value={fmt(d.resumen.beneficioNeto)} color={d.resumen.beneficioNeto >= 0 ? '#22c55e' : '#f87171'} />
                <MetricCard label="IVA a pagar"  value={fmt(d.resumen.ivaAPagar)}     color="#f59e0b" sub={`Rep: ${fmt(d.resumen.ivaRepercutido)} · Sop: ${fmt(d.resumen.ivaSoportado)}`} />
                <MetricCard label="IRPF retenido" value={fmt(d.resumen.irpfRetenido)} color="#8b5cf6" />
              </div>

              {/* Saldos por cuenta */}
              <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Saldo por cuenta</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 24 }}>
                {CUENTAS.map(c => (
                  <SaldoCard key={c.key} cuenta={{ ...c, saldo: d.saldos[c.key] ?? 0 }} />
                ))}
              </div>

              {/* Gráfica evolución mensual */}
              {d.evolucionMensual.length > 1 && (
                <>
                  <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Evolución mensual</h2>
                  <div style={{ ...S.card, marginBottom: 24, padding: '16px 8px' }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={d.evolucionMensual.map(e => ({ ...e, mes: mesLabel(e.mes) }))} barSize={18}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, color: 'white' }} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#71717a' }} />
                        <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4,4,0,0]} />
                        <Bar dataKey="gastos"   name="Gastos"   fill="#f87171" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {/* Top categorías de gasto */}
              {Object.keys(d.gastosPorCategoria).length > 0 && (
                <>
                  <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Gastos por categoría</h2>
                  <div style={S.card}>
                    {Object.entries(d.gastosPorCategoria)
                      .filter(([, v]) => v > 0)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 8)
                      .map(([cat, total]) => {
                        const max = Math.max(...Object.values(d.gastosPorCategoria));
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
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
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
            {/* Selector periodo */}
            {[['mes','Mes'],['trimestre','Trimestre'],['anio','Año']].map(([k,l]) => (
              <button key={k} onClick={() => { setPeriodo(k); setPagMovs(1); }}
                style={{ background: periodo === k ? '#0067FD' : '#27272a', color: 'white', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, cursor: 'pointer' }}>
                {l}
              </button>
            ))}
            <button style={S.ghost} onClick={() => cargarMovimientos(pagMovs)}>Actualizar</button>
          </div>

          <div style={S.card}>
            {loadingMovs ? (
              <p style={{ color: '#52525b', textAlign: 'center', padding: 24 }}>Cargando…</p>
            ) : movimientos.items.length === 0 ? (
              <p style={{ color: '#52525b', textAlign: 'center', padding: 24 }}>Sin movimientos para este periodo</p>
            ) : (
              <>
                <p style={{ color: '#52525b', fontSize: 12, marginBottom: 12 }}>{movimientos.total} movimientos</p>
                {movimientos.items.map(m => <FilaMovimiento key={m.id} m={m} />)}

                {/* Paginación */}
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

      {/* ── NUEVO MOVIMIENTO ── */}
      {tab === 'nuevo' && (
        <div style={S.card}>
          <h2 style={{ color: 'white', fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 20 }}>Nuevo movimiento</h2>
          <FormularioMovimiento onCreado={() => { setTab('movimientos'); cargarMovimientos(1); cargarDashboard(); }} />
        </div>
      )}
    </div>
  );
}
