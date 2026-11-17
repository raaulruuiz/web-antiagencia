import { useEffect, useState, useCallback } from 'react';
import { BACKEND_URL } from '@/lib/config';
// En local la vista previa usa el proxy de vite.config.js (el backend no admite su origen).
const API = import.meta.env.DEV ? '/__calendly' : `${BACKEND_URL}/public/calendly`;

import CalendarPicker, { BLUE, fmtDiaCorto, initialCalMonth, mensajeError } from '@/components/booking/CalendarPicker';

// Calendario de reservas embebible en cualquier página. Usa la misma herramienta
// que /reservar/:slug (tipos creados en /admin/calendly), sin su marco de página.
// `origen` (p. ej. los UTM) se añade a las notas de la reserva para saber de dónde viene.
// `desde` ('YYYY-MM-DD', opcional) oculta los días anteriores a esa fecha; pasada la fecha no hace nada.
// `sinFinesDeSemana` oculta sábados y domingos aunque el tipo de reunión los tenga activos.

function fmtFechaHoraLarga(iso) {
  return new Date(iso).toLocaleString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
}

export default function ReservaEmbebida({ slug, origen = '', onReservada, mostrarDuracion = true, desde = null, sinFinesDeSemana = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [dias, setDias] = useState([]);
  const [selectedFecha, setSelectedFecha] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [calMonth, setCalMonth] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', notas: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmado, setConfirmado] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const [rTipo, rDisp] = await Promise.all([
        fetch(`${API}/${slug}`),
        fetch(`${API}/${slug}/disponibilidad`),
      ]);
      if (!rTipo.ok || !rDisp.ok) throw new Error('No se ha podido cargar el calendario.');
      const dDisp = (await rDisp.json()).filter(d => (!desde || d.fecha >= desde)
        && !(sinFinesDeSemana && (d.weekday === 'saturday' || d.weekday === 'sunday')));
      setTipo(await rTipo.json());
      setDias(dDisp);
      setCalMonth(prev => prev || initialCalMonth(dDisp));
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setLoading(false);
    }
  }, [slug, desde, sinFinesDeSemana]);

  useEffect(() => { cargar(); }, [cargar]);

  async function confirmar(e) {
    e.preventDefault();
    if (!selectedSlot || !form.nombre.trim() || !form.email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const notas = [form.notas.trim(), origen && `Origen: ${origen}`].filter(Boolean).join('\n');
      const res = await fetch(`${API}/${slug}/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre, email: form.email, notas: notas || null,
          startISO: selectedSlot.startISO, endISO: selectedSlot.endISO, respuestas: {},
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError(data.error || 'Ese hueco ya no está disponible.');
        setSelectedSlot(null);
        cargar();
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Error al reservar');
      setConfirmado(data);
      onReservada?.(data);
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-gray-500 text-sm py-8">Cargando calendario…</p>;

  if (confirmado) {
    return (
      <div className="py-4">
        <p className="text-xl font-bold text-gray-900 mb-2">¡Reserva confirmada!</p>
        <p className="text-gray-700 mb-1">{fmtFechaHoraLarga(confirmado.inicio)}</p>
        <p className="text-gray-500 text-sm">Te ha llegado la invitación por email, con la opción de modificar o cancelar.</p>
      </div>
    );
  }

  if (!tipo) return <p className="text-sm text-red-600">{error || 'No se ha podido cargar el calendario.'}</p>;

  return (
    <div className="text-gray-800">
      {mostrarDuracion && <p className="text-sm mb-6" style={{ color: BLUE, fontWeight: 700 }}>{tipo.duracion_minutos} minutos · videollamada</p>}
      <CalendarPicker
        dias={dias} calMonth={calMonth} setCalMonth={setCalMonth}
        selectedFecha={selectedFecha} setSelectedFecha={setSelectedFecha}
        selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot}
      />
      {selectedSlot && (
        <form onSubmit={confirmar} className="flex flex-col gap-3 border-t border-gray-200 pt-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
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
            <label className="block text-xs text-gray-500 mb-1">Algo que quieras contarme antes (opcional)</label>
            <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={submitting}
            className="bg-[#7000FF] hover:bg-[#0067FD] text-white font-bold rounded-sm px-6 py-3 transition-colors"
            style={{ fontFamily: "'Rubik', sans-serif", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Confirmando…' : `Confirmar ${selectedSlot.horaInicio} · ${fmtDiaCorto(selectedFecha)}`}
          </button>
        </form>
      )}
    </div>
  );
}
