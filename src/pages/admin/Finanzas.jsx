import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
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

const CAMPOS_FILTRO = [
  { key: 'nombre',          label: 'Nombre',          tipo: 'text' },
  { key: 'tipo',            label: 'Tipo',            tipo: 'select',          ops: ['Ingreso','Gasto'] },
  { key: 'cuenta',          label: 'Cuenta',          tipo: 'select',          ops: CUENTAS.map(c => c.key) },
  { key: 'categorias',      label: 'Categoría',       tipo: 'array',           ops: CATEGORIAS },
  { key: 'cantidad',        label: 'Cantidad (€)',     tipo: 'number' },
  { key: 'beneficio',       label: 'Beneficio (€)',   tipo: 'number' },
  { key: 'base_imponible',  label: 'Base Imponible',  tipo: 'number' },
  { key: 'iva',             label: 'IVA',             tipo: 'select',          ops: IVA_OPTS },
  { key: 'irpf',            label: 'IRPF',            tipo: 'select',          ops: IRPF_OPTS },
  { key: 'importe_factura',   label: 'Importe s/ factura',  tipo: 'number_nullable' },
  { key: 'fecha_factura',     label: 'Fecha Factura',       tipo: 'date' },
  { key: 'created_at',        label: 'Creado',    tipo: 'date' },
  { key: 'updated_at',        label: 'Modificado', tipo: 'date' },
  { key: 'cliente_ids',       label: 'Cliente',    tipo: 'uuid_nullable' },
  { key: 'equipo_ids',        label: 'Miembro equipo',      tipo: 'uuid_nullable' },
];

const OPS_POR_TIPO = {
  text:            [['ilike','contiene'],['not_ilike','no contiene'],['eq','es igual a'],['is_null','está vacío'],['is_not_null','no está vacío']],
  date:            [['gte','es o después de'],['lte','es o antes de'],['gt','después de'],['lt','antes de'],['eq','es exactamente']],
  number:          [['eq','='],['neq','≠'],['gt','>'],['gte','≥'],['lt','<'],['lte','≤']],
  number_nullable: [['eq','='],['neq','≠'],['gt','>'],['gte','≥'],['lt','<'],['lte','≤'],['is_null','está vacío'],['is_not_null','no está vacío']],
  select:          [['eq','es'],['neq','no es']],
  array:           [['cs','contiene'],['not_cs','no contiene']],
  uuid_nullable:   [['is_not_null','tiene asignado'],['is_null','no tiene asignado'],['eq','es'],['neq','no es']],
};

const CAMPOS_SORT = [
  { key: 'fecha',          label: 'Fecha' },
  { key: 'nombre',         label: 'Nombre' },
  { key: 'cantidad',       label: 'Cantidad' },
  { key: 'beneficio',      label: 'Beneficio' },
  { key: 'base_imponible', label: 'Base Imponible' },
  { key: 'fecha_factura',     label: 'Fecha Factura' },
  { key: 'importe_factura',   label: 'Importe Factura' },
  { key: 'created_at',        label: 'Creado' },
  { key: 'updated_at',        label: 'Modificado' },
  { key: 'cliente_ids',       label: 'Cliente' },
  { key: 'equipo_ids',        label: 'Miembro equipo' },
];

// Formatea número con separador de miles en locale español: 2308.04 → "2.308,04"
function fmtN(n, decimals = 2) {
  if (n == null || n === '') return '—';
  return Number(n).toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtEur(n, showSign = false) {
  if (n == null) return '—';
  const formatted = fmtN(Math.abs(n));
  const sign = n > 0 ? (showSign ? '+' : '') : n < 0 ? '-' : '';
  return `${sign}${formatted}€`;
}

const S = {
  card:    { background: '#161616', border: '1px solid #27272a', borderRadius: 12, padding: 20 },
  input:   { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  select:  { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  label:   { color: '#71717a', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 },
  primary: { background: '#0067FD', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  ghost:   { background: 'transparent', color: '#71717a', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' },
  danger:  { background: 'transparent', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' },
};

// Misma lógica que calcularCampos del backend — rellena campos derivados si faltan
function enriquecerMovimiento(m) {
  if (!m) return m;
  if (m.base_imponible != null && m.iva_a_pagar != null) return m; // ya completo
  const ivaPct  = parseFloat(m.iva)  / 100 || 0;
  const irpfPct = parseFloat(m.irpf) / 100 || 0;
  const cantidad = m.cantidad || 0;
  const esIngreso = m.tipo === 'Ingreso';
  let extra;
  if (esIngreso) {
    const divisor = 1 + ivaPct - irpfPct;
    const base = divisor > 0 ? Math.round(cantidad / divisor * 100) / 100 : cantidad;
    extra = { base_imponible: base, iva_a_pagar: Math.round(base * ivaPct * 100) / 100, irpf_a_pagar: 0, irpf_retenido_yo: Math.round(base * irpfPct * 100) / 100 };
  } else {
    const base = irpfPct > 0 ? Math.round(cantidad / (1 - irpfPct) * 100) / 100 : cantidad;
    const baseReal = ivaPct > 0 ? Math.round(base / (1 + ivaPct) * 100) / 100 : base;
    extra = { base_imponible: baseReal, iva_a_pagar: ivaPct > 0 ? Math.round(-baseReal * ivaPct * 100) / 100 : 0, irpf_a_pagar: Math.round(irpfPct > 0 ? baseReal * irpfPct * 100 / 100 : 0), irpf_retenido_yo: 0 };
  }
  return { ...m, ...extra };
}

function fmt(n) {
  if (n == null) return '—';
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '-' : '') + intFmt + ',' + dec + ' €';
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

function CheckLegend({ items, hidden, onToggle, style }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', ...style }}>
      {items.map(({ key, name, color }) => {
        const off = !!hidden[key];
        return (
          <span key={key} onClick={() => onToggle(key)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, border: `2px solid ${color}`,
              background: off ? 'transparent' : color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: off ? '#52525b' : color, fontSize: 11 }}>{name}</span>
          </span>
        );
      })}
    </div>
  );
}

function MultiCheckboxDropdown({ opciones, valores, onChange }) {
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

function PanelFiltros({ filtros, op, onChangeFiltros, onChangeOp, listasAsignacion = {} }) {
  const defaultValor = meta => (meta?.tipo === 'select' || meta?.tipo === 'array') ? [] : '';

  function addCondicion() {
    const meta = CAMPOS_FILTRO[0];
    onChangeFiltros([...filtros, { id: Date.now(), campo: meta.key, operador: (OPS_POR_TIPO[meta.tipo] || [])[0]?.[0] || 'ilike', valor: defaultValor(meta) }]);
  }
  function updateCondicion(id, key, val) {
    onChangeFiltros(filtros.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, [key]: val };
      if (key === 'campo') {
        const meta = CAMPOS_FILTRO.find(c => c.key === val);
        updated.operador = (OPS_POR_TIPO[meta?.tipo || 'text'] || [])[0]?.[0] || 'eq';
        updated.valor = defaultValor(meta);
      }
      return updated;
    }));
  }
  function removeCondicion(id) { onChangeFiltros(filtros.filter(f => f.id !== id)); }

  const panelStyle = { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 10, padding: '14px 16px', marginBottom: 12 };
  const btnLink = { background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13 };

  return (
    <div style={panelStyle}>
      {filtros.length > 1 && (
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <select value={op} onChange={e => onChangeOp(e.target.value)}
            style={{ background: '#161616', border: '1px solid #0067FD', borderRadius: 6, color: '#0067FD', padding: '3px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <option value="and">Y (AND)</option>
            <option value="or">O (OR)</option>
          </select>
          <span style={{ color: '#52525b', fontSize: 12 }}>
            {op === 'and' ? 'se deben cumplir todas las condiciones' : 'se debe cumplir al menos una condición'}
          </span>
        </div>
      )}
      {filtros.length === 0 && (
        <p style={{ color: '#52525b', fontSize: 13, margin: '0 0 10px 0' }}>Sin filtros activos — añade una condición</p>
      )}
      {filtros.map((f, idx) => {
        const meta = CAMPOS_FILTRO.find(c => c.key === f.campo) || CAMPOS_FILTRO[0];
        const ops  = OPS_POR_TIPO[meta.tipo] || OPS_POR_TIPO.text;
        const sinValor = ['is_null', 'is_not_null'].includes(f.operador);
        const isMulti = meta.tipo === 'select' || meta.tipo === 'array';
        const isUuid  = meta.tipo === 'uuid_nullable';
        const uuidOpciones = isUuid ? (listasAsignacion[meta.key] || []) : [];
        return (
          <div key={f.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
            {idx > 0 && (
              <span style={{ color: '#0067FD', fontSize: 11, fontWeight: 700, minWidth: 22, textAlign: 'right', flexShrink: 0 }}>
                {op === 'and' ? 'Y' : 'O'}
              </span>
            )}
            <select value={f.campo} onChange={e => updateCondicion(f.id, 'campo', e.target.value)}
              style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, minWidth: 130 }}>
              {CAMPOS_FILTRO.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <select value={f.operador} onChange={e => updateCondicion(f.id, 'operador', e.target.value)}
              style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, minWidth: 118 }}>
              {ops.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            {!sinValor && (
              isMulti ? (
                <MultiCheckboxDropdown
                  opciones={meta.ops || []}
                  valores={Array.isArray(f.valor) ? f.valor : []}
                  onChange={v => updateCondicion(f.id, 'valor', v)}
                />
              ) : isUuid && uuidOpciones.length > 0 ? (
                <select value={f.valor || ''} onChange={e => updateCondicion(f.id, 'valor', e.target.value)}
                  style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, minWidth: 150 }}>
                  <option value="">— Elige —</option>
                  {uuidOpciones.map(o => <option key={o.id} value={o.id}>{o.nombre}{o.nombre_empresa ? ` (${o.nombre_empresa})` : ''}</option>)}
                </select>
              ) : (
                <input
                  type={meta.tipo === 'date' ? 'date' : (meta.tipo === 'number' || meta.tipo === 'number_nullable') ? 'number' : 'text'}
                  value={f.valor}
                  onChange={e => updateCondicion(f.id, 'valor', e.target.value)}
                  placeholder="Valor"
                  style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, width: 130 }}
                />
              )
            )}
            <button onClick={() => removeCondicion(f.id)}
              style={{ ...btnLink, color: '#52525b', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
          </div>
        );
      })}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: filtros.length > 0 ? 10 : 0 }}>
        <button onClick={addCondicion} style={{ ...btnLink, color: '#0067FD' }}>+ Añadir condición</button>
        {filtros.length > 0 && (
          <button onClick={() => onChangeFiltros([])} style={{ ...btnLink, color: '#52525b', fontSize: 12 }}>Limpiar todo</button>
        )}
      </div>
    </div>
  );
}

