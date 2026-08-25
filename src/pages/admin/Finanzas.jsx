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

function SearchableSelect({ value, onChange, options, placeholder = '— elegir —', style = {}, onClose }) {
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

const CAMPOS_FILTRO_DOCS = [
  { key: 'fecha_factura',        label: 'Fecha',       tipo: 'date' },
  { key: 'numero_factura',       label: 'Nº Factura',  tipo: 'text' },
  { key: 'nombre_entidad',       label: 'Entidad',     tipo: 'text' },
  { key: 'tipo',                 label: 'Tipo',        tipo: 'select', ops: ['Venta','Compra'] },
  { key: 'factura_proveedor_id', label: 'Proveedor',   tipo: 'uuid_nullable' },
  { key: 'factura_cliente_id',   label: 'Cliente',     tipo: 'uuid_nullable' },
  { key: 'importe',              label: 'Importe',     tipo: 'number' },
  { key: 'impuesto',             label: 'IVA',         tipo: 'number' },
  { key: 'irpf',                 label: 'IRPF',        tipo: 'number' },
  { key: 'nif_cif',              label: 'NIF/CIF',     tipo: 'text' },
  { key: 'anio',                 label: 'Año',         tipo: 'number' },
  { key: 'trimestre',            label: 'Trimestre',   tipo: 'number' },
  { key: 'archivo_nombre',       label: 'Archivo',     tipo: 'text' },
];

const CAMPOS_SORT_DOCS = [
  { key: 'fecha_factura',  label: 'Fecha' },
  { key: 'numero_factura', label: 'Nº Factura' },
  { key: 'nombre_entidad', label: 'Entidad' },
  { key: 'tipo',           label: 'Tipo' },
  { key: 'importe',        label: 'Importe' },
  { key: 'impuesto',       label: 'IVA' },
  { key: 'irpf',           label: 'IRPF' },
  { key: 'anio',           label: 'Año' },
  { key: 'trimestre',      label: 'Trimestre' },
  { key: 'archivo_nombre', label: 'Archivo' },
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

function PanelFiltros({ filtros, op, onChangeFiltros, onChangeOp, listasAsignacion = {}, campos = CAMPOS_FILTRO }) {
  const defaultValor = meta => (meta?.tipo === 'select' || meta?.tipo === 'array') ? [] : '';

  function addCondicion() {
    const meta = campos[0];
    onChangeFiltros([...filtros, { id: Date.now(), campo: meta.key, operador: (OPS_POR_TIPO[meta.tipo] || [])[0]?.[0] || 'ilike', valor: defaultValor(meta) }]);
  }
  function updateCondicion(id, key, val) {
    onChangeFiltros(filtros.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, [key]: val };
      if (key === 'campo') {
        const meta = campos.find(c => c.key === val);
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
        const meta = campos.find(c => c.key === f.campo) || campos[0];
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
              {campos.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
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
                <SearchableSelect
                  value={f.valor || ''}
                  onChange={v => updateCondicion(f.id, 'valor', v)}
                  options={uuidOpciones}
                  placeholder="— Elige —"
                  style={{ minWidth: 180 }}
                />
              ) : (
                <input
                  type={meta.tipo === 'date' ? 'date' : (meta.tipo === 'number' || meta.tipo === 'number_nullable') ? 'number' : 'text'}
                  value={f.valor}
                  onChange={e => updateCondicion(f.id, 'valor', e.target.value)}
                  placeholder="Valor"
                  style={{ background: '#161616', border: '1px solid #3f3f46', borderRadius: 6, color: 'white', padding: '5px 8px', fontSize: 12, width: 130, colorScheme: 'dark' }}
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

function PanelOrdenar({ sorts, onChange, campos = CAMPOS_SORT }) {
  const usados = new Set(sorts.map(s => s.campo));
  function addSort() {
    const libre = campos.find(c => !usados.has(c.key));
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
            {campos.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
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
        <button onClick={addSort} disabled={sorts.length >= campos.length}
          style={{ ...btnLink, color: sorts.length >= campos.length ? '#3f3f46' : '#8b5cf6' }}>
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

function ModalEditar({ movimiento, onGuardado, onCerrar, zIndex = 1000 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 12px', overflowY: 'auto' }}>
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

function ModalMovimiento({ m, onClose, onEditar, onEliminar, onConfirm, zIndex = 1000 }) {
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
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
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
            <p style={{ color: '#3f3f46', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>ID</p>
            <span style={{ color: '#3f3f46', fontSize: 11, fontFamily: 'monospace' }}>{m.id || '—'}</span>
          </div>
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

function TabFiscal({ onAbrirMovimiento, facturaViewer, setFacturaViewer }) {
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
  // facturaViewer is passed as prop from Finanzas
  const [facturaFiltro, setFacturaFiltro] = useState('todos'); // 'todos' | 'ingreso' | 'gasto'
  const [facturaOrden, setFacturaOrden] = useState('fecha_desc'); // 'fecha_desc' | 'fecha_asc' | 'importe_desc' | 'importe_asc'
  const [subirAbierto, setSubirAbierto] = useState(false); // mostrar zonas de drop
  // Detectar errores
  const [erroresModal, setErroresModal] = useState(false);
  const [erroresData, setErroresData] = useState([]);
  const [detectando, setDetectando] = useState(false);
  const [errMovDetail, setErrMovDetail] = useState(null);
  const [errMovEditar, setErrMovEditar] = useState(null);
  const [errFiltro, setErrFiltro] = useState('todos'); // 'todos' | 'error' | 'warning' | 'info'
  const [errSplitView, setErrSplitView] = useState(null); // { movimiento, factura } | null
  const [modDetalle, setModDetalle] = useState(null); // { num, titulo, desc, valor, valorLabel, secciones } | null

  // Abre un movimiento desde el contexto de errores con datos completos + actualiza URL
  async function abrirMovEnErrores(mov) {
    const params = new URLSearchParams(window.location.search);
    params.set('mov', mov.id);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos/${mov.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      setErrMovDetail(r.ok ? data : mov);
    } catch { setErrMovDetail(mov); }
  }

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
    if (trimestreAbierto === i) { setTrimestreAbierto(null); setPendientes([]); setSelFacturas(new Set()); setSubirAbierto(false); }
    else { setTrimestreAbierto(i); setPendientes([]); setSelFacturas(new Set()); setSubirAbierto(false); cargarFacturasTrimestre(q); }
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
    const listas = pendientes.filter(p => !p._procesando && !p._error); // incluye _warning (datos parciales)
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
      const data = await r.json();
      // Quitar solo los guardados, dejar pendientes con error o aún procesando
      const idsGuardados = new Set(listas.map(p => p._id));
      setPendientes(prev => prev.filter(p => !idsGuardados.has(p._id)));
      cargarFacturasTrimestre(trimestreAbierto + 1);
      // Si hay contactos nuevos sin asignar, mostrar modal
      if (data.nuevos_pendientes?.length) {
        const token2 = await getToken();
        const rc = await fetch(`${BACKEND_URL}/admin/finanzas/contactos/todos`, { headers: { Authorization: `Bearer ${token2}` } });
        if (rc.ok) setContactosTodos(await rc.json());
        setModalNuevosContactos(data.nuevos_pendientes.map(p => ({
          ...p, _nombre: '', _nombre_empresa: p.nombre_entidad || '', _asignarA: null, _ignorar: false,
          _nif_cif: p.nif_cif || '', _direccion: p.direccion || '', _email: p.email || '', _roles: ['proveedor'],
        })));
      }
    } catch (e) { alert('Error guardando: ' + e.message); }
    finally { setGuardando(false); }
  }

  async function cargarDocsContacto(contactoId) {
    setLoadingDocs(true);
    setDocsContacto([]);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/facturas?contacto_id=${contactoId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setDocsContacto(await r.json());
    } catch(e) {}
    finally { setLoadingDocs(false); }
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

  async function detectarErrores() {
    const key = `${anio}-${trimestreAbierto + 1}`;
    const facturasGuardadas = facturasPorTrimestre[key] || [];
    if (!facturasGuardadas.length) { alert('No hay facturas guardadas en este trimestre'); return; }
    setDetectando(true);
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/movimientos-con-factura?anio=${anio}&trimestre=${trimestreAbierto + 1}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const movs = await r.json();
      if (!r.ok) throw new Error(movs.error || `Error ${r.status}`);

      const conflictos = [];
      const movsUsados = new Set();
      const normTipo = t => (t || '').toLowerCase().includes('ingreso') ? 'ingreso' : 'gasto';
      const mesNom = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

      // Tokeniza un texto: minúsculas, sin acentos, sin puntuación, palabras de ≥3 chars
      const tokens = s => (s || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/).filter(w => w.length >= 3);

      // Contactos disponibles para el matching
      const ctodosMatch = docTabContactos.length ? docTabContactos : contactosTodos;

      // Nombres canónicos de una factura: siempre del contacto vinculado (nombre + alias).
      // Si no hay contacto vinculado, devuelve [] — se trata como error de datos.
      const facNombres = fac => {
        const contactoId = fac.tipo === 'gasto' ? fac.factura_proveedor_id : fac.factura_cliente_id;
        const contacto = contactoId ? ctodosMatch.find(c => c.id === contactoId) : null;
        if (!contacto) return [];
        const nombres = [];
        if (contacto.nombre) nombres.push(contacto.nombre);
        if (contacto.nombre_empresa) nombres.push(contacto.nombre_empresa);
        if (Array.isArray(contacto.alias)) nombres.push(...contacto.alias.filter(Boolean));
        return nombres;
      };

      // Penalización: usa TODOS los nombres candidatos de la factura, devuelve la menor penalización
      const nombrePenaltyFac = (fac, movNombre) => {
        const nombres = facNombres(fac);
        if (!nombres.length || !movNombre) return 0;
        const tM = tokens(movNombre);
        return Math.min(...nombres.map(n => {
          const tF = tokens(n);
          if (!tF.length) return 0;
          const matches = tF.filter(w => tM.some(wm => wm.includes(w) || w.includes(wm)));
          return (1 - matches.length / tF.length) * 8;
        }));
      };

      // Descarte duro: solo si TODOS los nombres candidatos de la factura son incompatibles con el movimiento
      // (ambos lados ≥2 tokens y sin tokens en común)
      const nombreIncompatible = (fac, movNombre) => {
        const nombres = facNombres(fac);
        if (!nombres.length || !movNombre) return false;
        const tM = tokens(movNombre);
        if (!tM.length) return false;
        // Compatible si ALGÚN nombre candidato tiene tokens en común con el movimiento
        return !nombres.some(n => {
          const tF = tokens(n);
          if (tF.length < 2 || tM.length < 2) return true; // no suficiente contexto → no descartar
          return tF.some(w => tM.some(wm => wm.includes(w) || w.includes(wm)));
        });
      };

      // Para cada factura subida, buscar el movimiento DB más parecido
      // NOTA: fac.importe es la BASE (sin IVA). El movimiento tiene base_imponible y cantidad (total con IVA).
      for (const fac of facturasGuardadas) {
        const facBase  = Math.abs(fac.importe || 0);
        const facIva   = Math.abs(fac.impuesto || 0);
        const facTotal = facBase + facIva;
        const facTipo  = fac.tipo;

        // Error: factura sin contacto vinculado (siempre debe tener proveedor o cliente)
        const contactoReqId = facTipo === 'gasto' ? fac.factura_proveedor_id : fac.factura_cliente_id;
        if (!contactoReqId) {
          conflictos.push({ tipo: 'sin_contacto', factura: fac, severidad: 'error',
            desc: `Factura de ${fmt(facBase)} sin ${facTipo === 'gasto' ? 'proveedor' : 'cliente'} vinculado. Asigna el contacto en la pestaña Documentos.` });
          continue;
        }

        // Distancia de importes: mínimo entre 4 combinaciones base/total
        const importeDiff = m => Math.min(
          Math.abs(Math.abs(m.base_imponible || 0) - facBase),
          Math.abs(Math.abs(m.cantidad || 0) - facTotal),
          Math.abs(Math.abs(m.base_imponible || 0) - facTotal),
          Math.abs(Math.abs(m.cantidad || 0) - facBase)
        );

        // Penalización por distancia de fecha: 0.1 € por día de diferencia entre
        // la fecha de la factura (doc) y la fecha del movimiento.
        // Permite desempatar cuando dos movimientos tienen el mismo importe (ej: dos suscripciones SaaS).
        const fechaPenalty = m => {
          if (!fac.fecha_factura || !m.fecha) return 0;
          const dias = Math.abs(new Date(fac.fecha_factura) - new Date(m.fecha)) / 86400000;
          return dias * 0.1;
        };

        // 1º: movimientos con importe_factura explícito
        let candidatos = movs
          .filter(m => !movsUsados.has(m.id) && normTipo(m.tipo) === facTipo && m.importe_factura != null && !nombreIncompatible(fac, m.nombre))
          .map(m => {
            const diff = Math.min(
              Math.abs(Math.abs(m.importe_factura) - facBase),
              Math.abs(Math.abs(m.importe_factura) - facTotal)
            );
            return { m, diff, score: diff + fechaPenalty(m) + nombrePenaltyFac(fac, m.nombre) };
          })
          .filter(c => c.diff <= 1)
          .sort((a, b) => a.score - b.score);

        // 2º: movimientos con fecha_factura pero sin importe_factura — comparar por base/total
        // Umbral 2.5€ para absorber diferencias de conversión de divisa (ej: USD→EUR)
        if (!candidatos.length) {
          candidatos = movs
            .filter(m => !movsUsados.has(m.id) && normTipo(m.tipo) === facTipo && m.fecha_factura != null && m.importe_factura == null && !nombreIncompatible(fac, m.nombre))
            .map(m => {
              const diff = importeDiff(m);
              return { m, diff, score: diff + fechaPenalty(m) + nombrePenaltyFac(fac, m.nombre) };
            })
            .filter(c => c.diff <= 2.5)
            .sort((a, b) => a.score - b.score);
        }

        if (!candidatos.length) {
          conflictos.push({ tipo: 'sin_movimiento', factura: fac, severidad: 'warning',
            desc: `Factura de ${fmt(facBase)} sin movimiento en DB que tenga datos de factura asociados. Puede que el movimiento exista pero le falte rellenar "importe factura" o "fecha factura".` });
          continue;
        }

        const { m } = candidatos[0];
        movsUsados.add(m.id);

        // Movimiento fuera del trimestre actual (cross-trimestre detectado via buffer ±35 días)
        if (m._fuera_trimestre) {
          const [mY, mM] = m.fecha.split('-').map(Number);
          conflictos.push({ tipo: 'cross_trimestre', movimiento: m, factura: fac, severidad: 'error',
            desc: `El movimiento está en ${mesNom[mM-1]}-${mY}, fuera de este trimestre — la factura fue emitida en este período pero el cobro/pago cayó en otro trimestre` });
        }

        // Conflicto: desfase de fecha entre fecha_factura del doc y fecha del movimiento
        if (!m._fuera_trimestre && fac.fecha_factura && m.fecha) {
          const [fY, fM] = fac.fecha_factura.split('-').map(Number);
          const [mY, mM] = m.fecha.split('-').map(Number);
          if (fY !== mY || fM !== mM) {
            conflictos.push({ tipo: 'desfase_fecha', movimiento: m, factura: fac, severidad: 'warning',
              desc: `Factura emitida en ${mesNom[fM-1]}-${fY} pero el movimiento está registrado en ${mesNom[mM-1]}-${mY}` });
          }
        }

        // Conflicto: desfase entre fecha_factura guardada en DB y fecha del documento subido
        // Para gastos: es normal que el doc tenga fecha posterior al movimiento (ciclo de facturación).
        // Solo alertar si la diferencia es > 5 días O si el doc es anterior a la DB.
        if (fac.fecha_factura && m.fecha_factura && fac.fecha_factura !== m.fecha_factura) {
          const docDate = new Date(fac.fecha_factura);
          const dbDate  = new Date(m.fecha_factura);
          const diffDias = (docDate - dbDate) / 86400000; // positivo = doc más reciente
          const esGasto = facTipo === 'gasto';
          const esCasoNormal = esGasto && diffDias > 0 && diffDias <= 5; // doc posterior ≤5 días en compra → OK
          if (!esCasoNormal) {
            conflictos.push({ tipo: 'fecha_factura_distinta', movimiento: m, factura: fac, severidad: 'warning',
              desc: `Fecha en el documento: ${fac.fecha_factura} vs fecha de factura en DB: ${m.fecha_factura}` });
          }
        }

        // Conflicto: IVA
        const movIva = Math.abs(m.iva_a_pagar || 0);
        if (facIva > 0 && movIva === 0) {
          conflictos.push({ tipo: 'iva_faltante_db', movimiento: m, factura: fac, severidad: 'error',
            desc: `La factura refleja ${fmt(facIva)} de IVA pero el movimiento no tiene IVA registrado` });
        } else if (facIva === 0 && movIva > 0) {
          conflictos.push({ tipo: 'iva_en_db_sin_factura', movimiento: m, factura: fac, severidad: 'warning',
            desc: `El movimiento tiene ${fmt(movIva)} de IVA en DB pero la factura subida no muestra IVA` });
        } else if (facIva > 0 && movIva > 0 && Math.abs(facIva - movIva) > 1) {
          conflictos.push({ tipo: 'iva_diferente', movimiento: m, factura: fac, severidad: 'error',
            desc: `IVA en factura: ${fmt(facIva)} vs IVA en DB: ${fmt(movIva)} (diferencia ${fmt(Math.abs(facIva - movIva))})` });
        }

        // Conflicto: total pagado ≠ total factura (base + IVA)
        const movTotal = Math.abs(m.cantidad || 0);
        if (facTotal > 0 && Math.abs(movTotal - facTotal) > 1) {
          conflictos.push({ tipo: 'importe_distinto', movimiento: m, factura: fac, severidad: 'warning',
            desc: `Total cobrado/pagado: ${fmt(movTotal)} vs total factura (base+IVA): ${fmt(facTotal)}` });
        }
      }

      // Movimientos con datos de factura en DB que no matchearon con ninguna factura subida
      for (const m of movs) {
        if (!movsUsados.has(m.id) && (m.importe_factura != null || m.fecha_factura != null)) {
          conflictos.push({ tipo: 'sin_factura_subida', movimiento: m, severidad: 'info',
            desc: `Tiene ${m.importe_factura != null ? `importe_factura: ${fmt(Math.abs(m.importe_factura))}` : ''}${m.fecha_factura ? ` fecha: ${m.fecha_factura}` : ''} en DB pero ninguna factura subida coincide` });
        }
      }

      setErroresData(conflictos);
      setErroresModal(true);
    } catch (e) { alert('Error: ' + e.message); }
    setDetectando(false);
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
        <span style={{ color: f._warning ? '#f59e0b' : '#52525b', fontSize:11, minWidth:16 }} title={f._warning || undefined}>{f._warning ? '⚠️' : '📄'}</span>
        {f.archivo_url
          ? <button onClick={() => setFacturaViewer({ url: f.archivo_url, nombre: f.archivo_nombre, id: f.id, data: f })} style={{ flex:1, background:'none', border:'none', padding:0, color: f._warning ? '#fbbf24' : '#60a5fa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:100, textAlign:'left', cursor:'pointer', fontSize:12 }} title={f._warning || 'Ver documento'}>{f.archivo_nombre || '—'}</button>
          : <span style={{ flex:1, color: f._warning ? '#fbbf24' : '#a1a1aa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:100 }} title={f._warning || undefined}>{f.archivo_nombre || '—'}</span>
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
                  {/* Comparativa DB vs Con Factura DB vs Facturas subidas */}
                  {facturasGuardadas.length > 0 && (() => {
                    // Facturas subidas (año actual)
                    const fIng  = facturasGuardadas.filter(f => f.tipo === 'ingreso').reduce((s, f) => s + (f.importe || 0), 0);
                    const fGas  = facturasGuardadas.filter(f => f.tipo === 'gasto').reduce((s, f)   => s + Math.abs(f.importe || 0), 0);
                    const fIvaR = facturasGuardadas.filter(f => f.tipo === 'ingreso').reduce((s, f) => s + (f.impuesto || 0), 0);
                    const fIvaS = facturasGuardadas.filter(f => f.tipo === 'gasto').reduce((s, f)   => s + Math.abs(f.impuesto || 0), 0);
                    // DB total (año actual)
                    const dbIng = t.facturacion; const dbGas = t.totalGastos;
                    const dbIvaR = t.ivaRepercutido; const dbIvaS = t.ivaSoportado;
                    // DB con factura (año actual)
                    const cf = t.conFactura || {};
                    const cfIng = cf.facturacion || 0; const cfGas = cf.totalGastos || 0;
                    const cfIvaR = cf.ivaRepercutido || 0; const cfIvaS = cf.ivaSoportado || 0;
                    // Comparativa (año anterior — solo DB)
                    const cfc = tc?.conFactura || {};

                    const dc = v => v === 0 ? '#52525b' : v > 0 ? '#22c55e' : '#f87171';
                    const dl = v => v === 0 ? '±0' : (v > 0 ? '+' : '') + fmt(v);
                    const Col = ({ v, color, comp }) => (
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:1 }}>
                        <span style={{ color: color || '#d4d4d8', fontWeight:600 }}>{fmt(v)}</span>
                        {comp != null && <span style={{ color:'#3f3f46', fontSize:10 }}>ant. {fmt(comp)}</span>}
                      </div>
                    );
                    const DCol = ({v}) => <span style={{ color: dc(v), fontWeight:700, fontSize:11 }}>{dl(v)}</span>;
                    const cols = ['Ingresos','IVA rep.','Gastos','IVA sop.'];
                    const rows = [
                      { label:'Total movimientos', vals:[dbIng, dbIvaR, dbGas, dbIvaS], colors:['#22c55e','#f59e0b','#f87171','#f59e0b'],
                        comps: tc ? [tc.facturacion, tc.ivaRepercutido, tc.totalGastos, tc.ivaSoportado] : null },
                      { label:'Con factura (DB)',  vals:[cfIng, cfIvaR, cfGas, cfIvaS], colors:['#22c55e','#f59e0b','#f87171','#f59e0b'],
                        comps: tc ? [cfc.facturacion||0, cfc.ivaRepercutido||0, cfc.totalGastos||0, cfc.ivaSoportado||0] : null },
                      { label:'Facturas subidas',  vals:[fIng, fIvaR, fGas, fIvaS], colors:['#22c55e','#f59e0b','#f87171','#f59e0b'], comps: null },
                      { label:'Diferencia (sub−DB fact)', diff: true, vals:[fIng-cfIng, fIvaR-cfIvaR, fGas-cfGas, fIvaS-cfIvaS], comps: null },
                    ];
                    return (
                      <div style={{ background:'#0d0d0d', border:'1px solid #27272a', borderRadius:8, padding:'10px 14px', marginBottom:14, overflowX:'auto' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                          <p style={{ color:'#52525b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', margin:0 }}>
                            Conciliación facturas vs movimientos{tc ? <span style={{ color:'#3f3f46', fontWeight:400 }}> — ant. {anioComp}</span> : null}
                          </p>
                          <button onClick={detectarErrores} disabled={detectando}
                            style={{ background:'#1a0a0a', border:'1px solid #7f1d1d', color:'#f87171', borderRadius:6, padding:'2px 10px', fontSize:10, cursor: detectando ? 'not-allowed' : 'pointer', fontWeight:600, opacity: detectando ? 0.7 : 1, flexShrink:0 }}>
                            {detectando ? 'Analizando…' : '⚠ Detectar errores'}
                          </button>
                        </div>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                          <thead>
                            <tr>
                              <th style={{ color:'#52525b', fontWeight:600, fontSize:10, textAlign:'left', paddingRight:16, paddingBottom:6, whiteSpace:'nowrap' }}></th>
                              {cols.map(c => <th key={c} style={{ color:'#52525b', fontWeight:600, fontSize:10, textAlign:'right', paddingRight:12, paddingBottom:6, whiteSpace:'nowrap' }}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map(({ label, vals, colors, diff, comps }) => (
                              <tr key={label} style={{ borderTop:'1px solid #1f1f1f' }}>
                                <td style={{ color: diff ? '#52525b' : '#71717a', fontSize:11, paddingRight:16, paddingTop:5, paddingBottom:5, whiteSpace:'nowrap', verticalAlign:'top' }}>{label}</td>
                                {vals.map((v, vi) => (
                                  <td key={vi} style={{ textAlign:'right', paddingRight:12, paddingTop:5, paddingBottom:5, verticalAlign:'top' }}>
                                    {diff ? <DCol v={v} /> : <Col v={v} color={colors[vi]} comp={comps?.[vi]} />}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {/* Modelos de Hacienda (calculados desde facturas subidas) */}
                  {facturasGuardadas.length > 0 && (() => {
                    const ing = facturasGuardadas.filter(f => f.tipo === 'ingreso');
                    const gas = facturasGuardadas.filter(f => f.tipo === 'gasto');
                    // Mod.303
                    const ivaRep = ing.reduce((s, f) => s + (f.impuesto || 0), 0);
                    const ivaSop = gas.reduce((s, f) => s + Math.abs(f.impuesto || 0), 0);
                    const mod303 = ivaRep - ivaSop;
                    // Mod.111 — IRPF retenido EN gastos (lo que el usuario retiene al pagar freelancers)
                    const irpf111 = gas.filter(f => (f.irpf || 0) > 0).reduce((s, f) => s + (f.irpf || 0), 0);
                    // Mod.130 — Estimación 20% beneficio neto (estimación directa)
                    const ingBase = ing.reduce((s, f) => s + (f.importe || 0), 0);
                    const gasBase = gas.reduce((s, f) => s + Math.abs(f.importe || 0), 0);
                    const mod130 = Math.max(0, (ingBase - gasBase) * 0.20);
                    // Mod.349 — Intracomunitarias: gastos con NIF de país EU y sin IVA
                    const euRe = /^(IE|FR|DE|IT|NL|BE|PT|AT|FI|SE|DK|PL|CZ|RO|HU|SK|SI|HR|BG|EE|LV|LT|LU|MT|CY|EL|GR)/i;
                    const intracom = gas.filter(f => f.nif_cif && euRe.test(f.nif_cif) && !(f.impuesto > 0));
                    const base349 = intracom.reduce((s, f) => s + Math.abs(f.importe || 0), 0);

                    // Comparativa modelos desde DB del año anterior
                    const tcMod303 = tc ? tc.ivaAPagar : null;
                    const tcMod111 = tc ? tc.irpfRetenido : null;
                    const tcMod130 = tc ? Math.max(0, (tc.facturacion - tc.totalGastos) * 0.20) : null;

                    const ModCard = ({ num, titulo, desc, valor, valorLabel, info, comp, compLabel, secciones }) => (
                      <div style={{ background:'#0d0d0d', border:'1px solid #27272a', borderRadius:8, padding:'10px 14px', flex:'1 1 180px', minWidth:160 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                          <span onClick={() => secciones && setModDetalle({ num, titulo, desc, valor, valorLabel, info, secciones })}
                            style={{ background:'#1a1a1a', border:'1px solid #3f3f46', borderRadius:4, color: secciones ? '#a78bfa' : '#a1a1aa', fontSize:10, fontWeight:700, padding:'1px 6px', cursor: secciones ? 'pointer' : 'default' }}>Mod.{num}</span>
                          <span style={{ color:'#52525b', fontSize:10 }}>{titulo}</span>
                        </div>
                        <p style={{ color:'#71717a', fontSize:10, margin:'0 0 6px' }}>{desc}</p>
                        {info
                          ? <span style={{ color:'#52525b', fontSize:12, fontWeight:600 }}>Informativo</span>
                          : <>
                              <span style={{ color: valor > 0 ? '#f87171' : valor < 0 ? '#22c55e' : '#52525b', fontSize:16, fontWeight:700 }}>
                                {valor > 0 ? '' : valor < 0 ? '−' : ''}{fmt(Math.abs(valor))}
                                {valorLabel && <span style={{ color:'#52525b', fontSize:10, fontWeight:400, marginLeft:4 }}>{valorLabel}</span>}
                              </span>
                              {comp != null && (
                                <p style={{ color:'#3f3f46', fontSize:10, margin:'4px 0 0' }}>
                                  ant. {fmt(Math.abs(comp))}{compLabel ? ` ${compLabel}` : ''}
                                  {comp !== 0 && valor !== 0 && <span style={{ color: valor < comp ? '#22c55e' : '#f87171', marginLeft:4 }}>
                                    ({valor < comp ? '↓' : '↑'}{Math.round(Math.abs((valor - comp) / comp) * 100)}%)
                                  </span>}
                                </p>
                              )}
                            </>
                        }
                        {num === '349' && base349 > 0 && (
                          <p style={{ color:'#71717a', fontSize:10, margin:'4px 0 0' }}>Base: {fmt(base349)} ({intracom.length} ops.)</p>
                        )}
                      </div>
                    );

                    return (
                      <div style={{ marginBottom:14 }}>
                        <p style={{ color:'#52525b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 8px' }}>
                          Modelos de Hacienda (según facturas){tc ? <span style={{ color:'#3f3f46', fontWeight:400 }}> — ant. {anioComp} desde DB</span> : null}
                        </p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          <ModCard num="303" titulo="IVA trimestral" desc={`IVA rep. ${fmt(ivaRep)} − IVA sop. ${fmt(ivaSop)}`} valor={mod303} valorLabel={mod303 > 0 ? 'a pagar' : mod303 < 0 ? 'a compensar' : ''} comp={tcMod303} compLabel={tcMod303 > 0 ? 'a pagar' : tcMod303 < 0 ? 'a compensar' : ''}
                            secciones={[
                              { label: `IVA repercutido — ${fmt(ivaRep)}`, facturas: ing.filter(f => f.impuesto), campoImporte: 'impuesto' },
                              { label: `IVA soportado — ${fmt(ivaSop)}`, facturas: gas.filter(f => f.impuesto), campoImporte: 'impuesto' },
                            ]} />
                          <ModCard num="111" titulo="Retenc. IRPF" desc="IRPF retenido al pagar a terceros" valor={irpf111} valorLabel={irpf111 > 0 ? 'a ingresar' : ''} info={irpf111 === 0} comp={tcMod111}
                            secciones={[
                              { label: 'Gastos con IRPF retenido', facturas: gas.filter(f => (f.irpf || 0) > 0), campoImporte: 'irpf' },
                            ]} />
                          <ModCard num="130" titulo="IRPF fraccionado" desc={`20% s/ beneficio ${fmt(ingBase - gasBase)} (est.)`} valor={mod130} valorLabel="estimado" info={mod130 === 0} comp={tcMod130} compLabel="estimado"
                            secciones={[
                              { label: `Ingresos — base ${fmt(ingBase)}`, facturas: ing, campoImporte: 'importe' },
                              { label: `Gastos — base ${fmt(gasBase)}`, facturas: gas, campoImporte: 'importe' },
                            ]} />
                          <ModCard num="349" titulo="Intracomunitarias" desc="Servicios EU sin IVA (Google, Meta…)" valor={0} info={base349 === 0}
                            secciones={base349 === 0 ? undefined : [{ label: 'Operaciones intracomunitarias', facturas: intracom, campoImporte: 'importe' }]} />
                          {base349 > 0 && <ModCard num="349" titulo="Intracomunitarias" desc={`${intracom.length} operaciones EU`} valor={base349} valorLabel="base declarable"
                            secciones={[{ label: 'Operaciones intracomunitarias', facturas: intracom, campoImporte: 'importe' }]} />}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Input file oculto */}
                  <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" style={{ display:'none' }}
                    onChange={e => { handleFiles(e.target.files, tipoActivo); e.target.value = ''; }} />

                  {/* Botón + Añadir / zonas de drop */}
                  {!subirAbierto
                    ? <button onClick={() => setSubirAbierto(true)} style={{ background:'#18181b', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:8, padding:'8px 18px', fontSize:13, cursor:'pointer', fontWeight:600, marginBottom:12 }}>＋ Añadir facturas</button>
                    : (
                      <div style={{ marginBottom:12 }}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:6 }}>
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
                        <button onClick={() => setSubirAbierto(false)} style={{ background:'none', border:'none', color:'#52525b', fontSize:11, cursor:'pointer', padding:0 }}>Ocultar</button>
                      </div>
                    )
                  }

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
                  {facturasGuardadas.length > 0 && (() => {
                    const filtradas = facturasGuardadas
                      .filter(f => facturaFiltro === 'todos' || f.tipo === facturaFiltro)
                      .sort((a, b) => {
                        if (facturaOrden === 'fecha_desc') return (b.fecha_factura || '').localeCompare(a.fecha_factura || '');
                        if (facturaOrden === 'fecha_asc')  return (a.fecha_factura || '').localeCompare(b.fecha_factura || '');
                        if (facturaOrden === 'importe_desc') return (b.importe || 0) - (a.importe || 0);
                        if (facturaOrden === 'importe_asc')  return (a.importe || 0) - (b.importe || 0);
                        return 0;
                      });
                    return (
                    <div style={{ background:'#0d0d0d', border:'1px solid #3f3f46', borderRadius:8, overflow:'hidden' }}>
                      {/* Header con controles */}
                      <div style={{ padding:'8px 10px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <input type="checkbox"
                          checked={filtradas.length > 0 && filtradas.every(f => selFacturas.has(f.id))}
                          onChange={e => {
                            setSelFacturas(prev => {
                              const s = new Set(prev);
                              filtradas.forEach(f => e.target.checked ? s.add(f.id) : s.delete(f.id));
                              return s;
                            });
                          }}
                          style={{ accentColor:'#0067FD', cursor:'pointer', opacity: selFacturas.size > 0 ? 1 : 0.3, transition:'opacity 0.15s' }} />
                        <span style={{ color:'#71717a', fontSize:12, fontWeight:600 }}>
                          Guardadas ({filtradas.length}{filtradas.length !== facturasGuardadas.length ? `/${facturasGuardadas.length}` : ''})
                        </span>
                        {/* Filtro tipo */}
                        <div style={{ display:'flex', gap:4, marginLeft:'auto' }}>
                          {[['todos','Todos'],['ingreso','Ingresos'],['gasto','Gastos']].map(([v,l]) => (
                            <button key={v} onClick={() => setFacturaFiltro(v)}
                              style={{ background: facturaFiltro===v ? (v==='ingreso'?'#052e16':v==='gasto'?'#1a0a0a':'#27272a') : 'transparent', color: facturaFiltro===v ? (v==='ingreso'?'#22c55e':v==='gasto'?'#f87171':'white') : '#52525b', border: `1px solid ${facturaFiltro===v?(v==='ingreso'?'#166534':v==='gasto'?'#7f1d1d':'#3f3f46'):'transparent'}`, borderRadius:6, padding:'2px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>
                              {l}
                            </button>
                          ))}
                        </div>
                        {/* Ordenación */}
                        <select value={facturaOrden} onChange={e => setFacturaOrden(e.target.value)}
                          style={{ background:'#18181b', color:'#a1a1aa', border:'1px solid #3f3f46', borderRadius:6, padding:'2px 6px', fontSize:11, cursor:'pointer' }}>
                          <option value="fecha_desc">Fecha ↓</option>
                          <option value="fecha_asc">Fecha ↑</option>
                          <option value="importe_desc">Importe ↓</option>
                          <option value="importe_asc">Importe ↑</option>
                        </select>
                        {selFacturas.size > 0 && (
                          <button onClick={eliminarFacturasBulk} disabled={eliminandoBulk}
                            style={{ background:'#7f1d1d', border:'1px solid #991b1b', color:'#f87171', borderRadius:6, padding:'3px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                            {eliminandoBulk ? 'Eliminando…' : `Eliminar ${selFacturas.size}`}
                          </button>
                        )}
                      </div>
                      {filtradas.map(f => <FacturaRow key={f.id} f={f} selectable />)}
                    </div>
                    );
                  })()}

                  {pendientes.length === 0 && facturasGuardadas.length === 0 && !extrayendo && (
                    <p style={{ color:'#3f3f46', fontSize:13, margin:0 }}>Sin facturas. Usa los botones para subir PDFs o imágenes.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Detectar Errores */}
      {erroresModal && createPortal(
        <div onClick={() => { setErroresModal(false); setErrMovDetail(null); setErrMovEditar(null); setErrFiltro('todos'); }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9000, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'24px 16px', overflowY:'auto' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:740, background:'#161616', border:'1px solid #3f3f46', borderRadius:14, overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', borderBottom:'1px solid #27272a', background:'#111', flexWrap:'wrap' }}>
              <span style={{ color:'#f87171', fontSize:14 }}>⚠</span>
              <span style={{ color:'white', fontWeight:700, fontSize:14 }}>Análisis de conflictos</span>
              {/* Filtros */}
              <div style={{ display:'flex', gap:4, marginLeft:8 }}>
                {[
                  ['todos', 'Todos', '#71717a', '#27272a'],
                  ['error', `${erroresData.filter(c=>c.severidad==='error').length} errores`, '#f87171', '#1a0505'],
                  ['warning', `${erroresData.filter(c=>c.severidad==='warning').length} avisos`, '#fbbf24', '#1a1200'],
                  ['info', `${erroresData.filter(c=>c.severidad==='info').length} info`, '#60a5fa', '#050d1a'],
                ].map(([v, l, col, bg]) => (
                  <button key={v} onClick={() => setErrFiltro(v)}
                    style={{ background: errFiltro===v ? bg : 'transparent', border:`1px solid ${errFiltro===v ? col : '#3f3f46'}`, color: errFiltro===v ? col : '#52525b', borderRadius:6, padding:'2px 9px', fontSize:10, cursor:'pointer', fontWeight:600 }}>
                    {l}
                  </button>
                ))}
              </div>
              <button onClick={() => { setErroresModal(false); setErrMovDetail(null); setErrMovEditar(null); setErrFiltro('todos'); }}
                style={{ background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:18, lineHeight:1, padding:'2px 6px', marginLeft:'auto' }}>✕</button>
            </div>

            {(() => {
              const tipoLabel = {
                sin_contacto:          'Factura sin proveedor/cliente vinculado',
                sin_movimiento:        'Sin movimiento en DB con datos de factura',
                sin_factura_subida:    'Sin factura subida',
                cross_trimestre:       'Cobro/pago en trimestre diferente al de la factura',
                desfase_fecha:         'Desfase de fecha (mismo trimestre)',
                fecha_factura_distinta:'Fecha de factura diferente (doc vs DB)',
                iva_faltante_db:       'IVA no registrado en DB',
                iva_en_db_sin_factura: 'IVA en DB sin IVA en factura',
                iva_diferente:         'IVA diferente',
                importe_distinto:      'Importe total ≠ total factura',
              };
              const filtrados = errFiltro === 'todos' ? erroresData : erroresData.filter(c => c.severidad === errFiltro);
              if (!filtrados.length) return <div style={{ padding:32, textAlign:'center', color:'#22c55e', fontWeight:600 }}>✓ Sin conflictos en este filtro</div>;
              return filtrados.map((c, ci) => {
                const sevColor = c.severidad === 'error' ? '#f87171' : c.severidad === 'warning' ? '#fbbf24' : '#60a5fa';
                const sevBg    = c.severidad === 'error' ? '#1a0505' : c.severidad === 'warning' ? '#1a1200' : '#050d1a';
                const sevLabel = c.severidad === 'error' ? 'Error' : c.severidad === 'warning' ? 'Aviso' : 'Info';
                const tienePar = c.movimiento && c.factura?.archivo_url;
                return (
                  <div key={ci} style={{ borderBottom:'1px solid #1f1f1f', padding:'12px 18px', background: ci % 2 === 0 ? 'transparent' : '#0a0a0a' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                      <span style={{ background: sevBg, border:`1px solid ${sevColor}`, color: sevColor, fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px', whiteSpace:'nowrap', flexShrink:0, marginTop:1 }}>{sevLabel}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ color:'white', fontWeight:600, fontSize:12, margin:'0 0 2px' }}>{tipoLabel[c.tipo] || c.tipo}</p>
                        <p style={{ color:'#71717a', fontSize:11, margin:'0 0 8px', lineHeight:1.5 }}>{c.desc}</p>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                          {c.movimiento && (
                            <button onClick={() => abrirMovEnErrores(c.movimiento)}
                              style={{ background:'#18181b', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:260, overflow:'hidden' }}>
                              <span style={{ flexShrink:0 }}>📋</span>
                              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.movimiento.nombre}</span>
                              <span style={{ color: c.movimiento.tipo?.toLowerCase().includes('ingreso') ? '#22c55e' : '#f87171', fontWeight:700, flexShrink:0 }}>{fmt(Math.abs(c.movimiento.cantidad))}€</span>
                            </button>
                          )}
                          {c.factura?.archivo_url && (
                            <button onClick={() => setFacturaViewer({ url: c.factura.archivo_url, nombre: c.factura.archivo_nombre, id: c.factura.id, data: c.factura })}
                              style={{ background:'#050d1a', border:'1px solid #1d4ed8', color:'#60a5fa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', gap:5, maxWidth:260, overflow:'hidden' }}>
                              <span style={{ flexShrink:0 }}>📄</span>
                              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.factura.archivo_nombre}</span>
                            </button>
                          )}
                          {tienePar && (
                            <button onClick={() => setErrSplitView({ movimiento: c.movimiento, factura: c.factura })}
                              style={{ background:'#0d0d0d', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                              ⬡ Ver ambos
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Movimiento detalle desde errores — zIndex por encima del modal errores */}
      {errMovDetail && createPortal(
        <ModalMovimiento
          m={errMovDetail}
          onClose={() => { setErrMovDetail(null); const p = new URLSearchParams(window.location.search); p.delete('mov'); window.history.replaceState({}, '', p.toString() ? `${window.location.pathname}?${p}` : window.location.pathname); }}
          onEditar={m => { setErrMovDetail(null); setErrMovEditar(m); }}
          onEliminar={null}
          onConfirm={() => {}}
          zIndex={9100}
        />,
        document.body
      )}

      {/* Movimiento editar desde errores */}
      {errMovEditar && createPortal(
        <ModalEditar
          movimiento={errMovEditar}
          zIndex={9200}
          onGuardado={(data) => {
            setErroresData(prev => prev.map(c =>
              c.movimiento?.id === errMovEditar.id ? { ...c, movimiento: { ...c.movimiento, ...data } } : c
            ));
            setErrMovEditar(null);
          }}
          onCerrar={() => setErrMovEditar(null)}
        />,
        document.body
      )}

      {/* Split view: movimiento (izq) + factura (der) */}
      {errSplitView && createPortal(
        <div onClick={() => setErrSplitView(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:9200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:1200, height:'90vh', display:'flex', gap:0, borderRadius:14, overflow:'hidden', border:'1px solid #3f3f46' }}>
            {/* Izq: detalle movimiento */}
            <div style={{ flex:'0 0 380px', background:'#161616', overflowY:'auto', display:'flex', flexDirection:'column' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderBottom:'1px solid #27272a', flexShrink:0 }}>
                <span style={{ color:'#a1a1aa', fontSize:12, fontWeight:600, flex:1 }}>Movimiento DB</span>
                <button onClick={() => { setErrMovEditar(errSplitView.movimiento); setErrSplitView(null); }}
                  style={{ background:'transparent', border:'1px solid #3f3f46', color:'#71717a', borderRadius:6, padding:'2px 10px', fontSize:11, cursor:'pointer' }}>Editar</button>
              </div>
              {(() => {
                const m = errSplitView.movimiento;
                const esIngreso = (m.tipo||'').toLowerCase().includes('ingreso');
                const col = esIngreso ? '#22c55e' : '#f87171';
                const Field = ({ label, value }) => (
                  <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                    <span style={{ color:'#52525b', fontSize:10, fontWeight:600, textTransform:'uppercase' }}>{label}</span>
                    <span style={{ color: value ? 'white' : '#3f3f46', fontSize:13 }}>{value || '—'}</span>
                  </div>
                );
                return (
                  <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14, flex:1 }}>
                    <div>
                      <p style={{ color:'white', fontWeight:700, fontSize:15, margin:'0 0 4px' }}>{m.nombre}</p>
                      <p style={{ color:'#71717a', fontSize:12, margin:0 }}>{m.fecha} · {m.cuenta}</p>
                    </div>
                    <div style={{ background:'#0d0d0d', borderRadius:10, padding:'12px 14px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                      <div><p style={{ color:'#71717a', fontSize:10, fontWeight:600, textTransform:'uppercase', margin:'0 0 3px' }}>Importe</p>
                        <p style={{ color:col, fontSize:20, fontWeight:700, margin:0 }}>{esIngreso?'+':'-'}{fmt(m.cantidad)}</p></div>
                      <div><p style={{ color:'#71717a', fontSize:10, fontWeight:600, textTransform:'uppercase', margin:'0 0 3px' }}>IVA</p>
                        <p style={{ color:'#f59e0b', fontSize:16, fontWeight:600, margin:0 }}>{fmt(Math.abs(m.iva_a_pagar||0))}</p></div>
                      <div><p style={{ color:'#71717a', fontSize:10, fontWeight:600, textTransform:'uppercase', margin:'0 0 3px' }}>Base</p>
                        <p style={{ color:'white', fontSize:16, fontWeight:600, margin:0 }}>{fmt(m.base_imponible||0)}</p></div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <Field label="Fecha movimiento" value={m.fecha} />
                      <Field label="Tipo" value={m.tipo} />
                      <Field label="IVA" value={m.iva || '—'} />
                      <Field label="IRPF" value={m.irpf || '—'} />
                      <Field label="Fecha factura (DB)" value={m.fecha_factura} />
                      <Field label="Importe factura (DB)" value={m.importe_factura != null ? fmt(Math.abs(m.importe_factura)) : null} />
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Separador */}
            <div style={{ width:1, background:'#27272a', flexShrink:0 }} />
            {/* Der: factura */}
            <div style={{ flex:1, background:'#111', display:'flex', flexDirection:'column', minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderBottom:'1px solid #27272a', flexShrink:0 }}>
                <span style={{ color:'#60a5fa', fontSize:12, fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{errSplitView.factura.archivo_nombre}</span>
                <button onClick={() => { setFacturaViewer({ url: errSplitView.factura.archivo_url, nombre: errSplitView.factura.archivo_nombre, id: errSplitView.factura.id, data: errSplitView.factura }); setErrSplitView(null); }}
                  style={{ background:'transparent', border:'1px solid #3f3f46', color:'#71717a', borderRadius:6, padding:'2px 10px', fontSize:11, cursor:'pointer', flexShrink:0 }}>Editar</button>
                <a href={errSplitView.factura.archivo_url} target="_blank" rel="noreferrer" style={{ color:'#60a5fa', fontSize:11, textDecoration:'none', flexShrink:0 }}>↗</a>
                <button onClick={() => setErrSplitView(null)} style={{ background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:16, lineHeight:1, padding:'0 4px', flexShrink:0 }}>✕</button>
              </div>
              {/* Metadata del documento */}
              {(() => {
                const fac = errSplitView.factura;
                const esGasto = fac.tipo === 'gasto';
                const base = parseFloat(fac.importe||0)||0;
                const total = base+(parseFloat(fac.impuesto)||0)+(parseFloat(fac.irpf)||0);
                const colNum = esGasto ? '#f87171' : '#4ade80';
                return (
                  <div style={{ display:'flex', gap:16, padding:'8px 14px', borderBottom:'1px solid #1f1f1f', flexShrink:0, flexWrap:'wrap', alignItems:'center', background:'#0d0d0d' }}>
                    {fac.tipo && <span style={{ background: esGasto?'#f8717122':'#4ade8022', color: esGasto?'#f87171':'#4ade80', border:`1px solid ${esGasto?'#f8717144':'#4ade8044'}`, borderRadius:4, padding:'1px 7px', fontSize:11, fontWeight:600 }}>{esGasto?'Compra':'Venta'}</span>}
                    {total !== 0 && <span style={{ color:colNum, fontSize:13, fontWeight:700 }}>{esGasto?'-':'+'}{Math.abs(total).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span>}
                    {base !== 0 && <span style={{ color:'#a1a1aa', fontSize:11 }}><span style={{ color:'#52525b' }}>Base </span>{Math.abs(base).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span>}
                    {fac.impuesto != null && fac.impuesto !== 0 && <span style={{ color:'#a1a1aa', fontSize:11 }}><span style={{ color:'#52525b' }}>IVA </span>{parseFloat(fac.impuesto).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span>}
                    {fac.irpf != null && fac.irpf !== 0 && <span style={{ color:'#a1a1aa', fontSize:11 }}><span style={{ color:'#52525b' }}>IRPF </span>{parseFloat(fac.irpf).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span>}
                    {fac.fecha_factura && <span style={{ color:'#a1a1aa', fontSize:11 }}><span style={{ color:'#52525b' }}>Fecha </span>{fac.fecha_factura}</span>}
                    {fac.numero_factura && <span style={{ color:'#a1a1aa', fontSize:11 }}><span style={{ color:'#52525b' }}>Nº </span>{fac.numero_factura}</span>}
                    {fac.nombre_entidad && <span style={{ color:'#a1a1aa', fontSize:11 }}><span style={{ color:'#52525b' }}>Entidad </span>{fac.nombre_entidad}</span>}
                    {fac.nif_cif && <span style={{ color:'#a1a1aa', fontSize:11 }}><span style={{ color:'#52525b' }}>NIF </span>{fac.nif_cif}</span>}
                  </div>
                );
              })()}
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(errSplitView.factura.archivo_nombre)
                ? <img src={errSplitView.factura.archivo_url} alt="" style={{ flex:1, objectFit:'contain', width:'100%', height:'100%' }} />
                : <iframe src={errSplitView.factura.archivo_url} title="factura" style={{ flex:1, width:'100%', border:'none' }} />
              }
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal detalle modelo Hacienda */}
      {modDetalle && createPortal(
        <div onClick={() => setModDetalle(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#111', border:'1px solid #3f3f46', borderRadius:12, width:'100%', maxWidth:700, maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{ background:'#1a1a1a', border:'1px solid #52525b', borderRadius:4, color:'#a78bfa', fontSize:11, fontWeight:700, padding:'2px 8px' }}>Mod.{modDetalle.num}</span>
              <span style={{ color:'#e4e4e7', fontSize:14, fontWeight:600 }}>{modDetalle.titulo}</span>
              <button onClick={() => setModDetalle(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 4px' }}>✕</button>
            </div>
            {/* Descripción + valor */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #27272a', flexShrink:0 }}>
              <p style={{ color:'#71717a', fontSize:12, margin:'0 0 8px' }}>{modDetalle.desc}</p>
              {!modDetalle.info && (
                <span style={{ color: modDetalle.valor > 0 ? '#f87171' : modDetalle.valor < 0 ? '#22c55e' : '#52525b', fontSize:22, fontWeight:700 }}>
                  {modDetalle.valor < 0 ? '−' : ''}{fmt(Math.abs(modDetalle.valor))}
                  {modDetalle.valorLabel && <span style={{ color:'#71717a', fontSize:12, fontWeight:400, marginLeft:6 }}>{modDetalle.valorLabel}</span>}
                </span>
              )}
              {modDetalle.info && <span style={{ color:'#52525b', fontSize:14, fontWeight:600 }}>Informativo</span>}
            </div>
            {/* Secciones de facturas */}
            <div style={{ overflowY:'auto', flex:1 }}>
              {modDetalle.secciones?.map((sec, si) => (
                <div key={si}>
                  <div style={{ padding:'8px 16px', background:'#0d0d0d', borderBottom:'1px solid #27272a', position:'sticky', top:0 }}>
                    <span style={{ color:'#a1a1aa', fontSize:11, fontWeight:700 }}>{sec.label}</span>
                  </div>
                  {sec.facturas.length === 0
                    ? <p style={{ color:'#3f3f46', fontSize:12, padding:'10px 16px', margin:0 }}>Sin facturas</p>
                    : sec.facturas.map((f, fi) => (
                      <div key={fi} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 16px', borderBottom:'1px solid #18181b' }}>
                        {/* Doc clicable */}
                        <div style={{ flex:'0 0 20px' }}>
                          {f.archivo_url
                            ? <button onClick={() => setFacturaViewer({ url: f.archivo_url, nombre: f.archivo_nombre, id: f.id, data: f })}
                                style={{ background:'none', border:'none', padding:0, cursor:'pointer', color:'#60a5fa', fontSize:14, lineHeight:1 }} title="Ver documento">📄</button>
                            : <span style={{ color:'#3f3f46', fontSize:14 }}>—</span>
                          }
                        </div>
                        {/* Entidad */}
                        <span style={{ flex:2, color:'#d4d4d8', fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {f.nombre_entidad || f.archivo_nombre || '—'}
                        </span>
                        {/* Fecha */}
                        <span style={{ flex:'0 0 80px', color:'#71717a', fontSize:11 }}>{f.fecha_factura || '—'}</span>
                        {/* Nº factura */}
                        <span style={{ flex:'0 0 90px', color:'#52525b', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.numero_factura || '—'}</span>
                        {/* Importe relevante */}
                        <span style={{ flex:'0 0 80px', textAlign:'right', color:'#a1a1aa', fontSize:12, fontWeight:600 }}>
                          {fmt(Math.abs(f[sec.campoImporte] || 0))}
                        </span>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
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
    { key:'id',               label:'ID',             w:290, readonly:'text' },
    { key:'notion_id',        label:'Notion ID',      w:290, readonly:'text' },
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
                      ) : col.readonly === 'text' ? (
                        <span style={{ color:'#52525b', fontSize:11, fontFamily:'monospace' }}>
                          {m[col.key] || '—'}
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

// ── Modal para crear / editar contacto (cliente o equipo) ───────

function ModalContacto({ tipo, datos, onGuardado, onCerrar, savingContacto, setSavingContacto }) {
  const esEdicion = !!datos?.id;
  const esCliente = tipo === 'cliente';
  const esEquipo = tipo === 'equipo';
  const esProveedor = tipo === 'proveedor';
  const tipoLabel = esCliente ? 'cliente' : esEquipo ? 'miembro de equipo' : 'proveedor';
  const [form, setForm] = useState({
    nombre:         datos?.nombre         || '',
    nombre_empresa: datos?.nombre_empresa || '',
    email:          datos?.email          || '',
    nif_cif:        datos?.nif_cif        || '',
    direccion:      datos?.direccion      || '',
    notas:          datos?.notas          || '',
    alias:          (datos?.alias || []).join(', '),
    activo:         datos?.activo !== false,
    fijo:           !!datos?.fijo,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleGuardar(e) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setSavingContacto(true);
    try {
      const token = await getToken();
      const aliasArr = form.alias.split(',').map(s => s.trim()).filter(Boolean);
      const base = { nombre: form.nombre, nombre_empresa: form.nombre_empresa || null, email: form.email || null, nif_cif: form.nif_cif || null, direccion: form.direccion || null, notas: form.notas || null, alias: aliasArr };
      const body = esCliente ? { ...base, activo: form.activo } : esEquipo ? { ...base, fijo: form.fijo } : base;
      const ruta = esCliente ? 'clientes' : esEquipo ? 'equipo' : 'proveedores';
      const url = esEdicion
        ? `${BACKEND_URL}/admin/finanzas/${ruta}/${datos.id}`
        : `${BACKEND_URL}/admin/finanzas/${ruta}`;
      const method = esEdicion ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Error ${r.status}`);
      onGuardado();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSavingContacto(false);
    }
  }

  return (
    <div onClick={onCerrar} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1c1c1e', border: '1px solid #3f3f46', borderRadius: 14, padding: '24px 28px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 20px' }}>
          {esEdicion ? 'Editar' : 'Nuevo'} {tipoLabel}
        </h3>
        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={S.label}>Nombre *</label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required style={S.input} placeholder="Nombre" />
          </div>
          <div>
            <label style={S.label}>Empresa</label>
            <input value={form.nombre_empresa} onChange={e => set('nombre_empresa', e.target.value)} style={S.input} placeholder="Nombre de empresa" />
          </div>
          <div>
            <label style={S.label}>NIF / CIF</label>
            <input value={form.nif_cif} onChange={e => set('nif_cif', e.target.value)} style={S.input} placeholder="A12345678" />
          </div>
          <div>
            <label style={S.label}>Dirección</label>
            <input value={form.direccion} onChange={e => set('direccion', e.target.value)} style={S.input} placeholder="Dirección fiscal" />
          </div>
          <div>
            <label style={S.label}>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={S.input} placeholder="email@ejemplo.com" />
          </div>
          <div>
            <label style={S.label}>Alias (separados por coma)</label>
            <input value={form.alias} onChange={e => set('alias', e.target.value)} style={S.input} placeholder="alias1, alias2, ..." />
            <p style={{ color: '#52525b', fontSize: 11, margin: '4px 0 0' }}>Nombres alternativos para matching de facturas</p>
          </div>
          <div>
            <label style={S.label}>Notas</label>
            <input value={form.notas} onChange={e => set('notas', e.target.value)} style={S.input} placeholder="Notas internas" />
          </div>
          {esEdicion && esCliente && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a1a1aa', fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.activo} onChange={e => set('activo', e.target.checked)} style={{ accentColor: '#0067FD' }} />
              Activo
            </label>
          )}
          {esEdicion && esEquipo && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a1a1aa', fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.fijo} onChange={e => set('fijo', e.target.checked)} style={{ accentColor: '#0067FD' }} />
              Fijo
            </label>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onCerrar} style={S.ghost}>Cancelar</button>
            <button type="submit" disabled={savingContacto} style={{ ...S.primary, opacity: savingContacto ? 0.6 : 1 }}>
              {savingContacto ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
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
  const [equipoAbierto, setEquipoAbierto] = useState(null);
  const [equipoBusqueda, setEquipoBusqueda] = useState('');
  const [equipoSort, setEquipoSort] = useState({ campo: 'beneficio', dir: 'asc' });
  const [movFiltroTipo, setMovFiltroTipo] = useState('todos');
  const [movPagina, setMovPagina] = useState(1);
  const [movPorPagina, setMovPorPagina] = useState(10);
  const [docContactoPagina, setDocContactoPagina] = useState(1);
  const [docContactoPorPagina, setDocContactoPorPagina] = useState(10);
  const [movBusqueda, setMovBusqueda] = useState('');
  const [clienteSort, setClienteSort] = useState({ campo: 'beneficio', dir: 'desc' });
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  // Modal contacto (cliente / equipo)
  const [modalContacto, setModalContacto] = useState(null); // null | { tipo: 'cliente'|'equipo', datos: {} | null }
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [proveedorAbierto, setProveedorAbierto] = useState(null);
  const [proveedorBusqueda, setProveedorBusqueda] = useState('');
  const [proveedorSort, setProveedorSort] = useState({ campo: 'gasto', dir: 'desc' });
  const [savingContacto, setSavingContacto] = useState(false);
  // Tabs internas en filas expandibles (Movimientos / Documentos)
  const [contactoTabInner, setContactoTabInner] = useState('movimientos');
  const [docsContacto, setDocsContacto] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docFiltroTipo, setDocFiltroTipo] = useState('todos');
  // Modal nuevos contactos detectados al guardar facturas
  const [modalNuevosContactos, setModalNuevosContactos] = useState(null); // null | array
  const [contactosTodos, setContactosTodos] = useState([]);
  const [confirmandoContactos, setConfirmandoContactos] = useState(false);
  // Tab Documentos (main)
  const [docTabDesde, setDocTabDesde] = useState(() => lsGet('fin_doc_desde', '2023-01-01'));
  const [docTabHasta, setDocTabHasta] = useState(() => lsGet('fin_doc_hasta', new Date().toISOString().slice(0,10)));
  const [documentosList, setDocumentosList] = useState([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [docTabBusqueda, setDocTabBusqueda] = useState('');
  const [docTabTipo, setDocTabTipo] = useState('todos');
  const [docTabSort, setDocTabSort] = useState({ campo: 'fecha_factura', dir: 'desc' });
  const [docTabEditando, setDocTabEditando] = useState(null); // { id, campo, valor }
  const [docTabContactos, setDocTabContactos] = useState([]);
  const [docFiltros, setDocFiltros] = useState([]);
  const [docFiltroOp, setDocFiltroOp] = useState('and');
  const [docSorts, setDocSorts] = useState([]);
  const [docPanelFiltro, setDocPanelFiltro] = useState(false);
  const [docPanelOrdenar, setDocPanelOrdenar] = useState(false);
  const [docSeleccionados, setDocSeleccionados] = useState(new Set());
  const [docPagina, setDocPagina] = useState(1);
  const [docLimit, setDocLimit] = useState(50);
  const [docMostrarTodos, setDocMostrarTodos] = useState(false);
  const [docColCalcs, setDocColCalcs] = useState({});
  const [docOpenCalcKey, setDocOpenCalcKey] = useState(null);
  const [docCalcDropPos, setDocCalcDropPos] = useState(null);
  const [docEliminandoBulk, setDocEliminandoBulk] = useState(false);
  const [docBulkProveedor, setDocBulkProveedor] = useState('');
  const [docBulkCliente, setDocBulkCliente] = useState('');
  const [docHoveredRow, setDocHoveredRow] = useState(null);
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
  const [facturaViewer, setFacturaViewer] = useState(null); // { url, nombre, id?, data? } | null
  const [viewerEditando, setViewerEditando] = useState(false);
  const [viewerDraft, setViewerDraft] = useState({});
  useEffect(() => { setViewerEditando(false); setViewerDraft({}); }, [facturaViewer?.id]);
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

  // URL sync: ?mov=ID ↔ movDetail (igual que Notion con &p=ID)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('mov');
    if (id) abrirDetalle(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (movDetail) {
      params.set('mov', movDetail.id);
    } else {
      params.delete('mov');
    }
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [movDetail]);

  // URL sync: ?doc=ID ↔ facturaViewer
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('doc');
    if (id) {
      getToken().then(token => {
        fetch(`${BACKEND_URL}/admin/finanzas/facturas/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(data => { if (data?.id) setFacturaViewer({ url: data.archivo_url, nombre: data.archivo_nombre || 'Documento', id: data.id, data }); })
          .catch(() => {});
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (facturaViewer?.id) {
      params.set('doc', facturaViewer.id);
    } else {
      params.delete('doc');
    }
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [facturaViewer]);

  async function cargarDocumentos(d, h) {
    const desde = d || docTabDesde;
    const hasta = h || docTabHasta;
    setLoadingDocumentos(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      const [rDocs, rCtodos] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/finanzas/facturas?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        docTabContactos.length ? Promise.resolve(null) :
          fetch(`${BACKEND_URL}/admin/finanzas/contactos/todos`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      let docs = [];
      if (rDocs.ok) { docs = await rDocs.json(); setDocumentosList(docs); }
      if (rCtodos && rCtodos.ok) setDocTabContactos(await rCtodos.json());

      // Detectar facturas huérfanas (sin proveedor/cliente asignado)
      const huerfanas = docs.filter(f =>
        (f.tipo === 'gasto' && !f.factura_proveedor_id) ||
        (f.tipo === 'ingreso' && !f.factura_cliente_id)
      );
      if (huerfanas.length > 0) {
        if (!contactosTodos.length) {
          const token2 = await getToken();
          const rc = await fetch(`${BACKEND_URL}/admin/finanzas/contactos/todos`, { headers: { Authorization: `Bearer ${token2}` } });
          if (rc.ok) setContactosTodos(await rc.json());
        }
        // Agrupar por nombre_entidad+tipo
        const grupos = new Map();
        for (const f of huerfanas) {
          const key = `${f.tipo}||${f.nombre_entidad || ''}`;
          if (!grupos.has(key)) grupos.set(key, { nombre_entidad: f.nombre_entidad || '', nif_cif: f.nif_cif || null, tipo: f.tipo, factura_ids: [], archivo_url: f.archivo_url || null });
          grupos.get(key).factura_ids.push(f.id);
        }
        setModalNuevosContactos([...grupos.values()].map(g => ({
          ...g, _nombre: '', _nombre_empresa: g.nombre_entidad || '', _asignarA: null, _ignorar: false,
          _nif_cif: g.nif_cif || '', _direccion: '', _email: '', _roles: ['proveedor'],
        })));
      }
    } catch(e) {}
    finally { setLoadingDocumentos(false); }
  }

  async function guardarCeldaDoc(id, updates) {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/finanzas/facturas/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Error');
      const updated = await res.json();
      setDocumentosList(prev => prev.map(d => d.id === id ? updated : d));
      return updated;
    } catch(e) { console.error(e); }
  }

  // Calcula campos fiscales derivados al cambiar proveedor/cliente
  function contactFiscalUpdates(contactId, contacts, docTipo, campo) {
    const isExternal = (docTipo === 'gasto' && campo === 'factura_proveedor_id') ||
                       (docTipo === 'ingreso' && campo === 'factura_cliente_id');
    if (!isExternal || !contactId) return {};
    const c = contacts.find(x => x.id === contactId);
    if (!c) return {};
    return { nombre_entidad: c.nombre_empresa || c.nombre || '', nif_cif: c.nif_cif || '' };
  }

  function toggleDocSel(id) {
    setDocSeleccionados(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleDocAll(items, allSel) {
    setDocSeleccionados(prev => {
      const s = new Set(prev);
      if (allSel) items.forEach(d => s.delete(d.id));
      else items.forEach(d => s.add(d.id));
      return s;
    });
  }
  async function eliminarDocsBulk() {
    setDocEliminandoBulk(true);
    try {
      const token = await getToken();
      const ids = [...docSeleccionados];
      await Promise.all(ids.map(id => fetch(`${BACKEND_URL}/admin/finanzas/facturas/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      })));
      setDocumentosList(prev => prev.filter(d => !docSeleccionados.has(d.id)));
      setDocSeleccionados(new Set());
    } catch(e) { console.error(e); }
    finally { setDocEliminandoBulk(false); }
  }

  async function editarDocsBulkContacto(campo, contactId) {
    if (!contactId) return;
    const ctodos = docTabContactos.length ? docTabContactos : contactosTodos;
    const ids = [...docSeleccionados];
    await Promise.all(ids.map(id => {
      const doc = documentosList.find(d => d.id === id);
      const extra = doc ? contactFiscalUpdates(contactId, ctodos, doc.tipo, campo) : {};
      return guardarCeldaDoc(id, { [campo]: contactId, ...extra });
    }));
    if (campo === 'factura_proveedor_id') setDocBulkProveedor('');
    else setDocBulkCliente('');
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === 'documentos') cargarDocumentos(); }, [tab]);
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

  const cargarProveedores = useCallback(async () => {
    setLoadingProveedores(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/proveedores?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      setProveedores(data.proveedores || []);
    } catch (e) {
      console.error('Error cargando proveedores:', e);
    } finally {
      setLoadingProveedores(false);
    }
  }, [desde, hasta]);

  useEffect(() => { if (tab === 'proveedores') cargarProveedores(); }, [tab, cargarProveedores]);

  async function eliminarContacto(id, tipo) {
    try {
      const token = await getToken();
      const r = await fetch(`${BACKEND_URL}/admin/finanzas/contactos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      if (tipo === 'cliente') setClientes(prev => prev.filter(c => c.id !== id));
      else if (tipo === 'equipo') setEquipo(prev => prev.filter(e => e.id !== id));
      else setProveedores(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Error eliminando: ' + err.message);
    }
  }

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
        <button style={tabStyle('documentos')}  onClick={() => { setTab('documentos'); if (!documentosList.length) cargarDocumentos(); }}>Documentos</button>
        <button style={tabStyle('fiscal')}      onClick={() => setTab('fiscal')}>Fiscal</button>
        <button style={tabStyle('clientes')}    onClick={() => setTab('clientes')}>Clientes</button>
        <button style={tabStyle('equipo')}      onClick={() => setTab('equipo')}>Equipo</button>
        <button style={tabStyle('proveedores')} onClick={() => setTab('proveedores')}>Proveedores</button>
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

      {/* ── DOCUMENTOS ── */}
      {tab === 'documentos' && (() => {
        const ctodos = docTabContactos.length ? docTabContactos : contactosTodos;
        const findC = id => ctodos.find(c => c.id === id)?.nombre || '—';

        const COLS_DOCS = [
          { key: 'pdf',                  label: '',           w: 32  },
          { key: 'fecha_factura',        label: 'Fecha',      w: 110 },
          { key: 'numero_factura',       label: 'Nº Factura', w: 145 },
          { key: 'nombre_entidad',       label: 'Entidad',    w: 200 },
          { key: 'tipo',                 label: 'Tipo',       w: 80  },
          { key: 'importe_total',          label: 'Importe',    w: 105, num: true, computed: true },
          { key: 'importe',              label: 'Base Impon.',w: 100, num: true },
          { key: 'impuesto',             label: 'IVA',        w: 90,  num: true },
          { key: 'irpf',                 label: 'IRPF',       w: 95,  num: true },
          { key: 'nif_cif',              label: 'NIF/CIF',    w: 120 },
          { key: 'factura_proveedor_id', label: 'Proveedor',  w: 150 },
          { key: 'factura_cliente_id',   label: 'Cliente',    w: 150 },
          { key: 'trimestre',            label: 'Q',          w: 72  },
          { key: 'archivo_nombre',       label: 'Archivo',    w: 220, editable: true },
          { key: 'id',                   label: 'ID',         w: 280 },
        ];

        // Filtering
        let docs = [...documentosList];
        if (docTabTipo !== 'todos') docs = docs.filter(d => d.tipo === docTabTipo);
        if (docTabBusqueda.trim()) {
          const q = docTabBusqueda.toLowerCase();
          docs = docs.filter(d =>
            (d.nombre_entidad||'').toLowerCase().includes(q) ||
            (d.numero_factura||'').toLowerCase().includes(q) ||
            (d.archivo_nombre||'').toLowerCase().includes(q) ||
            (d.nif_cif||'').toLowerCase().includes(q)
          );
        }
        if (docFiltros.length) {
          docs = docs.filter(doc => {
            const check = f => {
              const v = String(doc[f.campo] ?? '');
              // Map display labels to DB values for tipo field (select with array value)
              const mapTipo = lbl => lbl === 'Venta' ? 'ingreso' : lbl === 'Compra' ? 'gasto' : lbl;
              const mappedVals = f.campo === 'tipo' && Array.isArray(f.valor)
                ? f.valor.map(mapTipo)
                : null;
              const rawFv = String(f.valor ?? '');
              const fv = f.campo === 'tipo' ? mapTipo(rawFv) : rawFv;
              // For select with multiple values, check membership
              if (mappedVals && mappedVals.length > 0) {
                if (f.operador === 'eq') return mappedVals.includes(v);
                if (f.operador === 'neq') return !mappedVals.includes(v);
              }
              // Use numeric comparison when both values are valid numbers; otherwise string (handles ISO dates)
              const cmp = (a, b) => { const na = Number(a), nb = Number(b); return (!isNaN(na) && !isNaN(nb)) ? na - nb : a < b ? -1 : a > b ? 1 : 0; };
              switch(f.operador) {
                case 'ilike': return v.toLowerCase().includes(fv.toLowerCase());
                case 'not_ilike': return !v.toLowerCase().includes(fv.toLowerCase());
                case 'eq': return v === fv;
                case 'neq': return v !== fv;
                case 'gt': return cmp(v, fv) > 0;
                case 'gte': return cmp(v, fv) >= 0;
                case 'lt': return cmp(v, fv) < 0;
                case 'lte': return cmp(v, fv) <= 0;
                case 'is_null': return doc[f.campo]==null || doc[f.campo]==='';
                case 'is_not_null': return doc[f.campo]!=null && doc[f.campo]!=='';
                default: return true;
              }
            };
            return docFiltroOp === 'and' ? docFiltros.every(check) : docFiltros.some(check);
          });
        }
        if (docSorts.length) {
          docs = [...docs].sort((a,b) => {
            for (const s of docSorts) {
              const va = a[s.campo]??'', vb = b[s.campo]??'';
              if (va===vb) continue;
              return (va>vb?1:-1)*(s.dir==='asc'?1:-1);
            }
            return 0;
          });
        } else {
          docs = [...docs].sort((a,b) => ((b.fecha_factura||'')>(a.fecha_factura||'')?1:-1));
        }

        const totalDocs = docs.length;
        const totalPages = Math.max(1, Math.ceil(totalDocs / (docMostrarTodos ? totalDocs||1 : docLimit)));
        const safePag = Math.min(docPagina, totalPages);
        const docsPage = docMostrarTodos ? docs : docs.slice((safePag-1)*docLimit, safePag*docLimit);
        const docAllSel = docsPage.length>0 && docsPage.every(d => docSeleccionados.has(d.id));
        const docSomeSel = docsPage.some(d => docSeleccionados.has(d.id)) && !docAllSel;

        // Calc helpers
        const getDocVal = (d, key) => key === 'importe_total'
          ? (parseFloat(d.importe)||0)+(parseFloat(d.impuesto)||0)+(parseFloat(d.irpf)||0)
          : parseFloat(d[key]);
        const calcDocVal = (key, type) => {
          switch(type) {
            case 'sum': { const vs=docs.map(d=>getDocVal(d,key)).filter(v=>!isNaN(v)); return vs.reduce((a,b)=>a+b,0); }
            case 'average': { const vs=docs.map(d=>getDocVal(d,key)).filter(v=>!isNaN(v)); return vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:null; }
            case 'min': { const vs=docs.map(d=>getDocVal(d,key)).filter(v=>!isNaN(v)); return vs.length?Math.min(...vs):null; }
            case 'max': { const vs=docs.map(d=>getDocVal(d,key)).filter(v=>!isNaN(v)); return vs.length?Math.max(...vs):null; }
            case 'count_all': return docs.length;
            case 'count_values': return docs.filter(d=>d[key]!=null&&d[key]!=='').length;
            case 'count_unique': return new Set(docs.map(d=>d[key]).filter(v=>v!=null&&v!=='')).size;
            case 'count_empty': return docs.filter(d=>d[key]==null||d[key]==='').length;
            default: return null;
          }
        };
        const fmtDocCalc = (key, type, val) => {
          if (val==null) return '—';
          if (['count_all','count_values','count_unique','count_empty'].includes(type)) return String(Math.round(val));
          return ['importe','impuesto','irpf','importe_total'].includes(key) ? `${val.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €` : String(val);
        };
        const CALC_SHORT_D = { sum:'∑', average:'Ø', min:'↓', max:'↑', count_all:'#', count_values:'#v', count_unique:'#u', count_empty:'∅' };
        const getCalcOpts = key => {
          const base = [{val:'none',label:'Ninguno'},{val:'count_all',label:'Contar todo'},{val:'count_values',label:'Contar valores'},{val:'count_unique',label:'Contar únicos'},{val:'count_empty',label:'Contar vacíos'}];
          return ['importe','impuesto','irpf','importe_total'].includes(key) ? [...base,{val:'sum',label:'Suma'},{val:'average',label:'Media'},{val:'min',label:'Mínimo'},{val:'max',label:'Máximo'}] : base;
        };

        const thStyle = { color:'#52525b', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', padding:'8px 10px', borderBottom:'1px solid #27272a', textAlign:'left', whiteSpace:'nowrap' };
        const tdBase = { padding:'6px 10px', fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'#d4d4d8' };

        return (
          <>
            {/* Toolbar */}
            <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
              <DateRangePicker desde={docTabDesde} hasta={docTabHasta} onApply={(d,h) => { setDocTabDesde(d); setDocTabHasta(h); lsSet('fin_doc_desde',d); lsSet('fin_doc_hasta',h); cargarDocumentos(d,h); }} />
              <button style={S.ghost} onClick={() => cargarDocumentos()}>↺</button>
              <button onMouseDown={e=>e.preventDefault()} onClick={() => { setDocPanelFiltro(p=>!p); setDocPanelOrdenar(false); }}
                style={{ ...S.ghost, outline:'none', display:'flex', alignItems:'center', gap:6, ...(docFiltros.length>0?{borderColor:'#0067FD',color:'#0067FD'}:{}) }}>
                ⚡ Filtros
                {docFiltros.length>0 && <span style={{ background:'#0067FD', color:'white', borderRadius:10, fontSize:11, padding:'1px 7px', fontWeight:700 }}>{docFiltros.length}</span>}
              </button>
              <button onMouseDown={e=>e.preventDefault()} onClick={() => { setDocPanelOrdenar(p=>!p); setDocPanelFiltro(false); }}
                style={{ ...S.ghost, outline:'none', display:'flex', alignItems:'center', gap:6, ...(docSorts.length>0?{borderColor:'#8b5cf6',color:'#8b5cf6'}:{}) }}>
                ↕ Ordenar
                {docSorts.length>0 && <span style={{ color:'#8b5cf6', fontSize:11, fontWeight:600 }}>{docSorts.map(s=>(CAMPOS_SORT_DOCS.find(c=>c.key===s.campo)?.label||s.campo)+(s.dir==='asc'?' ↑':' ↓')).join(', ')}</span>}
              </button>
              <input type="text" placeholder="Buscar..." value={docTabBusqueda} onChange={e => { setDocTabBusqueda(e.target.value); setDocPagina(1); }}
                style={{ ...S.input, width:180, marginLeft:'auto' }} />
            </div>

            {docPanelFiltro && <PanelFiltros filtros={docFiltros} op={docFiltroOp} onChangeFiltros={f=>{setDocFiltros(f);setDocPagina(1);}} onChangeOp={op=>{setDocFiltroOp(op);setDocPagina(1);}} campos={CAMPOS_FILTRO_DOCS} listasAsignacion={{ factura_proveedor_id: docTabContactos, factura_cliente_id: docTabContactos }} />}
            {docPanelOrdenar && <PanelOrdenar sorts={docSorts} onChange={s=>{setDocSorts(s);setDocPagina(1);}} campos={CAMPOS_SORT_DOCS} />}

            {/* Bulk bar */}
            {docSeleccionados.size>0 && (
              <div style={{ position:'sticky', top:0, zIndex:10, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, padding:'8px 14px', marginBottom:10, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <span style={{ color:'#d4d4d8', fontSize:13 }}>{docSeleccionados.size} seleccionado{docSeleccionados.size!==1?'s':''}</span>
                {docSeleccionados.size < docs.length && (
                  <button onClick={() => setDocSeleccionados(new Set(docs.map(d=>d.id)))}
                    style={{ background:'none', border:'none', color:'#60a5fa', fontSize:12, cursor:'pointer', textDecoration:'underline', padding:0 }}>
                    Seleccionar todos ({docs.length})
                  </button>
                )}
                {/* Bulk proveedor */}
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ color:'#71717a', fontSize:12 }}>Proveedor:</span>
                  <SearchableSelect value={docBulkProveedor} onChange={v => setDocBulkProveedor(v)}
                    options={docTabContactos.length ? docTabContactos : contactosTodos}
                    placeholder="— elegir —" />
                  {docBulkProveedor && (
                    <button onClick={() => editarDocsBulkContacto('factura_proveedor_id', docBulkProveedor)}
                      style={{ background:'#0067FD', border:'none', borderRadius:6, color:'white', padding:'3px 10px', fontSize:12, cursor:'pointer', fontWeight:600 }}>Aplicar</button>
                  )}
                </div>
                {/* Bulk cliente */}
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ color:'#71717a', fontSize:12 }}>Cliente:</span>
                  <SearchableSelect value={docBulkCliente} onChange={v => setDocBulkCliente(v)}
                    options={docTabContactos.length ? docTabContactos : contactosTodos}
                    placeholder="— elegir —" />
                  {docBulkCliente && (
                    <button onClick={() => editarDocsBulkContacto('factura_cliente_id', docBulkCliente)}
                      style={{ background:'#0067FD', border:'none', borderRadius:6, color:'white', padding:'3px 10px', fontSize:12, cursor:'pointer', fontWeight:600 }}>Aplicar</button>
                  )}
                </div>
                <button onClick={eliminarDocsBulk} disabled={docEliminandoBulk}
                  style={{ background:'#450a0a', border:'1px solid #7f1d1d', color:'#f87171', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                  {docEliminandoBulk?'Eliminando…':`🗑 Eliminar ${docSeleccionados.size}`}
                </button>
                <button onClick={() => setDocSeleccionados(new Set())}
                  style={{ background:'none', border:'none', color:'#52525b', fontSize:12, cursor:'pointer', marginLeft:'auto' }}>
                  Cancelar selección
                </button>
              </div>
            )}

            {loadingDocumentos ? (
              <p style={{ color:'#52525b' }}>Cargando…</p>
            ) : (
              <div style={S.card}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ borderCollapse:'collapse', tableLayout:'fixed', width:'100%', fontSize:13, minWidth:COLS_DOCS.reduce((a,c)=>a+c.w,0)+40 }}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, width:36, minWidth:36, padding:'8px 0 8px 10px' }}>
                          {docSeleccionados.size > 0 && (
                            <input type="checkbox" checked={docAllSel}
                              ref={el=>{ if(el) el.indeterminate=docSomeSel; }}
                              onChange={() => toggleDocAll(docsPage, docAllSel)}
                              style={{ accentColor:'#0067FD', cursor:'pointer' }} />
                          )}
                        </th>
                        {COLS_DOCS.map(col => (
                          <th key={col.key} style={{ ...thStyle, width:col.w, minWidth:col.w, ...(col.key==='pdf' ? {padding:'8px 4px 8px 0'} : {}) }}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {docsPage.map(doc => {
                        const sel = docSeleccionados.has(doc.id);
                        const hov = docHoveredRow === doc.id;
                        const showCb = sel || docSeleccionados.size>0 || hov;
                        return (
                          <tr key={doc.id}
                            onMouseEnter={() => setDocHoveredRow(doc.id)}
                            onMouseLeave={() => setDocHoveredRow(null)}
                            style={{ borderBottom:'1px solid #1c1c1e', background:sel?'#1e293b':hov?'#18181b':'transparent' }}>
                            <td style={{ width:36, padding:'6px 0 6px 10px', verticalAlign:'middle' }}>
                              {showCb
                                ? <input type="checkbox" checked={sel} onChange={() => toggleDocSel(doc.id)} style={{ accentColor:'#0067FD', cursor:'pointer' }} />
                                : <span style={{ display:'inline-block', width:16 }} />}
                            </td>
                            {COLS_DOCS.map(col => {
                              const val = doc[col.key];
                              const isEditing = docTabEditando?.id===doc.id && docTabEditando?.campo===col.key;

                              if (col.key === 'pdf') return (
                                <td key="pdf" style={{ width:32, padding:'6px 4px 6px 0', textAlign:'center', verticalAlign:'middle' }}>
                                  {doc.archivo_url
                                    ? <button onClick={() => setFacturaViewer({ url:doc.archivo_url, nombre:doc.archivo_nombre||'Documento', id:doc.id, data:doc })}
                                        style={{ background:'none', border:'none', color:'#60a5fa', cursor:'pointer', fontSize:14, padding:0 }} title="Ver PDF">📄</button>
                                    : <span style={{ color:'#3f3f46' }}>—</span>}
                                </td>
                              );

                              if (col.key === 'tipo') return (
                                <td key="tipo" style={{ ...tdBase, width:col.w }}>
                                  {val ? <span style={{ background:val==='ingreso'?'#14532d':'#450a0a', color:val==='ingreso'?'#4ade80':'#f87171', fontSize:10, padding:'2px 6px', borderRadius:4, fontWeight:600 }}>{val==='ingreso'?'Venta':'Compra'}</span> : '—'}
                                </td>
                              );

                              if (col.key==='factura_proveedor_id'||col.key==='factura_cliente_id') return (
                                <td key={col.key} style={{ width:col.w, maxWidth:col.w, padding:'2px 6px', verticalAlign:'middle', overflow:'hidden' }}>
                                  {isEditing ? (
                                    <SearchableSelect value={docTabEditando.valor||''}
                                      options={ctodos}
                                      placeholder="— ninguno —"
                                      style={{ width: '100%' }}
                                      onClose={() => setDocTabEditando(null)}
                                      onChange={async newId => {
                                        const extra = contactFiscalUpdates(newId, ctodos, doc.tipo, col.key);
                                        await guardarCeldaDoc(doc.id, { [col.key]: newId||null, ...extra });
                                        setDocTabEditando(null);
                                      }} />
                                  ) : (
                                    <div onClick={() => setDocTabEditando({ id:doc.id, campo:col.key, valor:val||'' })}
                                      style={{ padding:'3px 4px', color:val?'#d4d4d8':'#3f3f46', cursor:'pointer', borderRadius:4, minHeight:22, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', background:hov?'#27272a':'transparent' }}
                                      onMouseEnter={e=>e.currentTarget.style.background='#27272a'}
                                      onMouseLeave={e=>e.currentTarget.style.background=hov?'#27272a':'transparent'}>
                                      {findC(val)}
                                    </div>
                                  )}
                                </td>
                              );

                              if (col.key==='id') return (
                                <td key="id" style={{ ...tdBase, width:col.w, fontFamily:'monospace', fontSize:10, color:'#52525b' }}>{val||'—'}</td>
                              );

                              if (col.key === 'importe_total') {
                                const total = (parseFloat(doc.importe??0)||0) + (parseFloat(doc.impuesto??0)||0) + (parseFloat(doc.irpf??0)||0);
                                const isZero = Math.abs(total) < 0.005;
                                const isVenta = doc.tipo === 'ingreso';
                                const isCompra = doc.tipo === 'gasto';
                                const numColor = isZero ? '#71717a' : isVenta ? '#4ade80' : isCompra ? '#f87171' : '#d4d4d8';
                                const sign = isZero ? '' : isVenta ? '+' : isCompra ? '-' : '';
                                const display = `${sign}${Math.abs(total).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €`;
                                return (
                                  <td key="importe_total" style={{ ...tdBase, width:col.w, color:numColor, textAlign:'right', fontWeight:600 }}>{display}</td>
                                );
                              }

                              if (['importe','impuesto','irpf'].includes(col.key)) {
                                const num = parseFloat(val ?? 0);
                                const isZero = Math.abs(num) < 0.005;
                                const isVenta = doc.tipo === 'ingreso';
                                const isCompra = doc.tipo === 'gasto';
                                const numColor = isZero ? '#71717a' : isVenta ? '#4ade80' : isCompra ? '#f87171' : '#d4d4d8';
                                const sign = isZero ? '' : isVenta ? '+' : isCompra ? '-' : '';
                                const display = `${sign}${Math.abs(num).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} €`;
                                return (
                                  <td key={col.key} style={{ ...tdBase, width:col.w, color:numColor, textAlign:'right', cursor:'pointer' }}
                                    onClick={() => setDocTabEditando({ id:doc.id, campo:col.key, valor:String(val??'') })}>
                                    {isEditing
                                      ? <input autoFocus type="number" step="0.01"
                                          defaultValue={val??''}
                                          onBlur={async e => { await guardarCeldaDoc(doc.id, { [col.key]: e.target.value==='' ? null : parseFloat(e.target.value) }); setDocTabEditando(null); }}
                                          onKeyDown={e => { if (e.key==='Enter') e.target.blur(); if (e.key==='Escape') setDocTabEditando(null); }}
                                          style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'white', borderRadius:4, padding:'2px 4px', fontSize:11, textAlign:'right', outline:'none' }} />
                                      : display}
                                  </td>
                                );
                              }

                              if (col.editable) return (
                                <td key={col.key} style={{ width:col.w, maxWidth:col.w, padding:'2px 6px', verticalAlign:'middle', overflow:'hidden' }}>
                                  {isEditing ? (
                                    <input autoFocus value={docTabEditando.valor}
                                      onChange={e => setDocTabEditando(prev=>({...prev, valor:e.target.value}))}
                                      onBlur={() => { guardarCeldaDoc(doc.id, { [col.key]: docTabEditando.valor }); setDocTabEditando(null); }}
                                      onKeyDown={e => { if(e.key==='Enter') e.target.blur(); if(e.key==='Escape') setDocTabEditando(null); }}
                                      style={{ width:'100%', background:'#1c1c1e', border:'1px solid #0067FD', color:'white', borderRadius:4, padding:'3px 6px', fontSize:12, outline:'none', boxSizing:'border-box' }} />
                                  ) : (
                                    <div onClick={() => setDocTabEditando({ id:doc.id, campo:col.key, valor:val??'' })}
                                      style={{ padding:'3px 4px', color:val?'#d4d4d8':'#3f3f46', cursor:'text', borderRadius:4, minHeight:22, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', background:hov?'#27272a':'transparent' }}
                                      onMouseEnter={e=>e.currentTarget.style.background='#27272a'}
                                      onMouseLeave={e=>e.currentTarget.style.background=hov?'#27272a':'transparent'}>
                                      {val||'—'}
                                    </div>
                                  )}
                                </td>
                              );

                              if (col.key === 'trimestre') return (
                                <td key="trimestre" style={{ ...tdBase, width:col.w }}>
                                  {doc.trimestre != null ? `${doc.trimestre}/${doc.anio}` : '—'}
                                </td>
                              );

                              return (
                                <td key={col.key} style={{ ...tdBase, width:col.w }}>{val??'—'}</td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Calc bar */}
                <div style={{ position:'sticky', bottom:0, background:'#0d0d0d', borderTop:'2px solid #27272a', overflowX:'auto' }}>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    <div style={{ width:36, flexShrink:0 }} />
                    {COLS_DOCS.map(col => {
                      const calcType = docColCalcs[col.key];
                      const result = calcType && calcType!=='none' ? calcDocVal(col.key, calcType) : null;
                      const formatted = result!=null ? fmtDocCalc(col.key, calcType, result) : null;
                      const isOpen = docOpenCalcKey===col.key;
                      const canCalc = col.key!=='pdf' && col.key!=='tipo';
                      return (
                        <div key={col.key} style={{ width:col.w, flexShrink:0, padding:'4px 10px', boxSizing:'border-box' }}>
                          {canCalc ? (
                            <button onClick={e => {
                                if (isOpen) { setDocOpenCalcKey(null); setDocCalcDropPos(null); return; }
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDocCalcDropPos({ bottom:window.innerHeight-rect.top+4, left:rect.left });
                                setDocOpenCalcKey(col.key);
                              }}
                              style={{ background:'none', border:'none', cursor:'pointer', padding:0, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
                              {formatted ? (
                                <>
                                  <span style={{ color:'#52525b', fontSize:10, textTransform:'uppercase' }}>{CALC_SHORT_D[calcType]}</span>
                                  <span style={{ color:'#d4d4d8', fontSize:12 }}>{formatted}</span>
                                </>
                              ) : <span style={{ color:'#3f3f46', fontSize:11 }}>Calcular</span>}
                            </button>
                          ) : <span />}
                          {isOpen && docCalcDropPos && createPortal(
                            <div style={{ position:'fixed', bottom:docCalcDropPos.bottom, left:docCalcDropPos.left, background:'#1c1c1e', border:'1px solid #3f3f46', borderRadius:8, padding:4, zIndex:9999, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.7)' }}>
                              {getCalcOpts(col.key).map(opt => (
                                <button key={opt.val} onClick={() => { setDocColCalcs(prev=>({...prev,[col.key]:opt.val})); setDocOpenCalcKey(null); setDocCalcDropPos(null); }}
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

                {/* Paginación */}
                <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:16, flexWrap:'wrap', alignItems:'center' }}>
                  {!docMostrarTodos && totalPages>1 && (
                    <>
                      <button style={S.ghost} disabled={safePag<=1} onClick={() => setDocPagina(p=>p-1)}>← Anterior</button>
                      <span style={{ color:'#71717a', fontSize:13, padding:'8px 0' }}>{safePag} / {totalPages}</span>
                      <button style={S.ghost} disabled={safePag>=totalPages} onClick={() => setDocPagina(p=>p+1)}>Siguiente →</button>
                    </>
                  )}
                  <select value={docMostrarTodos?'todos':String(docLimit)}
                    onChange={e => { const v=e.target.value; if(v==='todos'){setDocMostrarTodos(true);setDocPagina(1);}else{setDocLimit(parseInt(v));setDocMostrarTodos(false);setDocPagina(1);} }}
                    style={{ ...S.select, width:'auto', fontSize:13, padding:'7px 10px' }}>
                    {[50,100,200].map(n=><option key={n} value={n}>{n} por página</option>)}
                    <option value="todos">Todos ({totalDocs})</option>
                  </select>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* ── FISCAL ── */}
      {tab === 'fiscal' && <TabFiscal onAbrirMovimiento={abrirDetalle} facturaViewer={facturaViewer} setFacturaViewer={setFacturaViewer} />}

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
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 }}>
                <span onClick={() => { setClienteAbierto(abierto ? null : c.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); setDocsContacto([]); }}
                  style={{ color: '#52525b', fontSize: 12, flexShrink: 0, display: 'inline-block', transition: 'transform 0.2s', transform: abierto ? 'rotate(90deg)' : 'none', cursor: 'pointer' }}>▶</span>
                <div onClick={() => { setClienteAbierto(abierto ? null : c.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); setDocsContacto([]); }}
                  style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{c.nombre}</span>
                  {c.nombre_empresa && c.nombre_empresa !== c.nombre && (
                    <span style={{ color: '#71717a', fontSize: 12, marginLeft: 8 }}>{c.nombre_empresa}</span>
                  )}
                </div>
                <button onClick={e => { e.stopPropagation(); setModalContacto({ tipo: 'cliente', datos: c }); }}
                  style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                  Editar
                </button>
                <button onClick={e => { e.stopPropagation(); setConfirmDialog({ texto: `¿Eliminar cliente "${c.nombre}"?`, onOk: () => eliminarContacto(c.id, 'cliente') }); }}
                  style={{ background: 'transparent', border: '1px solid #7f1d1d', color: '#f87171', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                  Eliminar
                </button>
                <div onClick={() => { setClienteAbierto(abierto ? null : c.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); setDocsContacto([]); }}
                  style={{ display: 'flex', gap: 16, flexShrink: 0, cursor: 'pointer' }}>
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
                  <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderBottom: '1px solid #27272a' }}>
                    {[['movimientos', 'Movimientos'], ['documentos', 'Documentos']].map(([t, label]) => (
                      <button key={t} onClick={() => { setContactoTabInner(t); setDocFiltroTipo('todos'); }}
                        style={{ background: 'none', border: 'none', borderBottom: contactoTabInner === t ? '2px solid #60a5fa' : '2px solid transparent', color: contactoTabInner === t ? '#60a5fa' : '#71717a', padding: '6px 14px 8px', fontSize: 13, cursor: 'pointer', fontWeight: contactoTabInner === t ? 600 : 400 }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {contactoTabInner === 'movimientos' && (!tieneMovs ? (
                    <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Sin movimientos en el periodo seleccionado.</p>
                  ) : (() => {
                    const movsTipo = movFiltroTipo === 'todos' ? movsFiltered : movsFiltered.filter(m => m.tipo === movFiltroTipo);
                    const totalMovs = movsTipo.length;
                    const paginas = movPorPagina === 'todos' ? 1 : Math.ceil(totalMovs / movPorPagina);
                    const movsPag = movPorPagina === 'todos' ? movsTipo : movsTipo.slice((movPagina - 1) * movPorPagina, movPagina * movPorPagina);
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
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
                  })())}
                  {contactoTabInner === 'documentos' && (() => {
                    const docsFiltered = (c.facturas || []).filter(d => docFiltroTipo === 'todos' || d.tipo === docFiltroTipo);
                    return (
                      <>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          {['todos', 'gasto', 'ingreso'].map(t => (
                            <button key={t} onClick={() => { setDocFiltroTipo(t); setDocContactoPagina(1); }}
                              style={{ background: docFiltroTipo === t ? '#3f3f46' : 'transparent', border: '1px solid #3f3f46', color: docFiltroTipo === t ? 'white' : '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                              {t === 'todos' ? 'Todos' : t === 'gasto' ? 'Compras' : 'Ventas'}
                            </button>
                          ))}
                          <span style={{ color: '#52525b', fontSize: 11, marginLeft: 'auto' }}>{docsFiltered.length} documento{docsFiltered.length !== 1 ? 's' : ''}</span>
                        </div>
                        {docsFiltered.length === 0 ? (
                          <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Sin documentos asignados.</p>
                        ) : (() => {
                          const totalDocs = docsFiltered.length;
                          const paginasDoc = docContactoPorPagina === 'todos' ? 1 : Math.ceil(totalDocs / docContactoPorPagina);
                          const docsPag = docContactoPorPagina === 'todos' ? docsFiltered : docsFiltered.slice((docContactoPagina - 1) * docContactoPorPagina, docContactoPagina * docContactoPorPagina);
                          return (
                            <>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {docsPag.map(doc => (
                                  <div key={doc.id} onClick={() => doc.archivo_url && setFacturaViewer({ url: doc.archivo_url, nombre: doc.archivo_nombre || 'Documento', id: doc.id, data: doc })}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: '#1c1c1e', cursor: doc.archivo_url ? 'pointer' : 'default' }}>
                                    <span style={{ color: '#52525b', fontSize: 12, flexShrink: 0, minWidth: 72 }}>{doc.fecha_factura || '—'}</span>
                                    <span style={{ flex: 1, color: '#d4d4d8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.numero_factura || doc.archivo_nombre || '—'}</span>
                                    <span style={{ background: doc.tipo === 'ingreso' ? '#14532d' : '#450a0a', color: doc.tipo === 'ingreso' ? '#4ade80' : '#f87171', fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
                                      {doc.tipo === 'ingreso' ? 'Venta' : 'Compra'}
                                    </span>
                                    {doc.importe != null && <span style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{fmt(doc.importe)}</span>}
                                    {doc.archivo_url && <span style={{ color: '#60a5fa', fontSize: 12, flexShrink: 0 }}>📄</span>}
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                <select value={docContactoPorPagina} onChange={e => { setDocContactoPorPagina(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value)); setDocContactoPagina(1); }}
                                  style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
                                  {[10, 50, 100].map(n => <option key={n} value={n}>{n} por página</option>)}
                                  <option value="todos">Todos</option>
                                </select>
                                {docContactoPorPagina !== 'todos' && paginasDoc > 1 && (
                                  <>
                                    <button onClick={() => setDocContactoPagina(p => Math.max(1, p - 1))} disabled={docContactoPagina === 1}
                                      style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>‹</button>
                                    <span style={{ color: '#71717a', fontSize: 12 }}>{docContactoPagina} / {paginasDoc}</span>
                                    <button onClick={() => setDocContactoPagina(p => Math.min(paginasDoc, p + 1))} disabled={docContactoPagina === paginasDoc}
                                      style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>›</button>
                                  </>
                                )}
                              </div>
                            </>
                          );
                        })()}
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
                onClick={() => setModalContacto({ tipo: 'cliente', datos: null })}
                style={{ background: '#0067FD', border: 'none', color: 'white', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}
              >＋ Nuevo cliente</button>

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
                <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>No hay clientes. Pulsa «＋ Nuevo cliente» para añadir.</p>
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

        const nosotros   = sortEquipo(buscarFiltroE(equipo.filter(e => e.fijo)));
        const freelancers = sortEquipo(buscarFiltroE(equipo.filter(e => !e.fijo)));

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
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 }}>
                <span onClick={() => { setEquipoAbierto(abierto ? null : e.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); setDocsContacto([]); }}
                  style={{ color: '#52525b', fontSize: 12, flexShrink: 0, display: 'inline-block', transition: 'transform 0.2s', transform: abierto ? 'rotate(90deg)' : 'none', cursor: 'pointer' }}>▶</span>
                <div onClick={() => { setEquipoAbierto(abierto ? null : e.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); setDocsContacto([]); }}
                  style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{e.nombre}</span>
                  {e.email && <span style={{ color: '#71717a', fontSize: 12, marginLeft: 8 }}>{e.email}</span>}
                </div>
                <button onClick={ev => { ev.stopPropagation(); setModalContacto({ tipo: 'equipo', datos: e }); }}
                  style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                  Editar
                </button>
                <button onClick={ev => { ev.stopPropagation(); setConfirmDialog({ texto: `¿Eliminar "${e.nombre}" del equipo?`, onOk: () => eliminarContacto(e.id, 'equipo') }); }}
                  style={{ background: 'transparent', border: '1px solid #7f1d1d', color: '#f87171', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                  Eliminar
                </button>
                <div onClick={() => { setEquipoAbierto(abierto ? null : e.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); setDocsContacto([]); }}
                  style={{ display: 'flex', gap: 16, flexShrink: 0, cursor: 'pointer' }}>
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
                  <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderBottom: '1px solid #27272a' }}>
                    {[['movimientos', 'Movimientos'], ['documentos', 'Documentos']].map(([t, label]) => (
                      <button key={t} onClick={() => { setContactoTabInner(t); setDocFiltroTipo('todos'); }}
                        style={{ background: 'none', border: 'none', borderBottom: contactoTabInner === t ? '2px solid #60a5fa' : '2px solid transparent', color: contactoTabInner === t ? '#60a5fa' : '#71717a', padding: '6px 14px 8px', fontSize: 13, cursor: 'pointer', fontWeight: contactoTabInner === t ? 600 : 400 }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {contactoTabInner === 'movimientos' && (!tieneMovs ? (
                    <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Sin movimientos en el periodo seleccionado.</p>
                  ) : (() => {
                    const movsTipo = movFiltroTipo === 'todos' ? movsFiltered : movsFiltered.filter(m => m.tipo === movFiltroTipo);
                    const totalMovs = movsTipo.length;
                    const paginas = movPorPagina === 'todos' ? 1 : Math.ceil(totalMovs / movPorPagina);
                    const movsPag = movPorPagina === 'todos' ? movsTipo : movsTipo.slice((movPagina - 1) * movPorPagina, movPagina * movPorPagina);
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
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
                  })())}
                  {contactoTabInner === 'documentos' && (() => {
                    const docsFiltered = (e.facturas || []).filter(d => docFiltroTipo === 'todos' || d.tipo === docFiltroTipo);
                    return (
                      <>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          {['todos', 'gasto', 'ingreso'].map(t => (
                            <button key={t} onClick={() => { setDocFiltroTipo(t); setDocContactoPagina(1); }}
                              style={{ background: docFiltroTipo === t ? '#3f3f46' : 'transparent', border: '1px solid #3f3f46', color: docFiltroTipo === t ? 'white' : '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                              {t === 'todos' ? 'Todos' : t === 'gasto' ? 'Compras' : 'Ventas'}
                            </button>
                          ))}
                          <span style={{ color: '#52525b', fontSize: 11, marginLeft: 'auto' }}>{docsFiltered.length} documento{docsFiltered.length !== 1 ? 's' : ''}</span>
                        </div>
                        {docsFiltered.length === 0 ? (
                          <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Sin documentos asignados.</p>
                        ) : (() => {
                          const totalDocs = docsFiltered.length;
                          const paginasDoc = docContactoPorPagina === 'todos' ? 1 : Math.ceil(totalDocs / docContactoPorPagina);
                          const docsPag = docContactoPorPagina === 'todos' ? docsFiltered : docsFiltered.slice((docContactoPagina - 1) * docContactoPorPagina, docContactoPagina * docContactoPorPagina);
                          return (
                            <>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {docsPag.map(doc => (
                                  <div key={doc.id} onClick={() => doc.archivo_url && setFacturaViewer({ url: doc.archivo_url, nombre: doc.archivo_nombre || 'Documento', id: doc.id, data: doc })}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: '#1c1c1e', cursor: doc.archivo_url ? 'pointer' : 'default' }}>
                                    <span style={{ color: '#52525b', fontSize: 12, flexShrink: 0, minWidth: 72 }}>{doc.fecha_factura || '—'}</span>
                                    <span style={{ flex: 1, color: '#d4d4d8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.numero_factura || doc.archivo_nombre || '—'}</span>
                                    <span style={{ background: doc.tipo === 'ingreso' ? '#14532d' : '#450a0a', color: doc.tipo === 'ingreso' ? '#4ade80' : '#f87171', fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
                                      {doc.tipo === 'ingreso' ? 'Venta' : 'Compra'}
                                    </span>
                                    {doc.importe != null && <span style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{fmt(doc.importe)}</span>}
                                    {doc.archivo_url && <span style={{ color: '#60a5fa', fontSize: 12, flexShrink: 0 }}>📄</span>}
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                <select value={docContactoPorPagina} onChange={e => { setDocContactoPorPagina(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value)); setDocContactoPagina(1); }}
                                  style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
                                  {[10, 50, 100].map(n => <option key={n} value={n}>{n} por página</option>)}
                                  <option value="todos">Todos</option>
                                </select>
                                {docContactoPorPagina !== 'todos' && paginasDoc > 1 && (
                                  <>
                                    <button onClick={() => setDocContactoPagina(p => Math.max(1, p - 1))} disabled={docContactoPagina === 1}
                                      style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>‹</button>
                                    <span style={{ color: '#71717a', fontSize: 12 }}>{docContactoPagina} / {paginasDoc}</span>
                                    <button onClick={() => setDocContactoPagina(p => Math.min(paginasDoc, p + 1))} disabled={docContactoPagina === paginasDoc}
                                      style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>›</button>
                                  </>
                                )}
                              </div>
                            </>
                          );
                        })()}
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
                onClick={() => setModalContacto({ tipo: 'equipo', datos: null })}
                style={{ background: '#0067FD', border: 'none', color: 'white', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}
              >＋ Nuevo miembro</button>

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
                <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>No hay datos. Pulsa «＋ Nuevo miembro» para añadir.</p>
              </div>
            ) : (
              <>
                {nosotros.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Fijo <span style={{ color: '#a1a1aa' }}>({nosotros.length})</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {nosotros.map(renderMiembro)}
                    </div>
                  </div>
                )}
                {freelancers.length > 0 && (
                  <div>
                    <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Freelance <span style={{ color: '#a1a1aa' }}>({freelancers.length})</span>
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

      {/* ── PROVEEDORES ── */}
      {tab === 'proveedores' && (() => {
        const getValorSortP = (p, campo) => {
          const movs = (p.movimientos || []).filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
          const ing  = movs.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + m.cantidad, 0);
          const gas  = movs.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + m.cantidad, 0);
          if (campo === 'facturacion') return ing;
          if (campo === 'gasto') return gas;
          return ing - gas;
        };
        const sortProveedores = arr => [...arr].sort((a, b) => {
          const va = getValorSortP(a, proveedorSort.campo);
          const vb = getValorSortP(b, proveedorSort.campo);
          return proveedorSort.dir === 'desc' ? vb - va : va - vb;
        });
        const buscarFiltroP = arr => {
          const q = proveedorBusqueda.trim().toLowerCase();
          if (!q) return arr;
          return arr.filter(p =>
            p.nombre.toLowerCase().includes(q) ||
            (p.nombre_empresa || '').toLowerCase().includes(q)
          );
        };

        const lista = sortProveedores(buscarFiltroP(proveedores));

        const renderProveedor = (p) => {
          const abierto = proveedorAbierto === p.id;
          const movsFiltered = (p.movimientos || []).filter(m => !(m.categorias || []).includes('Traspaso Entre Cuentas'));
          const tieneMovs = movsFiltered.length > 0;
          const cantidadPro = m => m.cantidad / Math.max(m.proveedor_ids?.length || 1, 1);
          const ingresos  = movsFiltered.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + cantidadPro(m), 0);
          const gastos    = movsFiltered.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + cantidadPro(m), 0);
          const balance   = ingresos - gastos;
          return (
            <div key={p.id} style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 }}>
                <span onClick={() => { setProveedorAbierto(abierto ? null : p.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); setDocsContacto([]); }}
                  style={{ color: '#52525b', fontSize: 12, flexShrink: 0, display: 'inline-block', transition: 'transform 0.2s', transform: abierto ? 'rotate(90deg)' : 'none', cursor: 'pointer' }}>▶</span>
                <div onClick={() => { setProveedorAbierto(abierto ? null : p.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); setDocsContacto([]); }}
                  style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{p.nombre}</span>
                  {p.nombre_empresa && p.nombre_empresa !== p.nombre && (
                    <span style={{ color: '#71717a', fontSize: 12, marginLeft: 8 }}>{p.nombre_empresa}</span>
                  )}
                </div>
                <button onClick={ev => { ev.stopPropagation(); setModalContacto({ tipo: 'proveedor', datos: p }); }}
                  style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                  Editar
                </button>
                <button onClick={ev => { ev.stopPropagation(); setConfirmDialog({ texto: `¿Eliminar proveedor "${p.nombre}"?`, onOk: () => eliminarContacto(p.id, 'proveedor') }); }}
                  style={{ background: 'transparent', border: '1px solid #7f1d1d', color: '#f87171', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                  Eliminar
                </button>
                <div onClick={() => { setProveedorAbierto(abierto ? null : p.id); setMovFiltroTipo('todos'); setMovPagina(1); setMovPorPagina(10); setDocFiltroTipo('todos'); setDocContactoPagina(1); setDocContactoPorPagina(10); setContactoTabInner('movimientos'); setDocsContacto([]); }}
                  style={{ display: 'flex', gap: 16, flexShrink: 0, cursor: 'pointer' }}>
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
                  {(p.nif_cif || p.email) && (
                    <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                      {p.nif_cif && <span style={{ color: '#71717a', fontSize: 12 }}>NIF: <span style={{ color: '#a1a1aa' }}>{p.nif_cif}</span></span>}
                      {p.email   && <span style={{ color: '#71717a', fontSize: 12 }}>Email: <span style={{ color: '#a1a1aa' }}>{p.email}</span></span>}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderBottom: '1px solid #27272a' }}>
                    {[['movimientos', 'Movimientos'], ['documentos', 'Documentos']].map(([t, label]) => (
                      <button key={t} onClick={() => { setContactoTabInner(t); setDocFiltroTipo('todos'); }}
                        style={{ background: 'none', border: 'none', borderBottom: contactoTabInner === t ? '2px solid #60a5fa' : '2px solid transparent', color: contactoTabInner === t ? '#60a5fa' : '#71717a', padding: '6px 14px 8px', fontSize: 13, cursor: 'pointer', fontWeight: contactoTabInner === t ? 600 : 400 }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {contactoTabInner === 'movimientos' && (!tieneMovs ? (
                    <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Sin movimientos en el periodo seleccionado.</p>
                  ) : (() => {
                    const movsTipo = movFiltroTipo === 'todos' ? movsFiltered : movsFiltered.filter(m => m.tipo === movFiltroTipo);
                    const totalMovs = movsTipo.length;
                    const paginas = movPorPagina === 'todos' ? 1 : Math.ceil(totalMovs / movPorPagina);
                    const movsPag = movPorPagina === 'todos' ? movsTipo : movsTipo.slice((movPagina - 1) * movPorPagina, movPagina * movPorPagina);
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
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
                              <span style={{ color: m.tipo === 'Ingreso' ? '#22c55e' : '#f87171', fontSize: 13, fontWeight: 600, flexShrink: 0, minWidth: 70, textAlign: 'right' }}>
                                {fmt(m.tipo === 'Ingreso' ? m.cantidad : -m.cantidad)}
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
                              <button onClick={() => setMovPagina(prev => Math.max(1, prev - 1))} disabled={movPagina === 1}
                                style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>‹</button>
                              <span style={{ color: '#71717a', fontSize: 12 }}>{movPagina} / {paginas}</span>
                              <button onClick={() => setMovPagina(prev => Math.min(paginas, prev + 1))} disabled={movPagina === paginas}
                                style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>›</button>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })())}
                  {contactoTabInner === 'documentos' && (() => {
                    const docsFiltered = (p.facturas || []).filter(d => docFiltroTipo === 'todos' || d.tipo === docFiltroTipo);
                    return (
                      <>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          {['todos', 'gasto', 'ingreso'].map(t => (
                            <button key={t} onClick={() => { setDocFiltroTipo(t); setDocContactoPagina(1); }}
                              style={{ background: docFiltroTipo === t ? '#3f3f46' : 'transparent', border: '1px solid #3f3f46', color: docFiltroTipo === t ? 'white' : '#71717a', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                              {t === 'todos' ? 'Todos' : t === 'gasto' ? 'Compras' : 'Ventas'}
                            </button>
                          ))}
                          <span style={{ color: '#52525b', fontSize: 11, marginLeft: 'auto' }}>{docsFiltered.length} documento{docsFiltered.length !== 1 ? 's' : ''}</span>
                        </div>
                        {docsFiltered.length === 0 ? (
                          <p style={{ color: '#52525b', fontSize: 13, margin: 0 }}>Sin documentos asignados.</p>
                        ) : (() => {
                          const totalDocs = docsFiltered.length;
                          const paginasDoc = docContactoPorPagina === 'todos' ? 1 : Math.ceil(totalDocs / docContactoPorPagina);
                          const docsPag = docContactoPorPagina === 'todos' ? docsFiltered : docsFiltered.slice((docContactoPagina - 1) * docContactoPorPagina, docContactoPagina * docContactoPorPagina);
                          return (
                            <>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {docsPag.map(doc => (
                                  <div key={doc.id} onClick={() => doc.archivo_url && setFacturaViewer({ url: doc.archivo_url, nombre: doc.archivo_nombre || 'Documento', id: doc.id, data: doc })}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: '#1c1c1e', cursor: doc.archivo_url ? 'pointer' : 'default' }}>
                                    <span style={{ color: '#52525b', fontSize: 12, flexShrink: 0, minWidth: 72 }}>{doc.fecha_factura || '—'}</span>
                                    <span style={{ flex: 1, color: '#d4d4d8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.numero_factura || doc.archivo_nombre || '—'}</span>
                                    <span style={{ background: doc.tipo === 'ingreso' ? '#14532d' : '#450a0a', color: doc.tipo === 'ingreso' ? '#4ade80' : '#f87171', fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
                                      {doc.tipo === 'ingreso' ? 'Venta' : 'Compra'}
                                    </span>
                                    {doc.importe != null && <span style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{fmt(doc.importe)}</span>}
                                    {doc.archivo_url && <span style={{ color: '#60a5fa', fontSize: 12, flexShrink: 0 }}>📄</span>}
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                <select value={docContactoPorPagina} onChange={e => { setDocContactoPorPagina(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value)); setDocContactoPagina(1); }}
                                  style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
                                  {[10, 50, 100].map(n => <option key={n} value={n}>{n} por página</option>)}
                                  <option value="todos">Todos</option>
                                </select>
                                {docContactoPorPagina !== 'todos' && paginasDoc > 1 && (
                                  <>
                                    <button onClick={() => setDocContactoPagina(p => Math.max(1, p - 1))} disabled={docContactoPagina === 1}
                                      style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>‹</button>
                                    <span style={{ color: '#71717a', fontSize: 12 }}>{docContactoPagina} / {paginasDoc}</span>
                                    <button onClick={() => setDocContactoPagina(p => Math.min(paginasDoc, p + 1))} disabled={docContactoPagina === paginasDoc}
                                      style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>›</button>
                                  </>
                                )}
                              </div>
                            </>
                          );
                        })()}
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
                onClick={() => setModalContacto({ tipo: 'proveedor', datos: null })}
                style={{ background: '#0067FD', border: 'none', color: 'white', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', flexShrink: 0, fontWeight: 600 }}
              >＋ Nuevo proveedor</button>

              <input
                type="text"
                placeholder="Buscar proveedor…"
                value={proveedorBusqueda}
                onChange={e => setProveedorBusqueda(e.target.value)}
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
                    onClick={() => setProveedorSort(s => s.campo === key ? { campo: key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { campo: key, dir: 'desc' })}
                    style={{
                      background: proveedorSort.campo === key ? '#3f3f46' : 'transparent',
                      border: 'none', color: proveedorSort.campo === key ? 'white' : '#71717a',
                      borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer',
                    }}>
                    {label}{proveedorSort.campo === key ? (proveedorSort.dir === 'desc' ? ' ↓' : ' ↑') : ''}
                  </button>
                ))}
              </div>
            </div>

            {loadingProveedores ? (
              <p style={{ color: '#71717a', fontSize: 14 }}>Cargando proveedores…</p>
            ) : proveedores.length === 0 ? (
              <div style={{ ...S.card, padding: 24, textAlign: 'center' }}>
                <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>No hay proveedores. Pulsa «＋ Nuevo proveedor» para añadir.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lista.map(renderProveedor)}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── NUEVO ── */}
      {tab === 'nuevo' && (
        <NuevoMovimientoTab onGuardado={() => { setSinMovimientosMes(false); setTab('movimientos'); cargarMovimientos(1); cargarDashboard(); }} />
      )}

      {/* ── Modal contacto (cliente / equipo) ── */}
      {modalContacto && <ModalContacto
        tipo={modalContacto.tipo}
        datos={modalContacto.datos}
        onGuardado={() => {
          setModalContacto(null);
          if (modalContacto.tipo === 'cliente') cargarClientes();
          else if (modalContacto.tipo === 'equipo') cargarEquipo();
          else cargarProveedores();
        }}
        onCerrar={() => setModalContacto(null)}
        savingContacto={savingContacto}
        setSavingContacto={setSavingContacto}
      />}

      {/* ── Modal Nuevos Contactos detectados al guardar facturas ── */}
      {modalNuevosContactos && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={() => setModalNuevosContactos(null)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#18181b', border:'1px solid #3f3f46', borderRadius:14, width:'100%', maxWidth:720, maxHeight:'88vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #27272a', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:'#fbbf24', fontSize:18 }}>⚠️</span>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontWeight:700, color:'#f4f4f5', fontSize:15 }}>Contactos nuevos detectados</p>
                <p style={{ margin:0, color:'#71717a', fontSize:12 }}>Se han guardado las facturas. Estos contactos no estaban en tu lista. Revísalos antes de confirmar.</p>
              </div>
              <button onClick={() => setModalNuevosContactos(null)} style={{ background:'none', border:'none', color:'#52525b', fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
            </div>
            {/* Body */}
            <div style={{ overflowY:'auto', flex:1, padding:'14px 22px', display:'flex', flexDirection:'column', gap:12 }}>
              {modalNuevosContactos.map((item, idx) => {
                const update = patch => setModalNuevosContactos(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
                const contactosFiltrados = item._busqueda
                  ? contactosTodos.filter(c => c.nombre?.toLowerCase().includes(item._busqueda.toLowerCase()) || c.nombre_empresa?.toLowerCase().includes(item._busqueda.toLowerCase()))
                  : [];
                return (
                  <div key={idx} style={{ background: item._ignorar ? '#111' : '#1c1c1e', border:`1px solid ${item._ignorar ? '#27272a' : '#3f3f46'}`, borderRadius:10, padding:'14px 16px', opacity: item._ignorar ? 0.4 : 1 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:'0 0 2px', color:'#f4f4f5', fontWeight:600, fontSize:14 }}>{item.nombre_entidad}</p>
                        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                          {item.nif_cif && <span style={{ color:'#71717a', fontSize:12 }}>NIF: <span style={{ color:'#a1a1aa' }}>{item.nif_cif}</span></span>}
                          <span style={{ color:'#71717a', fontSize:12 }}>Tipo: <span style={{ color: item.tipo === 'ingreso' ? '#22c55e' : '#f87171' }}>{item.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}</span></span>
                          <span style={{ color:'#71717a', fontSize:12 }}>{item.factura_ids?.length} factura{item.factura_ids?.length !== 1 ? 's' : ''}</span>
                          {item.archivo_url && <a href={item.archivo_url} target="_blank" rel="noreferrer" style={{ color:'#60a5fa', fontSize:12 }} onClick={e => e.stopPropagation()}>📄 Ver PDF</a>}
                        </div>
                      </div>
                      <button onClick={() => update({ _ignorar: !item._ignorar })}
                        style={{ background: item._ignorar ? '#27272a' : '#7f1d1d', border:'1px solid #3f3f46', color: item._ignorar ? '#71717a' : '#f87171', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer', flexShrink:0 }}>
                        {item._ignorar ? 'Restaurar' : '✕ Quitar'}
                      </button>
                    </div>
                    {!item._ignorar && (
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                          <div>
                            <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Nombre (alias)</label>
                            <input value={item._nombre} onChange={e => update({ _nombre: e.target.value })} placeholder={item.nombre_entidad}
                              style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                          </div>
                          <div>
                            <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Nombre empresa</label>
                            <input value={item._nombre_empresa} onChange={e => update({ _nombre_empresa: e.target.value })}
                              style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                          </div>
                          <div>
                            <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>NIF / CIF / VAT</label>
                            <input value={item._nif_cif||''} onChange={e => update({ _nif_cif: e.target.value })} placeholder="—"
                              style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                          </div>
                          <div>
                            <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Email</label>
                            <input value={item._email||''} onChange={e => update({ _email: e.target.value })} placeholder="—"
                              style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Dirección</label>
                          <input value={item._direccion||''} onChange={e => update({ _direccion: e.target.value })} placeholder="—"
                            style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                        </div>
                        <div>
                          <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Tipo de contacto</label>
                          <div style={{ display:'flex', gap:8 }}>
                            {[['proveedor','Proveedor'],['equipo','Freelance'],['cliente','Cliente']].map(([rol, label]) => {
                              const active = (item._roles||['proveedor']).includes(rol);
                              return (
                                <button key={rol} onClick={() => {
                                  const cur = item._roles||['proveedor'];
                                  update({ _roles: active && cur.length > 1 ? cur.filter(r=>r!==rol) : active ? cur : [...cur, rol] });
                                }} style={{ background: active ? '#0067FD' : '#27272a', border:`1px solid ${active ? '#0067FD' : '#3f3f46'}`, color: active ? 'white' : '#71717a', borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer' }}>
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {/* Asignar a existente */}
                        <div style={{ position:'relative' }}>
                          <label style={{ color:'#71717a', fontSize:11, display:'block', marginBottom:3 }}>Asignar a contacto existente (opcional)</label>
                          {item._asignarA ? (
                            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#27272a', border:'1px solid #3f3f46', borderRadius:6, padding:'6px 10px' }}>
                              <span style={{ flex:1, color:'#f4f4f5', fontSize:13 }}>{item._asignarA.nombre}</span>
                              <button onClick={() => update({ _asignarA: null, _busqueda: '' })} style={{ background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:12 }}>✕</button>
                            </div>
                          ) : (
                            <>
                              <input value={item._busqueda || ''} onChange={e => update({ _busqueda: e.target.value })} placeholder="Buscar contacto..."
                                style={{ width:'100%', background:'#27272a', border:'1px solid #3f3f46', color:'#f4f4f5', borderRadius:6, padding:'6px 10px', fontSize:13, boxSizing:'border-box' }} />
                              {contactosFiltrados.length > 0 && (
                                <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#27272a', border:'1px solid #3f3f46', borderRadius:6, zIndex:10, maxHeight:160, overflowY:'auto', marginTop:2 }}>
                                  {contactosFiltrados.slice(0,8).map(c => (
                                    <div key={c.id} onClick={() => update({ _asignarA: c, _busqueda: '' })}
                                      style={{ padding:'8px 12px', cursor:'pointer', borderBottom:'1px solid #3f3f46', color:'#f4f4f5', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                                      <span style={{ flex:1 }}>{c.nombre}</span>
                                      <span style={{ color:'#52525b', fontSize:11 }}>{(c.roles||[]).join(', ')}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Footer */}
            <div style={{ padding:'14px 22px', borderTop:'1px solid #27272a', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:10 }}>
              <button onClick={() => setModalNuevosContactos(null)}
                style={{ background:'none', border:'1px solid #3f3f46', color:'#a1a1aa', borderRadius:8, padding:'8px 18px', fontSize:13, cursor:'pointer' }}>Cancelar</button>
              <button disabled={confirmandoContactos} onClick={async () => {
                setConfirmandoContactos(true);
                try {
                  const token = await getToken();
                  const items = modalNuevosContactos.map(item => ({
                    accion:        item._ignorar ? 'ignorar' : item._asignarA ? 'asignar' : 'crear',
                    factura_ids:   item.factura_ids,
                    nombre:        item._nombre || item.nombre_entidad,
                    nombre_empresa: item._nombre_empresa || null,
                    nif_cif:       item._nif_cif   || item.nif_cif   || null,
                    direccion:     item._direccion || item.direccion  || null,
                    email:         item._email     || item.email      || null,
                    roles:         item._roles     || ['proveedor'],
                    contacto_id:   item._asignarA?.id || null,
                    nombre_entidad: item.nombre_entidad,
                    tipo:          item.tipo || 'gasto',
                  }));
                  const r = await fetch(`${BACKEND_URL}/admin/finanzas/facturas/confirmar-contactos`, {
                    method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
                    body: JSON.stringify({ items }),
                  });
                  if (!r.ok) throw new Error('Error al confirmar');
                  setModalNuevosContactos(null);
                  cargarProveedores();
                  if (tab === 'documentos') cargarDocumentos();
                } catch(e) { alert(e.message); }
                finally { setConfirmandoContactos(false); }
              }}
                style={{ background:'#0067FD', border:'none', color:'white', borderRadius:8, padding:'8px 22px', fontSize:13, fontWeight:600, cursor:'pointer', opacity: confirmandoContactos ? 0.6 : 1 }}>
                {confirmandoContactos ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
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

      {/* Viewer modal documentos/facturas */}
      {facturaViewer && createPortal(
        <div onClick={() => setFacturaViewer(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:960, height:'92vh', background:'#1a1a1a', borderRadius:12, border:'1px solid #3f3f46', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderBottom:'1px solid #27272a', flexShrink:0 }}>
              <span style={{ color:'#a1a1aa', fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{facturaViewer.nombre}</span>
              {facturaViewer.id && <span style={{ color:'#52525b', fontSize:11, fontFamily:'monospace', flexShrink:0 }}>{facturaViewer.id.slice(0,8)}…</span>}
              {facturaViewer.id && !viewerEditando && (
                <button onClick={() => setViewerEditando(true) || setViewerDraft({ archivo_nombre: facturaViewer.nombre||'', factura_proveedor_id: facturaViewer.data?.factura_proveedor_id||'', factura_cliente_id: facturaViewer.data?.factura_cliente_id||'', importe: facturaViewer.data?.importe??'', impuesto: facturaViewer.data?.impuesto??'', irpf: facturaViewer.data?.irpf??'' })}
                  style={{ background:'transparent', border:'1px solid #3f3f46', borderRadius:6, color:'#71717a', padding:'5px 12px', fontSize:12, cursor:'pointer', flexShrink:0 }}>Editar</button>
              )}
              <a href={facturaViewer.url} target="_blank" rel="noreferrer" style={{ color:'#60a5fa', fontSize:12, textDecoration:'none', flexShrink:0 }}>↗ Abrir en nueva pestaña</a>
              <button onClick={() => { setFacturaViewer(null); setViewerEditando(false); }} style={{ background:'none', border:'none', color:'#71717a', cursor:'pointer', fontSize:18, lineHeight:1, padding:'0 4px', flexShrink:0 }}>✕</button>
            </div>
            {/* Metadata */}
            {facturaViewer.data && (() => {
              const fv = facturaViewer.data;
              const ctodos = docTabContactos.length ? docTabContactos : contactosTodos;
              const findC = id => ctodos.find(c => c.id === id)?.nombre || id?.slice(0,8) || '—';
              const pill = (txt, color) => <span style={{ background: color+'22', color, border:`1px solid ${color}44`, borderRadius:4, padding:'1px 7px', fontSize:11, fontWeight:600, flexShrink:0 }}>{txt}</span>;
              return (
                <div style={{ display:'flex', gap:20, padding:'10px 16px', borderBottom:'1px solid #27272a', flexShrink:0, flexWrap:'wrap', alignItems:'center' }}>
                  {fv.tipo && pill(fv.tipo === 'ingreso' ? 'Venta' : 'Compra', fv.tipo === 'ingreso' ? '#4ade80' : '#f87171')}
                  {fv.fecha_factura && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Fecha</span> {fv.fecha_factura}</span>}
                  {fv.numero_factura && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Nº</span> {fv.numero_factura}</span>}
                  {fv.nombre_entidad && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Entidad</span> {fv.nombre_entidad}</span>}
                  {fv.nif_cif && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>NIF</span> {fv.nif_cif}</span>}
                  {fv.importe != null && (() => { const base=parseFloat(fv.importe)||0; const total=base+(parseFloat(fv.impuesto)||0)+(parseFloat(fv.irpf)||0); const isV=fv.tipo==='ingreso'; const colBase=Math.abs(base)<0.005?'#71717a':isV?'#4ade80':'#f87171'; const colTot=Math.abs(total)<0.005?'#71717a':isV?'#4ade80':'#f87171'; const signBase=Math.abs(base)<0.005?'':(isV?'+':'-'); const signTot=Math.abs(total)<0.005?'':(isV?'+':'-'); return (<><span style={{ color:colTot, fontSize:13, fontWeight:700 }}><span style={{ color:'#52525b', fontWeight:400, fontSize:11, marginRight:2 }}>Importe</span>{signTot}{Math.abs(total).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span><span style={{ color:colBase, fontSize:12 }}><span style={{ color:'#52525b' }}>Base </span>{signBase}{Math.abs(base).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span></>); })()}
                  {fv.impuesto != null && fv.impuesto !== 0 && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>IVA</span> {parseFloat(fv.impuesto).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span>}
                  {fv.irpf != null && fv.irpf !== 0 && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>IRPF</span> {parseFloat(fv.irpf).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span>}
                  {fv.factura_proveedor_id && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Proveedor</span> {findC(fv.factura_proveedor_id)}</span>}
                  {fv.factura_cliente_id && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Cliente</span> {findC(fv.factura_cliente_id)}</span>}
                  {fv.trimestre && <span style={{ color:'#52525b', fontSize:12 }}>Q{fv.trimestre}/{fv.anio}</span>}
                </div>
              );
            })()}
            {/* Panel edición */}
            {viewerEditando && facturaViewer.id && (() => {
              const ctodos = docTabContactos.length ? docTabContactos : contactosTodos;
              const fv = facturaViewer.data || {};
              const selStyle = { background:'#27272a', border:'1px solid #3f3f46', borderRadius:6, color:'white', padding:'5px 8px', fontSize:12, outline:'none', flex:1 };
              const lblStyle = { color:'#52525b', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' };
              const handleContactChange = (campo, newId) => {
                const extra = contactFiscalUpdates(newId, ctodos, fv.tipo, campo);
                setViewerDraft(prev => ({ ...prev, [campo]: newId, ...extra }));
              };
              const handleSave = async () => {
                const payload = { ...viewerDraft };
                if (payload.importe  !== '') payload.importe  = payload.importe  != null ? parseFloat(payload.importe)  : null;
                if (payload.impuesto !== '') payload.impuesto = payload.impuesto != null ? parseFloat(payload.impuesto) : null;
                if (payload.irpf     !== '') payload.irpf     = payload.irpf     != null ? parseFloat(payload.irpf)     : null;
                const contactoCambiado = payload.factura_proveedor_id !== fv.factura_proveedor_id || payload.factura_cliente_id !== fv.factura_cliente_id;
                const updated = await guardarCeldaDoc(facturaViewer.id, payload);
                if (updated) setFacturaViewer(prev => ({ ...prev, nombre: viewerDraft.archivo_nombre, data: updated }));
                setViewerEditando(false);
                if (contactoCambiado) { cargarProveedores(); cargarClientes(); cargarEquipo(); }
              };
              return (
                <div style={{ padding:'12px 16px', borderBottom:'1px solid #27272a', background:'#111', flexShrink:0, display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:4, flex:'2 1 200px' }}>
                      <span style={lblStyle}>Nombre archivo</span>
                      <input value={viewerDraft.archivo_nombre||''} onChange={e => setViewerDraft(prev=>({...prev, archivo_nombre:e.target.value}))}
                        style={{ ...selStyle }} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4, flex:'1 1 160px' }}>
                      <span style={lblStyle}>Proveedor</span>
                      <SearchableSelect value={viewerDraft.factura_proveedor_id||''}
                        onChange={v => handleContactChange('factura_proveedor_id', v)}
                        options={ctodos} placeholder="— ninguno —" style={{ flex: 1 }} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4, flex:'1 1 160px' }}>
                      <span style={lblStyle}>Cliente</span>
                      <SearchableSelect value={viewerDraft.factura_cliente_id||''}
                        onChange={v => handleContactChange('factura_cliente_id', v)}
                        options={ctodos} placeholder="— ninguno —" style={{ flex: 1 }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      <span style={lblStyle}>Importe (€)</span>
                      <input type="number" step="0.01" value={viewerDraft.importe??''} onChange={e => setViewerDraft(prev=>({...prev, importe:e.target.value}))}
                        style={{ ...selStyle, width:110 }} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      <span style={lblStyle}>IVA (€)</span>
                      <input type="number" step="0.01" value={viewerDraft.impuesto??''} onChange={e => setViewerDraft(prev=>({...prev, impuesto:e.target.value}))}
                        style={{ ...selStyle, width:90 }} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      <span style={lblStyle}>IRPF (€)</span>
                      <input type="number" step="0.01" value={viewerDraft.irpf??''} onChange={e => setViewerDraft(prev=>({...prev, irpf:e.target.value}))}
                        style={{ ...selStyle, width:90 }} />
                    </div>
                  </div>
                  {(viewerDraft.nombre_entidad || viewerDraft.nif_cif) && (
                    <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                      <span style={{ color:'#52525b', fontSize:11 }}>Se actualizará →</span>
                      {viewerDraft.nombre_entidad && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>Entidad</span> {viewerDraft.nombre_entidad}</span>}
                      {viewerDraft.nif_cif && <span style={{ color:'#a1a1aa', fontSize:12 }}><span style={{ color:'#52525b' }}>NIF</span> {viewerDraft.nif_cif}</span>}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={handleSave} style={{ background:'#0067FD', border:'none', borderRadius:6, color:'white', padding:'6px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Guardar</button>
                    <button onClick={() => setViewerEditando(false)} style={{ background:'transparent', border:'1px solid #3f3f46', borderRadius:6, color:'#71717a', padding:'6px 14px', fontSize:12, cursor:'pointer' }}>Cancelar</button>
                  </div>
                </div>
              );
            })()}
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
