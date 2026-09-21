import { useState } from 'react';
import { IconEye, IconDownload } from './icons';

export function PreviewImg({ src, imgStyle, wrapperStyle, onPreview, href }) {
  const [hov, setHov] = useState(false);
  const mobile = window.innerWidth < 640;
  const imgEl = <img src={src} alt="" loading="lazy" style={{ display: 'block', ...imgStyle }} />;
  return (
    <div style={{ position: 'relative', ...wrapperStyle }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>{imgEl}</a>
        : imgEl}
      {(hov || mobile) && (
        <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); onPreview(src); }}
            style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11, fontWeight: 500, backdropFilter: 'blur(4px)' }}>
            <IconEye /> Ver
          </button>
          <a href={src} download target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 6, padding: '4px 7px', display: 'flex', alignItems: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', textDecoration: 'none' }}
            title="Descargar imagen">
            <IconDownload />
          </a>
        </div>
      )}
    </div>
  );
}
