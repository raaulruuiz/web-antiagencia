import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FooterMinimal from '@/components/landing/FooterMinimal';
import { BACKEND_URL } from '@/lib/config';
import CalendarPicker, { BLUE, fmtDiaCorto, initialCalMonth } from '@/components/booking/CalendarPicker';

function fmtFechaHoraLarga(iso) {
  const dt = new Date(iso);
  return dt.toLocaleString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
}

export default function Reservar() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tipo, setTipo] = useState(null);
  const [dias, setDias] = useState([]);
  const [selectedFecha, setSelectedFecha] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [calMonth, setCalMonth] = useState(null); // { year, month(0-idx) }

  const [form, setForm] = useState({ nombre: '', email: '', notas: '' });
  const [respuestas, setRespuestas] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmado, setConfirmado] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const [rTipo, rDisp] = await Promise.all([
        fetch(`${BACKEND_URL}/public/calendly/${slug}`),
        fetch(`${BACKEND_URL}/public/calendly/${slug}/disponibilidad`),
      ]);
      if (rTipo.status === 404) { setNotFound(true); return; }
      const dTipo = await rTipo.json();
      if (!rTipo.ok) throw new Error(dTipo.error || 'Error al cargar');
      const dDisp = await rDisp.json();
      if (!rDisp.ok) throw new Error(dDisp.error || 'Error al cargar disponibilidad');

      setTipo(dTipo);
      setDias(dDisp);
      setCalMonth(prev => prev || initialCalMonth(dDisp));
      setSelectedFecha(prev => (prev && dDisp.some(d => d.fecha === prev)) ? prev : null);
      setSelectedSlot(prev => {
        if (!prev) return null;
        const dia = dDisp.find(d => d.fecha === selectedFecha);
        return dia?.slots.find(s => s.startISO === prev.startISO) || null;
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => { cargar(); }, [cargar]);

  async function confirmarReserva(e) {
    e.preventDefault();
    if (!selectedSlot || !form.nombre.trim() || !form.email.trim()) return;
    const preguntas = tipo?.preguntas_extra || [];
    const faltante = preguntas.find(p => p.requerida && !String(respuestas[p.id] ?? '').trim());
    if (faltante) {
      setSubmitError(`Falta responder: ${faltante.nombre}`);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/public/calendly/${slug}/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          notas: form.notas || null,
          startISO: selectedSlot.startISO,
          endISO: selectedSlot.endISO,
          respuestas,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setSubmitError(data.error || 'Ese hueco ya no está disponible.');
        setSelectedSlot(null);
        cargar();
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Error al reservar');
      setConfirmado(data);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>{tipo ? `Reservar · ${tipo.nombre}` : 'Reservar'} - Antiagencia</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-2xl">
            <div className="bg-white shadow-xl rounded-sm px-6 md:px-12 py-10 md:py-12" style={{ fontFamily: "'Georgia', serif" }}>

              {loading && (
                <p className="text-gray-500 text-sm text-center py-16">Cargando…</p>
              )}

              {!loading && notFound && (
                <div className="text-center py-16">
                  <h1 className="text-2xl text-gray-900 mb-4 font-bold">Página no encontrada</h1>
                  <p className="text-gray-600">Este enlace de reserva no existe o ya no está activo.</p>
                </div>
              )}

              {!loading && !notFound && confirmado && (
                <div className="text-center py-8">
                  <h1 className="text-2xl md:text-3xl text-gray-900 mb-4 font-bold">¡Reserva confirmada!</h1>
                  <p className="text-gray-700 mb-1">{fmtFechaHoraLarga(confirmado.inicio)}</p>
                  <p className="text-gray-500 text-sm mb-6">Te ha llegado la invitación por email, con la opción de modificar o cancelar.</p>
                  {confirmado.meet_link && (
                    <a
                      href={confirmado.meet_link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-block', backgroundColor: BLUE, color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: '4px', fontWeight: 700, fontSize: '15px' }}
                    >
                      Enlace de Google Meet →
                    </a>
                  )}
                </div>
              )}

              {!loading && !notFound && !confirmado && tipo && (
                <div className="text-gray-800">
                  <h1 className="text-2xl md:text-3xl text-gray-900 mb-2 font-bold">{tipo.nombre}</h1>
                  {tipo.descripcion && <p className="text-gray-600 mb-2 leading-relaxed">{tipo.descripcion}</p>}
                  <p className="text-sm mb-8" style={{ color: BLUE, fontWeight: 700 }}>{tipo.duracion_minutos} minutos</p>

                  <CalendarPicker
                    dias={dias}
                    calMonth={calMonth}
                    setCalMonth={setCalMonth}
                    selectedFecha={selectedFecha}
                    setSelectedFecha={setSelectedFecha}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                  />

                  {selectedSlot && (
                    <form onSubmit={confirmarReserva} className="flex flex-col gap-3 border-t border-gray-200 pt-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
                        <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Email *</label>
                        <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Notas (opcional)</label>
                        <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                      </div>

                      {(tipo.preguntas_extra || []).map(p => (
                        <div key={p.id}>
                          <label className="block text-xs text-gray-500 mb-1">
                            {p.nombre} {p.requerida && '*'}
                          </label>
                          {p.tipo === 'texto_largo' ? (
                            <textarea required={p.requerida} rows={2}
                              value={respuestas[p.id] || ''}
                              onChange={e => setRespuestas(r => ({ ...r, [p.id]: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                          ) : p.tipo === 'seleccion_unica' ? (
                            <select required={p.requerida}
                              value={respuestas[p.id] || ''}
                              onChange={e => setRespuestas(r => ({ ...r, [p.id]: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                              <option value="">Selecciona una opción</option>
                              {(p.opciones || []).map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                          ) : p.tipo === 'seleccion_multiple' ? (
                            <div className="flex flex-col gap-1.5 pt-1">
                              {(p.opciones || []).map(op => {
                                const seleccionadas = respuestas[p.id] || [];
                                const checked = seleccionadas.includes(op);
                                return (
                                  <label key={op} className="flex items-center gap-1.5 text-sm text-gray-700">
                                    <input type="checkbox" checked={checked}
                                      onChange={() => setRespuestas(r => {
                                        const actuales = r[p.id] || [];
                                        const next = checked ? actuales.filter(v => v !== op) : [...actuales, op];
                                        return { ...r, [p.id]: next };
                                      })} />
                                    {op}
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <input required={p.requerida}
                              value={respuestas[p.id] || ''}
                              onChange={e => setRespuestas(r => ({ ...r, [p.id]: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                          )}
                        </div>
                      ))}

                      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{ backgroundColor: BLUE, color: '#fff', border: 'none', borderRadius: '4px', padding: '14px 24px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
                      >
                        {submitting ? 'Confirmando…' : `Confirmar ${selectedSlot.horaInicio} · ${fmtDiaCorto(selectedFecha)}`}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
