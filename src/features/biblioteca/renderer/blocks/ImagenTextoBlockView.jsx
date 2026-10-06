import { PreviewImg, isRetinaCrop } from '../shared/PreviewImg';
import { BlockHeader } from '../shared/BlockHeader';

export function ImagenTextoBlockView({ block, onPreview, hideTitle, isMobile }) {
  const items = block.items || [];
  if (!items.length && !block.titulo && !block.subtitulo) return null;
  if (!items.length) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  const layout   = block.it_layout || 'img-text';
  const isHoriz  = !isMobile && (layout === 'img-text' || layout === 'text-img');
  const imgFirst = layout === 'img-text' || layout === 'img-top';

  return (
    <div>
      {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((it, i) => {
          const color = it.text_color || '#6366f1';
          const hasImage = it.image?.url;
          const hasText  = it.texto?.trim();
          // 2× email crops keep their email scale (1 CSS px → 1 CSS px) and only shrink when the
          // column is narrower; other images keep filling the column as before.
          const crop = hasImage && isRetinaCrop(it.image.url);
          const imgEl = hasImage ? (
            <PreviewImg src={it.image.url} onPreview={onPreview}
              wrapperStyle={crop ? { borderRadius: 10, width: 'fit-content', maxWidth: '100%' } : { borderRadius: 10 }}
              imgStyle={crop ? { width: 'auto', maxWidth: '100%', borderRadius: 10, display: 'block' } : { width: '100%', borderRadius: 10, display: 'block' }} />
          ) : null;
          const txtEl = hasText ? (
            <div style={{ background: color + '18', border: `1px solid ${color}44`, borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: color, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', textAlign: it.text_align || 'left' }}>{it.texto}</p>
            </div>
          ) : null;
          const first  = imgFirst ? imgEl : txtEl;
          const second = imgFirst ? txtEl : imgEl;
          const sideBySide = isHoriz && hasImage && hasText;
          // Side by side, a crop's column takes the crop's own width (if it fits) and the text keeps
          // the rest, never less than 200px.
          const cropCols = imgFirst ? 'minmax(0, max-content) minmax(200px, 1fr)' : 'minmax(200px, 1fr) minmax(0, max-content)';
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: sideBySide ? (crop ? cropCols : '1fr 1fr') : '1fr', gap: 16, alignItems: 'start' }}>
              {first}
              {second}
            </div>
          );
        })}
      </div>
    </div>
  );
}
