import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FooterMinimal from '@/components/landing/FooterMinimal';
import { BACKEND_URL } from '@/lib/config';

const BLUE = '#0067FD';
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function fechaDeYMD(y, m, d) {
  // Construye la fecha 'YYYY-MM-DD' a partir de componentes numéricos (no de
  // un Date ya formateado), para no arrastrar desfases de zona horaria.
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function fmtDiaCorto(fecha) {
  const [y, m, d] = fecha.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return dt.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
}

function fmtMesAnio(year, month) {
  const dt = new Date(year, month, 1);
  const s = dt.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtFechaHoraLarga(iso) {
  const dt = new Date(iso);
  return dt.toLocaleString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
}

// Celdas del mes: null para huecos antes del día 1, luego 1..N.
function celdasDelMes(year, month) {
  const primerDia = new Date(year, month, 1);
  const inicioSemana = (primerDia.getDay() + 6) % 7; // lunes = 0
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < inicioSemana; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);
  return celdas;
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

  const diasMap = useMemo(() => {
    const m = {};
    dias.forEach(d => { m[d.fecha] = d; });
    return m;
  }, [dias]);

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
      setCalMonth(prev => {
        if (prev) return prev;
        if (!dDisp.length) return null;
        const [y, m] = dDisp[0].fecha.split('-').map(Number);
        return { year: y, month: m - 1 };
      });
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
                      {calMonth && (
                        <div className="mb-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
                          <div className="flex items-center justify-between mb-3">
                            <button
                              type="button"
                              onClick={() => setCalMonth(m => {
                                const d = new Date(m.year, m.month - 1, 1);
                                return { year: d.getFullYear(), month: d.getMonth() };
                              })}
                              disabled={calMonth.year === Number(dias[0].fecha.slice(0, 4)) && calMonth.month === Number(dias[0].fecha.slice(5, 7)) - 1}
                              style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#374151', padding: '4px 10px', opacity: (calMonth.year === Number(dias[0].fecha.slice(0, 4)) && calMonth.month === Number(dias[0].fecha.slice(5, 7)) - 1) ? 0.3 : 1 }}
                            >‹</button>
                            <span className="text-sm font-semibold text-gray-800">{fmtMesAnio(calMonth.year, calMonth.month)}</span>
                            <button
                              type="button"
                              onClick={() => setCalMonth(m => {
                                const d = new Date(m.year, m.month + 1, 1);
                                return { year: d.getFullYear(), month: d.getMonth() };
                              })}
                              disabled={(() => { const ult = dias[dias.length - 1].fecha; return calMonth.year === Number(ult.slice(0, 4)) && calMonth.month === Number(ult.slice(5, 7)) - 1; })()}
                              style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#374151', padding: '4px 10px', opacity: (() => { const ult = dias[dias.length - 1].fecha; return calMonth.year === Number(ult.slice(0, 4)) && calMonth.month === Number(ult.slice(5, 7)) - 1; })() ? 0.3 : 1 }}
                            >›</button>
                          </div>
                          <div className="grid grid-cols-7 gap-1 mb-1">
                            {DIAS_SEMANA.map(w => (
                              <div key={w} className="text-center text-[11px] text-gray-400 font-semibold py-1">{w}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {celdasDelMes(calMonth.year, calMonth.month).map((d, i) => {
                              if (d === null) return <div key={`empty-${i}`} />;
                              const fecha = fechaDeYMD(calMonth.year, calMonth.month, d);
                              const disponible = !!diasMap[fecha];
                              const isSelected = fecha === selectedFecha;
                              return (
                                <button
                                  key={fecha}
                                  type="button"
                                  disabled={!disponible}
                                  onClick={() => { setSelectedFecha(fecha); setSelectedSlot(null); }}
                                  style={{
                                    aspectRatio: '1',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    border: isSelected ? `2px solid ${BLUE}` : '1px solid transparent',
                                    backgroundColor: isSelected ? BLUE : (disponible ? '#eef4ff' : 'transparent'),
                                    color: isSelected ? '#fff' : (disponible ? BLUE : '#d1d5db'),
                                    cursor: disponible ? 'pointer' : 'default',
                                  }}
                                >
                                  {d}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {diaActual && (
                        <div className="mb-8">
                          <p className="text-xs text-gray-500 mb-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
                            Horas disponibles el {fmtDiaCorto(selectedFecha)}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
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
                              ) : p.tipo === 'si_no' ? (
                                <div className="flex gap-4 pt-1">
                                  {['Sí', 'No'].map(opt => (
                                    <label key={opt} className="flex items-center gap-1.5 text-sm text-gray-700">
                                      <input type="radio" name={`preg-${p.id}`} required={p.requerida}
                                        checked={respuestas[p.id] === opt}
                                        onChange={() => setRespuestas(r => ({ ...r, [p.id]: opt }))} />
                                      {opt}
                                    </label>
                                  ))}
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
