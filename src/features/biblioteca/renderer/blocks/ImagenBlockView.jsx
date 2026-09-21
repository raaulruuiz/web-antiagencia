import { PreviewImg } from '../shared/PreviewImg';
import { BlockHeader } from '../shared/BlockHeader';

export function ImagenBlockView({ block, onPreview, hideTitle }) {
  const images = block.images || [];
  if (!images.length && !block.titulo && !block.subtitulo) return null;
  if (!images.length) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  const layout = block.images_layout;

  if (layout === 'fila') {
    return (
      <div>
        {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, overflowX: 'auto' }}>
          {images.map((img, i) => (
            <PreviewImg key={i} src={img.url || img} onPreview={onPreview}
              wrapperStyle={{ borderRadius: 9, flexShrink: 0 }}
              imgStyle={{ height: 180, width: 'auto', borderRadius: 9, objectFit: 'contain', border: '1px solid var(--t-border)', display: 'block' }} />
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div>
        {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {images.map((img, i) => (
            <PreviewImg key={i} src={img.url || img} onPreview={onPreview}
              wrapperStyle={{ borderRadius: 9 }}
              imgStyle={{ width: '100%', aspectRatio: '1', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)', display: 'block' }} />
          ))}
        </div>
      </div>
    );
  }

  // Default: columna
  return (
    <div>
      {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {images.map((img, i) => (
          <PreviewImg key={i} src={img.url || img} onPreview={onPreview}
            wrapperStyle={{ borderRadius: 9 }}
            imgStyle={{ width: '100%', height: 'auto', maxHeight: 320, borderRadius: 9, objectFit: 'contain', border: '1px solid var(--t-border)', display: 'block' }} />
        ))}
      </div>
    </div>
  );
}
