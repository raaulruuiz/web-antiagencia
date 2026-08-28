import { useRef } from 'react';

const EMAIL_BASE_RULES = [
  // margin:0 removes the browser default 8px body margin; padding is NOT overridden so
  // email-designer-specified body padding (e.g. side gutters in Wendy / Salvi) is preserved.
  'body { margin: 0 !important; word-break: normal !important; overflow-wrap: normal !important; }',
  // Override email templates that set word-break: break-word on td/p/div (more specific than body)
  'td, th, p, div, span { word-break: normal !important; overflow-wrap: normal !important; }',
  // Prevent horizontal scrollbar when email content is slightly wider than iframe
  'html, body { overflow-x: hidden !important; }',
  // Reset browser-default paragraph margins — Gmail does this too; without it, <p> elements
  // between image sections create visible gaps that don't exist in the Gmail reading pane.
  'p { margin: 0; }',
  'img { display: block; border: 0; outline: none; text-decoration: none; max-width: 100%; }',
  // Shopify Email / MJML "round" image class — Gmail strips the stylesheet so border-radius is lost
  'img[class*="image--round"], [class*="image--round"] img { border-radius: 8px !important; }',
  'table { border-collapse: collapse !important; }',
  'img.an1 { display: inline; width: 1em; height: 1em; vertical-align: -0.1em; max-width: none; }',
  // Gmail injects download-button overlays (div.a6S) on top of images with opacity:0.01 and
  // absolute positioning. Without Gmail's own CSS, these render as block elements in the normal
  // flow and create large invisible gaps between image sections.
  'div.a6S { display: none !important; }',
];

// Desktop-only rules: restore Sales Manago/Beefree DnD column layout.
// In mobile mode these are NOT injected — the email's own @media queries handle layout.
// Without these rules in desktop mode, all DnD columns collapse to display:block.
const DND_DESKTOP_RULES = [
  '[class*="dnd-display-table"] { display: table !important; width: 100% !important; }',
  '[class*="dnd-display-table-row"] { display: table-row !important; }',
  '[class*="dnd-display-table-cell"] { display: table-cell !important; vertical-align: top !important; box-sizing: border-box !important; }',
  '[class*="dnd-width-100-percent"] { width: 100% !important; }',
  '[class*="dnd-width-50-percent"] { width: 50% !important; }',
  '[class*="dnd-width-33-33-percent"] { width: 33.33% !important; }',
  '[class*="dnd-width-25-percent"] { width: 25% !important; }',
  '[class*="dnd-hide-desktop"] { display: none !important; }',
  // Klaviyo uses "mobile-only" class suffix for elements that should be hidden on desktop
  '[class*="mobile-only"] { display: none !important; }',
];

// Mobile-only rules injected in mobile preview mode.
// Gmail strips <style> blocks from captured HTML, leaving only inline styles.
// Klaviyo mobile-only elements have style="display:none" inline with no media query
// to override them in an iframe. We force-show them explicitly.
// table-specific rule must come AFTER the generic one so specificity wins.
const DND_MOBILE_RULES = [
  '[class*="dnd-hide-mobile"] { display: none !important; }',
  // Gmail strips <style> blocks, so Klaviyo responsive classes have no media query to toggle them.
  // Force-hide desktop-only and force-show mobile-only explicitly.
  '[class*="desktop-only"] { display: none !important; }',
  '[class*="mobile-only"] { display: block !important; max-height: none !important; overflow: visible !important; }',
  'table[class*="mobile-only"] { display: table !important; }',
];

const EMAIL_WIDTH = 600; // standard email content width in px
const IFRAME_VIEWPORT = 601;
const MOBILE_VIEWPORT = 375;