function PanelOrdenar({ sorts, onChange }) {
  const usados = new Set(sorts.map(s => s.campo));
  function addSort() {
    const libre = CAMPOS_SORT.find(c => !usados.has(c.key));
    if (libre) onChange([...sorts, { campo: libre.key, dir: 'desc' }]);
  }
  function updateSort(idx, key, val) { onChange(sorts.map((s, i) => i === idx ? { ...s, [key]: val } : s)); }
  function removeSort(idx) { onChange(sorts.filter((_, i) => i !== idx)); }

  const panelStyle = { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 10, padding: '14px 16px', marginBottom: 12 };
  const btnLink = { background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13 };

  return (
    <div style={panelStyle}>
      {sorts.length === 0 && (
        <p style={{ color: '#52525b', fontSize: 13, margin: '0 0 10px 0' }}>Sin ordenación — por defecto fecha más reciente</p>
      )}
      {sorts.map((s, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
          <select value={s.campo} onChange={e => updateSort(idx, 'campo', e.target.value)}
            style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, minWidth: 140 }}>
            {CAMPOS_SORT.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <select value={s.dir} onChange={e => updateSort(idx, 'dir', e.target.value)}
            style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, minWidth: 130 }}>
            <option value="desc">Descendente ↓</option>
            <option value="asc">Ascendente ↑</option>
          </select>
          <button onClick={() => removeSort(idx)}
            style={{ ...btnLink, color: '#52525b', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: sorts.length > 0 ? 10 : 0 }}>
        <button onClick={addSort} disabled={sorts.length >= CAMPOS_SORT.length}
          style={{ ...btnLink, color: sorts.length >= CAMPOS_SORT.length ? '#3f3f46' : '#8b5cf6' }}>
          + Añadir ordenación
        </button>
        {sorts.length > 0 && (
          <button onClick={() => onChange([])} style={{ ...btnLink, color: '#52525b', fontSize: 12 }}>Restablecer</button>
        )}
      </div>
    </div>
  );
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

// ── Desplegable multiselect con checkboxes ──────────────────────
function MultiCheckDrop({ label, opciones, seleccionados, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    if (!open) { setQ(''); return; }
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  const etiqueta = seleccionados.length === 0 ? 'Ninguno'
    : seleccionados.length === 1
      ? (opciones.find(o => o.id === seleccionados[0])?.label || '1 seleccionado')
      : `${seleccionados.length} seleccionados`;
  const opcionesFiltradas = q ? opciones.filter(o => o.label.toLowerCase().includes(q.toLowerCase())) : opciones;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>{label}</label>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: '#27272a', border: '1px solid #3f3f46', color: seleccionados.length ? 'white' : '#71717a', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{etiqueta}</span>
        <span style={{ color: '#52525b', fontSize: 10, flexShrink: 0, marginLeft: 6 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 300, top: '100%', left: 0, right: 0, background: '#1c1c1e', border: '1px solid #3f3f46', borderRadius: 8, marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #27272a' }}>
            <input ref={inputRef} type="text" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Buscar..." onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'white', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {opcionesFiltradas.length === 0
              ? <p style={{ color: '#52525b', fontSize: 12, textAlign: 'center', padding: '12px 0', margin: 0 }}>Sin resultados</p>
              : opcionesFiltradas.map(o => {
                  const sel = seleccionados.includes(o.id);
                  return (
                    <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #27272a', background: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <input type="checkbox" checked={sel}
                        onChange={() => onChange(sel ? seleccionados.filter(id => id !== o.id) : [...seleccionados, o.id])}
                        style={{ accentColor: '#0067FD', width: 14, height: 14, flexShrink: 0 }} />
                      <span style={{ color: sel ? 'white' : '#a1a1aa', fontSize: 13 }}>{o.label}</span>
                    </label>
                  );
                })
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Formulario (nuevo y edición) ────────────────────────────────

function FormularioMovimiento({ inicial, onGuardado, onCancelar }) {
  const esEdicion = !!inicial?.id;
  const [form, setForm] = useState(inicial || {
    nombre: '', fecha: new Date().toISOString().slice(0,10),
    tipo: 'Ingreso', cuenta: 'Ingresos', cantidad: '',
    iva: '21%', irpf: '0%', categorias: [],
    cliente_ids: [], equipo_ids: [],
  });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [clientesLista, setClientesLista] = useState([]);
  const [equipoLista, setEquipoLista] = useState([]);

  useEffect(() => {
    getToken().then(token => {
      fetch(`${BACKEND_URL}/admin/finanzas/clientes/lista`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setClientesLista(Array.isArray(d) ? d : [])).catch(() => {});
      fetch(`${BACKEND_URL}/admin/finanzas/equipo/lista`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setEquipoLista(Array.isArray(d) ? d : [])).catch(() => {});
    });
  }, []);

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
      const json = await r.json();
      setOk(true);
      if (esEdicion) {
        onGuardado(json.movimiento || { ...form, cantidad: parseFloat(form.cantidad) });
      } else {
        setForm(f => ({ ...f, nombre: '', cantidad: '', categorias: [] }));
        setTimeout(() => { setOk(false); onGuardado(null); }, 1200);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Al crear: filtrar cuentas por tipo para sugerir la más común.
  // Al editar: mostrar todas para no cambiar la cuenta sin querer.
  const todasLasCuentas = CUENTAS.map(c => c.key);
  const cuentasPorTipo = esEdicion
    ? todasLasCuentas
    : (form.tipo === 'Ingreso' ? ['Ingresos'] : ['Gastos de Operación','Impuestos','Compensación del Dueño','Ganancia','Freelancers y Material']);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        <div>
          <label style={S.label}>Nombre *</label>
          <input style={S.input} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Factura cliente X" required />
        </div>
        <div>
          <label style={S.label}>Fecha *</label>
          <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required />
        </div>
        <div>
          <label style={S.label}>Tipo *</label>
          <select style={S.select} value={form.tipo} onChange={e => { set('tipo', e.target.value); if (!esEdicion) set('cuenta', e.target.value === 'Ingreso' ? 'Ingresos' : 'Gastos de Operación'); }}>
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

      <div style={{ background: '#1a1a1a', border: '1px solid #27272a', borderRadius: 8, padding: '12px 14px' }}>
        <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>Datos de factura (opcional)</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={S.label}>Fecha Factura</label>
            <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={form.fecha_factura || ''} onChange={e => set('fecha_factura', e.target.value || null)} />
          </div>
          <div>
            <label style={S.label}>Importe s/ factura</label>
            <input style={S.input} type="number" step="0.01" min="0" value={form.importe_factura ?? ''} onChange={e => set('importe_factura', e.target.value === '' ? null : e.target.value)} placeholder="—" />
          </div>
        </div>
      </div>

      {(clientesLista.length > 0 || equipoLista.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {clientesLista.length > 0 && (
            <MultiCheckDrop
              label="Clientes"
              opciones={clientesLista.map(c => ({ id: c.id, label: c.nombre + (c.nombre_empresa ? ` (${c.nombre_empresa})` : '') }))}
              seleccionados={form.cliente_ids || []}
              onChange={ids => set('cliente_ids', ids)}
            />
          )}
          {equipoLista.length > 0 && (
            <MultiCheckDrop
              label="Miembros equipo"
              opciones={equipoLista.map(e => ({ id: e.id, label: e.nombre }))}
              seleccionados={form.equipo_ids || []}
              onChange={ids => set('equipo_ids', ids)}
            />
          )}
        </div>
      )}

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
          onGuardado={(data) => { onGuardado(data); onCerrar(); }}
          onCancelar={onCerrar}
        />
      </div>
    </div>
  );
}

// ── Fila de movimiento ──────────────────────────────────────────

function ModalMovimiento({ m, onClose, onEditar, onEliminar, onConfirm }) {
  if (!m) return null;
  const esIngreso = m.tipo === 'Ingreso';
  const color = esIngreso ? '#22c55e' : '#f87171';

  const Field = ({ label, value, mono }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ color: (value == null || value === '' || value === '—') ? '#3f3f46' : mono ? '#a78bfa' : 'white', fontSize: 13, fontFamily: mono ? 'monospace' : 'inherit' }}>
        {(value == null || value === '') ? '—' : value}
      </span>
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 14, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', padding: 24, position: 'relative' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <span style={{ color, fontSize: 22, flexShrink: 0, marginTop: 2 }}>{esIngreso ? '↑' : '↓'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.3 }}>{m.nombre}</p>
            <p style={{ color: '#71717a', fontSize: 13, margin: 0 }}>{m.fecha} · {m.cuenta}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
            {onEditar && (
              <button
                onClick={() => { onClose(); onEditar(m); }}
                style={{ background: 'transparent', border: '1px solid #3f3f46', borderRadius: 6, color: '#71717a', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
              >Editar</button>
            )}
            {onEliminar && (
              <button
                onClick={() => { onClose(); onConfirm({ texto: `¿Eliminar "${m.nombre}"?`, onOk: () => onEliminar(m.id) }); }}
                style={{ background: 'transparent', border: '1px solid #7f1d1d', borderRadius: 6, color: '#f87171', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
              >Eliminar</button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#52525b', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '2px 6px' }}
            >×</button>
          </div>
        </div>

        {/* Importe principal — estructura fija siempre igual */}
        <div style={{ background: '#0d0d0d', borderRadius: 10, padding: '14px 16px', marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <p style={{ color: '#71717a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px 0' }}>Importe</p>
            <p style={{ color, fontSize: 22, fontWeight: 700, margin: 0 }}>{esIngreso ? '+' : '-'}{fmt(m.cantidad)}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#71717a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px 0' }}>Base Imponible</p>
            <p style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: 0 }}>{fmt(m.base_imponible)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#71717a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px 0' }}>Beneficio</p>
            <p style={{ color: m.beneficio >= 0 ? '#22c55e' : '#f87171', fontSize: 16, fontWeight: 600, margin: 0 }}>{fmt(m.beneficio)}</p>
          </div>
        </div>

        {/* Campos en grid — estructura fija, siempre los mismos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 20 }}>
          <Field label="Tipo"            value={m.tipo} />
          <Field label="Cuenta"          value={m.cuenta} />
          <Field label="IVA"             value={m.iva} />
          <Field label="IVA a pagar"     value={fmt(m.iva_a_pagar)} />
          <Field label="IRPF"            value={m.irpf} />
          <Field label="IRPF a pagar"    value={fmt(m.irpf_a_pagar)} />
          <Field label="IRPF retenido (yo)" value={fmt(m.irpf_retenido_yo)} />
          <Field label="Importe s/ factura" value={fmt(m.importe_factura)} />
          <Field label="Fecha Factura"   value={m.fecha_factura || '—'} />
          <Field label="Clientes" value={(m.clientes_info || []).length ? m.clientes_info.map(c => c.nombre).join(', ') : null} />
          <Field label="Equipo" value={(m.equipo_info || []).length ? m.equipo_info.map(e => e.nombre).join(', ') : null} />
        </div>

        {/* Reparto — solo si hay múltiples clientes o equipo */}
        {((m.clientes_info?.length > 1) || (m.equipo_info?.length > 1)) && (() => {
          const porCliente = m.clientes_info?.length > 1 ? Math.round(m.cantidad / m.clientes_info.length * 100) / 100 : null;
          const porMiembro = m.equipo_info?.length > 1 ? Math.round(m.cantidad / m.equipo_info.length * 100) / 100 : null;
          return (
            <div style={{ background: '#0d0d0d', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Reparto</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {porCliente != null && m.clientes_info.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#a1a1aa' }}>{c.nombre}</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{fmt(porCliente)}</span>
                  </div>
                ))}
                {porMiembro != null && m.equipo_info.map(e => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#a1a1aa' }}>{e.nombre}</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{fmt(porMiembro)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 20, display: 'none' }}>
        </div>

        {/* Categorías */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Categorías</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(m.categorias || []).length > 0
              ? m.categorias.map(c => <span key={c} style={{ background: '#27272a', color: '#a1a1aa', fontSize: 12, padding: '3px 9px', borderRadius: 6 }}>{c}</span>)
              : <span style={{ color: '#52525b', fontSize: 13 }}>—</span>
            }
          </div>
        </div>

        {/* Metadatos — zona dim */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: '#3f3f46', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Creado</p>
            <span style={{ color: '#3f3f46', fontSize: 11, fontFamily: 'monospace' }}>
              {m.created_at ? m.created_at.slice(0, 10) : '—'}
            </span>
          </div>
          <div>
            <p style={{ color: '#3f3f46', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Modificado</p>
            <span style={{ color: '#3f3f46', fontSize: 11, fontFamily: 'monospace' }}>
              {m.updated_at ? m.updated_at.slice(0, 10) : '—'}
            </span>
          </div>
          <div>
            <p style={{ color: '#3f3f46', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Notion ID</p>
            <span style={{ color: '#3f3f46', fontSize: 11, fontFamily: 'monospace' }}>{m.notion_id || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilaMovimiento({ m, onVerDetalle }) {
  const esIngreso = m.tipo === 'Ingreso';
  return (
    <div
      onClick={() => onVerDetalle && onVerDetalle(m.id)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #27272a', cursor: 'pointer' }}
    >
      <span style={{ color: esIngreso ? '#22c55e' : '#f87171', fontSize: 16, flexShrink: 0 }}>{esIngreso ? '↑' : '↓'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'white', fontSize: 14, margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nombre}</p>
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
  // Facturas
  const [trimestreAbierto, setTrimestreAbierto] = useState(null); // 0-3
  const [facturasPorTrimestre, setFacturasPorTrimestre] = useState({}); // { "anio-q": [] }
  const [pendientes, setPendientes] = useState([]); // facturas extraídas pendientes de guardar
  const [extrayendo, setExtrayendo] = useState(false); // solo para deshabilitar el botón que está en uso
  const [guardando, setGuardando] = useState(false);
  const fileInputRef = useRef(null);
  const [tipoActivo, setTipoActivo] = useState(null); // 'ingreso' | 'gasto'
  const [dragOver, setDragOver] = useState(null); // 'ingreso' | 'gasto' | null
  const [selFacturas, setSelFacturas] = useState(new Set()); // ids seleccionados para bulk delete
  const [eliminandoBulk, setEliminandoBulk] = useState(false);
  const [facturaViewer, setFacturaViewer] = useState(null); // { url, nombre } | null

  const cargar = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/fiscal?anio=${anio}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      if (!r.ok) { setErr(data.error || `Error ${r.status}`); return; }
      setDatos(data);
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  }, [anio]);

  const cargarComp = useCallback(async () => {
    if (!comparar || !anioComp) { setDatosComp(null); return; }
    setLoadingComp(true);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/fiscal?anio=${anioComp}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      if (r.ok) setDatosComp(data);
    } catch { } finally { setLoadingComp(false); }
  }, [comparar, anioComp]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { cargarComp(); }, [cargarComp]);

  async function cargarFacturasTrimestre(q) {
    const key = `${anio}-${q}`;
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/facturas?anio=${anio}&trimestre=${q}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      if (r.ok) setFacturasPorTrimestre(prev => ({ ...prev, [key]: data }));
    } catch { }
  }

  function toggleTrimestre(i) {
    const q = i + 1;
    if (trimestreAbierto === i) { setTrimestreAbierto(null); setPendientes([]); setSelFacturas(new Set()); }
    else { setTrimestreAbierto(i); setPendientes([]); setSelFacturas(new Set()); cargarFacturasTrimestre(q); }
  }

  async function eliminarFacturasBulk() {
    if (!selFacturas.size) return;
    setEliminandoBulk(true);
    try {
      const token = await getToken();
      await Promise.all([...selFacturas].map(id =>
        fetch(`${BACKEND_URL}/admin/finanzas/facturas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      ));
      const q = trimestreAbierto + 1;
      const key = `${anio}-${q}`;
      setFacturasPorTrimestre(prev => ({ ...prev, [key]: (prev[key] || []).filter(f => !selFacturas.has(f.id)) }));
      setSelFacturas(new Set());
    } catch (e) { alert('Error: ' + e.message); }
    finally { setEliminandoBulk(false); }
  }

  async function handleFiles(files, tipo) {
    if (!files.length) return;
    const fileArr = Array.from(files);
    const token = await getToken();

    // Añadir placeholders "procesando" inmediatamente para cada archivo
    const placeholders = fileArr.map(f => ({ _id: Math.random().toString(36).slice(2), archivo_nombre: f.name, tipo, anio, trimestre: trimestreAbierto + 1, _procesando: true }));
    setPendientes(prev => [...prev, ...placeholders]);
    setExtrayendo(true);

    // Procesar cada archivo en paralelo
    await Promise.all(fileArr.map(async (file, idx) => {
      const placeholderId = placeholders[idx]._id;
      try {
        const fd = new FormData();
        fd.append('files', file);
        const r = await fetch(`${BACKEND_URL}/admin/finanzas/facturas/extraer`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
        });
        if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.error || `Error ${r.status}`); }
        const data = await r.json();
        const extraida = data.facturas?.[0] || {};
        setPendientes(prev => prev.map(p => p._id === placeholderId ? { ...extraida, _id: placeholderId, tipo, anio, trimestre: trimestreAbierto + 1, _procesando: false } : p));
      } catch (e) {
        setPendientes(prev => prev.map(p => p._id === placeholderId ? { ...p, _procesando: false, _error: e.message } : p));
      }
    }));

    setExtrayendo(false);
  }

  async function guardarPendientes() {
    const listas = pendientes.filter(p => !p._procesando && !p._error);
    if (!listas.length) return;
    setGuardando(true);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/facturas`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ facturas: listas }),
      });
      if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.error || `Error ${r.status}`); }
      // Quitar solo los guardados, dejar pendientes con error o aún procesando
      const idsGuardados = new Set(listas.map(p => p._id));
      setPendientes(prev => prev.filter(p => !idsGuardados.has(p._id)));
      cargarFacturasTrimestre(trimestreAbierto + 1);
    } catch (e) { alert('Error guardando: ' + e.message); }
    finally { setGuardando(false); }
  }

  async function eliminarFactura(id) {
    try {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/admin/finanzas/facturas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const q = trimestreAbierto + 1;
      const key = `${anio}-${q}`;
      setFacturasPorTrimestre(prev => ({ ...prev, [key]: (prev[key] || []).filter(f => f.id !== id) }));
    } catch (e) { alert('Error: ' + e.message); }
  }

  const anios = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  if (loading) return <p style={{ color: '#52525b' }}>Cargando…</p>;
  if (err)    return <p style={{ color: '#f87171', fontSize: 13, background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px' }}>Error: {err}</p>;
  if (!datos)  return null;

  const { trimestres, anual } = datos;
  const ca = datosComp?.anual;

  const FacturaRow = ({ f, onDelete, selectable }) => {
    if (f._procesando) return (
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderBottom:'1px solid #27272a', fontSize:12 }}>
        <span style={{ color:'#52525b', fontSize:11 }}>📄</span>
        <span style={{ flex:1, color:'#71717a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.archivo_nombre}</span>
        <span style={{ color:'#f59e0b', fontSize:11, display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
          <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', border:'2px solid #f59e0b', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
          Extrayendo…
        </span>
        {onDelete && <button onClick={onDelete} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:14, padding:'0 2px', flexShrink:0 }}>✕</button>}
      </div>
    );
    if (f._error) return (
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderBottom:'1px solid #27272a', fontSize:12 }}>
        <span style={{ color:'#f87171', fontSize:11 }}>⚠️</span>
        <span style={{ flex:1, color:'#71717a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.archivo_nombre}</span>
        <span style={{ color:'#f87171', fontSize:11, flexShrink:0 }}>{f._error}</span>
        {onDelete && <button onClick={onDelete} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:14, padding:'0 2px', flexShrink:0 }}>✕</button>}
      </div>
    );
    const [hovered, setHovered] = useState(false);
    const checked = selectable && selFacturas.has(f.id);
    return (
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderBottom:'1px solid #27272a', fontSize:12, flexWrap:'wrap', background: checked ? '#1a1a2e' : 'transparent' }}>
        {selectable && (
          <input type="checkbox" checked={checked} onChange={e => {
            setSelFacturas(prev => { const s = new Set(prev); e.target.checked ? s.add(f.id) : s.delete(f.id); return s; });
          }} style={{ accentColor:'#0067FD', cursor:'pointer', flexShrink:0, opacity: hovered || checked ? 1 : 0, transition:'opacity 0.15s' }} />
        )}
        <span style={{ color:'#52525b', fontSize:11, minWidth:16 }}>📄</span>
        {f.archivo_url
          ? <button onClick={() => setFacturaViewer({ url: f.archivo_url, nombre: f.archivo_nombre })} style={{ flex:1, background:'none', border:'none', padding:0, color:'#60a5fa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:100, textAlign:'left', cursor:'pointer', fontSize:12 }} title="Ver documento">{f.archivo_nombre || '—'}</button>
          : <span style={{ flex:1, color:'#a1a1aa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:100 }}>{f.archivo_nombre || '—'}</span>
        }
        <span style={{ background: f.tipo==='ingreso' ? '#052e16' : '#1a0a0a', color: f.tipo==='ingreso' ? '#22c55e' : '#f87171', border: `1px solid ${f.tipo==='ingreso'?'#166534':'#7f1d1d'}`, borderRadius:4, padding:'1px 7px', fontSize:11, flexShrink:0 }}>
          {f.tipo === 'ingreso' ? 'Venta' : 'Compra'}
        </span>
        <span style={{ color:'#71717a', minWidth:88, flexShrink:0 }}>{f.fecha_factura || '—'}</span>
        <span style={{ color:'#d4d4d8', minWidth:60, flexShrink:0 }}>Nº {f.numero_factura || '—'}</span>
        <span style={{ color:'#71717a', minWidth:90, flexShrink:0 }}>{f.nif_cif || '—'}</span>
        <span style={{ color:'white', fontWeight:600, minWidth:75, textAlign:'right', flexShrink:0 }}>{f.importe != null ? fmt(f.importe)+' €' : '—'}</span>
        <span style={{ color:'#f59e0b', minWidth:65, textAlign:'right', flexShrink:0 }}>IVA {f.impuesto != null ? fmt(f.impuesto)+' €' : '—'}</span>
        {onDelete && <button onClick={onDelete} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', fontSize:14, padding:'0 2px', flexShrink:0 }}>✕</button>}
        {!onDelete && f.id && <button onClick={() => eliminarFactura(f.id)} style={{ background:'none', border:'none', color:'#3f3f46', cursor:'pointer', fontSize:12, padding:'0 2px', flexShrink:0 }}>🗑</button>}
      </div>
    );
  };

  return (
    <div>
      {/* Selector año */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {anios.map(a => (
          <button key={a} onClick={() => { setAnio(a); setTrimestreAbierto(null); setPendientes([]); setFacturasPorTrimestre({}); }}
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
        {(() => { const b = anual.facturacion - anual.totalGastos; const bc = ca ? ca.facturacion - ca.totalGastos : null; return <MetricCard label="Beneficio" value={fmt(b)} color={b >= 0 ? '#10b981' : '#f87171'} compValue={bc} />; })()}
        <MetricCard label="IVA repercutido" value={fmt(anual.ivaRepercutido)} color="#f59e0b" compValue={ca ? ca.ivaRepercutido : null} />
        <MetricCard label="IVA soportado"   value={fmt(anual.ivaSoportado)}   color="#f59e0b" compValue={ca ? ca.ivaSoportado : null} />
        <MetricCard label="IVA a pagar"     value={fmt(anual.ivaAPagar)}      color={anual.ivaAPagar > 0 ? '#f59e0b' : '#22c55e'} compValue={ca ? ca.ivaAPagar : null} />
        <MetricCard label="IRPF retenido"   value={fmt(anual.irpfRetenido)}   color="#8b5cf6" compValue={ca ? ca.irpfRetenido : null} />
      </div>

      {/* Por trimestre */}
      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Por trimestre</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {trimestres.map((t, i) => {
          const tc = datosComp?.trimestres?.[i];
          const abierto = trimestreAbierto === i;
          const key = `${anio}-${i+1}`;
          const facturasGuardadas = facturasPorTrimestre[key] || [];
          return (
            <div key={i} style={S.card}>
              {/* Cabecera trimestre — clickable */}
              <div onClick={() => toggleTrimestre(i)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom: abierto ? 12 : 0 }}>
                <span style={{ color:'#52525b', fontSize:11, transition:'transform 0.2s', display:'inline-block', transform: abierto ? 'rotate(90deg)' : 'none' }}>▶</span>
                <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: 0, flex:1 }}>
                  {t.label}{tc ? <span style={{ color: '#52525b', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>vs {anioComp}</span> : null}
                </p>
              </div>

              {/* Métricas fiscales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: abierto ? 16 : 0 }}>
                <FiscalMetric label="Facturación"         value={t.facturacion}                    color="#22c55e" comp={tc ? tc.facturacion : null} />
                <FiscalMetric label="Gastos"              value={t.totalGastos}                    color="#f87171" comp={tc ? tc.totalGastos : null} />
                <FiscalMetric label="Beneficio"           value={t.facturacion - t.totalGastos}    color={(t.facturacion - t.totalGastos) >= 0 ? '#10b981' : '#f87171'} comp={tc ? tc.facturacion - tc.totalGastos : null} />
                <FiscalMetric label="IVA repercutido"     value={t.ivaRepercutido}                 color="#f59e0b" comp={tc ? tc.ivaRepercutido : null} />
                <FiscalMetric label="IVA soportado"       value={t.ivaSoportado}                   color="#f59e0b" comp={tc ? tc.ivaSoportado : null} />
                <FiscalMetric label="IVA a pagar (303)"   value={t.ivaAPagar}                      color={t.ivaAPagar > 0 ? '#f59e0b' : '#22c55e'} comp={tc ? tc.ivaAPagar : null} />
                <FiscalMetric label="IRPF retenido (130)" value={t.irpfRetenido}                   color="#8b5cf6" comp={tc ? tc.irpfRetenido : null} />
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

              {/* Sección facturas (solo si abierto) */}
              {abierto && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #27272a' }}>
                  {/* Input file oculto */}
                  <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" style={{ display:'none' }}
                    onChange={e => { handleFiles(e.target.files, tipoActivo); e.target.value = ''; }} />

                  {/* Zonas de drop */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                    {[
                      { tipo:'ingreso', label:'＋ Ingresos', bg:'#052e16', border:'#166534', color:'#22c55e', bgHover:'#0a3f20' },
                      { tipo:'gasto',   label:'＋ Gastos',   bg:'#1a0a0a', border:'#7f1d1d', color:'#f87171', bgHover:'#2a0f0f' },
                    ].map(({ tipo, label, bg, border, color, bgHover }) => (
                      <div key={tipo}
                        onClick={() => { if (!extrayendo) { setTipoActivo(tipo); fileInputRef.current?.click(); } }}
                        onDragOver={e => { e.preventDefault(); setDragOver(tipo); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={e => { e.preventDefault(); setDragOver(null); if (!extrayendo) handleFiles(e.dataTransfer.files, tipo); }}
                        style={{ background: dragOver === tipo ? bgHover : bg, border: `2px dashed ${dragOver === tipo ? color : border}`, color, borderRadius:10, padding:'18px 14px', fontSize:13, cursor: extrayendo ? 'not-allowed' : 'pointer', fontWeight:600, textAlign:'center', transition:'all 0.15s', opacity: extrayendo ? 0.6 : 1 }}>
                        {extrayendo && tipoActivo === tipo ? 'Extrayendo…' : label}
                        <div style={{ fontSize:11, fontWeight:400, color: dragOver === tipo ? color : '#52525b', marginTop:4 }}>
                          {dragOver === tipo ? 'Suelta aquí' : 'Haz clic o arrastra PDFs / imágenes'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Facturas pendientes de guardar */}
                  {pendientes.length > 0 && (
                    <div style={{ background:'#0d0d0d', border:'1px solid #3f3f46', borderRadius:8, marginBottom:12, overflow:'hidden' }}>
                      <div style={{ padding:'8px 10px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        {(() => { const listos = pendientes.filter(p => !p._procesando && !p._error).length; const proc = pendientes.filter(p => p._procesando).length; return (<>
                          <span style={{ color:'#a78bfa', fontSize:12, fontWeight:600, flex:1 }}>
                            {proc > 0 ? `Procesando ${proc}…` : ''}{proc > 0 && listos > 0 ? ' · ' : ''}{listos > 0 ? `${listos} listo${listos > 1 ? 's' : ''}` : ''}
                          </span>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => setPendientes([])} disabled={guardando}
                              style={{ background:'transparent', color:'#71717a', border:'1px solid #3f3f46', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                              Cancelar
                            </button>
                            {listos > 0 && <button onClick={guardarPendientes} disabled={guardando}
                              style={{ background:'#0067FD', color:'white', border:'none', borderRadius:6, padding:'4px 14px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                              {guardando ? 'Guardando…' : `Guardar ${listos}`}
                            </button>}
                          </div>
                        </>); })()}
                      </div>
                      {pendientes.map((f, pi) => (
                        <FacturaRow key={pi} f={f} onDelete={() => setPendientes(prev => prev.filter((_,j) => j !== pi))} />
                      ))}
                    </div>
                  )}

                  {/* Facturas ya guardadas */}
                  {facturasGuardadas.length > 0 && (
                    <div style={{ background:'#0d0d0d', border:'1px solid #3f3f46', borderRadius:8, overflow:'hidden' }}>
                      <div style={{ padding:'8px 10px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:10 }}>
                        <input type="checkbox"
                          checked={facturasGuardadas.length > 0 && facturasGuardadas.every(f => selFacturas.has(f.id))}
                          onChange={e => {
                            setSelFacturas(prev => {
                              const s = new Set(prev);
                              facturasGuardadas.forEach(f => e.target.checked ? s.add(f.id) : s.delete(f.id));
                              return s;
                            });
                          }}
                          style={{ accentColor:'#0067FD', cursor:'pointer', opacity: selFacturas.size > 0 ? 1 : 0.3, transition:'opacity 0.15s' }} />
                        <span style={{ color:'#71717a', fontSize:12, fontWeight:600, flex:1 }}>Guardadas ({facturasGuardadas.length})</span>
                        {selFacturas.size > 0 && (
                          <button onClick={eliminarFacturasBulk} disabled={eliminandoBulk}
                            style={{ background:'#7f1d1d', border:'1px solid #991b1b', color:'#f87171', borderRadius:6, padding:'3px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                            {eliminandoBulk ? 'Eliminando…' : `Eliminar ${selFacturas.size}`}
                          </button>
                        )}
                      </div>
                      {facturasGuardadas.map(f => <FacturaRow key={f.id} f={f} selectable />)}
                    </div>
                  )}

                  {pendientes.length === 0 && facturasGuardadas.length === 0 && !extrayendo && (
                    <p style={{ color:'#3f3f46', fontSize:13, margin:0 }}>Sin facturas. Usa los botones para subir PDFs o imágenes.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Viewer modal */}
      {facturaViewer && createPortal(
        <div onClick={() => setFacturaViewer(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:900, height:'90vh', background:'#1a1a1a', borderRadius:12, border:'1px solid #3f3f46', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderBottom:'1px solid #27272a', flexShrink:0 }}>
              <span style={{ color:'#a1a1aa', fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{facturaViewer.nombre}</span>
              <a href={facturaViewer.url} target="_blank" rel="noreferrer" style={{ color:'#60a5fa', fontSize:12, textDecoration:'none', flexShrink:0 }}>↗ Abrir en nueva pestaña</a>
              <button onClick={() => setFacturaViewer(null)} style={{ background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 4px', flexShrink:0 }}>✕</button>
            </div>
            {/* Contenido */}
            {/\.(jpg|jpeg|png|gif|webp)$/i.test(facturaViewer.nombre)
              ? <img src={facturaViewer.url} alt={facturaViewer.nombre} style={{ flex:1, objectFit:'contain', width:'100%', height:'100%' }} />
              : <iframe src={facturaViewer.url} title={facturaViewer.nombre} style={{ flex:1, width:'100%', border:'none' }} />
            }
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Tab Nuevo: manual o desde imagen ───────────────────────────
function NuevoMovimientoTab({ onGuardado }) {
  const [modo, setModo] = useState('imagen');
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  // sections: null | [{ previewUrl, movimientos: [...], guardados: Set<number>, error? }]
  const [sections, setSections] = useState(null);
  const [pagina, setPagina] = useState(0); // página actual en el modo de revisión
  const [extrayendoIdx, setExtrayendoIdx] = useState(null); // which image is being processed
  const [guardandoKey, setGuardandoKey] = useState(null); // 'si-mi'
  const [clientesLista, setClientesLista] = useState([]);
  const [equipoLista, setEquipoLista] = useState([]);
  const inputRef = useRef(null);
  const cancelRef = useRef(false);
  const [nuevasCats, setNuevasCats] = useState({}); // { 'si-mi': texto | undefined }

  const CUENTAS_LIST = CUENTAS.map(c => c.key);

  function detectarCuentaSec(movimientos) {
    if (!movimientos.length) return 'Gastos de Operación';
    const freq = {};
    movimientos.forEach(m => { freq[m.cuenta] = (freq[m.cuenta] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  }

  function setCuentaSec(si, cuenta) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s, cuentaSec: cuenta,
      movimientos: s.movimientos.map(m => ({ ...m, cuenta })),
    }));
  }

  useEffect(() => {
    getToken().then(token => {
      fetch(`${BACKEND_URL}/admin/finanzas/clientes/lista`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setClientesLista(Array.isArray(d) ? d.map(c => ({ id: c.id, label: c.nombre + (c.nombre_empresa ? ` (${c.nombre_empresa})` : '') })) : [])).catch(() => {});
      fetch(`${BACKEND_URL}/admin/finanzas/equipo/lista`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setEquipoLista(Array.isArray(d) ? d.map(e => ({ id: e.id, label: e.nombre })) : [])).catch(() => {});
    });
  }, []);

  function onFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagenes(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setSections(null);
    e.target.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#3f3f46';
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagenes(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setSections(null);
  }

  function resetear() {
    setSections(null);
    setPagina(0);
    setImagenes([]);
    setPreviews([]);
    setDesde('');
    setHasta('');
  }

  async function extraer() {
    if (!imagenes.length) return;
    cancelRef.current = false;
    setSections([]);
    for (let i = 0; i < imagenes.length; i++) {
      if (cancelRef.current) break;
      setExtrayendoIdx(i);
      let seccion;
      try {
        const token = await getToken();
        const fd = new FormData();
        fd.append('imagenes', imagenes[i]);
        if (desde) fd.append('desde', desde);
        if (hasta) fd.append('hasta', hasta);
        const r = await fetch(`${BACKEND_URL}/admin/finanzas/extraer-imagen`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Error');
        const movimientos = (data.movements || []).map(m => ({
          nombre: m.name || '',
          fecha: m.date || new Date().toISOString().slice(0,10),
          tipo: m.type || 'Gasto',
          cuenta: m.account || 'Gastos de Operación',
          cantidad: String(m.amount_eur || ''),
          iva: m.iva || '0%',
          irpf: m.irpf || '0%',
          categorias: [], cliente_ids: [], equipo_ids: [],
          fecha_factura: '', importe_factura: '',
        }));
        const cuentaSec = detectarCuentaSec(movimientos);
        const movNorm = movimientos.map(m => ({ ...m, cuenta: cuentaSec }));
        seccion = { previewUrl: previews[i], movimientos: movNorm, guardados: new Set(), cuentaSec };
      } catch (err) {
        seccion = { previewUrl: previews[i], movimientos: [], guardados: new Set(), cuentaSec: 'Gastos de Operación', error: err.message };
      }
      // Añadir la sección al final (sin tocar las anteriores — preserva ediciones del usuario)
      setSections(prev => [...prev, seccion]);
      if (i === 0) setPagina(0); // primera imagen lista: muestra al usuario para que empiece a revisar
    }
    setExtrayendoIdx(null);
  }

  function setMovField(si, mi, key, val) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s, movimientos: s.movimientos.map((m, j) => j !== mi ? m : { ...m, [key]: val }),
    }));
  }

  function eliminarMov(si, mi) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s, movimientos: s.movimientos.filter((_, j) => j !== mi),
    }));
  }

  // Marca un movimiento como "revisado" localmente (sin guardar en BD)
  function marcarRevisado(si, mi) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s, guardados: new Set([...s.guardados, mi]),
    }));
  }

  // Reabre un movimiento ya marcado para editarlo
  function desmarcarRevisado(si, mi) {
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s, guardados: new Set([...s.guardados].filter(j => j !== mi)),
    }));
  }

  // Guarda TODOS los movimientos en BD de una vez
  async function guardarTodos() {
    if (!sections) return;
    setGuardandoKey('todos');
    try {
      const token = await getToken();
      for (let si = 0; si < sections.length; si++) {
        for (let mi = 0; mi < sections[si].movimientos.length; mi++) {
          const m = sections[si].movimientos[mi];
          if (!m.nombre || !m.cantidad) continue;
          const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimiento`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...m, cantidad: parseFloat(m.cantidad),
              fecha_factura: m.fecha_factura || null,
              importe_factura: m.importe_factura ? parseFloat(m.importe_factura) : null,
            }),
          });
          if (!r.ok) throw new Error(await r.text());
        }
      }
      fetch(`${BACKEND_URL}/admin/finanzas/completar-tracking-diario`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).then(d => {
        if (d.completadas > 0) console.log(`✅ ${d.completadas} tarea(s) "Tracking diario" marcadas en Notion`);
      }).catch(() => {});
      onGuardado();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
      setGuardandoKey(null);
    }
  }

  const totalRevisados = sections ? sections.reduce((acc, s) => acc + s.guardados.size, 0) : 0;
  const totalMovs = sections ? sections.reduce((acc, s) => acc + s.movimientos.length, 0) : 0;
  const hayMovimientos = sections && totalMovs > 0;
  const procesando = extrayendoIdx !== null;

  const btnTab = (t, label) => (
    <button type="button" onClick={() => setModo(t)}
      style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        background: modo === t ? '#0067FD' : '#27272a', color: modo === t ? 'white' : '#71717a' }}>
      {label}
    </button>
  );

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: 0, flex: 1 }}>Nuevo movimiento</h2>
        {!sections && (
          <div style={{ display: 'flex', gap: 6, background: '#1c1c1e', padding: 4, borderRadius: 10 }}>
            {btnTab('imagen', '📷 Desde imagen')}
            {btnTab('manual', '✏️ Manual')}
          </div>
        )}
      </div>

      {modo === 'manual' && (
        <FormularioMovimiento onGuardado={onGuardado} />
      )}

      {/* ── SUBIDA ── */}
      {modo === 'imagen' && !sections && (
        <div>
          {/* Rango de fechas — siempre visible y obligatorio */}
          <div style={{ marginBottom: 16, padding: 14, background: '#1c1c1e', borderRadius: 10, border: `1px solid ${(!desde || !hasta) ? '#3f3f46' : '#22c55e33'}` }}>
            <p style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Rango de fechas del extracto
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={S.label}>Desde *</label>
                <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={desde} onChange={e => setDesde(e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Hasta *</label>
                <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
              </div>
            </div>
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#0067FD'; }}
            onDragLeave={e => { e.currentTarget.style.borderColor = '#3f3f46'; }}
            onDrop={onDrop}
            style={{ border: '2px dashed #3f3f46', borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <p style={{ color: '#71717a', fontSize: 32, margin: '0 0 8px' }}>📷</p>
            <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>
              {imagenes.length > 0 ? `${imagenes.length} imagen${imagenes.length > 1 ? 'es' : ''} seleccionada${imagenes.length > 1 ? 's' : ''}` : 'Arrastra o haz clic para subir'}
            </p>
            <p style={{ color: '#52525b', fontSize: 12, margin: 0 }}>Capturas bancarias, tickets o facturas · JPG, PNG · Máx 10 MB cada una</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFileChange} style={{ display: 'none' }} />

          {imagenes.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {previews.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt={imagenes[i]?.name}
                    style={{ height: 72, width: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #3f3f46', display: 'block' }} />
                  <button type="button"
                    onClick={() => {
                      setImagenes(prev => prev.filter((_, j) => j !== i));
                      setPreviews(prev => prev.filter((_, j) => j !== i));
                    }}
                    style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#27272a', border: '1px solid #52525b', color: '#a1a1aa', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {(() => {
            const listo = imagenes.length > 0 && desde && hasta && !procesando;
            const motivo = !desde || !hasta ? 'Rellena el rango de fechas' : !imagenes.length ? 'Sube al menos una imagen' : null;
            return (
              <button type="button" onClick={listo ? extraer : undefined} disabled={!listo}
                title={motivo || ''}
                style={{ marginTop: 12, background: listo ? '#0067FD' : '#27272a', color: listo ? 'white' : '#52525b', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: listo ? 'pointer' : 'not-allowed', width: '100%' }}>
                {procesando
                  ? `⏳ Analizando imagen ${(extrayendoIdx ?? 0) + 1} de ${imagenes.length}...`
                  : motivo
                    ? `🔍 Extraer movimientos — ${motivo}`
                    : `🔍 Extraer movimientos${imagenes.length > 1 ? ` (${imagenes.length} imágenes)` : ''}`
                }
              </button>
            );
          })()}
        </div>
      )}

      {/* ── RESULTADOS (paginado por imagen) ── */}
      {modo === 'imagen' && sections !== null && (() => {
        const si = pagina;
        const sec = sections[si];
        const guardadosPagina = sec ? sec.guardados.size : 0;
        const movsPagina = sec ? sec.movimientos.length : 0;
        const hayPendientesPagina = sec && guardadosPagina < movsPagina;
        return (
          <div>
            {/* Cabecera */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              {procesando
                ? <>
                    <span style={{ color: '#facc15', fontSize: 13, fontWeight: 600 }}>⏳ Analizando imagen {(extrayendoIdx ?? 0) + 1} de {imagenes.length}...</span>
                    <button type="button" onClick={() => { cancelRef.current = true; setExtrayendoIdx(null); }}
                      style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </>
                : <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>✓ {totalMovs} movimiento{totalMovs !== 1 ? 's' : ''} de {sections.length} imagen{sections.length !== 1 ? 'es' : ''}</span>
              }
              <button type="button" onClick={resetear}
                style={{ background: 'none', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                ← Nueva imagen
              </button>
              {!procesando && hayMovimientos && (
                <button type="button" onClick={guardarTodos} disabled={guardandoKey === 'todos'}
                  style={{ marginLeft: 'auto', background: '#0067FD', color: 'white', border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: guardandoKey === 'todos' ? 'not-allowed' : 'pointer' }}>
                  {guardandoKey === 'todos' ? 'Guardando...' : `Guardar todos (${totalMovs})`}
                </button>
              )}
            </div>

            {/* Paginación */}
            {sections.length > 1 && (() => {
              const total = sections.length;
              const btnPag = (i) => {
                const guardadoTodo = sections[i] && sections[i].guardados.size === sections[i].movimientos.length && sections[i].movimientos.length > 0;
                return (
                  <button key={i} type="button" onClick={() => setPagina(i)}
                    style={{ padding: '5px 11px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                      background: i === si ? '#0067FD' : '#27272a',
                      color: i === si ? 'white' : sections[i] ? (guardadoTodo ? '#22c55e' : '#a1a1aa') : '#52525b',
                    }}>
                    {i + 1}{guardadoTodo ? ' ✓' : ''}
                  </button>
                );
              };
              // Ventana deslizante: siempre mostrar 1, ..., [si-2..si+2], ..., total
              const window = 2;
              const indices = new Set([0, total - 1]);
              for (let k = Math.max(0, si - window); k <= Math.min(total - 1, si + window); k++) indices.add(k);
              const sorted = [...indices].sort((a, b) => a - b);
              const items = [];
              sorted.forEach((idx, pos) => {
                if (pos > 0 && idx - sorted[pos - 1] > 1) {
                  items.push(<span key={`dots-${idx}`} style={{ color: '#52525b', fontSize: 12, padding: '0 2px' }}>…</span>);
                }
                items.push(btnPag(idx));
              });
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'nowrap' }}>
                  <button type="button" onClick={() => setPagina(p => Math.max(0, p - 1))} disabled={si === 0}
                    style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #3f3f46', background: 'none', color: si === 0 ? '#3f3f46' : '#a1a1aa', cursor: si === 0 ? 'default' : 'pointer', fontSize: 13, flexShrink: 0 }}>
                    ‹
                  </button>
                  {items}
                  <button type="button" onClick={() => setPagina(p => Math.min(total - 1, p + 1))} disabled={si === total - 1}
                    style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #3f3f46', background: 'none', color: si === total - 1 ? '#3f3f46' : '#a1a1aa', cursor: si === total - 1 ? 'default' : 'pointer', fontSize: 13, flexShrink: 0 }}>
                    ›
                  </button>
                </div>
              );
            })()}

            {sec && (
              <div>
                {/* Imagen */}
                <div style={{ marginBottom: 14 }}>
                  <img src={sec.previewUrl} alt={`Imagen ${si + 1}`}
                    style={{ width: '100%', maxHeight: 640, objectFit: 'contain', display: 'block', borderRadius: 10, border: '1px solid #27272a', background: '#0d0d0d' }} />
                </div>

                {/* Selector de cuenta a nivel de sección */}
                {sec.movimientos.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 14px', background: '#1c1c1e', borderRadius: 10, border: '1px solid #27272a' }}>
                    <span style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cuenta de esta imagen</span>
                    <select value={sec.cuentaSec || ''} onChange={e => setCuentaSec(si, e.target.value)}
                      style={{ ...S.input, maxWidth: 260, margin: 0 }}>
                      {CUENTAS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                {/* Error de parsing */}
                {sec.error && (
                  <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 10 }}>
                    No se pudieron extraer movimientos de esta imagen
                  </div>
                )}

                {sec.movimientos.length === 0 && !sec.error && !procesando && (
                  <p style={{ color: '#52525b', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sin movimientos detectados</p>
                )}
                {procesando && si === extrayendoIdx && sec.movimientos.length === 0 && !sec.error && (
                  <p style={{ color: '#71717a', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Analizando...</p>
                )}

                {/* Botón marcar todos de esta imagen como listos */}
                {!procesando && hayPendientesPagina && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <button type="button" onClick={() => setSections(prev => prev.map((s, i) => i !== si ? s : { ...s, guardados: new Set(s.movimientos.map((_, mi) => mi)) }))}
                      style={{ background: '#27272a', color: '#a1a1aa', border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      ✓ Marcar imagen {si + 1} como lista
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sec.movimientos.map((m, mi) => {
                    const guardado = sec.guardados.has(mi);
                    const thisKey = `${si}-${mi}`;
                    return (
                      <div key={mi} style={{ background: '#1c1c1e', borderRadius: 10, padding: 14, border: `1px solid ${guardado ? '#22c55e33' : '#27272a'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: guardado ? 0 : 12,
                          cursor: guardado ? 'pointer' : 'default' }}
                          onClick={guardado ? () => desmarcarRevisado(si, mi) : undefined}>
                          <span style={{ color: m.tipo === 'Ingreso' ? '#22c55e' : '#f87171', fontWeight: 700, fontSize: 15 }}>
                            {m.tipo === 'Ingreso' ? '+' : '-'}{m.cantidad} €
                          </span>
                          <span style={{ color: '#71717a', fontSize: 12, flex: 1 }}>{m.nombre} · {m.fecha}</span>
                          {guardado
                            ? <span style={{ color: '#22c55e', fontSize: 12 }}>✓ Listo · clic para editar</span>
                            : <>
                                <button type="button" onClick={e => { e.stopPropagation(); marcarRevisado(si, mi); }}
                                  style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                                  ✓ Listo
                                </button>
                                <button type="button" onClick={e => { e.stopPropagation(); eliminarMov(si, mi); }}
                                  style={{ background: 'none', border: 'none', color: '#52525b', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                              </>
                          }
                        </div>
                        {!guardado && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div style={{ gridColumn: '1/-1' }}>
                              <label style={S.label}>Nombre</label>
                              <input style={S.input} value={m.nombre} onChange={e => setMovField(si, mi, 'nombre', e.target.value)} />
                            </div>
                            <div>
                              <label style={S.label}>Fecha</label>
                              <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={m.fecha} onChange={e => setMovField(si, mi, 'fecha', e.target.value)} />
                            </div>
                            <div>
                              <label style={S.label}>Cantidad (€)</label>
                              <input style={S.input} type="number" step="0.01" value={m.cantidad} onChange={e => setMovField(si, mi, 'cantidad', e.target.value)} />
                            </div>
                            <div>
                              <label style={S.label}>Tipo</label>
                              <select style={S.input} value={m.tipo} onChange={e => setMovField(si, mi, 'tipo', e.target.value)}>
                                <option>Ingreso</option><option>Gasto</option>
                              </select>
                            </div>
                            <div>
                              <label style={S.label}>Cuenta</label>
                              <select style={S.input} value={m.cuenta} onChange={e => setMovField(si, mi, 'cuenta', e.target.value)}>
                                {CUENTAS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={S.label}>IVA</label>
                              <select style={S.input} value={m.iva} onChange={e => setMovField(si, mi, 'iva', e.target.value)}>
                                {['0%','4%','10%','21%'].map(v => <option key={v}>{v}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={S.label}>IRPF</label>
                              <select style={S.input} value={m.irpf} onChange={e => setMovField(si, mi, 'irpf', e.target.value)}>
                                {['0%','7%','15%','19%'].map(v => <option key={v}>{v}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={S.label}>Fecha factura</label>
                              <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={m.fecha_factura} onChange={e => setMovField(si, mi, 'fecha_factura', e.target.value)} />
                            </div>
                            <div>
                              <label style={S.label}>Importe factura (€)</label>
                              <input style={S.input} type="number" step="0.01" value={m.importe_factura} onChange={e => setMovField(si, mi, 'importe_factura', e.target.value)} />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                              <label style={S.label}>Categorías</label>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                {CATEGORIAS.map(cat => {
                                  const sel = m.categorias.includes(cat);
                                  return (
                                    <button key={cat} type="button"
                                      onClick={() => setMovField(si, mi, 'categorias', sel ? m.categorias.filter(c => c !== cat) : [...m.categorias, cat])}
                                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                                        background: sel ? '#0067FD' : '#27272a', color: sel ? 'white' : '#71717a' }}>
                                      {cat}
                                    </button>
                                  );
                                })}
                                {/* Categorías personalizadas ya añadidas */}
                                {m.categorias.filter(c => !CATEGORIAS.includes(c)).map(cat => (
                                  <button key={cat} type="button"
                                    onClick={() => setMovField(si, mi, 'categorias', m.categorias.filter(c => c !== cat))}
                                    style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid #0067FD',
                                      background: '#0067FD22', color: '#60a5fa' }}>
                                    {cat} ✕
                                  </button>
                                ))}
                                {/* Botón + nueva categoría */}
                                {nuevasCats[thisKey] !== undefined
                                  ? <input autoFocus value={nuevasCats[thisKey] || ''}
                                      onChange={e => setNuevasCats(prev => ({ ...prev, [thisKey]: e.target.value }))}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          const cat = (nuevasCats[thisKey] || '').trim();
                                          if (cat) setMovField(si, mi, 'categorias', [...m.categorias, cat]);
                                          setNuevasCats(prev => { const n = {...prev}; delete n[thisKey]; return n; });
                                        }
                                        if (e.key === 'Escape') setNuevasCats(prev => { const n = {...prev}; delete n[thisKey]; return n; });
                                      }}
                                      onBlur={() => {
                                        const cat = (nuevasCats[thisKey] || '').trim();
                                        if (cat) setMovField(si, mi, 'categorias', [...m.categorias, cat]);
                                        setNuevasCats(prev => { const n = {...prev}; delete n[thisKey]; return n; });
                                      }}
                                      placeholder="Escribe y Enter"
                                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: '#1c1c1e', border: '1px dashed #3f3f46', color: 'white', outline: 'none', width: 140 }}
                                    />
                                  : <button type="button"
                                      onClick={() => setNuevasCats(prev => ({ ...prev, [thisKey]: '' }))}
                                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px dashed #3f3f46', background: 'none', color: '#52525b' }}>
                                      + Nueva
                                    </button>
                                }
                              </div>
                            </div>
                            {clientesLista.length > 0 && (
                              <div>
                                <MultiCheckDrop label="Clientes" opciones={clientesLista} seleccionados={m.cliente_ids} onChange={val => setMovField(si, mi, 'cliente_ids', val)} />
                              </div>
                            )}
                            {equipoLista.length > 0 && (
                              <div>
                                <MultiCheckDrop label="Equipo" opciones={equipoLista} seleccionados={m.equipo_ids} onChange={val => setMovField(si, mi, 'equipo_ids', val)} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ── Celda editable inline ───────────────────────────────────────
const CUENTAS_OPTS = ['Ingresos','Impuestos','Compensación del Dueño','Gastos de Operación','Freelancers y Material','Ganancia'];

function CeldaEditable({ m, campo, onGuardar, clientesLista = [], equipoLista = [] }) {
  const [editando, setEditando] = useState(false);
  const [val, setVal] = useState(m[campo]);
  const [nuevaCat, setNuevaCat] = useState(null); // null = oculto, '' = mostrando input
  const [filtroLista, setFiltroLista] = useState('');
  const ref = useRef(null);

  useEffect(() => { if (!editando) setVal(m[campo]); }, [m[campo], editando]);

  useEffect(() => {
    if (!editando) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) confirmar(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editando, val]);

  function confirmar() {
    if (val !== m[campo]) onGuardar(m.id, campo, val);
    setEditando(false);
  }

  const esSelect = ['tipo','cuenta','iva','irpf'].includes(campo);
  const esMulti = campo === 'categorias';
  const esMultiUuid = ['cliente_ids','equipo_ids'].includes(campo);

  if (esMulti) {
    const cats = m.categorias || [];
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <div onClick={() => setEditando(o => !o)} style={{ cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: 3, minHeight: 22 }}>
          {cats.length ? cats.slice(0,2).map(c => (
            <span key={c} style={{ background: '#27272a', color: '#71717a', fontSize: 10, padding: '1px 5px', borderRadius: 3 }}>{c}</span>
          )) : <span style={{ color: '#3f3f46', fontSize: 12 }}>—</span>}
          {cats.length > 2 && <span style={{ color: '#52525b', fontSize: 10 }}>+{cats.length-2}</span>}
        </div>
        {editando && (
          <div style={{ position: 'absolute', zIndex: 400, top: '100%', left: 0, background: '#1c1c1e', border: '1px solid #3f3f46', borderRadius: 8, padding: 8, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {CATEGORIAS.map(c => {
                const sel = (val || []).includes(c);
                return (
                  <button key={c} type="button" onClick={() => setVal(prev => sel ? (prev||[]).filter(x=>x!==c) : [...(prev||[]),c])}
                    style={{ background: sel?'#0067FD':'#27272a', color: sel?'white':'#a1a1aa', border:'none', borderRadius:4, padding:'2px 7px', fontSize:11, cursor:'pointer' }}>
                    {c}
                  </button>
                );
              })}
              {/* Categorías personalizadas */}
              {(val||[]).filter(c => !CATEGORIAS.includes(c)).map(c => (
                <button key={c} type="button" onClick={() => setVal(prev => (prev||[]).filter(x=>x!==c))}
                  style={{ background:'#0067FD22', color:'#60a5fa', border:'1px solid #0067FD', borderRadius:4, padding:'2px 7px', fontSize:11, cursor:'pointer' }}>
                  {c} ✕
                </button>
              ))}
              {/* + Nueva categoría */}
              {nuevaCat !== null
                ? <input autoFocus value={nuevaCat}
                    onChange={e => setNuevaCat(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { const c = nuevaCat.trim(); if (c) setVal(prev => [...(prev||[]), c]); setNuevaCat(null); }
                      if (e.key === 'Escape') setNuevaCat(null);
                    }}
                    onBlur={() => { const c = nuevaCat.trim(); if (c) setVal(prev => [...(prev||[]), c]); setNuevaCat(null); }}
                    placeholder="Escribe y Enter"
                    style={{ padding:'2px 7px', borderRadius:4, fontSize:11, background:'#27272a', border:'1px dashed #3f3f46', color:'white', outline:'none', width:110 }}
                  />
                : <button type="button" onClick={() => setNuevaCat('')}
                    style={{ background:'none', border:'1px dashed #3f3f46', color:'#52525b', borderRadius:4, padding:'2px 7px', fontSize:11, cursor:'pointer' }}>
                    + Nueva
                  </button>
              }
            </div>
            <button onClick={confirmar} style={{ marginTop:6, background:'#0067FD', color:'white', border:'none', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer', width:'100%' }}>
              Aplicar
            </button>
          </div>
        )}
      </div>
    );
  }

  if (esMultiUuid) {
    const lista = campo === 'cliente_ids' ? clientesLista : equipoLista;
    const selIds = val || [];
    const nombres = selIds.map(id => lista.find(x => x.id === id)?.nombre || '?');
    const listaFiltrada = filtroLista.trim()
      ? lista.filter(o => o.nombre.toLowerCase().includes(filtroLista.toLowerCase()))
      : lista;
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <div onClick={() => { setEditando(o => !o); setFiltroLista(''); }} style={{ cursor:'pointer', minHeight:20 }}>
          {nombres.length ? <span style={{ color:'#d4d4d8', fontSize:12 }}>{nombres.join(', ')}</span> : <span style={{ color:'#3f3f46', fontSize:12 }}>—</span>}
        </div>
        {editando && (
          <div style={{ position:'absolute', zIndex:400, top:'100%', left:0, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, minWidth:200, boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
            <div style={{ padding:'6px 8px', borderBottom:'1px solid #27272a' }}>
              <input
                autoFocus
                value={filtroLista}
                onChange={e => setFiltroLista(e.target.value)}
                placeholder="Buscar..."
                onClick={e => e.stopPropagation()}
                style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', borderRadius:4, color:'white', fontSize:12, padding:'4px 8px', outline:'none', boxSizing:'border-box' }}
              />
            </div>
            <div style={{ maxHeight:180, overflowY:'auto' }}>
              {listaFiltrada.map(o => {
                const sel = (val||[]).includes(o.id);
                return (
                  <label key={o.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', cursor:'pointer', borderBottom:'1px solid #27272a' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#27272a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <input type="checkbox" checked={sel} onChange={() => setVal(prev => sel?(prev||[]).filter(id=>id!==o.id):[...(prev||[]),o.id])}
                      style={{ accentColor:'#0067FD', flexShrink:0 }} />
                    <span style={{ color:'#d4d4d8', fontSize:12 }}>{o.nombre}</span>
                  </label>
                );
              })}
              {listaFiltrada.length === 0 && (
                <p style={{ color:'#52525b', fontSize:12, padding:'8px 10px', margin:0 }}>Sin resultados</p>
              )}
            </div>
            <button onClick={confirmar} style={{ width:'100%', background:'#0067FD', color:'white', border:'none', borderRadius:'0 0 8px 8px', padding:'6px', fontSize:12, cursor:'pointer' }}>Aplicar</button>
          </div>
        )}
      </div>
    );
  }

  const OPTS = campo==='tipo'?['Ingreso','Gasto']:campo==='cuenta'?CUENTAS_OPTS:campo==='iva'?IVA_OPTS:IRPF_OPTS;

  if (esSelect) {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        {editando ? (
          <select autoFocus value={val} onChange={e => { setVal(e.target.value); setEditando(false); onGuardar(m.id, campo, e.target.value); }}
            onBlur={() => setEditando(false)}
            style={{ background:'#1c1c1e', border:'1px solid #0067FD', borderRadius:4, color:'white', fontSize:12, padding:'2px 4px', cursor:'pointer' }}>
            {OPTS.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <div onClick={() => { setEditando(true); setVal(m[campo]); }} style={{ cursor:'pointer' }}>
            {campo==='tipo' ? (
              <span style={{ background: val==='Ingreso'?'#14532d':'#450a0a', color: val==='Ingreso'?'#22c55e':'#f87171', borderRadius:4, padding:'2px 7px', fontSize:11, fontWeight:600 }}>{val}</span>
            ) : (
              <span style={{ color: val?'#d4d4d8':'#3f3f46', fontSize:12 }}>{val||'—'}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // text / number / date
  return editando ? (
    <input autoFocus type={campo==='cantidad'||campo==='importe_factura'?'number':campo==='fecha'||campo==='fecha_factura'?'date':'text'} value={val||''}
      onChange={e => setVal(e.target.value)}
      onBlur={confirmar}
      onKeyDown={e => { if(e.key==='Enter') confirmar(); if(e.key==='Escape') setEditando(false); }}
      style={{ background:'#1c1c1e', border:'1px solid #0067FD', borderRadius:4, color:'white', fontSize:12, padding:'2px 6px', width:'100%', colorScheme:'dark' }}
    />
  ) : (
    <div onClick={() => { setEditando(true); setVal(m[campo]); }}
      style={{ cursor:'pointer', color: m[campo]!=null&&m[campo]!==''?'#d4d4d8':'#3f3f46', fontSize:12, minHeight:20 }}>
      {campo==='cantidad'
        ? <span style={{ color: m.tipo==='Ingreso'?'#22c55e':'#f87171', fontWeight:600 }}>{m[campo]!=null ? (m.tipo==='Ingreso'?'+':'-')+fmt(Math.abs(m[campo])):''}</span>
        : campo==='importe_factura'
        ? (m[campo]!=null ? fmt(m[campo]) : '—')
        : (m[campo]||'—')}
    </div>
  );
}

// ── Tabla de movimientos ────────────────────────────────────────
function TablaMovimientos({ items, seleccionados, onToggleSel, onToggleAll, onGuardarCelda, onVerDetalle, clientesLista, equipoLista }) {
  const allSel = items.length > 0 && items.every(m => seleccionados.has(m.id));
  const someSel = !allSel && items.some(m => seleccionados.has(m.id));
  const [editNombreId, setEditNombreId] = useState(null);
  const [editNombreVal, setEditNombreVal] = useState('');
  const nombreInputRef = useRef(null);
  const [colCalcs, setColCalcs] = useState(() => { try { const v = localStorage.getItem('fin-col-calcs'); return v ? JSON.parse(v) : {}; } catch { return {}; } });
  const [openCalcKey, setOpenCalcKey] = useState(null);
  const [calcDropPos, setCalcDropPos] = useState(null);
  const [colWidths, setColWidths] = useState([]);
  const tableWrapRef = useRef(null);
  const calcBarRef = useRef(null);
  const theadRef = useRef(null);

  useEffect(() => {
    if (editNombreId && nombreInputRef.current) nombreInputRef.current.focus();
  }, [editNombreId]);

  function guardarNombre() {
    if (editNombreVal.trim() && editNombreVal !== items.find(m => m.id === editNombreId)?.nombre) {
      onGuardarCelda(editNombreId, 'nombre', editNombreVal.trim());
    }
    setEditNombreId(null);
  }

  useEffect(() => {
    if (!openCalcKey) return;
    function handler(e) {
      if (e.target.closest('.fin-calc-dropdown')) return; // clic dentro del portal
      if (calcBarRef.current && !calcBarRef.current.contains(e.target)) { setOpenCalcKey(null); setCalcDropPos(null); }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openCalcKey]);

  // Medir anchos reales de columnas del header para alinear la barra de cálculo
  useEffect(() => {
    function measure() {
      if (!theadRef.current) return;
      const ths = Array.from(theadRef.current.querySelectorAll('th'));
      if (ths.length) setColWidths(ths.map(th => th.offsetWidth));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (theadRef.current) ro.observe(theadRef.current);
    return () => ro.disconnect();
  }, []);

  function setColCalc(key, val) {
    const next = { ...colCalcs, [key]: val };
    setColCalcs(next);
    try { localStorage.setItem('fin-col-calcs', JSON.stringify(next)); } catch {}
  }

  const CALC_NUMERIC_KEYS = ['cantidad','importe_factura','base_imponible','beneficio','ivaAPagar','irpfAPagar','irpf_retenido_yo'];
  const CALC_DATE_KEYS = ['fecha','fecha_factura','created_at','updated_at'];
  const CALC_NUMERIC_OPTS = [
    { val:'sum', label:'Suma' }, { val:'average', label:'Media' }, { val:'median', label:'Mediana' },
    { val:'min', label:'Mínimo' }, { val:'max', label:'Máximo' }, { val:'range', label:'Rango' },
  ];
  const CALC_DATE_OPTS = [
    { val:'earliest', label:'Fecha más antigua' }, { val:'latest', label:'Fecha más reciente' }, { val:'date_range', label:'Rango de fechas' },
  ];
  const CALC_COMMON_OPTS = [
    { val:'none', label:'Ninguno' }, { val:'count_all', label:'Contar todo' },
    { val:'count_values', label:'Contar valores' }, { val:'count_unique', label:'Contar únicos' },
    { val:'count_empty', label:'Contar vacíos' }, { val:'count_not_empty', label:'Contar no vacíos' },
    { val:'pct_empty', label:'% vacíos' }, { val:'pct_not_empty', label:'% rellenos' },
  ];
  const CALC_SHORT = { sum:'SUMA', average:'MEDIA', median:'MEDIANA', min:'MÍN', max:'MÁX', range:'RANGO', count_all:'TOTAL', count_values:'VALORES', count_unique:'ÚNICOS', count_empty:'VACÍOS', count_not_empty:'NO VACÍOS', pct_empty:'% VACÍOS', pct_not_empty:'% RELLENOS', earliest:'MÁS ANTIGUA', latest:'MÁS RECIENTE', date_range:'RANGO FECHAS' };

  function getCalcOpts(key) {
    const none = CALC_COMMON_OPTS[0]; // { val:'none', label:'Ninguno' }
    const rest = CALC_COMMON_OPTS.slice(1);
    if (CALC_NUMERIC_KEYS.includes(key)) return [none, ...CALC_NUMERIC_OPTS, ...rest];
    if (CALC_DATE_KEYS.includes(key)) return [none, ...CALC_DATE_OPTS, ...rest];
    return CALC_COMMON_OPTS;
  }

  function calcVal(key, type) {
    if (!type || type === 'none') return null;
    const vals = items.map(m => m[key]);
    const notEmpty = v => v != null && v !== '' && !(Array.isArray(v) && v.length === 0);
    switch(type) {
      case 'count_all':       return items.length;
      case 'count_values':    return vals.filter(notEmpty).length;
      case 'count_unique':    return new Set(vals.filter(v=>v!=null).map(v=>JSON.stringify(v))).size;
      case 'count_empty':     return vals.filter(v=>!notEmpty(v)).length;
      case 'count_not_empty': return vals.filter(notEmpty).length;
      case 'pct_empty':       return items.length ? +(vals.filter(v=>!notEmpty(v)).length/items.length*100).toFixed(1) : 0;
      case 'pct_not_empty':   return items.length ? +(vals.filter(notEmpty).length/items.length*100).toFixed(1) : 0;
      case 'sum':     { const ns=vals.filter(v=>v!=null); return ns.reduce((a,b)=>a+b,0); }
      case 'average': { const ns=vals.filter(v=>v!=null); return ns.length?ns.reduce((a,b)=>a+b,0)/ns.length:null; }
      case 'median':  { const ns=vals.filter(v=>v!=null).sort((a,b)=>a-b); if(!ns.length) return null; const mid=Math.floor(ns.length/2); return ns.length%2?ns[mid]:(ns[mid-1]+ns[mid])/2; }
      case 'min':     { const ns=vals.filter(v=>v!=null); return ns.length?Math.min(...ns):null; }
      case 'max':     { const ns=vals.filter(v=>v!=null); return ns.length?Math.max(...ns):null; }
      case 'range':   { const ns=vals.filter(v=>v!=null); return ns.length?Math.max(...ns)-Math.min(...ns):null; }
      case 'earliest':   { const ds=vals.filter(v=>v).sort(); return ds.length?ds[0].slice(0,10):null; }
      case 'latest':     { const ds=vals.filter(v=>v).sort(); return ds.length?ds[ds.length-1].slice(0,10):null; }
      case 'date_range': { const ds=vals.filter(v=>v).sort(); if(ds.length<2) return null; return Math.round((new Date(ds[ds.length-1])-new Date(ds[0]))/864e5)+' días'; }
      default: return null;
    }
  }

  function fmtCalc(key, type, val) {
    if (val == null) return null;
    if (['pct_empty','pct_not_empty'].includes(type)) return val + '%';
    if (['count_all','count_values','count_unique','count_empty','count_not_empty'].includes(type)) return String(val);
    if (CALC_NUMERIC_KEYS.includes(key)) return fmt(val);
    return String(val);
  }

  const COLS = [
    { key:'fecha',            label:'Fecha',          w:95 },
    { key:'nombre',           label:'Nombre',         flex:1 },
    { key:'cantidad',         label:'Cantidad',       w:90 },
    { key:'tipo',             label:'Tipo',           w:80 },
    { key:'cuenta',           label:'Cuenta',         w:160 },
    { key:'iva',              label:'IVA',            w:55 },
    { key:'irpf',             label:'IRPF',           w:55 },
    { key:'categorias',       label:'Categorías',     w:150 },
    { key:'cliente_ids',      label:'Clientes',       w:130 },
    { key:'equipo_ids',       label:'Equipo',         w:120 },
    { key:'fecha_factura',    label:'F. Factura',     w:100 },
    { key:'importe_factura',  label:'Imp. s/Factura', w:110 },
    { key:'base_imponible',   label:'Base Impon.',    w:95,  readonly:true },
    { key:'beneficio',        label:'Beneficio',      w:90,  readonly:true },
    { key:'ivaAPagar',        label:'IVA a Pagar',    w:90,  readonly:true },
    { key:'irpfAPagar',       label:'IRPF a Pagar',   w:95,  readonly:true },
    { key:'irpf_retenido_yo', label:'IRPF Ret.',      w:80,  readonly:true },
    { key:'created_at',       label:'Creado',         w:100, readonly:'date' },
    { key:'updated_at',       label:'Modificado',     w:100, readonly:'date' },
  ];
  function calcColMinW(col) {
    const type = colCalcs[col.key];
    if (!type || type === 'none') return col.w || 80;
    if (['sum','average','median','min','max','range'].includes(type)) return Math.max(col.w||0, 155);
    if (['earliest','latest','date_range'].includes(type)) return Math.max(col.w||0, 165);
    if (['pct_empty','pct_not_empty'].includes(type)) return Math.max(col.w||0, 115);
    return Math.max(col.w||0, 100); // count types
  }

  const th = { padding:'8px 10px', color:'#52525b', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #27272a', whiteSpace:'nowrap', textAlign:'left' };
  const td = { padding:'6px 10px', borderBottom:'1px solid #1c1c1e', verticalAlign:'middle', whiteSpace:'nowrap' };

  const haySeleccionados = items.some(m => seleccionados.has(m.id));
  // Ancho mínimo compartido entre tabla y barra de cálculo para alinear columnas
  const tblMinW = 36 + COLS.reduce((s, c) => s + (c.w || 150), 0);
  return (
    <div>
      <style>{`
        .fin-tabla-row .fin-cb { opacity:0; transition:opacity 0.1s; }
        .fin-tabla-row:hover .fin-cb { opacity:1; }
        .fin-tabla-row .fin-cb.checked { opacity:1; }
        .fin-tabla-row .fin-nombre-btn { opacity:0; transition:opacity 0.1s; }
        .fin-tabla-row:hover .fin-nombre-btn { opacity:1; }
        .fin-calc-btn:hover span { opacity:0.7; }
        .fin-calc-bar::-webkit-scrollbar { display:none; }
        .fin-calc-bar { scrollbar-width:none; }
      `}</style>
      <div ref={tableWrapRef} style={{ overflowX:'auto' }}
        onScroll={e => { if(calcBarRef.current) calcBarRef.current.scrollLeft = e.currentTarget.scrollLeft; }}>
        <table style={{ width:'100%', minWidth:tblMinW, borderCollapse:'collapse', fontSize:13 }}>
          <thead ref={theadRef}>
            <tr>
              <th style={{ ...th, width:36, paddingRight:0 }}>
                {haySeleccionados && (
                  <input type="checkbox" checked={allSel} ref={el => { if(el) el.indeterminate=someSel; }}
                    onChange={() => onToggleAll(items, allSel)} style={{ accentColor:'#0067FD', cursor:'pointer' }} />
                )}
              </th>
              {COLS.map(col => <th key={col.key} style={{ ...th, width:col.w, minWidth:calcColMinW(col) }}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map(m => {
              const sel = seleccionados.has(m.id);
              return (
                <tr key={m.id} className="fin-tabla-row" style={{ background: sel?'#1e293b':'transparent' }}
                  onMouseEnter={e => { if(!sel) e.currentTarget.style.background='#1c1c1e'; }}
                  onMouseLeave={e => { e.currentTarget.style.background=sel?'#1e293b':'transparent'; }}>
                  <td style={{ ...td, width:36, paddingRight:0 }}>
                    <input type="checkbox" checked={sel} onChange={() => onToggleSel(m.id)}
                      className={`fin-cb${sel?' checked':''}`}
                      style={{ accentColor:'#0067FD', cursor:'pointer' }} />
                  </td>
                  {COLS.map(col => (
                    <td key={col.key} style={{ ...td, width:col.w, maxWidth:col.flex?260:col.w, overflow:col.flex?'hidden':undefined }}>
                      {col.key==='nombre' ? (
                        editNombreId === m.id ? (
                          <input ref={nombreInputRef} value={editNombreVal}
                            onChange={e => setEditNombreVal(e.target.value)}
                            onBlur={guardarNombre}
                            onKeyDown={e => { if(e.key==='Enter') guardarNombre(); if(e.key==='Escape') setEditNombreId(null); }}
                            style={{ background:'#27272a', border:'1px solid #0067FD', borderRadius:4, color:'white', fontSize:13, padding:'2px 6px', width:'100%', outline:'none' }} />
                        ) : (
                          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <span onClick={() => onVerDetalle(m.id)} style={{ color:'#d4d4d8', fontSize:13, cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}
                              onMouseEnter={e=>e.target.style.color='#0067FD'} onMouseLeave={e=>e.target.style.color='#d4d4d8'}>
                              {m.nombre}
                            </span>
                            <button className="fin-nombre-btn" onClick={e => { e.stopPropagation(); setEditNombreId(m.id); setEditNombreVal(m.nombre); }}
                              style={{ background:'none', border:'none', cursor:'pointer', color:'#71717a', padding:'0 2px', lineHeight:1, flexShrink:0, display:'flex', alignItems:'center' }}
                              title="Editar nombre">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          </div>
                        )
                      ) : col.readonly === 'date' ? (
                        <span style={{ color:'#71717a', fontSize:12, fontFamily:'monospace' }}>
                          {m[col.key] ? m[col.key].slice(0,10) : '—'}
                        </span>
                      ) : col.readonly ? (
                        <span style={{ color: m[col.key] < 0 ? '#f87171' : m[col.key] > 0 ? '#4ade80' : '#52525b', fontSize:13 }}>
                          {m[col.key] != null ? (m[col.key] > 0 ? '+' : '') + fmt(m[col.key]) : '—'}
                        </span>
                      ) : (
                        <CeldaEditable m={m} campo={col.key} onGuardar={onGuardarCelda} clientesLista={clientesLista} equipoLista={equipoLista} />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Barra de cálculo — fuera del overflow-x para que position:sticky funcione respecto al viewport */}
      <div ref={calcBarRef} className="fin-calc-bar"
        style={{ position:'sticky', bottom:0, zIndex:20, overflowX:'auto', background:'#0d0d0d', borderTop:'2px solid #27272a' }}
        onScroll={e => { if(tableWrapRef.current) tableWrapRef.current.scrollLeft = e.currentTarget.scrollLeft; }}>
        <div style={{ display:'flex' }}>
          {/* celda checkbox — mismo ancho que th[0] medido */}
          <div style={{ width: colWidths[0] || 36, flexShrink:0 }} />
          {COLS.map((col, i) => {
            const w = colWidths[i + 1];
            const calcType = colCalcs[col.key];
            const result = calcType && calcType !== 'none' ? calcVal(col.key, calcType) : null;
            const formatted = result != null ? fmtCalc(col.key, calcType, result) : null;
            const isOpen = openCalcKey === col.key;
            const opts = getCalcOpts(col.key);
            return (
              <div key={col.key} style={{ width: w || col.w || 80, flexShrink:0, padding:'5px 10px', boxSizing:'border-box' }}>
                <button className="fin-calc-btn"
                  onClick={e => {
                    if (isOpen) { setOpenCalcKey(null); setCalcDropPos(null); return; }
                    const rect = e.currentTarget.getBoundingClientRect();
                    setCalcDropPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left });
                    setOpenCalcKey(col.key);
                  }}
                  style={{ background:'none', border:'none', cursor:'pointer', padding:0, fontWeight:600, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
                  {formatted ? (
                    <>
                      <span style={{ color:'#52525b', fontSize:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>{CALC_SHORT[calcType]}</span>
                      <span style={{ color:'#d4d4d8', fontSize:12 }}>{formatted}</span>
                    </>
                  ) : (
                    <span style={{ color:'#3f3f46', fontSize:11 }}>Calcular</span>
                  )}
                </button>
                {isOpen && calcDropPos && createPortal(
                  <div className="fin-calc-dropdown" style={{ position:'fixed', bottom:calcDropPos.bottom, left:calcDropPos.left, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, padding:'4px', zIndex:9999, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.7)' }}>
                    {opts.map(opt => (
                      <button key={opt.val} onClick={() => { setColCalc(col.key, opt.val); setOpenCalcKey(null); setCalcDropPos(null); }}
                        style={{ display:'block', width:'100%', textAlign:'left', background:calcType===opt.val?'#27272a':'transparent', border:'none', color:calcType===opt.val?'#fff':'#a1a1aa', fontSize:12, padding:'6px 10px', borderRadius:4, cursor:'pointer' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
            );
          })}
        </div>
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
  const [zoomEvol, setZoomEvol] = useState(0);
  const [zoomCuenta, setZoomCuenta] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clienteAbierto, setClienteAbierto] = useState(null);
  const [equipo, setEquipo] = useState([]);
  const [loadingEquipo, setLoadingEquipo] = useState(false);
  const [syncingEquipo, setSyncingEquipo] = useState(false);
  const [equipoAbierto, setEquipoAbierto] = useState(null);
  const [equipoBusqueda, setEquipoBusqueda] = useState('');
  const [equipoSort, setEquipoSort] = useState({ campo: 'beneficio', dir: 'asc' });
  const [movFiltroTipo, setMovFiltroTipo] = useState('todos');
  const [movPagina, setMovPagina] = useState(1);
  const [movPorPagina, setMovPorPagina] = useState(10);
  const [movBusqueda, setMovBusqueda] = useState('');
  const [syncingClientes, setSyncingClientes] = useState(false);
  const [clienteSort, setClienteSort] = useState({ campo: 'beneficio', dir: 'desc' });
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [evolHidden, setEvolHidden] = useState({});
  const [catHidden, setCatHidden] = useState({});
  const [ctaHidden, setCtaHidden] = useState({});
  const toggleEvol = k => setEvolHidden(h => ({ ...h, [k]: !h[k] }));
  const toggleCat  = k => setCatHidden(h  => ({ ...h, [k]: !h[k] }));
  const toggleCta  = k => setCtaHidden(h  => ({ ...h, [k]: !h[k] }));
  const scrollEvolRef = useRef(null);
  const xAxisEvolRef  = useRef(null);
  const scrollCtaRef  = useRef(null);
  const xAxisCtaRef   = useRef(null);
  const [movimientos, setMovimientos] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loadingDash, setLoadingDash] = useState(true);
  const [loadingMovs, setLoadingMovs] = useState(true);
  const [errDash, setErrDash] = useState(null);
  const [errMovs, setErrMovs] = useState(null);
  const [movFiltros, setMovFiltros]     = useState([]);
  const [movFiltroOp, setMovFiltroOp]   = useState('and');
  const [movSorts, setMovSorts]         = useState([]);
  const [panelFiltro, setPanelFiltro]   = useState(false);
  const [panelOrdenar, setPanelOrdenar] = useState(false);
  const [pagMovs, setPagMovs] = useState(1);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [movEditando, setMovEditando] = useState(null);
  const [movDetail, setMovDetail] = useState(null);
  const [dashComp, setDashComp] = useState(null);
  const [loadingComp, setLoadingComp] = useState(false);
  const [errComp, setErrComp] = useState(null);
  const [sinMovimientosMes, setSinMovimientosMes] = useState(false);
  const [filtroClientesLista, setFiltroClientesLista] = useState([]);
  const [filtroEquipoLista, setFiltroEquipoLista] = useState([]);
  const [vistaMovs, setVistaMovs] = useState(() => lsGet('fin_vista', 'lista'));
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [selTodos, setSelTodos] = useState(false); // todos los del filtro seleccionados
  const [cargandoTodos, setCargandoTodos] = useState(false);
  const [bulkCampo, setBulkCampo] = useState(null);
  const [bulkValor, setBulkValor] = useState('');
  const [bulkValorMulti, setBulkValorMulti] = useState([]); // para cliente_ids / equipo_ids
  const [bulkFiltroLista, setBulkFiltroLista] = useState('');
  const [movLimit, setMovLimit] = useState(() => lsGet('fin_limit', 50));
  const [confirmDialog, setConfirmDialog] = useState(null); // { texto, onOk }

  // Cargar listas para filtros (una vez al montar)
  useEffect(() => {
    getToken().then(token => {
      const h = { Authorization: `Bearer ${token}` };
      fetch(`${BACKEND_URL}/admin/finanzas/clientes/lista`, { headers: h })
        .then(r => r.json()).then(d => setFiltroClientesLista(Array.isArray(d) ? d : [])).catch(() => {});
      fetch(`${BACKEND_URL}/admin/finanzas/equipo/lista`, { headers: h })
        .then(r => r.json()).then(d => setFiltroEquipoLista(Array.isArray(d) ? d : [])).catch(() => {});
    });
  }, []);

  // Persistir en localStorage cuando cambian
  useEffect(() => { lsSet('fin_desde', desde); }, [desde]);
  useEffect(() => { lsSet('fin_hasta', hasta); }, [hasta]);
  useEffect(() => { lsSet('fin_tab', tab); }, [tab]);
  useEffect(() => { lsSet('fin_comparar', comparar); }, [comparar]);
  useEffect(() => { lsSet('fin_desdeComp', desdeComp); }, [desdeComp]);
  useEffect(() => { lsSet('fin_hastaComp', hastaComp); }, [hastaComp]);

  async function abrirDetalle(id) {
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      if (r.ok) setMovDetail(data);
    } catch (e) { console.error(e); }
  }

  async function guardarCeldaInline(id, campo, valor) {
    try {
      const token = await getToken();
      const body = { [campo]: campo === 'cantidad' ? parseFloat(valor) : valor };
      const res = await fetch(`${BACKEND_URL}/admin/finanzas/movimiento/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
      }
      const json = await res.json();
      const m = json.movimiento;
      if (m) {
        const fila = {
          id: m.id, notion_id: m.notion_id, nombre: m.nombre, fecha: m.fecha,
          tipo: m.tipo, cuenta: m.cuenta, cantidad: m.cantidad, iva: m.iva, irpf: m.irpf,
          ivaAPagar: m.iva_a_pagar, irpfAPagar: m.irpf_a_pagar, beneficio: m.beneficio,
          categorias: m.categorias || [], fecha_factura: m.fecha_factura || null,
          importe_factura: m.importe_factura ?? null, base_imponible: m.base_imponible ?? null,
          irpf_retenido_yo: m.irpf_retenido_yo ?? null, cliente_ids: m.cliente_ids || [],
          equipo_ids: m.equipo_ids || [], created_at: m.created_at, updated_at: m.updated_at,
        };
        setMovimientos(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? fila : i) }));
        cargarDashboard();
        cargarEquipo();
      }
    } catch (err) {
      alert('Error al guardar: ' + err.message);
      cargarMovimientos(pagMovs);
    }
  }

  async function eliminarBulk() {
    if (!seleccionados.size) return;
    setConfirmDialog({
      texto: `¿Eliminar ${seleccionados.size} movimiento${seleccionados.size>1?'s':''}?`,
      onOk: async () => {
        const ids = [...seleccionados];
        const token = await getToken();
        await fetch(`${BACKEND_URL}/admin/finanzas/movimientos/bulk-delete`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });
        setMovimientos(prev => ({ ...prev, items: prev.items.filter(m => !ids.includes(m.id)), total: prev.total - ids.length }));
        setSeleccionados(new Set());
        cargarDashboard();
      },
    });
  }

  async function editarBulk(campo, valor) {
    if (!seleccionados.size || !valor) return;
    const ids = [...seleccionados];
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos/bulk-edit`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, updates: { [campo]: valor } }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
      }
      setBulkCampo(null);
      setBulkValor('');
      cargarMovimientos(pagMovs);
      cargarDashboard();
      cargarEquipo();
    } catch (err) {
      alert('Error al editar en bloque: ' + err.message);
    }
  }

  function toggleSel(id) { setSelTodos(false); setSeleccionados(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; }); }
  function toggleAll(items, allSel) {
    setSelTodos(false);
    setSeleccionados(prev => {
      const s = new Set(prev);
      if (allSel) items.forEach(m => s.delete(m.id));
      else items.forEach(m => s.add(m.id));
      return s;
    });
  }

  async function seleccionarTodosLosMovimientos() {
    setCargandoTodos(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({ limit: 99999, page: 1 });
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      if (movFiltros.length) params.set('filtros', JSON.stringify(movFiltros));
      if (movFiltroOp) params.set('filtroOp', movFiltroOp);
      if (movSorts.length) params.set('sorts', JSON.stringify(movSorts));
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      const ids = (data.items || []).map(m => m.id);
      setSeleccionados(new Set(ids));
      setSelTodos(true);
    } catch (e) { console.error(e); }
    finally { setCargandoTodos(false); }
  }

  async function eliminarMovimiento(id) {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/finanzas/movimiento/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
      }
      setMovimientos(prev => ({ ...prev, items: prev.items.filter(m => m.id !== id), total: prev.total - 1 }));
      cargarDashboard();
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    }
  }

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

  const cargarMovimientos = useCallback(async (page = 1, todos = false, limit = movLimit, busqueda = '') => {
    setLoadingMovs(true);
    setErrMovs(null);
    try {
      const token = await getToken();
      const params = new URLSearchParams({ desde, hasta, page });
      if (todos) params.set('todos', '1');
      else params.set('limit', String(limit));
      if (busqueda) params.set('busqueda', busqueda);
      const filtrosValidos = movFiltros.filter(f => {
        if (!f.campo || !f.operador) return false;
        if (['is_null','is_not_null'].includes(f.operador)) return true;
        if (Array.isArray(f.valor)) return f.valor.length > 0;
        return f.valor !== '';
      });
      if (filtrosValidos.length > 0) {
        params.set('filters', JSON.stringify(filtrosValidos.map(({ campo, operador, valor }) => ({ campo, operador, valor }))));
        params.set('filterOp', movFiltroOp);
      }
      if (movSorts.length > 0) params.set('sorts', JSON.stringify(movSorts));
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
  }, [desde, hasta, movFiltros, movFiltroOp, movSorts, movLimit]);

  useEffect(() => { cargarDashboard(); }, [cargarDashboard]);

  // Búsqueda server-side con debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => { setPagMovs(1); cargarMovimientos(1, mostrarTodos, movLimit, movBusqueda.trim()); }, 300);
    return () => clearTimeout(t);
  }, [movBusqueda]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const cargarClientes = useCallback(async () => {
    setLoadingClientes(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/clientes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      setClientes(data.clientes || []);
    } catch (e) {
      console.error('Error cargando clientes:', e);
    } finally {
      setLoadingClientes(false);
    }
  }, [desde, hasta]);

  useEffect(() => { if (tab === 'clientes') cargarClientes(); }, [tab, cargarClientes]);

  const cargarEquipo = useCallback(async () => {
    setLoadingEquipo(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/equipo?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      setEquipo(data.equipo || []);
    } catch (e) {
      console.error('Error cargando equipo:', e);
    } finally {
      setLoadingEquipo(false);
    }
  }, [desde, hasta]);

  useEffect(() => { if (tab === 'equipo') cargarEquipo(); }, [tab, cargarEquipo]);

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
          onGuardado={(data) => {
            if (data && movEditando) {
              setMovimientos(prev => ({
                ...prev,
                items: prev.items.map(m => m.id === movEditando.id ? { ...m, ...data } : m),
              }));
            }
            cargarMovimientos(pagMovs);
            cargarDashboard();
          }}
          onCerrar={() => setMovEditando(null)}
        />
      )}

      {/* Modal detalle */}
      {movDetail && (
        <ModalMovimiento
          m={movDetail}
          onClose={() => setMovDetail(null)}
          onEditar={m => { setMovDetail(null); setMovEditando(m); }}
          onEliminar={id => { setMovDetail(null); eliminarMovimiento(id); }}
          onConfirm={setConfirmDialog}
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
        <button style={tabStyle('clientes')}    onClick={() => setTab('clientes')}>Clientes</button>
        <button style={tabStyle('equipo')}      onClick={() => setTab('equipo')}>Equipo</button>
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
                const numBars1 = dashComp ? 6 : 3;
                const barW = gran === 'dia'
                  ? Math.max(1, Math.min(dashComp ? 10 : 20, Math.floor(600 / (d.evolucionMensual.length * numBars1))))
                  : gran === 'anio' ? (dashComp ? 18 : 36) : (dashComp ? 9 : 18);

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
                  </>
                );
                // Zoom: calcular dominio Y para sincronizar eje fijo y gráfica scrollable
                const evolYVals = evolData.flatMap(e => [e.ingresos||0, e.gastos||0, e.beneficio||0, e.ingresosAnt||0, e.gastosAnt||0, e.beneficioAnt||0]);
                const evolYMin = Math.min(0, ...evolYVals);
                const evolYMax = Math.max(0, ...evolYVals);
                const evolYPad = Math.max((evolYMax - evolYMin) * 0.08, 10);
                const evolDomain = [Math.floor(evolYMin - evolYPad), Math.ceil(evolYMax + evolYPad)];
                const evolTicks = (() => {
                  const [lo, hi] = evolDomain;
                  return Array.from({ length: 5 }, (_, i) => Math.round(lo + (hi - lo) * i / 4));
                })();
                const EVOL_Y_W = 52;
                const pxPerPtEvol = zoomEvol === 1 ? 50 : 100;
                const zWidthEvol = Math.max(900, evolData.length * pxPerPtEvol);
                const zBarWEvol = zoomEvol === 2 ? (dashComp ? 22 : 32) : (dashComp ? 14 : 20);
                const zIntervalEvol = Math.max(0, Math.floor(evolData.length / 15));
                const ZOOM_H    = 200;
                const ZOOM_XH   = 30;
                const ZOOM_M    = { top: 5, right: 10, left: 0, bottom: 5 };
                const ZOOM_MX   = { top: 0, right: 10, left: 0, bottom: 5 };

                const evolLegendItems = [
                  { name: 'Ingresos', color: '#22c55e' }, { name: 'Gastos', color: '#f87171' }, { name: 'Beneficio', color: '#60a5fa' },
                  ...(dashComp ? [{ name: 'Ingresos ant.', color: '#166534' }, { name: 'Gastos ant.', color: '#991b1b' }, { name: 'Beneficio ant.', color: '#1d4ed8' }] : []),
                ];

                const evolBars = () => (<>
                  <Bar dataKey="ingresos"    name="Ingresos"      fill="#22c55e" radius={[4,4,0,0]} hide={!!evolHidden['ingresos']} />
                  <Bar dataKey="gastos"      name="Gastos"        fill="#f87171" radius={[4,4,0,0]} hide={!!evolHidden['gastos']} />
                  <Bar dataKey="beneficio"   name="Beneficio"     fill="#60a5fa" radius={[4,4,0,0]} hide={!!evolHidden['beneficio']} />
                  {dashComp && <Bar dataKey="ingresosAnt"  name="Ingresos ant."  fill="#166534" radius={[3,3,0,0]} hide={!!evolHidden['ingresos']} />}
                  {dashComp && <Bar dataKey="gastosAnt"    name="Gastos ant."    fill="#991b1b" radius={[3,3,0,0]} hide={!!evolHidden['gastos']} />}
                  {dashComp && <Bar dataKey="beneficioAnt" name="Beneficio ant." fill="#1d4ed8" radius={[3,3,0,0]} hide={!!evolHidden['beneficio']} />}
                </>);
                const evolLines = (<>
                  <Line dataKey="ingresos"    name="Ingresos"      stroke="#22c55e" strokeWidth={2} dot={false} connectNulls hide={!!evolHidden['ingresos']} />
                  <Line dataKey="gastos"      name="Gastos"        stroke="#f87171" strokeWidth={2} dot={false} connectNulls hide={!!evolHidden['gastos']} />
                  <Line dataKey="beneficio"   name="Beneficio"     stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls hide={!!evolHidden['beneficio']} />
                  {dashComp && <Line dataKey="ingresosAnt"  name="Ingresos ant."  stroke="#166534" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls hide={!!evolHidden['ingresos']} />}
                  {dashComp && <Line dataKey="gastosAnt"    name="Gastos ant."    stroke="#991b1b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls hide={!!evolHidden['gastos']} />}
                  {dashComp && <Line dataKey="beneficioAnt" name="Beneficio ant." stroke="#1d4ed8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls hide={!!evolHidden['beneficio']} />}
                </>);

                // Ejes del modo zoom: XAxis fuera del chart (scroll sincronizado), sin Legend
                const zoomedAxesEvol = (<>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mes" hide />
                  <YAxis hide domain={evolDomain} ticks={evolTicks} />
                  <Tooltip content={evolTooltip} />
                </>);

                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Evolución</h2>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[[0,'Auto'],[1,'×1'],[2,'×2']].map(([v, label]) => (
                          <button key={v} onClick={() => setZoomEvol(v)} style={{ background: zoomEvol === v ? (v === 0 ? '#27272a' : '#0067FD') : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: zoomEvol === v ? '#fff' : '#71717a', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>{label}</button>
                        ))}
                        <div style={{ width: 1, background: '#3f3f46', margin: '0 2px' }} />
                        {[['barras','Barras'],['lineas','Líneas']].map(([v, label]) => (
                          <button key={v} onClick={() => setViewEvol(v)} style={{ background: viewEvol === v ? '#27272a' : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: viewEvol === v ? '#fff' : '#71717a', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ ...S.card, marginBottom: 24, padding: '16px 8px' }}>
                      {zoomEvol > 0 ? (
                        <>
                          {/* Leyenda fuera del chart para no afectar la altura del área */}
                          <CheckLegend
                            items={[{key:'ingresos',name:'Ingresos',color:'#22c55e'},{key:'gastos',name:'Gastos',color:'#f87171'},{key:'beneficio',name:'Beneficio',color:'#60a5fa'}]}
                            hidden={evolHidden} onToggle={toggleEvol}
                            style={{ marginBottom: 6, paddingLeft: EVOL_Y_W + 4 }}
                          />
                          <div style={{ display: 'flex' }}>
                            {/* Eje Y fijo: labels HTML con posición matemática exacta */}
                            <div style={{ width: EVOL_Y_W, flexShrink: 0, position: 'relative', height: ZOOM_H }}>
                              {evolTicks.map(v => {
                                const frac = (v - evolDomain[0]) / (evolDomain[1] - evolDomain[0]);
                                const y = ZOOM_M.top + (ZOOM_H - ZOOM_M.top - ZOOM_M.bottom) * (1 - frac);
                                return (
                                  <div key={v} style={{ position: 'absolute', top: y, left: 0, right: 4, fontSize: 11, color: '#71717a', textAlign: 'right', lineHeight: 1, transform: 'translateY(-50%)' }}>
                                    {fmtY(v)}
                                  </div>
                                );
                              })}
                            </div>
                            {/* Área scrollable: solo barras, sin XAxis */}
                            <div ref={scrollEvolRef} style={{ flex: 1, overflowX: 'auto' }}
                              onScroll={e => { if (xAxisEvolRef.current) xAxisEvolRef.current.scrollLeft = e.target.scrollLeft; }}>
                              {viewEvol === 'barras' ? (
                                <BarChart width={zWidthEvol} height={ZOOM_H} data={evolData} barSize={zBarWEvol} margin={ZOOM_M}>
                                  {zoomedAxesEvol}{evolBars()}
                                </BarChart>
                              ) : (
                                <LineChart width={zWidthEvol} height={ZOOM_H} data={evolData} margin={ZOOM_M}>
                                  {zoomedAxesEvol}{evolLines}
                                </LineChart>
                              )}
                            </div>
                          </div>
                          {/* Eje X fijo: scroll sincronizado con las barras */}
                          <div style={{ display: 'flex' }}>
                            <div style={{ width: EVOL_Y_W, flexShrink: 0 }} />
                            <div ref={xAxisEvolRef} style={{ flex: 1, overflowX: 'hidden', pointerEvents: 'none' }}>
                              <BarChart width={zWidthEvol} height={ZOOM_XH} data={evolData} margin={ZOOM_MX}>
                                <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} interval={zIntervalEvol} tickFormatter={fmtEjeLabel} />
                              </BarChart>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckLegend
                            items={[{key:'ingresos',name:'Ingresos',color:'#22c55e'},{key:'gastos',name:'Gastos',color:'#f87171'},{key:'beneficio',name:'Beneficio',color:'#60a5fa'}]}
                            hidden={evolHidden} onToggle={toggleEvol}
                            style={{ marginBottom: 8, paddingLeft: 8 }}
                          />
                          <ResponsiveContainer width="100%" height={200}>
                            {viewEvol === 'barras' ? (
                              <BarChart barSize={barW} data={evolData}>
                                {evolAxes}{evolBars()}
                              </BarChart>
                            ) : (
                              <LineChart data={evolData}>
                                {evolAxes}{evolLines}
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        </>
                      )}
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
                        <CheckLegend
                          items={cats.map((cat, i) => ({ key: cat, name: cat, color: ROJOS[i % ROJOS.length] }))}
                          hidden={catHidden} onToggle={toggleCat}
                          style={{ marginBottom: 8, paddingLeft: 8 }}
                        />
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
                            {cats.map((cat, i) => (
                              <Line key={cat} type="monotone" dataKey={cat} name={cat}
                                stroke={ROJOS[i % ROJOS.length]} strokeWidth={2} dot={false} connectNulls hide={!!catHidden[cat]} />
                            ))}
                            {dashComp && cats.map((cat, i) => (
                              <Line key={cat + 'Ant'} type="monotone" dataKey={cat + 'Ant'} name={cat + ' ant.'}
                                stroke={ROJOS[i % ROJOS.length]} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} dot={false} connectNulls legendType="none" hide={!!catHidden[cat]} />
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
                const numBars3 = dashComp ? 12 : 6;
                const barW = gran === 'dia'
                  ? Math.max(1, Math.min(dashComp ? 6 : 12, Math.floor(600 / (d.evolucionPorCuenta.datos.length * numBars3))))
                  : gran === 'anio' ? (dashComp ? 12 : 24) : (dashComp ? 6 : 12);

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
                  </>
                );

                // Zoom cuentas
                const ctaYVals = ctaData.flatMap(e => cuentas.flatMap(c => [e[c]||0, e[c+'Ant']||0]));
                const ctaYMin = Math.min(0, ...ctaYVals);
                const ctaYMax = Math.max(0, ...ctaYVals);
                const ctaYPad = Math.max((ctaYMax - ctaYMin) * 0.08, 10);
                const ctaDomain = [Math.floor(ctaYMin - ctaYPad), Math.ceil(ctaYMax + ctaYPad)];
                const ctaTicks = (() => {
                  const [lo, hi] = ctaDomain;
                  return Array.from({ length: 5 }, (_, i) => Math.round(lo + (hi - lo) * i / 4));
                })();
                const CTA_Y_W = 52;
                const pxPerPtCta = zoomCuenta === 1 ? 70 : 140;
                const zWidthCta = Math.max(900, ctaData.length * pxPerPtCta);
                const zBarWCta = zoomCuenta === 2 ? (dashComp ? 12 : 18) : (dashComp ? 8 : 14);
                const zIntervalCta = Math.max(0, Math.floor(ctaData.length / 15));
                const CTA_H  = 220;
                const CTA_XH = 30;
                const CTA_M  = { top: 5, right: 10, left: 0, bottom: 5 };
                const CTA_MX = { top: 0, right: 10, left: 0, bottom: 5 };

                const ctaLegendItems = cuentas.map(c => ({ name: CUENTA_LABELS[c], color: CUENTA_COLORS[c] }));

                const zoomedAxesCta = (<>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="periodo" hide />
                  <YAxis hide domain={ctaDomain} ticks={ctaTicks} />
                  <Tooltip content={ctaTooltip} />
                </>);

                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 24 }}>
                      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Evolución por cuenta</h2>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[[0,'Auto'],[1,'×1'],[2,'×2']].map(([v, label]) => (
                          <button key={v} onClick={() => setZoomCuenta(v)} style={{ background: zoomCuenta === v ? (v === 0 ? '#27272a' : '#0067FD') : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: zoomCuenta === v ? '#fff' : '#71717a', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>{label}</button>
                        ))}
                        <div style={{ width: 1, background: '#3f3f46', margin: '0 2px' }} />
                        {[['barras','Barras'],['lineas','Líneas']].map(([v, label]) => (
                          <button key={v} onClick={() => setViewCuenta(v)} style={{ background: viewCuenta === v ? '#27272a' : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: viewCuenta === v ? '#fff' : '#71717a', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ ...S.card, marginBottom: 24, padding: '16px 8px' }}>
                      {zoomCuenta > 0 ? (
                        <>
                          <CheckLegend
                            items={cuentas.map(c => ({ key: c, name: CUENTA_LABELS[c], color: CUENTA_COLORS[c] }))}
                            hidden={ctaHidden} onToggle={toggleCta}
                            style={{ marginBottom: 6, paddingLeft: CTA_Y_W + 4 }}
                          />
                          <div style={{ display: 'flex' }}>
                            {/* Eje Y fijo: labels HTML con posición matemática exacta */}
                            <div style={{ width: CTA_Y_W, flexShrink: 0, position: 'relative', height: CTA_H }}>
                              {ctaTicks.map(v => {
                                const frac = (v - ctaDomain[0]) / (ctaDomain[1] - ctaDomain[0]);
                                const y = CTA_M.top + (CTA_H - CTA_M.top - CTA_M.bottom) * (1 - frac);
                                return (
                                  <div key={v} style={{ position: 'absolute', top: y, left: 0, right: 4, fontSize: 11, color: '#71717a', textAlign: 'right', lineHeight: 1, transform: 'translateY(-50%)' }}>
                                    {fmtY(v)}
                                  </div>
                                );
                              })}
                            </div>
                            {/* Área scrollable: solo barras, sin XAxis */}
                            <div ref={scrollCtaRef} style={{ flex: 1, overflowX: 'auto' }}
                              onScroll={e => { if (xAxisCtaRef.current) xAxisCtaRef.current.scrollLeft = e.target.scrollLeft; }}>
                              {viewCuenta === 'barras' ? (
                                <BarChart width={zWidthCta} height={CTA_H} data={ctaData} barSize={zBarWCta} margin={CTA_M}>
                                  {zoomedAxesCta}
                                  {cuentas.map(c => <Bar key={c} dataKey={c} name={CUENTA_LABELS[c]} fill={CUENTA_COLORS[c]} radius={[4,4,0,0]} hide={!!ctaHidden[c]} />)}
                                  {dashComp && cuentas.map(c => <Bar key={c+'Ant'} dataKey={c+'Ant'} name={CUENTA_LABELS[c]+' ant.'} fill={CUENTA_COLORS[c]} fillOpacity={0.4} radius={[3,3,0,0]} legendType="none" hide={!!ctaHidden[c]} />)}
                                </BarChart>
                              ) : (
                                <LineChart width={zWidthCta} height={CTA_H} data={ctaData} margin={CTA_M}>
                                  {zoomedAxesCta}
                                  {cuentas.map(c => <Line key={c} type="monotone" dataKey={c} name={CUENTA_LABELS[c]} stroke={CUENTA_COLORS[c]} strokeWidth={2} dot={false} connectNulls hide={!!ctaHidden[c]} />)}
                                  {dashComp && cuentas.map(c => <Line key={c+'Ant'} type="monotone" dataKey={c+'Ant'} name={CUENTA_LABELS[c]+' ant.'} stroke={CUENTA_COLORS[c]} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} dot={false} connectNulls legendType="none" hide={!!ctaHidden[c]} />)}
                                </LineChart>
                              )}
                            </div>
                          </div>
                          {/* Eje X fijo: scroll sincronizado con las barras */}
                          <div style={{ display: 'flex' }}>
                            <div style={{ width: CTA_Y_W, flexShrink: 0 }} />
                            <div ref={xAxisCtaRef} style={{ flex: 1, overflowX: 'hidden', pointerEvents: 'none' }}>
                              <BarChart width={zWidthCta} height={CTA_XH} data={ctaData} margin={CTA_MX}>
                                <XAxis dataKey="periodo" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} interval={zIntervalCta} tickFormatter={fmtEjeCta} />
                              </BarChart>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckLegend
                            items={cuentas.map(c => ({ key: c, name: CUENTA_LABELS[c], color: CUENTA_COLORS[c] }))}
                            hidden={ctaHidden} onToggle={toggleCta}
                            style={{ marginBottom: 8, paddingLeft: 8 }}
                          />
                          <ResponsiveContainer width="100%" height={220}>
                            {viewCuenta === 'barras' ? (
                              <BarChart barSize={barW} data={ctaData}>
                                {ctaAxes}
                                {cuentas.map(c => <Bar key={c} dataKey={c} name={CUENTA_LABELS[c]} fill={CUENTA_COLORS[c]} radius={[4,4,0,0]} hide={!!ctaHidden[c]} />)}
                                {dashComp && cuentas.map(c => <Bar key={c+'Ant'} dataKey={c+'Ant'} name={CUENTA_LABELS[c]+' ant.'} fill={CUENTA_COLORS[c]} fillOpacity={0.4} radius={[3,3,0,0]} legendType="none" hide={!!ctaHidden[c]} />)}
                              </BarChart>
                            ) : (
                              <LineChart data={ctaData}>
                                {ctaAxes}
                                {cuentas.map(c => <Line key={c} type="monotone" dataKey={c} name={CUENTA_LABELS[c]} stroke={CUENTA_COLORS[c]} strokeWidth={2} dot={false} connectNulls hide={!!ctaHidden[c]} />)}
                                {dashComp && cuentas.map(c => <Line key={c+'Ant'} type="monotone" dataKey={c+'Ant'} name={CUENTA_LABELS[c]+' ant.'} stroke={CUENTA_COLORS[c]} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} dot={false} connectNulls legendType="none" hide={!!ctaHidden[c]} />)}
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        </>
                      )}
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
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <DateRangePicker desde={desde} hasta={hasta} onApply={handleApplyMovimientos} />
              <button style={S.ghost} onClick={() => cargarMovimientos(pagMovs, mostrarTodos)}>↺</button>
            </div>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setPanelFiltro(p => !p); setPanelOrdenar(false); }}
              style={{ ...S.ghost, outline: 'none', display: 'flex', alignItems: 'center', gap: 6, ...(movFiltros.length > 0 ? { borderColor: '#0067FD', color: '#0067FD' } : {}) }}>
              ⚡ Filtros
              {movFiltros.length > 0 && (
                <span style={{ background: '#0067FD', color: 'white', borderRadius: 10, fontSize: 11, padding: '1px 7px', fontWeight: 700 }}>
                  {movFiltros.length}
                </span>
              )}
            </button>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setPanelOrdenar(p => !p); setPanelFiltro(false); }}
              style={{ ...S.ghost, outline: 'none', display: 'flex', alignItems: 'center', gap: 6, ...(movSorts.length > 0 ? { borderColor: '#8b5cf6', color: '#8b5cf6' } : {}) }}>
              ↕ Ordenar
              {movSorts.length > 0 && (
                <span style={{ color: '#8b5cf6', fontSize: 11, fontWeight: 600 }}>
                  {movSorts.map(s => (CAMPOS_SORT.find(c => c.key === s.campo)?.label || s.campo) + (s.dir === 'asc' ? ' ↑' : ' ↓')).join(', ')}
                </span>
              )}
            </button>
            <input
              type="text"
              placeholder="Buscar..."
              value={movBusqueda}
              onChange={e => { setMovBusqueda(e.target.value); setPagMovs(1); }}
              style={{ ...S.input, width: 180, marginLeft: 'auto' }}
            />
            <div style={{ display:'flex', gap:4, background:'#1c1c1e', padding:3, borderRadius:8, flexShrink:0 }}>
              {[['lista','☰'],['tabla','⊞']].map(([v,ic]) => (
                <button key={v} type="button" onClick={() => { setVistaMovs(v); lsSet('fin_vista',v); setSeleccionados(new Set()); }}
                  style={{ background:vistaMovs===v?'#27272a':'transparent', border:'none', color:vistaMovs===v?'white':'#52525b', borderRadius:6, padding:'5px 10px', fontSize:14, cursor:'pointer' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          {/* Barra de acciones bulk */}
          {seleccionados.size > 0 && (() => {
            const BULK_CAMPOS = [
              { key:'tipo',        label:'Tipo',     opts:['Ingreso','Gasto'] },
              { key:'cuenta',      label:'Cuenta',   opts:CUENTAS_OPTS },
              { key:'iva',         label:'IVA',      opts:IVA_OPTS },
              { key:'irpf',        label:'IRPF',     opts:IRPF_OPTS },
              { key:'cliente_ids', label:'Clientes', multi:true, lista:filtroClientesLista },
              { key:'equipo_ids',  label:'Equipo',   multi:true, lista:filtroEquipoLista },
            ];
            const closeBulk = () => { setBulkCampo(null); setBulkValor(''); setBulkValorMulti([]); setBulkFiltroLista(''); };
            return (
              <div style={{ background:'#1e293b', border:'1px solid #1d4ed8', borderRadius:10, padding:'10px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', position:'sticky', top:0, zIndex:200 }}>
                <span style={{ color:'#60a5fa', fontSize:13, fontWeight:600, flexShrink:0 }}>{seleccionados.size} seleccionado{seleccionados.size>1?'s':''}</span>
                <button onClick={() => { setSeleccionados(new Set()); setSelTodos(false); }} style={{ background:'none', border:'none', color:'#52525b', fontSize:12, cursor:'pointer', padding:'2px 6px' }}>✕ Deseleccionar</button>
                {!selTodos && seleccionados.size > 0 && movimientos.total > seleccionados.size && (
                  <button onClick={seleccionarTodosLosMovimientos} disabled={cargandoTodos}
                    style={{ background:'none', border:'none', color:'#60a5fa', fontSize:12, cursor:'pointer', textDecoration:'underline', padding:'2px 4px' }}>
                    {cargandoTodos ? 'Cargando…' : `Seleccionar todos (${movimientos.total})`}
                  </button>
                )}
                {selTodos && <span style={{ color:'#a78bfa', fontSize:12 }}>✓ Todos los {seleccionados.size} seleccionados</span>}
                <div style={{ width:1, background:'#27272a', alignSelf:'stretch' }} />
                {BULK_CAMPOS.map(({ key, label, opts, multi, lista }) => (
                  <div key={key} style={{ position:'relative' }}>
                    <button onClick={() => { const open = bulkCampo !== key; closeBulk(); if (open) setBulkCampo(key); }}
                      style={{ background:'#27272a', border:'1px solid #3f3f46', color:'#d4d4d8', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer' }}>
                      {label} ▾
                    </button>
                    {bulkCampo===key && !multi && (
                      <div style={{ position:'absolute', zIndex:500, top:'100%', left:0, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, marginTop:4, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.5)', overflow:'hidden' }}>
                        {opts.map(o => (
                          <button key={o} onClick={() => { editarBulk(key, o); closeBulk(); }}
                            style={{ display:'block', width:'100%', background:'none', border:'none', color:'#d4d4d8', padding:'8px 12px', textAlign:'left', fontSize:13, cursor:'pointer' }}
                            onMouseEnter={e=>e.currentTarget.style.background='#27272a'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                            {o}
                          </button>
                        ))}
                      </div>
                    )}
                    {bulkCampo===key && multi && (
                      <div style={{ position:'absolute', zIndex:500, top:'100%', left:0, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, marginTop:4, minWidth:220, boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding:'6px 8px', borderBottom:'1px solid #27272a' }}>
                          <input autoFocus value={bulkFiltroLista} onChange={e => setBulkFiltroLista(e.target.value)}
                            placeholder="Buscar..." onClick={e => e.stopPropagation()}
                            style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', borderRadius:4, color:'white', fontSize:12, padding:'4px 8px', outline:'none', boxSizing:'border-box' }} />
                        </div>
                        <div style={{ maxHeight:180, overflowY:'auto' }}>
                          {(bulkFiltroLista.trim() ? lista.filter(o => o.nombre.toLowerCase().includes(bulkFiltroLista.toLowerCase())) : lista).map(o => {
                            const sel = bulkValorMulti.includes(o.id);
                            return (
                              <label key={o.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', cursor:'pointer', borderBottom:'1px solid #27272a' }}
                                onMouseEnter={e=>e.currentTarget.style.background='#27272a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                <input type="checkbox" checked={sel}
                                  onChange={() => setBulkValorMulti(prev => sel ? prev.filter(id=>id!==o.id) : [...prev, o.id])}
                                  style={{ accentColor:'#0067FD', flexShrink:0 }} />
                                <span style={{ color:'#d4d4d8', fontSize:12 }}>{o.nombre}</span>
                              </label>
                            );
                          })}
                        </div>
                        <button onClick={() => { if (bulkValorMulti.length) { editarBulk(key, bulkValorMulti); closeBulk(); } }}
                          disabled={bulkValorMulti.length === 0}
                          style={{ width:'100%', background: bulkValorMulti.length ? '#0067FD' : '#27272a', color:'white', border:'none', borderRadius:'0 0 8px 8px', padding:'6px', fontSize:12, cursor: bulkValorMulti.length ? 'pointer' : 'default' }}>
                          Aplicar {bulkValorMulti.length > 0 ? `(${bulkValorMulti.length})` : ''}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={eliminarBulk}
                  style={{ marginLeft:'auto', background:'#450a0a', border:'1px solid #7f1d1d', color:'#f87171', borderRadius:6, padding:'4px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  🗑 Eliminar {seleccionados.size}
                </button>
              </div>
            );
          })()}
          {panelFiltro && (
            <PanelFiltros
              filtros={movFiltros} op={movFiltroOp}
              onChangeFiltros={f => { setMovFiltros(f); setPagMovs(1); }}
              onChangeOp={op => { setMovFiltroOp(op); setPagMovs(1); }}
              listasAsignacion={{ cliente_ids: filtroClientesLista, equipo_ids: filtroEquipoLista }}
            />
          )}
          {panelOrdenar && (
            <PanelOrdenar
              sorts={movSorts}
              onChange={s => { setMovSorts(s); setPagMovs(1); }}
            />
          )}

          <div style={S.card}>
            {loadingMovs ? (
              <p style={{ color: '#52525b', textAlign: 'center', padding: 24 }}>Cargando…</p>
            ) : errMovs ? (
              <p style={{ color: '#f87171', fontSize: 13, padding: 16 }}>Error: {errMovs}</p>
            ) : movimientos.items.length === 0 ? (
              <p style={{ color: '#52525b', textAlign: 'center', padding: 24 }}>Sin movimientos para este periodo</p>
            ) : (() => {
              const totalPages = movimientos.pages;
              const pageItems  = movimientos.items;

              const paginacion = (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  {!mostrarTodos && totalPages > 1 && (
                    <>
                      <button style={S.ghost} disabled={pagMovs <= 1} onClick={() => setPagMovs(p => p - 1)}>← Anterior</button>
                      <span style={{ color: '#71717a', fontSize: 13, padding: '8px 0' }}>{pagMovs} / {totalPages}</span>
                      <button style={S.ghost} disabled={pagMovs >= totalPages} onClick={() => setPagMovs(p => p + 1)}>Siguiente →</button>
                    </>
                  )}
                  <select value={mostrarTodos ? 'todos' : String(movLimit)}
                    onChange={e => { const v=e.target.value; if(v==='todos'){setMostrarTodos(true);setPagMovs(1);}else{const n=parseInt(v);setMovLimit(n);setMostrarTodos(false);setPagMovs(1);cargarMovimientos(1,false,n);} }}
                    style={{ ...S.select, width:'auto', fontSize:13, padding:'7px 10px' }}>
                    {[50,100,200].map(n=><option key={n} value={n}>{n} por página</option>)}
                    <option value="todos">Todos ({movimientos.total})</option>
                  </select>
                </div>
              );

              if (vistaMovs === 'tabla') {
                return (
                  <>
                    <TablaMovimientos
                      items={pageItems}
                      seleccionados={seleccionados}
                      onToggleSel={toggleSel}
                      onToggleAll={toggleAll}
                      onGuardarCelda={guardarCeldaInline}
                      onVerDetalle={abrirDetalle}
                      clientesLista={filtroClientesLista}
                      equipoLista={filtroEquipoLista}
                    />
                    {paginacion}
                  </>
                );
              }

              const normales  = pageItems.filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
              const traspasos = pageItems.filter(m =>  (m.categorias || []).includes('Traspaso Entre Cuentas'));
              return (
                <>
                  <style>{`
                    .fila-mov-wrap { position: relative; }
                    .fila-mov-cb { opacity: 0; transition: opacity 0.1s; }
                    .fila-mov-wrap:hover .fila-mov-cb { opacity: 1; }
                    .fila-mov-cb.checked { opacity: 1; }
                    .fin-tabla-row .fin-cb { opacity: 0; transition: opacity 0.1s; }
                    .fin-tabla-row:hover .fin-cb { opacity: 1; }
                    .fin-tabla-row .fin-cb.checked { opacity: 1; }
                    .fin-tabla-row th .fin-cb-all { opacity: 0; }
                    .fin-tabla-row th:hover .fin-cb-all { opacity: 1; }
                  `}</style>
                  <div style={{ display: 'grid', gridTemplateColumns: traspasos.length > 0 ? '1fr 1fr' : '1fr', gap: 24 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                        {seleccionados.size > 0 && (
                          <input type="checkbox"
                            checked={normales.length>0&&normales.every(m=>seleccionados.has(m.id))}
                            ref={el=>{if(el)el.indeterminate=normales.some(m=>seleccionados.has(m.id))&&!normales.every(m=>seleccionados.has(m.id));}}
                            onChange={()=>toggleAll(normales,normales.every(m=>seleccionados.has(m.id)))}
                            style={{accentColor:'#0067FD',cursor:'pointer'}}/>
                        )}
                        <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin:0 }}>Movimientos ({normales.length})</p>
                      </div>
                      {normales.map(m => {
                        const sel = seleccionados.has(m.id);
                        return (
                          <div key={m.id} className="fila-mov-wrap" style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <input type="checkbox" checked={sel} onChange={()=>toggleSel(m.id)}
                              className={`fila-mov-cb${sel?' checked':''}`}
                              style={{accentColor:'#0067FD',cursor:'pointer',flexShrink:0}}/>
                            <div style={{flex:1,minWidth:0}}><FilaMovimiento m={m} onVerDetalle={abrirDetalle} /></div>
                          </div>
                        );
                      })}
                    </div>
                    {traspasos.length > 0 && (
                      <div style={{ minWidth: 0, borderLeft: '1px solid #27272a', paddingLeft: 24 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                          {seleccionados.size > 0 && (
                            <input type="checkbox"
                              checked={traspasos.length>0&&traspasos.every(m=>seleccionados.has(m.id))}
                              ref={el=>{if(el)el.indeterminate=traspasos.some(m=>seleccionados.has(m.id))&&!traspasos.every(m=>seleccionados.has(m.id));}}
                              onChange={()=>toggleAll(traspasos,traspasos.every(m=>seleccionados.has(m.id)))}
                              style={{accentColor:'#0067FD',cursor:'pointer'}}/>
                          )}
                          <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin:0 }}>Traspasos ({traspasos.length})</p>
                        </div>
                        {traspasos.map(m => {
                          const sel = seleccionados.has(m.id);
                          return (
                            <div key={m.id} className="fila-mov-wrap" style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <input type="checkbox" checked={sel} onChange={()=>toggleSel(m.id)}
                                className={`fila-mov-cb${sel?' checked':''}`}
                                style={{accentColor:'#0067FD',cursor:'pointer',flexShrink:0}}/>
                              <div style={{flex:1,minWidth:0}}><FilaMovimiento m={m} onVerDetalle={abrirDetalle} /></div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {paginacion}
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* ── FISCAL ── */}
      {tab === 'fiscal' && <TabFiscal />}

      {/* ── CLIENTES ── */}
      {tab === 'clientes' && (() => {
        const beneficioSinTraspasos = c => {
          const movs = (c.movimientos || []).filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
          return movs.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + m.cantidad, 0)
               - movs.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + m.cantidad, 0);
        };
        const getValorSort = (c, campo) => {
          const movs = (c.movimientos || []).filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
          const ing  = movs.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + m.cantidad, 0);
          const gas  = movs.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + m.cantidad, 0);
          if (campo === 'facturacion') return ing;
          if (campo === 'gasto') return gas;
          return ing - gas; // beneficio
        };
        const sortClientes = arr => [...arr].sort((a, b) => {
          const va = getValorSort(a, clienteSort.campo);
          const vb = getValorSort(b, clienteSort.campo);
          return clienteSort.dir === 'desc' ? vb - va : va - vb;
        });
        const buscarFiltro = arr => {
          const q = clienteBusqueda.trim().toLowerCase();
          if (!q) return arr;
          return arr.filter(c =>
            c.nombre.toLowerCase().includes(q) ||
            (c.nombre_empresa || '').toLowerCase().includes(q)
          );
        };
        const yo        = buscarFiltro(clientes.filter(c => c.nombre === 'Anti-Agencia'));
        const activos   = sortClientes(buscarFiltro(clientes.filter(c => c.activo  && c.nombre !== 'Anti-Agencia')));
        const inactivos = sortClientes(buscarFiltro(clientes.filter(c => !c.activo && c.nombre !== 'Anti-Agencia')));

        const renderCliente = (c) => {
          const abierto   = clienteAbierto === c.id;
          const movsFiltered = (c.movimientos || []).filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
          const tieneMovs = movsFiltered.length > 0;
          const cantidadPro = m => m.cantidad / Math.max(m.cliente_ids?.length || 1, 1);
          const ingresos  = movsFiltered.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + cantidadPro(m), 0);
          const gastos    = movsFiltered.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + cantidadPro(m), 0);
          const balance   = ingresos - gastos;
          return (
            <div key={c.id} style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
              <div onClick={() => { setClienteAbierto(abierto ? null : c.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); }}
                style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer', gap: 12 }}>
                <span style={{ color: '#52525b', fontSize: 12, flexShrink: 0, display: 'inline-block', transition: 'transform 0.2s', transform: abierto ? 'rotate(90deg)' : 'none' }}>▶</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{c.nombre}</span>
                  {c.nombre_empresa && c.nombre_empresa !== c.nombre && (
                    <span style={{ color: '#71717a', fontSize: 12, marginLeft: 8 }}>{c.nombre_empresa}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>{fmt(ingresos)}</span>
                  <span style={{ fontSize: 13, color: '#f87171', fontWeight: 500 }}>{fmt(-gastos)}</span>
                  <span style={{ fontSize: 13, color: balance >= 0 ? '#60a5fa' : '#fb923c', fontWeight: 600 }}>{fmt(balance)}</span>
                </div>
              </div>

              {abierto && (
                <div style={{ borderTop: '1px solid #27272a', padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Ingresos', val: ingresos,  color: '#22c55e' },
                      { label: 'Gastos',   val: -gastos,   color: '#f87171' },
                      { label: 'Balance',  val: balance, color: balance >= 0 ? '#60a5fa' : '#fb923c' },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ ...S.card, padding: '10px 16px', flex: 1, minWidth: 100 }}>
                        <p style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{label}</p>
                        <p style={{ color, fontSize: 20, fontWeight: 700, margin: 0 }}>{fmt(val)}</p>
                      </div>
                    ))}
                  </div>
                  {(c.nif_cif || c.email) && (
                    <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                      {c.nif_cif && <span style={{ color: '#71717a', fontSize: 12 }}>NIF: <span style={{ color: '#a1a1aa' }}>{c.nif_cif}</span></span>}
                      {c.email   && <span style={{ color: '#71717a', fontSize: 12 }}>Email: <span style={{ color: '#a1a1aa' }}>{c.email}</span></span>}
                    </div>
                  )}
                  {!tieneMovs ? (
                    <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Sin movimientos en el periodo seleccionado.</p>
                  ) : (() => {
                    const movsTipo = movFiltroTipo === 'todos' ? movsFiltered : movsFiltered.filter(m => m.tipo === movFiltroTipo);
                    const totalMovs = movsTipo.length;
                    const paginas = movPorPagina === 'todos' ? 1 : Math.ceil(totalMovs / movPorPagina);
                    const movsPag = movPorPagina === 'todos' ? movsTipo : movsTipo.slice((movPagina - 1) * movPorPagina, movPagina * movPorPagina);
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                          <span style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>Movimientos</span>
                          {['todos', 'Ingreso', 'Gasto'].map(t => (
                            <button key={t} onClick={() => { setMovFiltroTipo(t); setMovPagina(1); }}
                              style={{ background: movFiltroTipo === t ? '#3f3f46' : 'transparent', border: '1px solid #3f3f46', color: movFiltroTipo === t ? 'white' : '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                              {t === 'todos' ? 'Todos' : t === 'Ingreso' ? 'Ingresos' : 'Gastos'}
                            </button>
                          ))}
                          <span style={{ color: '#52525b', fontSize: 11, marginLeft: 'auto' }}>{totalMovs} movimientos</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {movsPag.map(m => (
                            <div key={m.id} onClick={() => abrirDetalle(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: '#1c1c1e', cursor: 'pointer' }}>
                              <span style={{ color: '#52525b', fontSize: 12, flexShrink: 0, minWidth: 72 }}>{m.fecha}</span>
                              <span style={{ flex: 1, color: '#d4d4d8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nombre}</span>
                              {(m.categorias || []).slice(0, 2).map(cat => (
                                <span key={cat} style={{ background: '#27272a', color: '#71717a', fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{cat}</span>
                              ))}
                              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, minWidth: 70 }}>
                                <span style={{ color: m.tipo === 'Ingreso' ? '#22c55e' : '#f87171', fontSize: 13, fontWeight: 600 }}>
                                  {fmt(m.tipo === 'Ingreso' ? m.cantidad : -m.cantidad)}
                                </span>
                                {(m.cliente_ids?.length || 1) > 1 && (
                                  <span style={{ color: m.tipo === 'Ingreso' ? '#22c55e' : '#f87171', fontSize: 10, opacity: 0.7 }}>
                                    corr. {fmt(cantidadPro(m))}
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                        {/* Controles paginación */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                          <select value={movPorPagina} onChange={e => { setMovPorPagina(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value)); setMovPagina(1); }}
                            style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
                            {[10, 50, 100].map(n => <option key={n} value={n}>{n} por página</option>)}
                            <option value="todos">Todos</option>
                          </select>
                          {movPorPagina !== 'todos' && paginas > 1 && (
                            <>
                              <button onClick={() => setMovPagina(p => Math.max(1, p - 1))} disabled={movPagina === 1}
                                style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>‹</button>
                              <span style={{ color: '#71717a', fontSize: 12 }}>{movPagina} / {paginas}</span>
                              <button onClick={() => setMovPagina(p => Math.min(paginas, p + 1))} disabled={movPagina === paginas}
                                style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>›</button>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        };

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <DateRangePicker desde={desde} hasta={hasta} onApply={(d, h) => { setDesde(d); setHasta(h); }} />
              <button
                onClick={async () => {
                  setSyncingClientes(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    await fetch(`${BACKEND_URL}/admin/finanzas/clientes/sync`, { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } });
                    await cargarClientes();
                  } finally { setSyncingClientes(false); }
                }}
                disabled={syncingClientes}
                style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}
              >{syncingClientes ? 'Sincronizando…' : '↻ Sync Notion'}</button>

              {/* Buscador */}
              <input
                type="text"
                placeholder="Buscar cliente…"
                value={clienteBusqueda}
                onChange={e => setClienteBusqueda(e.target.value)}
                style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', width: 180 }}
              />

              {/* Ordenar por */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '4px 6px' }}>
                <span style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: 4 }}>Ordenar</span>
                {[
                  { key: 'beneficio',   label: 'Beneficio' },
                  { key: 'facturacion', label: 'Facturación' },
                  { key: 'gasto',       label: 'Gasto' },
                ].map(({ key, label }) => (
                  <button key={key}
                    onClick={() => setClienteSort(s => s.campo === key ? { campo: key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { campo: key, dir: 'desc' })}
                    style={{
                      background: clienteSort.campo === key ? '#3f3f46' : 'transparent',
                      border: 'none', color: clienteSort.campo === key ? 'white' : '#71717a',
                      borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer',
                    }}>
                    {label}{clienteSort.campo === key ? (clienteSort.dir === 'desc' ? ' ↓' : ' ↑') : ''}
                  </button>
                ))}
              </div>
            </div>

            {loadingClientes ? (
              <p style={{ color: '#71717a', fontSize: 14 }}>Cargando clientes…</p>
            ) : clientes.length === 0 ? (
              <div style={{ ...S.card, padding: 24, textAlign: 'center' }}>
                <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>No hay clientes. Pulsa «↻ Sync Notion» para importarlos.</p>
              </div>
            ) : (
              <>
                {yo.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Yo
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {yo.map(renderCliente)}
                    </div>
                  </div>
                )}
                {activos.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Activos <span style={{ color: '#22c55e' }}>({activos.length})</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {activos.map(renderCliente)}
                    </div>
                  </div>
                )}
                {inactivos.length > 0 && (
                  <div>
                    <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Inactivos <span style={{ color: '#f87171' }}>({inactivos.length})</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {inactivos.map(renderCliente)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* ── EQUIPO ── */}
      {tab === 'equipo' && (() => {
        const getValorSortE = (e, campo) => {
          const movs = (e.movimientos || []).filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
          const ing  = movs.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + m.cantidad, 0);
          const gas  = movs.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + m.cantidad, 0);
          if (campo === 'facturacion') return ing;
          if (campo === 'gasto') return gas;
          return ing - gas;
        };
        const sortEquipo = arr => [...arr].sort((a, b) => {
          const va = getValorSortE(a, equipoSort.campo);
          const vb = getValorSortE(b, equipoSort.campo);
          return equipoSort.dir === 'desc' ? vb - va : va - vb;
        });
        const buscarFiltroE = arr => {
          const q = equipoBusqueda.trim().toLowerCase();
          if (!q) return arr;
          return arr.filter(e => e.nombre.toLowerCase().includes(q));
        };

        const nosotros   = sortEquipo(buscarFiltroE(equipo.filter(e => e.grupo === 'nosotros')));
        const freelancers = sortEquipo(buscarFiltroE(equipo.filter(e => e.grupo === 'freelancer')));

        const renderMiembro = (e) => {
          const abierto = equipoAbierto === e.id;
          const movsFiltered = (e.movimientos || []).filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
          const tieneMovs = movsFiltered.length > 0;
          const cantidadPro = m => m.cantidad / Math.max(m.equipo_ids?.length || 1, 1);
          const ingresos  = movsFiltered.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + cantidadPro(m), 0);
          const gastos    = movsFiltered.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + cantidadPro(m), 0);
          const balance   = ingresos - gastos;
          return (
            <div key={e.id} style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
              <div onClick={() => { setEquipoAbierto(abierto ? null : e.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); }}
                style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer', gap: 12 }}>
                <span style={{ color: '#52525b', fontSize: 12, flexShrink: 0, display: 'inline-block', transition: 'transform 0.2s', transform: abierto ? 'rotate(90deg)' : 'none' }}>▶</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{e.nombre}</span>
                  {e.email && <span style={{ color: '#71717a', fontSize: 12, marginLeft: 8 }}>{e.email}</span>}
                </div>
                <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>{fmt(ingresos)}</span>
                  <span style={{ fontSize: 13, color: '#f87171', fontWeight: 500 }}>{fmt(-gastos)}</span>
                  <span style={{ fontSize: 13, color: balance >= 0 ? '#60a5fa' : '#fb923c', fontWeight: 600 }}>{fmt(balance)}</span>
                </div>
              </div>

              {abierto && (
                <div style={{ borderTop: '1px solid #27272a', padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Ingresos', val: ingresos,  color: '#22c55e' },
                      { label: 'Gastos',   val: -gastos,   color: '#f87171' },
                      { label: 'Balance',  val: balance, color: balance >= 0 ? '#60a5fa' : '#fb923c' },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ ...S.card, padding: '10px 16px', flex: 1, minWidth: 100 }}>
                        <p style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{label}</p>
                        <p style={{ color, fontSize: 20, fontWeight: 700, margin: 0 }}>{fmt(val)}</p>
                      </div>
                    ))}
                  </div>
                  {!tieneMovs ? (
                    <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Sin movimientos en el periodo seleccionado.</p>
                  ) : (() => {
                    const movsTipo = movFiltroTipo === 'todos' ? movsFiltered : movsFiltered.filter(m => m.tipo === movFiltroTipo);
                    const totalMovs = movsTipo.length;
                    const paginas = movPorPagina === 'todos' ? 1 : Math.ceil(totalMovs / movPorPagina);
                    const movsPag = movPorPagina === 'todos' ? movsTipo : movsTipo.slice((movPagina - 1) * movPorPagina, movPagina * movPorPagina);
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                          <span style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>Movimientos</span>
                          {['todos', 'Ingreso', 'Gasto'].map(t => (
                            <button key={t} onClick={() => { setMovFiltroTipo(t); setMovPagina(1); }}
                              style={{ background: movFiltroTipo === t ? '#3f3f46' : 'transparent', border: '1px solid #3f3f46', color: movFiltroTipo === t ? 'white' : '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                              {t === 'todos' ? 'Todos' : t === 'Ingreso' ? 'Ingresos' : 'Gastos'}
                            </button>
                          ))}
                          <span style={{ color: '#52525b', fontSize: 11, marginLeft: 'auto' }}>{totalMovs} movimientos</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {movsPag.map(m => (
                            <div key={m.id} onClick={() => abrirDetalle(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: '#1c1c1e', cursor: 'pointer' }}>
                              <span style={{ color: '#52525b', fontSize: 12, flexShrink: 0, minWidth: 72 }}>{m.fecha}</span>
                              <span style={{ flex: 1, color: '#d4d4d8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nombre}</span>
                              {(m.categorias || []).slice(0, 2).map(cat => (
                                <span key={cat} style={{ background: '#27272a', color: '#71717a', fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{cat}</span>
                              ))}
                              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, minWidth: 70 }}>
                                <span style={{ color: m.tipo === 'Ingreso' ? '#22c55e' : '#f87171', fontSize: 13, fontWeight: 600 }}>
                                  {fmt(m.tipo === 'Ingreso' ? m.cantidad : -m.cantidad)}
                                </span>
                                {(m.equipo_ids?.length || 1) > 1 && (
                                  <span style={{ color: m.tipo === 'Ingreso' ? '#22c55e' : '#f87171', fontSize: 10, opacity: 0.7 }}>
                                    corr. {fmt(cantidadPro(m))}
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                          <select value={movPorPagina} onChange={e => { setMovPorPagina(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value)); setMovPagina(1); }}
                            style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
                            {[10, 50, 100].map(n => <option key={n} value={n}>{n} por página</option>)}
                            <option value="todos">Todos</option>
                          </select>
                          {movPorPagina !== 'todos' && paginas > 1 && (
                            <>
                              <button onClick={() => setMovPagina(p => Math.max(1, p - 1))} disabled={movPagina === 1}
                                style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>‹</button>
                              <span style={{ color: '#71717a', fontSize: 12 }}>{movPagina} / {paginas}</span>
                              <button onClick={() => setMovPagina(p => Math.min(paginas, p + 1))} disabled={movPagina === paginas}
                                style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>›</button>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        };

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <DateRangePicker desde={desde} hasta={hasta} onApply={(d, h) => { setDesde(d); setHasta(h); }} />
              <button
                onClick={async () => {
                  setSyncingEquipo(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    await fetch(`${BACKEND_URL}/admin/finanzas/equipo/sync`, { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } });
                    await cargarEquipo();
                  } finally { setSyncingEquipo(false); }
                }}
                disabled={syncingEquipo}
                style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}
              >{syncingEquipo ? 'Sincronizando…' : '↻ Sync Notion'}</button>

              <input
                type="text"
                placeholder="Buscar persona…"
                value={equipoBusqueda}
                onChange={e => setEquipoBusqueda(e.target.value)}
                style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', width: 180 }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, padding: '4px 6px' }}>
                <span style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: 4 }}>Ordenar</span>
                {[
                  { key: 'beneficio',   label: 'Beneficio' },
                  { key: 'facturacion', label: 'Facturación' },
                  { key: 'gasto',       label: 'Gasto' },
                ].map(({ key, label }) => (
                  <button key={key}
                    onClick={() => setEquipoSort(s => s.campo === key ? { campo: key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { campo: key, dir: 'desc' })}
                    style={{
                      background: equipoSort.campo === key ? '#3f3f46' : 'transparent',
                      border: 'none', color: equipoSort.campo === key ? 'white' : '#71717a',
                      borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer',
                    }}>
                    {label}{equipoSort.campo === key ? (equipoSort.dir === 'desc' ? ' ↓' : ' ↑') : ''}
                  </button>
                ))}
              </div>
            </div>

            {loadingEquipo ? (
              <p style={{ color: '#71717a', fontSize: 14 }}>Cargando equipo…</p>
            ) : equipo.length === 0 ? (
              <div style={{ ...S.card, padding: 24, textAlign: 'center' }}>
                <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>No hay datos. Pulsa «↻ Sync Notion» para importar.</p>
              </div>
            ) : (
              <>
                {nosotros.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Nosotros <span style={{ color: '#a1a1aa' }}>({nosotros.length})</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {nosotros.map(renderMiembro)}
                    </div>
                  </div>
                )}
                {freelancers.length > 0 && (
                  <div>
                    <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Freelancer <span style={{ color: '#a1a1aa' }}>({freelancers.length})</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {freelancers.map(renderMiembro)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* ── NUEVO ── */}
      {tab === 'nuevo' && (
        <NuevoMovimientoTab onGuardado={() => { setSinMovimientosMes(false); setTab('movimientos'); cargarMovimientos(1); cargarDashboard(); }} />
      )}

      {/* ── Confirm dialog ── */}
      {confirmDialog && (
        <div onClick={() => setConfirmDialog(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#1c1c1e', border: '1px solid #3f3f46', borderRadius: 14, padding: '24px 28px', width: '100%', maxWidth: 380, textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 600, margin: '0 0 20px' }}>{confirmDialog.texto}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDialog(null)}
                style={{ padding: '8px 22px', borderRadius: 8, border: '1px solid #3f3f46', background: 'none', color: '#a1a1aa', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                Cancelar
              </button>
              <button onClick={() => { confirmDialog.onOk(); setConfirmDialog(null); }}
                style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
