export function PuntuacionBlockView({ block }) {
  const s = block.valor;
  if (s == null) return null;
  const col = s < 5 ? '#ef4444' : s < 7.5 ? '#f97316' : '#22c55e';
  const label = s < 5 ? 'Suspenso' : s < 7.5 ? 'Notable' : 'Sobresaliente';
  const align = block.text_align || 'center';
  const alignItems = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems, gap: 10, padding: '12px 0' }}>
      {block.titulo && <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t-text)', lineHeight: 1.2, textAlign: align }}>{block.titulo}</div>}
      {block.subtitulo && <div style={{ fontSize: 13, color: 'var(--t-text-muted)', textAlign: align, marginTop: block.titulo ? -4 : 0 }}>{block.subtitulo}</div>}
      <div style={{ border: `2px solid ${col}44`, borderRadius: 14, padding: '14px 24px', background: col + '0d', display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 52, fontWeight: 800, color: col, lineHeight: 1 }}>{s}</span>
        <span style={{ fontSize: 20, fontWeight: 500, color: 'var(--t-text-muted)' }}>/10</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: col, opacity: 0.8 }}>{label}</span>
    </div>
  );
}
