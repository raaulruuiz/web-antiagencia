import { useTheme } from '@/lib/ThemeContext';
import EmailIframe from '@/components/EmailIframe';
import { BlockHeader } from '../shared/BlockHeader';
import { renderEBBlock } from './renderEBBlock';

export function CorreccionBlockView({ block, onPreview, hideTitle }) {
  const { theme } = useTheme();
  const outerBg = theme === 'dark' ? '#1e1e1e' : '#e0e0e0';

  // EDITAR EMAIL mode: block has a saved edited HTML version
  if (block.email_html_edited) {
    if (!block.titulo && !block.subtitulo && !block.email_html_edited) return null;
    return (
      <div>
        {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
        <div style={{ background: outerBg, borderRadius: 12, padding: '20px', display: 'flex', justifyContent: 'center' }}>
          <EmailIframe html_body={block.email_html_edited} withLinks={true} />
        </div>
      </div>
    );
  }

  // NUEVO EMAIL mode: render from email_blocks
  const emailBlocks = block.email_blocks || [];
  if (!emailBlocks.length && !block.titulo && !block.subtitulo) return null;
  if (!emailBlocks.length) return hideTitle ? null : <div><BlockHeader title={block.titulo} subtitle={block.subtitulo} /></div>;
  const emailBg = block.email_bg || '#ffffff';

  return (
    <div>
      {!hideTitle && <BlockHeader title={block.titulo} subtitle={block.subtitulo} />}
      <div style={{ background: outerBg, borderRadius: 12, padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: emailBg, borderRadius: 8, padding: '20px 24px', width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {emailBlocks.map((eb, i) => renderEBBlock(eb, i, false, onPreview))}
        </div>
      </div>
    </div>
  );
}
