import { useRef } from 'react';

const EMAIL_BASE_RULES = [
  // margin:0 removes the browser default 8px body margin; padding is NOT overridden so
  // email-designer-specified body padding (e.g. side gutters in Wendy / Salvi) is preserved.
  'body { margin: 0 !important; word-break: normal !important; overflow-wrap: normal !important; }',
  // Override email templates that set word-break: break-word on td/p/div (more specific than body)
  'td, th, p, div, span { word-break: normal !important; overflow-wrap: normal !important; }',
  // Prevent horizontal scrollbar when email content is slightly wider than iframe
  'html, body { overflow-x: hidden !important; }',
  'img { display: block; border: 0; outline: none; text-decoration: none; max-width: 100%; }',
  'table { border-collapse: collapse !important; }',
  'img.an1 { display: inline; width: 1em; height: 1em; vertical-align: -0.1em; max-width: none; }',
];

const EMAIL_WIDTH = 600; // standard email width in px

function buildEmailIframeHtml(html_body, gmail_styles) {
  const rules = [...EMAIL_BASE_RULES];
  if (gmail_styles) {
    const { fontSize, fontFamily, lineHeight, color, wordBreak, overflowWrap } = gmail_styles;
    const parts = [];
    if (fontSize) parts.push(`font-size: ${fontSize}`);
    if (fontFamily) parts.push(`font-family: ${fontFamily}`);
    if (lineHeight && lineHeight !== 'normal') parts.push(`line-height: ${lineHeight}`);
    if (color) parts.push(`color: ${color}`);
    // word-break y overflow-wrap no se heredan: Gmail los tiene en break-word
    // y aplicarlos al body del email rompe palabras a mitad en columnas estrechas
    if (parts.length) rules.push(`body { ${parts.join('; ')}; }`);
  } else {
    rules.push('body { font-size: small; font-family: Arial, Helvetica, sans-serif; }');
  }
  const style = `<style>\n${rules.join('\n')}\n</style>`;
  if (!html_body) return style;
  const headClose = html_body.indexOf('</head>');
  if (headClose !== -1) return html_body.slice(0, headClose) + style + html_body.slice(headClose);
  return style + html_body;
}

export default function EmailIframe({ html_body, gmail_styles, style, withLinks = false }) {
  const containerRef = useRef(null);
  const iframeHtml = buildEmailIframeHtml(html_body, gmail_styles);

  if (!withLinks) {
    // Thumbnail mode: render at full email width (600px) and scale down proportionally
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
        <iframe
          srcDoc={iframeHtml}
          sandbox="allow-same-origin"
          onLoad={(e) => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.offsetWidth;
            const scale = containerWidth / EMAIL_WIDTH;
            e.target.style.transform = `scale(${scale})`;
          }}
          style={{
            width: `${EMAIL_WIDTH}px`,
            height: '3000px',
            border: 'none',
            display: 'block',
            pointerEvents: 'none',
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </div>
    );
  }

  return (
    <iframe
      srcDoc={iframeHtml}
      sandbox="allow-same-origin allow-popups allow-top-navigation-by-user-activation"
      onLoad={(e) => {
        const h = e.target.contentDocument?.body?.scrollHeight;
        if (h) e.target.style.height = h + 'px';
      }}
      style={{ width: '100%', height: '100%', border: 'none', display: 'block', ...style }}
    />
  );
}
