import { S, DIM_COLOR } from '../constants';
import { fmt } from '../utils';
import { Delta } from './Delta';

// ── Métricas ────────────────────────────────────────────────────

export function MetricCard({ label, value, color, sub, compValue }) {
  const numericValue = compValue != null ? parseFloat(String(value).replace(/[^0-9,-]/g, '').replace(',', '.')) : null;
  const antColor = DIM_COLOR[color] || '#52525b';
  return (
    <div style={S.card}>
      <p style={{ color: '#71717a', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</p>
      <p style={{ color: color || 'white', fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{value}</p>
      {compValue != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
          <Delta value={numericValue} comp={compValue} />
          <span style={{ color: antColor, fontSize: 10, fontWeight: 500 }}>ant {fmt(compValue)}</span>
        </div>
      )}
      {sub && <p style={{ color: '#52525b', fontSize: 11, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}
