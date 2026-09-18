import { useState, useEffect } from 'react';
import { useClientesLista, useEquipoLista, useProveedoresLista } from '@/features/finanzas';
import { BACKEND_URL } from '@/lib/config';
import { getToken } from '../utils';
import { S, CUENTAS, TIPOS, IVA_OPTS, IRPF_OPTS, CATEGORIAS } from '../constants';
import { MultiCheckDrop } from './MultiCheckDrop';

// ── Formulario (nuevo y edición) ────────────────────────────────

export function FormularioMovimiento({ inicial, onGuardado, onCancelar }) {
  const esEdicion = !!inicial?.id;
  const [form, setForm] = useState(inicial || {
    nombre: '', fecha: new Date().toISOString().slice(0,10),
    tipo: 'Ingreso', cuenta: 'Ingresos', cantidad: '',
    iva: '21%', irpf: '0%', categorias: [],
    cliente_ids: [], equipo_ids: [], proveedor_ids: [], factura_ids: [],
  });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const { data: clientesLista = [] } = useClientesLista();
  const { data: equipoLista = [] } = useEquipoLista();
  const { data: proveedoresListaForm = [] } = useProveedoresLista();
  const [facturasLista, setFacturasLista] = useState([]);

  useEffect(() => {
    getToken().then(token => {
      fetch(`${BACKEND_URL}/admin/finanzas/facturas`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setFacturasLista(Array.isArray(d) ? d : [])).catch(() => {});
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
        {(form.factura_ids?.length || 0) > 0 ? (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'#52525b' }}>🔒 Calculado desde {form.factura_ids.length} documento{form.factura_ids.length !== 1 ? 's' : ''} vinculado{form.factura_ids.length !== 1 ? 's' : ''}</span>
            {form.fecha_factura && <span style={{ background:'#27272a', borderRadius:4, padding:'2px 8px', fontSize:11, color:'#a1a1aa' }}>Fecha: {form.fecha_factura}</span>}
            {form.importe_factura != null && <span style={{ background:'#27272a', borderRadius:4, padding:'2px 8px', fontSize:11, color:'#a1a1aa' }}>Importe: {Math.abs(form.importe_factura).toLocaleString('es-ES',{minimumFractionDigits:2})} €</span>}
          </div>
        ) : (
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
        )}
      </div>

      {facturasLista.length > 0 && (
        <div style={{ background: '#1a1a1a', border: '1px solid #27272a', borderRadius: 8, padding: '12px 14px' }}>
          <p style={{ color: '#52525b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>Facturas vinculadas</p>
          <MultiCheckDrop
            label="Facturas"
            opciones={facturasLista.map(f => ({
              id: f.id,
              label: [f.nombre_entidad, f.numero_factura, f.fecha_factura, f.importe != null ? `${f.importe}€` : null].filter(Boolean).join(' · ')
            }))}
            seleccionados={form.factura_ids || []}
            onChange={ids => set('factura_ids', ids)}
          />
        </div>
      )}

      {(clientesLista.length > 0 || equipoLista.length > 0 || proveedoresListaForm.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
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
          {proveedoresListaForm.length > 0 && (
            <MultiCheckDrop
              label="Proveedores"
              opciones={proveedoresListaForm.map(p => ({ id: p.id, label: p.nombre + (p.nombre_empresa ? ` (${p.nombre_empresa})` : '') }))}
              seleccionados={form.proveedor_ids || []}
              onChange={ids => set('proveedor_ids', ids)}
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
        {ok && <span style={{ color: '#22c55e', fontSize: 14 }}>✓ Movimiento guardado correctamente</span>}
      </div>
    </form>
  );
}
