import { useEffect, useState, useCallback } from 'react';
import { BACKEND_URL } from '@/lib/config';
import { supabase } from '@/lib/supabaseClient';

const WEEKDAYS = [
  { key: 'monday',    label: 'Lunes' },
  { key: 'tuesday',   label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday',  label: 'Jueves' },
  { key: 'friday',    label: 'Viernes' },
  { key: 'saturday',  label: 'Sábado' },
  { key: 'sunday',    label: 'Domingo' },
];

const CUENTAS = [
  { key: 'raul@antiagencia.es',        label: 'raul@antiagencia.es' },
  { key: 'ruizromeroraul@gmail.com',   label: 'Personal (Gmail)' },
];

function slugify(nombre) {
  return (nombre || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function emptyForm() {
  const dias = {};
  WEEKDAYS.forEach(d => { dias[d.key] = { activo: false, intervals: [{ from: '11:00', to: '19:00' }] }; });
  return {
    nombre: '', descripcion: '', duracion_minutos: 60,
    buffer_antes_min: 0, buffer_despues_min: 0,
    min_notice_horas: 24, horizonte_dias: 60,
    dias,
    cuentas: { 'raul@antiagencia.es': true, 'ruizromeroraul@gmail.com': true },
  };
}

function horarioToForm(horario) {
  const f = emptyForm();
  (horario || []).forEach(r => {
    if (f.dias[r.wday] && r.intervals?.length) {
      f.dias[r.wday] = { activo: true, intervals: r.intervals.map(i => ({ from: i.from, to: i.to })) };
    }
  });
  return f;
}

function tipoToForm(tipo) {
  const f = horarioToForm(tipo.horario);
  f.nombre = tipo.nombre;
  f.descripcion = tipo.descripcion || '';
  f.duracion_minutos = tipo.duracion_minutos;
  f.buffer_antes_min = tipo.buffer_antes_min;
  f.buffer_despues_min = tipo.buffer_despues_min;
  f.min_notice_horas = tipo.min_notice_horas;
  f.horizonte_dias = tipo.horizonte_dias;
  const cuentas = {};
  CUENTAS.forEach(c => { cuentas[c.key] = (tipo.calendarios_conflicto || []).includes(c.key); });
  f.cuentas = cuentas;
  return f;
}

function formToPayload(form, nombreParaSlug) {
  const horario = WEEKDAYS
    .filter(d => form.dias[d.key].activo)
    .map(d => ({ wday: d.key, intervals: form.dias[d.key].intervals }));
  const calendarios_conflicto = CUENTAS.filter(c => form.cuentas[c.key]).map(c => c.key);
  return {
    nombre: form.nombre,
    slug: slugify(nombreParaSlug ?? form.nombre),
    descripcion: form.descripcion || null,
    duracion_minutos: parseInt(form.duracion_minutos, 10) || 60,
    buffer_antes_min: parseInt(form.buffer_antes_min, 10) || 0,
    buffer_despues_min: parseInt(form.buffer_despues_min, 10) || 0,
    min_notice_horas: parseInt(form.min_notice_horas, 10) || 0,
    horizonte_dias: parseInt(form.horizonte_dias, 10) || 60,
    horario,
    calendarios_conflicto,
  };
}

function fmtFechaHora(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function emptyReunionForm() {
  return { titulo: '', nombre_invitado: '', email_invitado: '', fecha: '', hora_inicio: '', hora_fin: '', descripcion: '' };
}

export default function Calendly() {
  const [tab, setTab] = useState('reuniones');

  const [token, setToken] = useState(null);
  const [tokenReady, setTokenReady] = useState(false);

  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [reuniones, setReuniones] = useState([]);
  const [loadingReuniones, setLoadingReuniones] = useState(true);
  const [error, setError] = useState(null);

  const [modalTipo, setModalTipo] = useState(null); // null | { tipo: null|obj }
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const [modalReunion, setModalReunion] = useState(false);
  const [reunionForm, setReunionForm] = useState(emptyReunionForm());
  const [savingReunion, setSavingReunion] = useState(false);
  const [confirmDeleteReunionId, setConfirmDeleteReunionId] = useState(null);
  const [deletingReunion, setDeletingReunion] = useState(false);

  function copiarUrl(slug) {
    const url = `https://antiagencia.es/reservar/${slug}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(s => s === slug ? null : s), 1500);
    }).catch(() => {});
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token ?? null);
      setTokenReady(true);
    });
  }, []);

  function buildHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  const fetchTipos = useCallback(async () => {
    if (!tokenReady) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/calendly/tipos`, { headers: buildHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar');
      setTipos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTipos(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tokenReady]);

  const fetchReuniones = useCallback(async () => {
    if (!tokenReady) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/calendly/reuniones`, { headers: buildHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar');
      setReuniones(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingReuniones(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tokenReady]);

  useEffect(() => { fetchTipos(); }, [fetchTipos]);
  useEffect(() => { fetchReuniones(); }, [fetchReuniones]);

  function abrirCrear() {
    setForm(emptyForm());
    setModalTipo({ tipo: null });
  }
  function abrirEditar(tipo) {
    setForm(tipoToForm(tipo));
    setModalTipo({ tipo });
  }

  function addFranja(dayKey) {
    setForm(f => ({ ...f, dias: { ...f.dias, [dayKey]: { ...f.dias[dayKey], intervals: [...f.dias[dayKey].intervals, { from: '11:00', to: '19:00' }] } } }));
  }
  function removeFranja(dayKey, idx) {
    setForm(f => ({ ...f, dias: { ...f.dias, [dayKey]: { ...f.dias[dayKey], intervals: f.dias[dayKey].intervals.filter((_, i) => i !== idx) } } }));
  }
  function setFranja(dayKey, idx, campo, valor) {
    setForm(f => ({
      ...f,
      dias: {
        ...f.dias,
        [dayKey]: {
          ...f.dias[dayKey],
          intervals: f.dias[dayKey].intervals.map((iv, i) => i === idx ? { ...iv, [campo]: valor } : iv),
        },
      },
    }));
  }

  async function guardarTipo(e) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      const esEdicion = !!modalTipo.tipo;
      const payload = formToPayload(form, esEdicion ? undefined : form.nombre);
      const url = esEdicion ? `${BACKEND_URL}/admin/calendly/tipos/${modalTipo.tipo.id}` : `${BACKEND_URL}/admin/calendly/tipos`;
      const res = await fetch(url, { method: esEdicion ? 'PUT' : 'POST', headers: buildHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setModalTipo(null);
      fetchTipos();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminarTipo(id, hard) {
    try {
      const url = `${BACKEND_URL}/admin/calendly/tipos/${id}${hard ? '?hard=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE', headers: buildHeaders() });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setConfirmDeleteId(null);
      fetchTipos();
    } catch (err) {
      alert('Error eliminando: ' + err.message);
    }
  }

  function abrirCrearReunion() {
    setReunionForm(emptyReunionForm());
    setModalReunion(true);
  }

  async function guardarReunion(e) {
    e.preventDefault();
    if (!reunionForm.titulo.trim() || !reunionForm.fecha || !reunionForm.hora_inicio || !reunionForm.hora_fin) return;
    setSavingReunion(true);
    try {
      const payload = {
        titulo: reunionForm.titulo,
        nombre_invitado: reunionForm.nombre_invitado || null,
        email_invitado: reunionForm.email_invitado || null,
        descripcion: reunionForm.descripcion || null,
        fecha_hora_inicio: `${reunionForm.fecha}T${reunionForm.hora_inicio}:00`,
        fecha_hora_fin: `${reunionForm.fecha}T${reunionForm.hora_fin}:00`,
      };
      const res = await fetch(`${BACKEND_URL}/admin/calendly/reuniones`, { method: 'POST', headers: buildHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la reunión');
      setModalReunion(false);
      fetchReuniones();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSavingReunion(false);
    }
  }

  async function eliminarReunion(id) {
    setDeletingReunion(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/calendly/reuniones/${encodeURIComponent(id)}`, { method: 'DELETE', headers: buildHeaders() });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setConfirmDeleteReunionId(null);
      fetchReuniones();
    } catch (err) {
      alert('Error eliminando: ' + err.message);
    } finally {
      setDeletingReunion(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Calendly</h1>
        <p className="text-zinc-500 text-sm mt-1">Dashboard de reuniones y tipos de reunión.</p>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-lg border border-red-800 bg-red-950 text-red-300 text-sm">{error}</div>}

      <div className="flex gap-1 mb-6 border-b border-zinc-800">
        {[{ id: 'reuniones', label: 'Reuniones' }, { id: 'calendarios', label: 'Calendarios' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reuniones' && (
        <div>
          <button onClick={abrirCrearReunion} className="mb-4 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors">
            + Añadir reunión
          </button>
          {loadingReuniones ? (
            <p className="text-zinc-500 text-sm">Cargando…</p>
          ) : reuniones.length === 0 ? (
            <p className="text-zinc-500 text-sm">No hay reuniones en los próximos 30 días.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {reuniones.map(r => (
                <div key={r.id} className="flex items-center justify-between border border-zinc-800 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{r.titulo}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{fmtFechaHora(r.inicio)}{r.invitado ? ` · ${r.invitado}` : ''}</p>
                    {r.meet_link && (
                      <a href={r.meet_link} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-0.5 inline-block">
                        Enlace de Google Meet →
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded ${r.fuente === 'google' ? 'bg-blue-950 text-blue-300' : 'bg-zinc-800 text-zinc-400'}`}>
                      {r.fuente === 'google' ? 'Google Calendar' : 'Interna'}
                    </span>
                    {r.fuente === 'google' && (
                      <button onClick={() => setConfirmDeleteReunionId(r.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'calendarios' && (
        <div>
          <button onClick={abrirCrear} className="mb-4 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors">
            + Crear calendario
          </button>
          {loadingTipos ? (
            <p className="text-zinc-500 text-sm">Cargando…</p>
          ) : tipos.length === 0 ? (
            <p className="text-zinc-500 text-sm">Todavía no has creado ningún tipo de reunión.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {tipos.map(t => (
                <div key={t.id} className="flex items-center justify-between border border-zinc-800 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{t.nombre} {!t.activo && <span className="text-zinc-600">(inactivo)</span>}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{t.duracion_minutos} min</p>
                    <p className="text-xs text-zinc-600 mt-0.5 flex items-center gap-1.5">
                      antiagencia.es/reservar/{t.slug}
                      <button type="button" onClick={() => copiarUrl(t.slug)} title="Copiar URL"
                        className="text-zinc-500 hover:text-white transition-colors">
                        {copiedSlug === t.slug ? '✓' : '⧉'}
                      </button>
                      <span className="text-zinc-700">(página pública pendiente — Fase 2)</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => abrirEditar(t)} className="text-xs text-zinc-400 hover:text-white px-2 py-1">Editar</button>
                    {t.activo ? (
                      <button onClick={() => setConfirmDeleteId(t)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">Desactivar</button>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(t)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">Eliminar definitivamente</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {confirmDeleteId && (
        <div onClick={() => setConfirmDeleteId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full">
            <p className="text-sm mb-4">
              {confirmDeleteId.activo
                ? '¿Desactivar este tipo de reunión? No se volverá a mostrar como activo, pero no se borra.'
                : '¿Eliminar definitivamente este tipo de reunión? No se puede deshacer.'}
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDeleteId(null)} className="text-sm text-zinc-400 px-3 py-1.5">Cancelar</button>
              <button onClick={() => eliminarTipo(confirmDeleteId.id, !confirmDeleteId.activo)} className="text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg px-3 py-1.5">
                {confirmDeleteId.activo ? 'Desactivar' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteReunionId && (
        <div onClick={() => setConfirmDeleteReunionId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full">
            <p className="text-sm mb-4">¿Eliminar esta reunión? Se borra el evento en Google Calendar y se avisa a los invitados si los hay.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDeleteReunionId(null)} className="text-sm text-zinc-400 px-3 py-1.5">Cancelar</button>
              <button onClick={() => eliminarReunion(confirmDeleteReunionId)} disabled={deletingReunion} className="text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg px-3 py-1.5 disabled:opacity-60">
                {deletingReunion ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalReunion && (
        <div onClick={() => setModalReunion(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-base font-bold mb-4">Añadir reunión</h3>
            <form onSubmit={guardarReunion} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Título *</label>
                <input value={reunionForm.titulo} onChange={e => setReunionForm(f => ({ ...f, titulo: e.target.value }))} required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Llamada con..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Nombre invitado</label>
                  <input value={reunionForm.nombre_invitado} onChange={e => setReunionForm(f => ({ ...f, nombre_invitado: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Email invitado</label>
                  <input type="email" value={reunionForm.email_invitado} onChange={e => setReunionForm(f => ({ ...f, email_invitado: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="opcional" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Fecha *</label>
                  <input type="date" value={reunionForm.fecha} onChange={e => setReunionForm(f => ({ ...f, fecha: e.target.value }))} required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Hora inicio *</label>
                  <input type="time" value={reunionForm.hora_inicio} onChange={e => setReunionForm(f => ({ ...f, hora_inicio: e.target.value }))} required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Hora fin *</label>
                  <input type="time" value={reunionForm.hora_fin} onChange={e => setReunionForm(f => ({ ...f, hora_fin: e.target.value }))} required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Descripción</label>
                <textarea value={reunionForm.descripcion} onChange={e => setReunionForm(f => ({ ...f, descripcion: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" rows={2} />
              </div>
              <p className="text-xs text-zinc-600">Se crea en el calendario Reuniones con un enlace de Google Meet automático. Si pones email, se le enviará la invitación.</p>
              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => setModalReunion(false)} className="text-sm text-zinc-400 px-3 py-1.5">Cancelar</button>
                <button type="submit" disabled={savingReunion} className="text-sm bg-white text-black rounded-lg px-4 py-1.5 font-medium disabled:opacity-60">
                  {savingReunion ? 'Creando…' : 'Crear reunión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalTipo && (
        <div onClick={() => setModalTipo(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-base font-bold mb-4">{modalTipo.tipo ? 'Editar' : 'Nuevo'} calendario</h3>
            <form onSubmit={guardarTipo} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Sesión de Claridad" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Duración (min)</label>
                  <input type="number" value={form.duracion_minutos} onChange={e => setForm(f => ({ ...f, duracion_minutos: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Aviso mínimo (horas)</label>
                  <input type="number" value={form.min_notice_horas} onChange={e => setForm(f => ({ ...f, min_notice_horas: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Buffer antes (min)</label>
                  <input type="number" value={form.buffer_antes_min} onChange={e => setForm(f => ({ ...f, buffer_antes_min: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Buffer después (min)</label>
                  <input type="number" value={form.buffer_despues_min} onChange={e => setForm(f => ({ ...f, buffer_despues_min: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-500 mb-1">Ventana de reserva (días en el futuro)</label>
                  <input type="number" value={form.horizonte_dias} onChange={e => setForm(f => ({ ...f, horizonte_dias: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-2">Horario</label>
                <div className="flex flex-col gap-2">
                  {WEEKDAYS.map(d => (
                    <div key={d.key} className="flex items-start gap-2">
                      <label className="flex items-center gap-2 w-28 text-xs text-zinc-300 pt-1.5 flex-shrink-0">
                        <input type="checkbox" checked={form.dias[d.key].activo}
                          onChange={e => setForm(f => ({ ...f, dias: { ...f.dias, [d.key]: { ...f.dias[d.key], activo: e.target.checked } } }))} />
                        {d.label}
                      </label>
                      <div className="flex flex-col gap-1.5 flex-1">
                        {form.dias[d.key].intervals.map((iv, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input type="time" value={iv.from} disabled={!form.dias[d.key].activo}
                              onChange={e => setFranja(d.key, idx, 'from', e.target.value)}
                              className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white disabled:opacity-40" />
                            <span className="text-zinc-600 text-xs">a</span>
                            <input type="time" value={iv.to} disabled={!form.dias[d.key].activo}
                              onChange={e => setFranja(d.key, idx, 'to', e.target.value)}
                              className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white disabled:opacity-40" />
                            {form.dias[d.key].intervals.length > 1 && (
                              <button type="button" onClick={() => removeFranja(d.key, idx)} disabled={!form.dias[d.key].activo}
                                className="text-zinc-600 hover:text-red-400 text-xs disabled:opacity-40">✕</button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addFranja(d.key)} disabled={!form.dias[d.key].activo}
                          className="text-xs text-zinc-500 hover:text-white text-left disabled:opacity-40 disabled:hover:text-zinc-500">
                          + añadir franja
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-2">Comprobar conflictos en</label>
                <div className="flex flex-col gap-1.5">
                  {CUENTAS.map(c => (
                    <label key={c.key} className="flex items-center gap-2 text-xs text-zinc-300">
                      <input type="checkbox" checked={form.cuentas[c.key]}
                        onChange={e => setForm(f => ({ ...f, cuentas: { ...f.cuentas, [c.key]: e.target.checked } }))} />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => setModalTipo(null)} className="text-sm text-zinc-400 px-3 py-1.5">Cancelar</button>
                <button type="submit" disabled={saving} className="text-sm bg-white text-black rounded-lg px-4 py-1.5 font-medium disabled:opacity-60">
                  {saving ? 'Guardando…' : modalTipo.tipo ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
