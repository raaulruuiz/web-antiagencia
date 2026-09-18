export function CheckLegend({ items, hidden, onToggle, style }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', ...style }}>
      {items.map(({ key, name, color }) => {
        const off = !!hidden[key];
        return (
          <span key={key} onClick={() => onToggle(key)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, border: `2px solid ${color}`,
              background: off ? 'transparent' : color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: off ? '#52525b' : color, fontSize: 11 }}>{name}</span>
          </span>
        );
      })}
    </div>
  );
}
