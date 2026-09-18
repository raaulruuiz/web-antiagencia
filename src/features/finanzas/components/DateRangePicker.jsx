import { useState, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { toISO, addDays, RANGOS_PRESET, fmtRango, periodoAnterior } from '../utils';

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
export function DateRangePicker({ desde, hasta, onApply, showComparar, comparar, desdeComp, hastaComp }) {
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
