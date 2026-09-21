import { BlockHeader } from '../shared/BlockHeader';

export function AsuntoAdelantoBlockView({ block, item, hideTitle, isMobile }) {
  const items = block.items || [];
  if (!items.length && !block.titulo && !block.subtitulo) return null;
  if (!items.length) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  const layout   = block.it_layout || 'img-text';
  const isHoriz  = !isMobile && (layout === 'img-text' || layout === 'text-img');
  const fieldFirst = layout === 'img-text' || layout === 'img-top';

  return (
    <div>
      {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((it, i) => {
          const color = it.text_color || '#6366f1';
          const hasField = it.show_asunto || it.show_adelanto;
          const hasText  = it.texto?.trim();
          const fieldEl = hasField ? (
            <div style={{
              background: 'var(--t-surface2)',
              border: '1px solid var(--t-border)',
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              {it.show_asunto && item?.asunto && (
                <>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asunto</span>
                  <span style={{ fontSize: 24, color: 'var(--t-text)', lineHeight: 1.3 }}>{item.asunto}</span>
                </>
              )}
              {it.show_adelanto && item?.adelanto && (
                <>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Adelanto</span>
                  <span style={{ fontSize: 24, color: 'var(--t-text)', lineHeight: 1.3 }}>{item.adelanto}</span>
                </>
              )}
            </div>
          ) : null;
          const txtEl = hasText ? (
            <div style={{ background: color + '18', border: `1px solid ${color}44`, borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: color, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', textAlign: it.text_align || 'left' }}>{it.texto}</p>
            </div>
          ) : null;
          const first  = fieldFirst ? fieldEl : txtEl;
          const second = fieldFirst ? txtEl : fieldEl;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: isHoriz && hasField && hasText ? '1fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
              {first}
              {second}
            </div>
          );
        })}
      </div>
    </div>
  );
}
