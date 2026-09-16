import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FooterMinimal from '@/components/landing/FooterMinimal';
import { BACKEND_URL } from '@/lib/config';

const BLUE = '#0067FD';

function fmtDia(fecha) {
  // fecha es 'YYYY-MM-DD' (calendario de Madrid, ya calculado en el backend).
  // Se parsea por componentes, no por string, para no depender de la zona
  // horaria del navegador de quien visite la página.
  const [y, m, d] = fecha.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return dt.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
}

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

  const [form, setForm] = useState({ nombre: '', email: '', notas: '' });
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
      setSelectedFecha(prev => dDisp.some(d => d.fecha === prev) ? prev : (dDisp[0]?.fecha ?? null));
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

  const diaActual = dias.find(d => d.fecha === selectedFecha);

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
                  <p className="text-gray-500 text-sm mb-6">Te ha llegado la invitación por email.</p>
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

                  {dias.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay huecos disponibles ahora mismo.</p>
                  ) : (
                    <>
                      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
                        {dias.map(d => (
                          <button
                            key={d.fecha}
                            onClick={() => { setSelectedFecha(d.fecha); setSelectedSlot(null); }}
                            style={{
                              flexShrink: 0,
                              padding: '10px 16px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              border: d.fecha === selectedFecha ? `2px solid ${BLUE}` : '1px solid #e5e7eb',
                              backgroundColor: d.fecha === selectedFecha ? '#eef4ff' : '#fff',
                              color: d.fecha === selectedFecha ? BLUE : '#374151',
                              cursor: 'pointer',
                            }}
                          >
                            {fmtDia(d.fecha)}
                          </button>
                        ))}
                      </div>

                      {diaActual && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8" style={{ fontFamily: 'system-ui, sans-serif' }}>
                          {diaActual.slots.map(s => (
                            <button
                              key={s.startISO}
                              onClick={() => setSelectedSlot(s)}
                              style={{
                                padding: '10px 8px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                border: selectedSlot?.startISO === s.startISO ? `2px solid ${BLUE}` : '1px solid #e5e7eb',
                                backgroundColor: selectedSlot?.startISO === s.startISO ? BLUE : '#fff',
                                color: selectedSlot?.startISO === s.startISO ? '#fff' : '#374151',
                                cursor: 'pointer',
                              }}
                            >
                              {s.horaInicio}
                            </button>
                          ))}
                        </div>
                      )}

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
                          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                          <button
                            type="submit"
                            disabled={submitting}
                            style={{ backgroundColor: BLUE, color: '#fff', border: 'none', borderRadius: '4px', padding: '14px 24px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
                          >
                            {submitting ? 'Confirmando…' : `Confirmar ${selectedSlot.horaInicio} · ${fmtDia(selectedFecha)}`}
                          </button>
                        </form>
                      )}
                    </>
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
