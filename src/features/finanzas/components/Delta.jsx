export function Delta({ value, comp }) {
  if (comp == null || comp === 0 || value == null) return null;
  const pct = Math.round(((value - comp) / Math.abs(comp)) * 100);
  const up = pct >= 0;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: up ? '#22c55e' : '#f87171', marginLeft: 6, whiteSpace: 'nowrap' }}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}
