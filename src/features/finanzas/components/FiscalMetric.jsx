import { fmt } from '../utils';

// ── Vista fiscal ────────────────────────────────────────────────

export function FiscalMetric({ label, value, color, comp }) {
  const pct = comp != null && comp !== 0 ? Math.round(((value - comp) / Math.abs(comp)) * 100) : null;
  const up = pct >= 0;
  return (
    <div>
      <p style={{ color: '#71717a', fontSize: 11, margin: '0 0 2px' }}>{label}</p>
      <p style={{ color, fontSize: 16, fontWeight: 700, margin: 0 }}>{fmt(value)}</p>
      {comp != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          {pct !== null && <span style={{ fontSize: 10, fontWeight: 600, color: up ? '#22c55e' : '#f87171' }}>{up ? '▲' : '▼'} {Math.abs(pct)}%</span>}
          <span style={{ color: '#52525b', fontSize: 10 }}>ant {fmt(comp)}</span>
        </div>
      )}
    </div>
  );
}
