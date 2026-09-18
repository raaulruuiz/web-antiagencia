// Helpers puros compartidos del feature Finanzas — extraídos de Finanzas.jsx (Fase 15).
import { supabase } from '@/lib/supabaseClient';

// Formatea número con separador de miles en locale español: 2308.04 → "2.308,04"
export function fmtN(n, decimals = 2) {
  if (n == null || n === '') return '—';
  return Number(n).toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtEur(n, showSign = false) {
  if (n == null) return '—';
  const formatted = fmtN(Math.abs(n));
  const sign = n > 0 ? (showSign ? '+' : '') : n < 0 ? '-' : '';
  return `${sign}${formatted}€`;
}

export function fmt(n) {
  if (n == null) return '—';
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '-' : '') + intFmt + ',' + dec + ' €';
}

export function fmtY(v) {
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 10000) return `${(v / 1000).toFixed(0)}k`;
  if (abs >= 1000)  return `${(v / 1000).toFixed(1)}k`;
  return `${Math.round(v)}`;
}

export function mesLabel(yyyymm) {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const [, m] = yyyymm.split('-');
  return meses[parseInt(m, 10) - 1];
}

export async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

export const RANGOS_PRESET = () => {
  const h = new Date();
  const a = h.getFullYear();
  const m = h.getMonth();
  const q = Math.floor(m / 3);
  const hoy = toISO(h);
  const manana = toISO(addDays(h, 1));
  const ayer = toISO(addDays(h, -1));
  return [
    { label: 'Hoy',                  desde: hoy,                            hasta: manana },
    { label: 'Ayer',                 desde: ayer,                           hasta: hoy },
    { label: 'Últimos 7 días',       desde: toISO(addDays(h, -7)),          hasta: hoy },
    { label: 'Últimos 30 días',      desde: toISO(addDays(h, -30)),         hasta: hoy },
    { label: 'Mes hasta la fecha',   desde: toISO(new Date(a, m, 1)),       hasta: manana },
    { label: 'Mes anterior',         desde: toISO(new Date(a, m - 1, 1)),   hasta: toISO(new Date(a, m, 1)) },
    { label: 'Trimestre hasta la fecha', desde: toISO(new Date(a, q*3, 1)), hasta: manana },
    { label: 'Trimestre anterior',   desde: toISO(new Date(a, (q-1)*3, 1)), hasta: toISO(new Date(a, q*3, 1)) },
    { label: 'Año hasta la fecha',   desde: `${a}-01-01`,                   hasta: manana },
    { label: 'Año anterior',         desde: `${a - 1}-01-01`,               hasta: `${a}-01-01` },
    { label: 'Máximo',               desde: '2023-01-01',                   hasta: manana },
  ];
};

export function fmtRango(desde, hasta) {
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const d = new Date(desde + 'T12:00:00');
  const h = addDays(new Date(hasta + 'T12:00:00'), -1);
  const fmtD = `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  const fmtH = `${h.getDate()} ${meses[h.getMonth()]} ${h.getFullYear()}`;
  return fmtD === fmtH ? fmtD : `${fmtD} – ${fmtH}`;
}

export function periodoAnterior(desde, hasta) {
  const d = new Date(desde + 'T12:00:00');
  const h = new Date(hasta + 'T12:00:00');
  // Si desde cae en día 1, usar aritmética de meses para no perder días en años bisiestos
  if (d.getDate() === 1) {
    let shiftMonths;
    if (h.getDate() === 1) {
      // Periodo completo de meses (ej: "Año anterior", "Mes anterior", "Trimestre anterior")
      shiftMonths = (h.getFullYear() - d.getFullYear()) * 12 + (h.getMonth() - d.getMonth());
    } else {
      // "Hasta la fecha": el inicio es día 1 del mes/trimestre/año → determinar unidad
      const m = d.getMonth(); // 0=Ene
      shiftMonths = m === 0 ? 12 : [3, 6, 9].includes(m) ? 3 : 1;
    }
    if (shiftMonths > 0) {
      const nd = new Date(d.getFullYear(), d.getMonth() - shiftMonths, d.getDate());
      const nh = new Date(h.getFullYear(), h.getMonth() - shiftMonths, h.getDate());
      return { desde: toISO(nd), hasta: toISO(nh) };
    }
  }
  // Fallback: mismo número de días hacia atrás
  const diffDays = Math.round((h - d) / 86400000);
  return { desde: toISO(addDays(d, -diffDays)), hasta: desde };
}

export function lsGet(key, fallback) { try { const v = localStorage.getItem(key); return v != null ? JSON.parse(v) : fallback; } catch { return fallback; } }
export function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
