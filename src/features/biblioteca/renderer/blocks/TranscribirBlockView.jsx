import { BlockHeader } from '../shared/BlockHeader';

export function TranscribirBlockView({ block, hideTitle }) {
  if (!block.texto && !block.titulo && !block.subtitulo) return null;
  if (!block.texto) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {!hideTitle && block.titulo && <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 4px' }}>{block.titulo}</h2>}
      {!hideTitle && block.subtitulo && <p style={{ fontSize: 13, color: 'var(--t-text-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{block.subtitulo}</p>}
      <div style={{ background: (block.text_color || '#06b6d4') + '18', border: `1px solid ${(block.text_color || '#06b6d4')}44`, borderRadius: 10, padding: '14px 16px' }}>
        <p style={{ fontSize: 13, color: block.text_color || '#06b6d4', margin: 0, lineHeight: 1.6, textAlign: block.text_align || 'left', whiteSpace: 'pre-wrap' }}>
          {block.texto}
        </p>
      </div>
    </div>
  );
}