// Strips @media (max-width: ...) blocks from a CSS string.
// Email templates use these to collapse multi-column desktop layouts into single-column mobile
// layouts. Desktop email clients (Outlook, Apple Mail, Gmail desktop) ignore or strip these.
// We do the same so emails always render in their intended desktop layout.
function stripMaxWidthMediaQueries(css) {
  let result = '';
  let i = 0;
  while (i < css.length) {
    const mediaIdx = css.indexOf('@media', i);
    if (mediaIdx === -1) { result += css.slice(i); break; }

    const braceIdx = css.indexOf('{', mediaIdx);
    if (braceIdx === -1) { result += css.slice(i); break; }

    const query = css.slice(mediaIdx, braceIdx);
    if (/max-width/i.test(query)) {
      // This is a mobile/responsive breakpoint — skip the entire block
      result += css.slice(i, mediaIdx);
      let depth = 0;
      let j = braceIdx;
      while (j < css.length) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') { depth--; if (depth === 0) { j++; break; } }
        j++;
      }
      i = j;
    } else {
      // Not a max-width query — keep it
      result += css.slice(i, braceIdx + 1);
      i = braceIdx + 1;
    }
  }
  return result;
}

// Removes mobile responsive @media blocks from all <style> tags in the email HTML.
function stripEmailResponsiveStyles(html) {
  return html.replace(
    /<style([^>]*)>([\s\S]*?)<\/style>/gi,
    (_, attrs, css) => `<style${attrs}>${stripMaxWidthMediaQueries(css)}</style>`
  );
}

function buildEmailIframeHtml(html_body, gmail_styles, mobileMode = false) {
  const rules = [
    ...EMAIL_BASE_RULES,
    ...(mobileMode ? DND_MOBILE_RULES : DND_DESKTOP_RULES),
  ];
  if (gmail_styles) {
    const { fontSize, fontFamily, lineHeight, color } = gmail_styles;
    const parts = [];
    if (fontSize) parts.push(`font-size: ${fontSize}`);
    if (fontFamily) parts.push(`font-family: ${fontFamily}`);
    if (lineHeight && lineHeight !== 'normal') parts.push(`line-height: ${lineHeight}`);
    if (color) parts.push(`color: ${color}`);
    if (parts.length) rules.push(`body { ${parts.join('; ')}; }`);
  } else {
    rules.push('body { font-size: small; font-family: Arial, Helvetica, sans-serif; }');
  }
  const style = `<style>\n${rules.join('\n')}\n</style>`;
  if (!html_body) return style;

  // Desktop: strip mobile media queries so columns render correctly.
  // Mobile: keep them so the email collapses to its intended mobile layout.
  const body = mobileMode ? html_body : stripEmailResponsiveStyles(html_body);

  const headClose = body.indexOf('</head>');
  if (headClose !== -1) return body.slice(0, headClose) + style + body.slice(headClose);
  return style + body;
}

export default function EmailIframe({ html_body, gmail_styles, style, withLinks = false, mobileMode = false }) {
  const containerRef = useRef(null);
  const iframeHtml = buildEmailIframeHtml(html_body, gmail_styles, mobileMode);
  const viewport = mobileMode ? MOBILE_VIEWPORT : IFRAME_VIEWPORT;

  if (!withLinks) {
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
        <iframe
          srcDoc={iframeHtml}
          sandbox="allow-same-origin"
          onLoad={(e) => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.offsetWidth;
            const scale = containerWidth / viewport;
            e.target.style.transform = `scale(${scale})`;
          }}
          style={{
            width: `${viewport}px`,
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

  // withLinks=true: wrap in a div sized to viewport so parent containers don't add gaps
  return (
    <div style={{ width: viewport, overflow: 'hidden' }}>
      <iframe
        srcDoc={iframeHtml}
        sandbox="allow-same-origin allow-popups allow-top-navigation-by-user-activation"
        onLoad={(e) => {
          const h = e.target.contentDocument?.body?.scrollHeight;
          if (h) e.target.style.height = h + 'px';
        }}
        style={{ width: `${viewport}px`, height: '100%', border: 'none', display: 'block', ...style }}
      />
    </div>
  );
}
