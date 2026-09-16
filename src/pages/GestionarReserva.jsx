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

export default function GestionarReserva() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  const [modo, setModo] = useState('ver'); // ver | cambiando | cancelando
  const [cancelando, setCancelando] = useState(false);
  const [cancelado, setCancelado] = useState(false);

  const [dias, setDias] = useState([]);
  const [selectedFecha, setSelectedFecha] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [calMonth, setCalMonth] = useState(null);
  const [guardandoCambio, setGuardandoCambio] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/public/calendly/reservas/${token}`);
      if (res.status === 404) { setNotFound(true); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar');
      setBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { cargar(); }, [cargar]);

  async function abrirCambiarFecha() {
    if (!booking?.tipo?.slug) return;
    setModo('cambiando');
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/public/calendly/${booking.tipo.slug}/disponibilidad`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar disponibilidad');
      setDias(data);
      setCalMonth(initialCalMonth(data));
      setSelectedFecha(null);
      setSelectedSlot(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmarCambio() {
    if (!selectedSlot) return;
    setGuardandoCambio(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/public/calendly/reservas/${token}/modificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startISO: selectedSlot.startISO, endISO: selectedSlot.endISO }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError(data.error || 'Ese hueco ya no está disponible.');
        setSelectedSlot(null);
        abrirCambiarFecha();
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Error al modificar');
      setModo('ver');
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoCambio(false);
    }
  }

  async function confirmarCancelacion() {
    setCancelando(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/public/calendly/reservas/${token}/cancelar`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cancelar');
      setCancelado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelando(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Gestionar reserva - Antiagencia</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-2xl">
            <div className="bg-white shadow-xl rounded-sm px-6 md:px-12 py-10 md:py-12" style={{ fontFamily: "'Georgia', serif" }}>

              {loading && <p className="text-gray-500 text-sm text-center py-16">Cargando…</p>}

              {!loading && notFound && (
                <div className="text-center py-16">
                  <h1 className="text-2xl text-gray-900 mb-4 font-bold">Reserva no encontrada</h1>
                  <p className="text-gray-600">Este enlace no es válido.</p>
                </div>
              )}

              {!loading && !notFound && booking && (
                <div className="text-gray-800" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {(cancelado || booking.estado === 'cancelada') ? (
                    <div className="text-center py-8">
                      <h1 className="text-2xl text-gray-900 mb-4 font-bold">Reserva cancelada</h1>
                      <p className="text-gray-600">{booking.tipo?.nombre} — {fmtFechaHoraLarga(booking.inicio)}</p>
                    </div>
                  ) : modo === 'ver' ? (
                    <>
                      <h1 className="text-2xl text-gray-900 mb-2 font-bold" style={{ fontFamily: "'Georgia', serif" }}>{booking.tipo?.nombre}</h1>
                      <p className="text-gray-700 mb-1">{fmtFechaHoraLarga(booking.inicio)}</p>
                      <p className="text-gray-500 text-sm mb-8">{booking.nombre_invitado} · {booking.email_invitado}</p>

                      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

                      <div className="flex gap-3">
                        <button onClick={abrirCambiarFecha}
                          style={{ backgroundColor: BLUE, color: '#fff', border: 'none', borderRadius: '4px', padding: '12px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                          Cambiar fecha/hora
                        </button>
                        <button onClick={() => setModo('cancelando')}
                          className="text-red-600 hover:text-red-700"
                          style={{ background: 'none', border: '1px solid #fecaca', borderRadius: '4px', padding: '12px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                          Cancelar reserva
                        </button>
                      </div>
                    </>
                  ) : modo === 'cancelando' ? (
                    <>
                      <h1 className="text-xl text-gray-900 mb-4 font-bold" style={{ fontFamily: "'Georgia', serif" }}>¿Cancelar esta reserva?</h1>
                      <p className="text-gray-600 mb-6">{booking.tipo?.nombre} — {fmtFechaHoraLarga(booking.inicio)}</p>
                      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                      <div className="flex gap-3">
                        <button onClick={() => setModo('ver')} className="text-gray-500 text-sm">Volver</button>
                        <button onClick={confirmarCancelacion} disabled={cancelando}
                          style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', padding: '12px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: cancelando ? 0.6 : 1 }}>
                          {cancelando ? 'Cancelando…' : 'Sí, cancelar'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="text-xl text-gray-900 mb-2 font-bold" style={{ fontFamily: "'Georgia', serif" }}>Elige nueva fecha/hora</h1>
                      <p className="text-gray-500 text-sm mb-6">{booking.tipo?.nombre}</p>

                      <CalendarPicker
                        dias={dias}
                        calMonth={calMonth}
                        setCalMonth={setCalMonth}
                        selectedFecha={selectedFecha}
                        setSelectedFecha={setSelectedFecha}
                        selectedSlot={selectedSlot}
                        setSelectedSlot={setSelectedSlot}
                      />

                      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

                      <div className="flex gap-3">
                        <button onClick={() => setModo('ver')} className="text-gray-500 text-sm">Cancelar</button>
                        {selectedSlot && (
                          <button onClick={confirmarCambio} disabled={guardandoCambio}
                            style={{ backgroundColor: BLUE, color: '#fff', border: 'none', borderRadius: '4px', padding: '12px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: guardandoCambio ? 0.6 : 1 }}>
                            {guardandoCambio ? 'Guardando…' : `Confirmar ${selectedSlot.horaInicio} · ${fmtDiaCorto(selectedFecha)}`}
                          </button>
                        )}
                      </div>
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
