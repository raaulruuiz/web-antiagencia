const EMAIL_BASE_RULES = [
  'body { margin: 0 !important; padding: 0 !important; }',
  'img { display: block; border: 0; outline: none; text-decoration: none; max-width: 100%; }',
  'table { border-collapse: collapse !important; }',
  'img.an1 { display: inline; width: 1em; height: 1em; vertical-align: -0.1em; max-width: none; }',
];

function buildEmailIframeHtml(html_body, gmail_styles) {
  const rules = [...EMAIL_BASE_RULES];
  if (gmail_styles) {
    const { fontSize, fontFamily, lineHeight, color, wordBreak, overflowWrap } = gmail_styles;
    const parts = [];
    if (fontSize) parts.push(`font-size: ${fontSize}`);
    if (fontFamily) parts.push(`font-family: ${fontFamily}`);
    if (lineHeight && lineHeight !== 'normal') parts.push(`line-height: ${lineHeight}`);
    if (color) parts.push(`color: ${color}`);
    if (wordBreak && wordBreak !== 'normal') parts.push(`word-break: ${wordBreak}`);
    if (overflowWrap && overflowWrap !== 'normal') parts.push(`overflow-wrap: ${overflowWrap}`);
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
  const iframeHtml = buildEmailIframeHtml(html_body, gmail_styles);
  const sandbox = withLinks
    ? 'allow-same-origin allow-popups allow-top-navigation-by-user-activation'
    : 'allow-same-origin';

  function handleLoad(e) {
    if (!withLinks) return;
    const h = e.target.contentDocument?.body?.scrollHeight;
    if (h) e.target.style.height = h + 'px';
  }

  return (
    <iframe
      srcDoc={iframeHtml}
      sandbox={sandbox}
      onLoad={handleLoad}
      style={{ width: '100%', height: '100%', border: 'none', display: 'block', ...style }}
    />
  );
}
