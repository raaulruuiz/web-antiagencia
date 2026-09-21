import { EnlacesBlockView } from './blocks/EnlacesBlockView';
import { ImagenBlockView } from './blocks/ImagenBlockView';
import { ImagenTextoBlockView } from './blocks/ImagenTextoBlockView';
import { CorreccionBlockView } from './blocks/CorreccionBlockView';
import { AudioBlockView } from './blocks/AudioBlockView';
import { AsuntoAdelantoBlockView } from './blocks/AsuntoAdelantoBlockView';
import { TranscribirBlockView } from './blocks/TranscribirBlockView';
import { ColumnasBlockView } from './blocks/ColumnasBlockView';
import { PuntuacionBlockView } from './blocks/PuntuacionBlockView';
import { SocialBlockView } from './blocks/SocialBlockView';

// Dispatcher visual único por block.type — usado por admin (BibliotecaItem.jsx) y
// público (BibliotecaItemPublica.jsx). Es la única fuente de verdad del render final
// de cada bloque (Fase Biblioteca Hito 1).
//
// wrap=true (por defecto, público): aplica el contenedor con borde/fondo/padding completo.
// wrap=false (admin): BlockCard ya aporta su propio contenedor — solo se aplica un
// padding equivalente, sin duplicar borde/fondo.
export function BlockRenderer({ block, onPreview, theme, isMobile, item, isPro, wrap = true }) {
  const wrapStyle = wrap
    ? { border: `1px solid ${theme === 'light' ? '#d4d4d8' : '#27272a'}`, borderRadius: 12, padding: '20px 24px', background: 'var(--t-surface3)' }
    : { padding: '14px' };

  // Determine visibility: explicit false = hidden; undefined defaults: correccion+audio=hidden, others=visible
  const isVisible = block.visible !== undefined
    ? block.visible !== false
    : block.type !== 'correccion' && block.type !== 'audio';

  // Puntuacion is always public
  if (block.type === 'puntuacion') return <div style={wrapStyle}><PuntuacionBlockView block={block} /></div>;

  if (!isVisible && !isPro) {
    // Render title + blurred content
    const title = block.titulo;
    const subtitle = block.subtitulo;
    let content;
    switch (block.type) {
      case 'enlaces':          content = <EnlacesBlockView block={block} onPreview={() => {}} hideTitle />; break;
      case 'imagen':           content = <ImagenBlockView block={block} onPreview={() => {}} hideTitle />; break;
      case 'imagen_texto':     content = <ImagenTextoBlockView block={block} onPreview={() => {}} hideTitle isMobile={isMobile} />; break;
      case 'correccion':       content = <CorreccionBlockView block={block} onPreview={() => {}} hideTitle />; break;
      case 'audio':            content = <AudioBlockView block={block} hideTitle />; break;
      case 'asunto_adelanto':  content = <AsuntoAdelantoBlockView block={block} item={item} hideTitle isMobile={isMobile} />; break;
      case 'transcribir':      content = <TranscribirBlockView block={block} hideTitle />; break;
      default: content = null;
    }
    return (
      <div style={wrapStyle}>
        {title && <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-text)', margin: '0 0 12px' }}>{title}</h2>}
        <div style={{ position: 'relative' }}>
          <div style={{ filter: 'blur(8px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.7 }}>
            {content}
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Contenido exclusivo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  switch (block.type) {
    case 'enlaces':         return <div style={wrapStyle}><EnlacesBlockView block={block} onPreview={onPreview} /></div>;
    case 'imagen':          return <div style={wrapStyle}><ImagenBlockView block={block} onPreview={onPreview} /></div>;
    case 'imagen_texto':    return <div style={wrapStyle}><ImagenTextoBlockView block={block} onPreview={onPreview} isMobile={isMobile} /></div>;
    case 'correccion':      return <div style={wrapStyle}><CorreccionBlockView block={block} onPreview={onPreview} /></div>;
    case 'audio':           return <div style={wrapStyle}><AudioBlockView block={block} /></div>;
    case 'asunto_adelanto': return <div style={wrapStyle}><AsuntoAdelantoBlockView block={block} item={item} isMobile={isMobile} /></div>;
    case 'transcribir':     return <div style={wrapStyle}><TranscribirBlockView block={block} /></div>;
    case 'columnas':        return <div style={wrapStyle}><ColumnasBlockView block={block} onPreview={onPreview} theme={theme} isMobile={isMobile} item={item} /></div>;
    case 'puntuacion':      return <div style={wrapStyle}><PuntuacionBlockView block={block} /></div>;
    case 'social':          return <div style={wrapStyle}><SocialBlockView block={block} /></div>;
    default: return null;
  }
}
