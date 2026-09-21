export function BlockHeader({ title, subtitle }) {
  if (!title && !subtitle) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      {title && <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 4px' }}>{title}</h2>}
      {subtitle && <p style={{ fontSize: 13, color: 'var(--t-text-muted)', margin: 0, lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}
