import { useState } from 'react';
import { useCrearCliente, useEditarCliente, useCrearEquipo, useEditarEquipo, useCrearProveedor, useEditarProveedor } from '@/features/finanzas';
import { S } from '../constants';

// ── Modal para crear / editar contacto (cliente o equipo) ───────

export function ModalContacto({ tipo, datos, onGuardado, onCerrar }) {
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

  const crearCliente   = useCrearCliente();
  const editarCliente  = useEditarCliente();
  const crearEquipo    = useCrearEquipo();
  const editarEquipo   = useEditarEquipo();
  const crearProveedor = useCrearProveedor();
  const editarProveedor = useEditarProveedor();
  const mutation = esCliente ? (esEdicion ? editarCliente : crearCliente)
    : esEquipo ? (esEdicion ? editarEquipo : crearEquipo)
    : (esEdicion ? editarProveedor : crearProveedor);
  const savingContacto = mutation.isPending;

  function handleGuardar(e) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    const aliasArr = form.alias.split(',').map(s => s.trim()).filter(Boolean);
    const base = { nombre: form.nombre, nombre_empresa: form.nombre_empresa || null, email: form.email || null, nif_cif: form.nif_cif || null, direccion: form.direccion || null, notas: form.notas || null, alias: aliasArr };
    const body = esCliente ? { ...base, activo: form.activo } : esEquipo ? { ...base, fijo: form.fijo } : base;
    const args = esEdicion ? { id: datos.id, data: body } : body;
    mutation.mutate(args, {
      onSuccess: () => onGuardado(),
      onError: (err) => alert('Error: ' + err.message),
    });
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
