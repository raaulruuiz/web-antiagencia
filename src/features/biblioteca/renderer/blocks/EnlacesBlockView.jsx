import DOMPurify from 'dompurify';
import { SocialIcon } from '../shared/SocialIcon';
import { PreviewImg } from '../shared/PreviewImg';
import { BlockHeader } from '../shared/BlockHeader';

export function EnlacesBlockView({ block, onPreview, hideTitle }) {
  // Support both new structure (links[]) and legacy (url + images)
  const links = block.links?.length
    ? block.links
    : (block.url ? [{ images: block.images || [], url: block.url }] : []);
  if (!links.length && !block.titulo && !block.subtitulo) return null;
  if (!links.length) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  const layout = block.links_layout || 'columna';
  const isGrid = layout === 'grid';
  const isFila = layout === 'fila';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {!hideTitle && block.titulo && <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 4px' }}>{block.titulo}</h2>}
      {!hideTitle && block.subtitulo && <p style={{ fontSize: 13, color: 'var(--t-text-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{block.subtitulo}</p>}
      <div style={
        isFila
          ? { display: 'flex', flexDirection: 'row', gap: 12, overflowX: 'auto', overflowY: 'hidden', alignItems: 'center' }
          : isGrid
          ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }
          : { display: 'flex', flexDirection: 'column', gap: 12 }
      }>
        {links.map((link, i) => (
          isGrid ? (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              {(link.images || []).map((img, j) => (
                img.isSocial ? (
                  <a key={j} href={link.url || undefined} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', aspectRatio: '1', borderRadius: 9, background: 'var(--t-surface2)', border: '1px solid var(--t-border)', textDecoration: 'none' }}>
                    <SocialIcon network={img.network} color={img.color} size={40} />
                  </a>
                ) : (
                  <PreviewImg key={j} src={img.url} href={link.url} onPreview={onPreview}
                    wrapperStyle={{ borderRadius: 9 }}
                    imgStyle={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 9, border: '1px solid var(--t-border)', display: 'block' }} />
                )
              ))}
              {(link.htmls?.length || link.html) &&
                (link.htmls?.length ? link.htmls : [link.html]).map((h, hi) => (
                  <a key={hi} href={link.url || undefined} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(h) }} />
                  </a>
                ))
              }
              {link.url && (
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: '#3b82f6', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  {link.url}
                </a>
              )}
            </div>
          ) : (
            isFila ? (
              /* Fila: imágenes en horizontal */
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, overflow: 'hidden', borderRadius: 8 }}>
                {(link.images || []).map((img, j) => (
                  img.isSocial ? (
                    <a key={j} href={link.url || undefined} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 9, background: 'var(--t-surface2)', border: '1px solid var(--t-border)', textDecoration: 'none', flexShrink: 0 }}>
                      <SocialIcon network={img.network} color={img.color} size={36} />
                    </a>
                  ) : (
                    <PreviewImg key={j} src={img.url} href={link.url} onPreview={onPreview}
                      wrapperStyle={{ borderRadius: 9, flexShrink: 0 }}
                      imgStyle={{ height: 160, width: 'auto', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)', display: 'block' }} />
                  )
                ))}
                {(link.htmls?.length || link.html) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, alignItems: 'center' }}>
                    {(link.htmls?.length ? link.htmls : [link.html]).map((h, hi) => (
                      <a key={hi} href={link.url || undefined} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(h) }} />
                      </a>
                    ))}
                  </div>
                )}
                {link.url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, maxWidth: 320 }}>
                    <span style={{ fontSize: 26, color: '#3b82f6', fontWeight: 300, flexShrink: 0 }}>→</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                      {link.url}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* Columna: imágenes apiladas, url debajo */
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(link.images || []).map((img, j) => (
                  img.isSocial ? (
                    <a key={j} href={link.url || undefined} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 9, background: 'var(--t-surface2)', border: '1px solid var(--t-border)', textDecoration: 'none', flexShrink: 0 }}>
                      <SocialIcon network={img.network} color={img.color} size={36} />
                    </a>
                  ) : (
                    <PreviewImg key={j} src={img.url} href={link.url} onPreview={onPreview}
                      wrapperStyle={{ borderRadius: 9, flexShrink: 0 }}
                      imgStyle={{ height: 160, width: 'auto', borderRadius: 9, objectFit: 'cover', border: '1px solid var(--t-border)', display: 'block' }} />
                  )
                ))}
                {(link.htmls?.length || link.html) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(link.htmls?.length ? link.htmls : [link.html]).map((h, hi) => (
                      <a key={hi} href={link.url || undefined} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(h) }} />
                      </a>
                    ))}
                  </div>
                )}
                {link.url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 26, color: '#3b82f6', fontWeight: 300, flexShrink: 0 }}>→</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none', wordBreak: 'break-all' }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                      {link.url}
                    </a>
                  </div>
                )}
              </div>
            )
          )
        ))}
      </div>
    </div>
  );
}
