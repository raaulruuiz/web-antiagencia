import { PreviewImg } from '../shared/PreviewImg';

export function renderEBBlock(eb, i, colMode, onPreview) {
  return (
    <div key={i}>
      {eb.type === 'text' && eb.content && (() => {
        const p = <p style={{ margin: 0, fontSize: eb.size || 14, fontWeight: eb.bold ? 700 : 400, textAlign: eb.align || 'left', color: '#1a1a1a', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{eb.content}</p>;
        return eb.href ? <a href={eb.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{p}</a> : p;
      })()}
      {eb.type === 'image' && eb.url && (
        <div style={{ textAlign: 'center' }}>
          <PreviewImg src={eb.url} onPreview={onPreview}
            wrapperStyle={{ display: 'inline-block', borderRadius: 6 }}
            imgStyle={{ display: 'block', maxWidth: '100%', maxHeight: colMode ? 120 : 200, objectFit: 'contain', borderRadius: 6, margin: '0 auto' }} />
        </div>
      )}
      {eb.type === 'button' && eb.text && (
        <div style={{ textAlign: 'center' }}>
          <a href={eb.href || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#6366f1', color: 'white', borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{eb.text}</a>
        </div>
      )}
      {eb.type === 'columns' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{(eb.left || []).map((sub, j) => renderEBBlock(sub, j, true, onPreview))}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{(eb.right || []).map((sub, j) => renderEBBlock(sub, j, true, onPreview))}</div>
        </div>
      )}
    </div>
  );
}
