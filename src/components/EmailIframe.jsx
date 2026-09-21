import { useRef, useEffect } from 'react';

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
  // Link color fix: Gmail rewrites <style> selectors with its own scope (.gmail-compose-body a …)
  // which don't match inside our iframe. Without those rules the browser falls back to its default
  // "a { color: blue }". Setting color:inherit makes links take the surrounding text color instead.
  // Inline styles (style="color:#xxx") still win because they have higher specificity.
  'a { color: inherit; }',
  // Social icon fix: Gmail strips <style> blocks, so <a> links wrapping images lose their
  // class-based "display:inline-block" and fall back to "display:inline". Our "img{display:block}"
  // rule then forces each <a>+img pair onto its own line (block inside inline = implicit block).
  // Restoring inline-block on those <a> elements keeps social icon rows horizontal.
  'a:has(> img) { display: inline-block; }',
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
  const resizeObserverRef = useRef(null);
  const fallbackTimersRef = useRef([]);
  const rafRef = useRef(null);
  const lastHeightRef = useRef(0);
  const lastWidthScaleRef = useRef(1);
  const iframeHtml = buildEmailIframeHtml(html_body, gmail_styles, mobileMode);
  // Always render at 601px — email content is designed for this width and would clip at 375px.
  // mobileMode only affects the injected CSS (mobile-only/desktop-only visibility, no media query strip).

  // Drops whatever autosize machinery (observer/timers/pending frame) is currently live —
  // called both when a new document loads into the same iframe and on unmount, so we never
  // keep observing/measuring a document that's gone.
  function cleanupAutosize() {
    if (resizeObserverRef.current) { resizeObserverRef.current.disconnect(); resizeObserverRef.current = null; }
    fallbackTimersRef.current.forEach(clearTimeout);
    fallbackTimersRef.current = [];
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }
  useEffect(() => cleanupAutosize, []);

  if (!withLinks) {
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
        <iframe
          srcDoc={iframeHtml}
          sandbox="allow-same-origin"
          onLoad={(e) => {
            if (!containerRef.current) return;
            const iframeEl = e.target;
            // Same principle as the withLinks branch: a fixed 601px iframe width clips
            // anything wider than that (via overflow-x:hidden inside the doc) before this
            // scale runs. Detect the content's real width and widen the iframe to match
            // before scaling, so the thumbnail shrinks a complete render instead of an
            // already-clipped one.
            const doc = iframeEl.contentDocument;
            let naturalWidth = IFRAME_VIEWPORT;
            if (doc) {
              const w = Math.max(doc.body?.scrollWidth || 0, doc.documentElement?.scrollWidth || 0);
              if (w > IFRAME_VIEWPORT) naturalWidth = w;
            }
            if (naturalWidth !== IFRAME_VIEWPORT) iframeEl.style.width = `${naturalWidth}px`;
            const containerWidth = containerRef.current.offsetWidth;
            const scale = containerWidth / naturalWidth;
            iframeEl.style.transform = `scale(${scale})`;
          }}
          style={{
            width: `${IFRAME_VIEWPORT}px`,
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

  // withLinks=true: wrap in a div sized to viewport so parent containers don't add gaps.
  // In mobile mode we keep the iframe at IFRAME_VIEWPORT (601px) so fixed-width email tables
  // render correctly, then scale the iframe down visually to MOBILE_VIEWPORT using transform.
  // This is the same technique used by Litmus / Email on Acid for mobile previews.
  const scale = mobileMode ? MOBILE_VIEWPORT / IFRAME_VIEWPORT : 1;

  // Applies the measured height, accounting for any visual scale currently in effect
  // (fixed mobile scale, or the dynamic desktop width-scale from applyWidthScale) so the
  // parent div's box matches what's actually rendered instead of leaving dead space.
  function applyHeight(iframeEl, h, extraScale) {
    if (!h || h === lastHeightRef.current) return;
    lastHeightRef.current = h;
    iframeEl.style.height = h + 'px';
    if (iframeEl.parentElement) {
      const effectiveScale = mobileMode ? scale : (extraScale || 1);
      iframeEl.parentElement.style.height = (mobileMode || effectiveScale < 1) ? Math.ceil(h * effectiveScale) + 'px' : '';
    }
  }

  // Desktop-only: a handful of captured emails use a fixed-px master table wider than
  // IFRAME_VIEWPORT (e.g. 636px) meant to be shrunk by a responsive class on small screens —
  // but Gmail strips <style> tags on capture, so that class has no rule left and the desktop
  // width applies unconditionally. Without this, overflow-x:hidden on body just clips the
  // excess (content runs off the right edge) instead of scaling it down. Emails that already
  // fit (the vast majority — fluid width:100% tables, or designed for ~600px) are untouched:
  // widthScale stays 1 and nothing changes for them.
  function applyWidthScale(iframeEl, ws) {
    if (mobileMode) return; // mobile already has its own fixed scale via CSS transform in JSX
    if (ws === lastWidthScaleRef.current) return;
    lastWidthScaleRef.current = ws;
    iframeEl.style.transform = ws < 1 ? `scale(${ws})` : '';
  }

  function measure(iframeEl) {
    const doc = iframeEl.contentDocument;
    if (!doc) return;
    const body = doc.body, docEl = doc.documentElement;
    let widthScale = 1;
    if (!mobileMode) {
      const w = Math.max(body?.scrollWidth || 0, docEl?.scrollWidth || 0);
      if (w > IFRAME_VIEWPORT) widthScale = IFRAME_VIEWPORT / w;
      // Give the iframe its real (unclipped) width when content overflows 601px.
      // `overflow-x:hidden` (EMAIL_BASE_RULES) clips anything past the iframe's OWN
      // viewport before any outer transform runs — a fixed-width iframe would discard
      // those pixels permanently, and scale() can't recover content that was never
      // painted. Widening first, then scaling the whole (now-complete) box back down,
      // is the only way to shrink it visually without losing the overflow.
      const targetWidth = widthScale < 1 ? w : IFRAME_VIEWPORT;
      if (iframeEl.style.width !== `${targetWidth}px`) iframeEl.style.width = `${targetWidth}px`;
    }
    applyWidthScale(iframeEl, widthScale);
    // Height measured AFTER the width above, so a fixed-width table that only renders
    // in full at its natural width reports its true (post-widen) height.
    const h = Math.max(body?.scrollHeight || 0, body?.offsetHeight || 0, docEl?.scrollHeight || 0, docEl?.offsetHeight || 0);
    applyHeight(iframeEl, h, widthScale);
  }

  // Coalesces bursts of ResizeObserver callbacks (e.g. several images finishing at once)
  // into a single measurement per frame — avoids a resize→measure→resize loop.
  function scheduleMeasure(iframeEl) {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => { rafRef.current = null; measure(iframeEl); });
  }

  function handleLoad(e) {
    cleanupAutosize(); // a fresh document just loaded — drop any observer/timers from the previous one
    lastHeightRef.current = 0;
    lastWidthScaleRef.current = 1;
    const iframeEl = e.target;
    if (!mobileMode) {
      // Reset to the baseline 601px viewport before measuring this fresh document —
      // a previously loaded (different) email may have left this same iframe node
      // widened + scaled, which would bias the overflow check below.
      iframeEl.style.width = `${IFRAME_VIEWPORT}px`;
      iframeEl.style.transform = '';
    }
    measure(iframeEl);
    const doc = iframeEl.contentDocument;
    if (!doc) return;

    if (typeof ResizeObserver !== 'undefined') {
      // Catches height changes after `load` — images/resources that finish rendering late,
      // or any other post-load layout shift — without polling.
      const ro = new ResizeObserver(() => scheduleMeasure(iframeEl));
      if (doc.body) ro.observe(doc.body);
      if (doc.documentElement) ro.observe(doc.documentElement);
      resizeObserverRef.current = ro;
    } else {
      // No ResizeObserver available: a handful of bounded re-measurements (not infinite
      // polling) as a reasonable fallback for the same late-loading-resources case.
      fallbackTimersRef.current = [150, 400, 800, 1500, 3000].map(delay => setTimeout(() => measure(iframeEl), delay));
    }

    // Fonts resolving after layout can reflow text and change height — re-measure once.
    if (doc.fonts?.ready) {
      doc.fonts.ready.then(() => scheduleMeasure(iframeEl)).catch(() => {});
    }
  }

  return (
    <div
      style={{
        width: mobileMode ? MOBILE_VIEWPORT : IFRAME_VIEWPORT,
        overflow: 'hidden',
        position: mobileMode ? 'relative' : undefined,
      }}
    >
      <iframe
        srcDoc={iframeHtml}
        sandbox="allow-same-origin allow-popups allow-top-navigation-by-user-activation"
        onLoad={handleLoad}
        style={{
          width: `${IFRAME_VIEWPORT}px`,
          height: '100%',
          border: 'none',
          display: 'block',
          transformOrigin: 'top left',
          transform: mobileMode ? `scale(${scale})` : undefined,
          ...style,
        }}
      />
    </div>
  );
}
