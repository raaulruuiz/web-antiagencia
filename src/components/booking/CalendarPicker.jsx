import { useMemo } from 'react';

export const BLUE = '#0067FD';
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function fechaDeYMD(y, m, d) {
  // Construye la fecha 'YYYY-MM-DD' a partir de componentes numéricos (no de
  // un Date ya formateado), para no arrastrar desfases de zona horaria.
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function fmtDiaCorto(fecha) {
  const [y, m, d] = fecha.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return dt.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
}

function fmtMesAnio(year, month) {
  const dt = new Date(year, month, 1);
  const s = dt.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
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

// Mes inicial a mostrar: el del primer día con huecos.
export function initialCalMonth(dias) {
  if (!dias?.length) return null;
  const [y, m] = dias[0].fecha.split('-').map(Number);
  return { year: y, month: m - 1 };
}

export default function CalendarPicker({ dias, calMonth, setCalMonth, selectedFecha, setSelectedFecha, selectedSlot, setSelectedSlot }) {
  const diasMap = useMemo(() => {
    const m = {};
    dias.forEach(d => { m[d.fecha] = d; });
    return m;
  }, [dias]);

  const diaActual = dias.find(d => d.fecha === selectedFecha);

  if (dias.length === 0) {
    return <p className="text-gray-500 text-sm">No hay huecos disponibles ahora mismo.</p>;
  }
  if (!calMonth) return null;

  const enPrimerMes = calMonth.year === Number(dias[0].fecha.slice(0, 4)) && calMonth.month === Number(dias[0].fecha.slice(5, 7)) - 1;
  const ultimaFecha = dias[dias.length - 1].fecha;
  const enUltimoMes = calMonth.year === Number(ultimaFecha.slice(0, 4)) && calMonth.month === Number(ultimaFecha.slice(5, 7)) - 1;

  return (
    <>
      <div className="mb-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setCalMonth(m => {
              const d = new Date(m.year, m.month - 1, 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })}
            disabled={enPrimerMes}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#374151', padding: '4px 10px', opacity: enPrimerMes ? 0.3 : 1 }}
          >‹</button>
          <span className="text-sm font-semibold text-gray-800">{fmtMesAnio(calMonth.year, calMonth.month)}</span>
          <button
            type="button"
            onClick={() => setCalMonth(m => {
              const d = new Date(m.year, m.month + 1, 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })}
            disabled={enUltimoMes}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#374151', padding: '4px 10px', opacity: enUltimoMes ? 0.3 : 1 }}
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
    </>
  );
}
