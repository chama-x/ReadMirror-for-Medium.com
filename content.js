(function () {
  'use strict';

  // Only operate on freedium.cfd pages that proxy Medium content
  if (location.hostname !== 'freedium.cfd' || !location.pathname.startsWith('/medium.com')) {
    return;
  }

  function isCloudflareInterstitial() {
    try {
      const cfSelectors = [
        '#challenge-running',
        'form#challenge-form',
        '.cf-browser-verification',
        '#cf-spinner-please-wait',
        '#cf-please-wait',
        '#challenge-stage',
      ];
      if (cfSelectors.some((sel) => document.querySelector(sel))) return true;
      if (/Just a moment/i.test(document.title)) return true;
    } catch (_) {
      // Ignore errors; if detection fails, treat as not Cloudflare to avoid blocking
    }
    return false;
  }

  const DEFAULTS = {
    autoUnlock: true,
    silentMode: true,
    openWhere: 'same',
    mirror: 'freedium',
    customMirrors: [],
    readerFallback: true,
    cfWait: 15,
    preset: 'medium',
    textScale: 100,
    columnWidth: 816,
    lineHeight: 158,
    headingScale: 100,
    underlineLinks: true,
    progressBar: false,
    hideBadges: true,
    headingWeight: 700,
    bodyWeight: 400,
    backgroundColor: '#ffffff',
    uiFont: 'sohne',
    bodyFont: 'source-serif-pro',
    hierarchy: ['title','subtitle','byline','body'],
    excludes: [],
  };

  function mapUiFont(token) {
    return token === 'system-sans'
      ? 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif'
      : 'sohne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif';
  }
  function mapBodyFont(token) {
    if (token === 'system-serif') return 'Georgia, Cambria, "Times New Roman", Times, serif';
    if (token === 'system-sans') return 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif';
    return 'source-serif-pro, Georgia, Cambria, "Times New Roman", Times, serif';
  }

  function applyStyling(settings) {
    const cfg = Object.assign({}, DEFAULTS, settings || {});
    const scale = Math.max(0.8, Math.min(2, cfg.textScale / 100));
    const bodySize = Math.round(20 * scale);
    const bodyLH = (cfg.lineHeight / 100).toFixed(2);
    const colWidth = Math.max(560, Math.min(1200, cfg.columnWidth));
    const underlineRule = cfg.underlineLinks ? 'underline' : 'none';
    const hscale = Math.max(0.9, Math.min(1.15, (cfg.headingScale || 100) / 100));
    const accent = cfg.accentColor || '#1a8917';
    const uiFont = mapUiFont(cfg.uiFont);
    const bodyFont = mapBodyFont(cfg.bodyFont);
    const headingW = cfg.headingWeight || 700;
    const bodyW = cfg.bodyWeight || 400;
    const bgColor = cfg.backgroundColor || '#ffffff';

    let style = document.getElementById('freedium-custom-style');
    if(!style){ style = document.createElement('style'); style.id = 'freedium-custom-style'; }
    style.textContent = `
/* Medium-like light theme – safely scoped to Freedium proxy pages */
html.freedium-tweaks { 
  color-scheme: light; 
  --fm-body-size: ${bodySize}px;
  --fm-body-lh: ${bodyLH};
  --fm-col-width: ${colWidth}px;
  --fm-underline: ${underlineRule};
  --fm-hscale: ${hscale};
  --fm-accent: ${accent};
  --fm-ui-font: ${uiFont};
  --fm-body-font: ${bodyFont};
  --fm-heading-w: ${headingW};
  --fm-body-w: ${bodyW};
  --fm-text: #242424; 
  --fm-muted: #6B6B6B; 
  --fm-border: #e6e6e6; 
  --fm-bg: ${bgColor}; 
}
html.freedium-tweaks.freedium-theme-contrast {
  --fm-text: #000000; --fm-muted:#333333; --fm-border:#d9d9d9; --fm-bg:#ffffff;
}
/* Serif preset switches body/headings to serif stack */
html.freedium-tweaks.freedium-theme-serif body { font-family: var(--fm-body-font) !important; }
html.freedium-tweaks.freedium-theme-serif h1,
html.freedium-tweaks.freedium-theme-serif h2,
html.freedium-tweaks.freedium-theme-serif h3 { font-family: var(--fm-body-font) !important; }

html.freedium-tweaks body {
  background: var(--fm-bg) !important;
  color: var(--fm-text) !important; /* Medium near-black */
  -webkit-font-smoothing: antialiased !important;
  text-rendering: optimizeLegibility !important;
  font-family: var(--fm-ui-font) !important;
  font-size: var(--fm-body-size) !important;
  line-height: var(--fm-body-lh) !important;
  padding-top: 56px !important;
}

/* Content column width (configurable) */
html.freedium-tweaks main,
html.freedium-tweaks article,
html.freedium-tweaks .content,
html.freedium-tweaks .post,
html.freedium-tweaks .container,
html.freedium-tweaks #content {
  max-width: var(--fm-col-width) !important;
  margin-left: auto !important;
  margin-right: auto !important;
  padding-left: 24px !important;
  padding-right: 24px !important;
}

/* Target Freedium's primary wrapper: <div class="w-full px-4 text-xl leading-normal ..."> */
html.freedium-tweaks div[class~="px-4"][class~="text-xl"][class~="leading-normal"] {
  max-width: var(--fm-col-width) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

/* Article body typography: serif stack (body text) */
html.freedium-tweaks article,
html.freedium-tweaks .post,
html.freedium-tweaks .story,
html.freedium-tweaks .content {
  font-family: var(--fm-body-font) !important;
  font-weight: var(--fm-body-w) !important;
}

/* Headings use a display serif on Medium; include both gt-super names */
html.freedium-tweaks h1,
html.freedium-tweaks h2,
html.freedium-tweaks h3 {
  font-family: var(--fm-ui-font) !important;
  color: var(--fm-text) !important;
  font-weight: var(--fm-heading-w) !important;
}
/* Main title */
html.freedium-tweaks h1 {
  font-size: calc(42px * var(--fm-hscale)) !important;
  line-height: calc(52px * var(--fm-hscale)) !important;
  font-weight: 700 !important;
  letter-spacing: -0.462px !important;
  margin: 24px 0 8px !important;
}
/* Secondary headings keep reasonable scale */
html.freedium-tweaks h2 { font-size: calc(28px * var(--fm-hscale)) !important; line-height: calc(34px * var(--fm-hscale)) !important; font-weight: 700 !important; margin: 20px 0 10px !important; }
html.freedium-tweaks h3 { font-size: calc(22px * var(--fm-hscale)) !important; line-height: calc(28px * var(--fm-hscale)) !important; font-weight: 700 !important; margin: 18px 0 8px !important; }

/* Subtitle directly under title (Medium style) */
html.freedium-tweaks h1 + p,
html.freedium-tweaks h1 + h2,
html.freedium-tweaks .subtitle,
html.freedium-tweaks .post-subtitle {
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
  font-size: 22px !important;
  line-height: 28px !important;
  font-weight: 400 !important;
  letter-spacing: normal !important;
  color: #6B6B6B !important;
  margin-top: 4px !important;
  margin-bottom: 12px !important;
}

/* Normalize overly light utility classes on subtitles */
html.freedium-tweaks h1 + p.text-gray-100,
html.freedium-tweaks h1 + p.text-slate-100,
html.freedium-tweaks h1 + p.text-neutral-100,
html.freedium-tweaks .subtitle.text-gray-100,
html.freedium-tweaks .subtitle.text-slate-100,
html.freedium-tweaks .subtitle.text-neutral-100,
html.freedium-tweaks .post-subtitle.text-gray-100,
html.freedium-tweaks .post-subtitle.text-slate-100,
html.freedium-tweaks .post-subtitle.text-neutral-100 {
  color: #6B6B6B !important;
}

/* Body text rhythm */
html.freedium-tweaks p,
html.freedium-tweaks li {
  font-family: source-serif-pro, Georgia, Cambria, "Times New Roman", Times, serif !important;
  font-size: inherit !important;
  line-height: inherit !important;
  font-weight: 400 !important;
  letter-spacing: -0.06px !important;
  color: var(--fm-text) !important;
}
html.freedium-tweaks p { margin: 14px 0 !important; }
html.freedium-tweaks ul, html.freedium-tweaks ol { padding-left: 1.4em !important; }

/* Links (inherit color; underline by default like Medium) */
html.freedium-tweaks a { color: inherit !important; text-decoration: var(--fm-underline) !important; }
html.freedium-tweaks a:hover { color: #000000 !important; }

/* Author details (byline) */
html.freedium-tweaks .byline,
html.freedium-tweaks .post-meta,
html.freedium-tweaks .author,
html.freedium-tweaks .author-card {
  color: #6B6B6B !important;
  font-family: Times, "Times New Roman", serif !important;
  font-size: 16px !important;
  line-height: normal !important;
  font-weight: 400 !important;
  letter-spacing: normal !important;
}

/* Subtle text and captions */
html.freedium-tweaks .meta,
html.freedium-tweaks .byline,
html.freedium-tweaks .caption,
html.freedium-tweaks figcaption,
html.freedium-tweaks time,
html.freedium-tweaks small { color: var(--fm-muted) !important; }
html.freedium-tweaks figcaption {
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
  font-size: 14px !important;
  line-height: 20px !important;
  font-weight: 400 !important;
  letter-spacing: normal !important;
  color: #6B6B6B !important;
  text-align: center !important;
  margin-top: 8px !important;
}

/* Blockquotes */
html.freedium-tweaks blockquote {
  color: var(--fm-text) !important;
  border-left: 3px solid var(--fm-border) !important;
  margin: 18px 0 !important;
  padding: 4px 16px !important;
}

/* Horizontal rule */
html.freedium-tweaks hr { border: 0 !important; border-top: 1px solid var(--fm-border) !important; margin: 24px 0 !important; }

/* Code blocks */
html.freedium-tweaks code, html.freedium-tweaks pre {
  background: #f2f2f2 !important;
  color: var(--fm-text) !important;
}
html.freedium-tweaks pre { padding: 12px 14px !important; overflow: auto !important; border-radius: 6px !important; }

/* Images and figures */
html.freedium-tweaks figure { margin: 20px 0 !important; }
html.freedium-tweaks img { max-width: 100% !important; height: auto !important; }

/* Hide Freedium's native top chrome; we inject our own */
html.freedium-tweaks .topbar,
html.freedium-tweaks #topbar,
html.freedium-tweaks nav#header,
html.freedium-tweaks #header,
html.freedium-tweaks #progress { display: none !important; }

/* Injected Medium-like navbar (without search) */
html.freedium-tweaks #fm-nav { position: sticky; top: 0; z-index: 2147483640; background: var(--fm-bg); color: var(--fm-text); border-bottom: 1px solid var(--fm-border); display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; }
html.freedium-tweaks #fm-nav .fm-left{display:flex;align-items:center;gap:12px}
html.freedium-tweaks #fm-nav .fm-brand { font-family: var(--fm-ui-font); font-weight: 700; font-size: 24px; letter-spacing: -0.3px; }
html.freedium-tweaks #fm-nav .fm-actions { display: flex; align-items: center; gap: 8px; }
html.freedium-tweaks #fm-nav .fm-iconbtn { border: 1px solid var(--fm-border); background: var(--fm-bg); color: var(--fm-text); border-radius: 9999px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
html.freedium-tweaks #fm-nav .fm-iconbtn:hover { box-shadow: inset 0 0 0 1px #eaeaea; }
html.freedium-tweaks #fm-nav .fm-iconbtn svg { width: 18px; height: 18px; color: var(--fm-text); }
html.freedium-tweaks #fm-nav .label { font-family: var(--fm-ui-font); font-size: 14px; }
html.freedium-tweaks #fm-nav .fm-credit { font-family: var(--fm-ui-font); font-size: 12px; color: var(--fm-muted); }
html.freedium-tweaks #fm-nav .fm-credit a { color: inherit; text-decoration: underline; }
/* Navbar expand-on-top behavior and reveal effect */
html.freedium-tweaks #fm-nav { transition: padding .16s ease, border-bottom-width .16s ease; }
html.freedium-tweaks #fm-nav.fm-expanded { padding-top: 12px; padding-bottom: 12px; border-bottom-width: 2px; }
html.freedium-tweaks #fm-nav .fm-reveal { display: none; align-items: center; justify-content: center; margin-left: 8px; }
html.freedium-tweaks #fm-nav.fm-expanded .fm-reveal { display: flex; }
html.freedium-tweaks #fm-nav .fm-reveal, 
html.freedium-tweaks #fm-nav .rm-code, 
html.freedium-tweaks #fm-nav .rm-digit, 
html.freedium-tweaks #fm-nav .rm-digit span { cursor: pointer; -webkit-user-select: none; user-select: none; }
html.freedium-tweaks #fm-nav .rm-code { display:flex; align-items:center; gap:4px; padding:2px 6px; border-radius:8px; background: var(--fm-bg); box-shadow: inset 0 1px 0 rgba(0,0,0,.04); line-height:1; }
html.freedium-tweaks #fm-nav .rm-digit { display:flex; align-items:center; padding:4px 2px; list-style:none }
html.freedium-tweaks #fm-nav .rm-digit span { display:inline-block; font: 600 12px/1 var(--fm-ui-font); color: var(--fm-muted); transform: scale(.92); filter: blur(.4px); transition: transform .25s ease, filter .25s ease, color .2s ease; }
html.freedium-tweaks #fm-nav .rm-digit:is(:hover,:focus-visible) span { transform: scale(1.12); filter: blur(0); color: var(--fm-text); }
html.freedium-tweaks #fm-nav .rm-digit:has(+ .rm-digit:is(:hover,:focus-visible)) span,
html.freedium-tweaks #fm-nav .rm-digit:is(:hover,:focus-visible) + .rm-digit span { transform: scale(1.02); filter: blur(.2px); color: #4a4a4a; }
  /* Gentle theme activation transitions */
  html.freedium-tweaks body,
  html.freedium-tweaks article,
  html.freedium-tweaks .content,
  html.freedium-tweaks .post,
  html.freedium-tweaks .container,
  html.freedium-tweaks #content {
    transition: color 140ms ease, background-color 140ms ease, border-color 140ms ease;
  }
  @media (prefers-reduced-motion: reduce) {
    html.freedium-tweaks body,
    html.freedium-tweaks article,
    html.freedium-tweaks .content,
    html.freedium-tweaks .post,
    html.freedium-tweaks .container,
    html.freedium-tweaks #content {
      transition: none !important;
    }
  }
  /* Navbar fade-in */
  @keyframes fmFadeIn { from { opacity: 0 } to { opacity: 1 } }
  html.freedium-tweaks #fm-nav { opacity: 0; animation: fmFadeIn 140ms ease 60ms forwards; }
  @media (prefers-reduced-motion: reduce) { html.freedium-tweaks #fm-nav { animation: none; opacity: 1 } }
  @media (max-width: 720px) {
  html.freedium-tweaks #fm-nav .fm-brand { font-size: 20px; }
  html.freedium-tweaks #fm-nav .label { display: none; }
}

/* In-page overlays */
html.freedium-tweaks .fm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:flex-start;justify-content:center;z-index:2147483641;padding:24px 12px;overflow:auto}
html.freedium-tweaks .fm-dialog{width:min(960px,96vw);background:var(--fm-bg);color:var(--fm-text);border:1px solid var(--fm-border);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.12);display:flex;flex-direction:column;overflow:hidden}
html.freedium-tweaks .fm-dialog header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--fm-border)}
html.freedium-tweaks .fm-dialog .fm-content{display:grid;grid-template-columns:minmax(320px,1fr) minmax(340px,520px);gap:16px;padding:16px}
html.freedium-tweaks .fm-dialog .preview{border:1px solid var(--fm-border);border-radius:12px;overflow:auto;max-height:70vh;padding:16px}
html.freedium-tweaks .fm-dialog .controls{display:grid;gap:10px;align-content:start}
html.freedium-tweaks .fm-row{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--fm-border);padding:10px 0}
html.freedium-tweaks .fm-row:first-child{border-top:0}
html.freedium-tweaks .fm-chiprow{display:flex;gap:8px;flex-wrap:wrap}
html.freedium-tweaks .fm-chip{border:1px solid var(--fm-border);border-radius:9999px;padding:6px 10px;background:var(--fm-bg);cursor:pointer}
html.freedium-tweaks .fm-chip.is-selected{background:#f5f5f5;box-shadow:inset 0 0 0 1px #eaeaea}
html.freedium-tweaks .fm-toggle{appearance:none;width:44px;height:26px;border-radius:999px;background:#e9e9ea;position:relative;border:1px solid #dadada}
html.freedium-tweaks .fm-toggle:checked{background:#cfead2;border-color:#b7e0bb}
html.freedium-tweaks .fm-toggle::after{content:"";position:absolute;top:50%;left:2px;width:20px;height:20px;border-radius:50%;transform:translate(0,-50%);background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.15);transition:transform .14s cubic-bezier(.2,.9,.2,1)}
html.freedium-tweaks .fm-toggle:checked::after{transform:translate(18px,-50%)}
html.freedium-tweaks .fm-range{width:220px}
html.freedium-tweaks .fm-color{width:40px;height:28px;border:1px solid var(--fm-border);border-radius:8px;background:var(--fm-bg)}

html.freedium-tweaks .author,
html.freedium-tweaks .author-card,
html.freedium-tweaks .byline-card,
html.freedium-tweaks .post-meta {
  background: var(--fm-bg) !important;
  border: 1px solid var(--fm-border) !important;
  box-shadow: none !important;
}

/* Neutralize any dark-theme leftovers */
html.freedium-tweaks [class*="bg-"],
html.freedium-tweaks .card,
html.freedium-tweaks .panel {
  background-color: var(--fm-bg) !important;
}

/* Normalize too-light text utilities to readable gray */
html.freedium-tweaks .text-gray-100,
html.freedium-tweaks .dark\:text-gray-100,
html.freedium-tweaks .text-slate-100,
html.freedium-tweaks .dark\:text-slate-100,
html.freedium-tweaks .text-neutral-100,
html.freedium-tweaks .dark\:text-neutral-100 { color: #6B6B6B !important; }

/* Freedium author card → Medium-like byline */
html.freedium-tweaks .freedium-byline {
  background: transparent !important;
  border: 0 !important;
  margin: 16px 0 24px !important;
  display: flex !important;
  align-items: center !important;
}
html.freedium-tweaks .freedium-byline .flex.items-center.p-4.space-x-4 { padding: 0 !important; margin-right: 16px !important; }
html.freedium-tweaks .freedium-byline .px-4.pb-2 { padding: 0 !important; }

/* Author name */
html.freedium-tweaks .freedium-byline .flex-grow > a.block {
  font-family: var(--fm-ui-font) !important;
  font-size: 16px !important;
  line-height: 22px !important;
  font-weight: 400 !important;
  letter-spacing: normal !important;
  color: #242424 !important;
  display: inline-block !important;
  margin-right: 16px !important;
}

/* Follow pill */
html.freedium-tweaks .freedium-byline button {
  background: transparent !important;
  border: 1px solid #242424 !important;
  color: #242424 !important;
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
  font-size: 14px !important;
  line-height: 20px !important;
  font-weight: 400 !important;
  padding: 6px 16px !important;
  border-radius: 9999px !important;
}
html.freedium-tweaks .freedium-byline button a { color: inherit !important; text-decoration: none !important; }

/* Byline meta (read time, date) */
html.freedium-tweaks .freedium-byline .freedium-byline-meta,
html.freedium-tweaks .freedium-byline .freedium-byline-meta * {
  font-family: var(--fm-ui-font) !important;
  font-size: 14px !important;
  line-height: 20px !important;
  font-weight: 400 !important;
  letter-spacing: normal !important;
  color: #6B6B6B !important;
}

/* Avatar stays the same size; keep rounded */
html.freedium-tweaks .freedium-byline img { border-radius: 9999px !important; }
/* Follow button becomes subtle pill like Medium */
html.freedium-tweaks .freedium-byline button,
html.freedium-tweaks .freedium-byline a button {
  background: #ffffff !important;
  color: #6B6B6B !important;
  border: 1px solid #e6e6e6 !important;
  border-radius: 9999px !important;
  padding: 2px 12px !important;
}
`;
    if(!style.isConnected){ document.documentElement.appendChild(style); }
    document.documentElement.classList.add('freedium-tweaks');
    document.documentElement.classList.toggle('freedium-theme-contrast', cfg.preset === 'contrast');
    document.documentElement.classList.toggle('freedium-theme-serif', cfg.preset === 'serif');

    // Inject Medium-like navbar once
    try {
      if (!document.getElementById('fm-nav')) {
        const nav = document.createElement('nav');
        nav.id = 'fm-nav';
        nav.setAttribute('role', 'navigation');
        nav.innerHTML = `
          <div class="fm-left">
            <div class="fm-brand">ReadMirror</div>
            <div class="fm-reveal" aria-hidden="true">
              <ul class="rm-code" aria-label="Made by CHX">
                <li class="rm-digit" tabindex="-1"><span>M</span></li>
                <li class="rm-digit" tabindex="-1"><span>A</span></li>
                <li class="rm-digit" tabindex="-1"><span>D</span></li>
                <li class="rm-digit" tabindex="-1"><span>E</span></li>
                <li class="rm-digit" tabindex="-1"><span> </span></li>
                <li class="rm-digit" tabindex="-1"><span>B</span></li>
                <li class="rm-digit" tabindex="-1"><span>Y</span></li>
                <li class="rm-digit" tabindex="-1"><span> </span></li>
                <li class="rm-digit" tabindex="-1"><span>C</span></li>
                <li class="rm-digit" tabindex="-1"><span>H</span></li>
                <li class="rm-digit" tabindex="-1"><span>X</span></li>
              </ul>
            </div>
          </div>
          <div class="fm-actions">
            <div class="fm-credit" role="note" aria-label="Content served by freedium.cfd">Content via <a href="https://freedium.cfd" target="_blank" rel="noopener noreferrer">freedium.cfd</a> · Unofficial</div>
          </div>`;
        document.body.prepend(nav);
        const setExpanded = ()=>{ const y = window.scrollY || document.documentElement.scrollTop || 0; if (y <= 2) nav.classList.add('fm-expanded'); else nav.classList.remove('fm-expanded'); };
        setExpanded();
        window.addEventListener('scroll', setExpanded, { passive: true });
        const openOverlay = async (kind) => {
          const existing = document.querySelector('.fm-overlay');
          if (existing) existing.remove();
          const overlay = document.createElement('div'); overlay.className = 'fm-overlay';
          const dialog = document.createElement('div'); dialog.className = 'fm-dialog';
          dialog.innerHTML = `
            <header>
              <div style="font-weight:700">${kind === 'theme' ? 'Visual Editor' : 'Settings'}</div>
              <button aria-label="Close" id="fm-close" class="fm-iconbtn">✕</button>
            </header>
            <div class="fm-content">
              <div class="preview">
                <style>
                  #fm-preview{ --fm-body-size:20px; --fm-body-lh:1.58; --fm-col-width:816px; --fm-underline:underline; --fm-hscale:1; --fm-accent:#1a8917; --fm-text:#242424; --fm-heading-w:700; --fm-body-w:400 }
                  #fm-preview{ max-width:var(--fm-col-width); margin:0 auto; font-size:var(--fm-body-size); line-height:var(--fm-body-lh); color:var(--fm-text) }
                  #fm-preview h1{ font-size:calc(42px*var(--fm-hscale)); line-height:calc(52px*var(--fm-hscale)); font-weight:var(--fm-heading-w); margin:16px 0 8px }
                  #fm-preview .subtitle{ font: 400 22px/28px sohne, Helvetica Neue, Arial, sans-serif; color:#6B6B6B }
                  #fm-preview p{ margin:12px 0 }
                  #fm-preview a{ text-decoration:var(--fm-underline); color:inherit }
                </style>
                <article id="fm-preview"><h1>Ship happens</h1><p class="subtitle">CHX 2025—should be true tho</p><p>Live preview mirrors your settings.</p><p><a href="#">Tasteful link</a></p></article>
              </div>
              <div class="controls" id="fm-controls"></div>
            </div>`;
          overlay.appendChild(dialog);
          document.body.appendChild(overlay);
          const opener = document.activeElement;
          const close = ()=>{ overlay.remove(); if(opener && typeof opener.focus==='function'){ opener.focus(); } };
          overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
          dialog.querySelector('#fm-close').addEventListener('click', close);
          // Focus trap
          const focusables = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          const first = focusables[0]; const last = focusables[focusables.length-1];
          if(first) first.focus();
          dialog.addEventListener('keydown', (ev)=>{
            if(ev.key==='Escape'){ ev.preventDefault(); close(); }
            if(ev.key==='Tab' && focusables.length){
              if(ev.shiftKey && document.activeElement===first){ ev.preventDefault(); last.focus(); }
              else if(!ev.shiftKey && document.activeElement===last){ ev.preventDefault(); first.focus(); }
            }
          });

          const applyPreview = (state) => {
            const root = dialog.querySelector('#fm-preview');
            if(!root) return;
            const scale = Math.max(0.8, Math.min(2, (state.textScale||100)/100));
            const bodySize = Math.round(20*scale);
            const hscale = Math.max(0.9, Math.min(1.15, (state.headingScale||100)/100));
            root.style.setProperty('--fm-body-size', bodySize+'px');
            root.style.setProperty('--fm-body-lh', (state.lineHeight||158)/100);
            root.style.setProperty('--fm-col-width', Math.max(560, Math.min(1200, state.columnWidth||816))+'px');
            root.style.setProperty('--fm-underline', state.underlineLinks? 'underline':'none');
            root.style.setProperty('--fm-hscale', String(hscale));
            root.style.setProperty('--fm-accent', state.accentColor||'#1a8917');
            root.style.setProperty('--fm-text', '#242424');
            root.style.setProperty('--fm-heading-w', String(state.headingWeight||700));
            root.style.setProperty('--fm-body-w', String(state.bodyWeight||400));
            root.style.fontFamily = state.bodyFont==='system-serif' ? 'Georgia, Cambria, "Times New Roman", Times, serif' : (state.bodyFont==='system-sans' ? 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Liberation Sans, sans-serif' : 'source-serif-pro, Georgia, Cambria, "Times New Roman", Times, serif');
            root.querySelectorAll('h1,h2,h3').forEach(h=>{ h.style.fontFamily = state.uiFont==='system-sans' ? 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Liberation Sans, sans-serif' : 'sohne, Helvetica Neue, Helvetica, Arial, sans-serif'; });
          };

          const presetOverrides = (p)=>{
            switch(p){
              case 'medium': return { uiFont:'sohne', bodyFont:'source-serif-pro', textScale:100, headingScale:100, headingWeight:700, bodyWeight:400, lineHeight:158, columnWidth:816, accentColor:'#1a8917', underlineLinks:true };
              case 'serif': return { bodyFont:'source-serif-pro' };
              case 'contrast': return { textScale:102, headingScale:105, headingWeight:750, bodyWeight:450, lineHeight:162, columnWidth:800, accentColor:'#0A84FF' };
              case 'bookish': return { uiFont:'system-serif', bodyFont:'source-serif-pro', textScale:102, lineHeight:165, columnWidth:740, accentColor:'#7A5C2E' };
              case 'focus': return { uiFont:'system-sans', textScale:100, headingScale:98, lineHeight:164, columnWidth:720, accentColor:'#0B6E4F', underlineLinks:false };
              case 'sepia': return { lineHeight:162, columnWidth:760, accentColor:'#8A4B08' };
              default: return {};
            }
          };

          const state = await chrome.storage.sync.get(DEFAULTS);
          applyPreview(Object.assign({}, DEFAULTS, state));

          const controls = dialog.querySelector('#fm-controls');
          if (kind === 'theme') {
            controls.innerHTML = `
              <div class="fm-row"><span>Preset</span><div class="fm-chiprow" id="fm-presets">
                <button class="fm-chip" data-p="medium">Match Medium</button>
                <button class="fm-chip" data-p="serif">System Serif</button>
                <button class="fm-chip" data-p="contrast">High Contrast</button>
                <button class="fm-chip" data-p="bookish">Bookish</button>
                <button class="fm-chip" data-p="focus">Focus</button>
                <button class="fm-chip" data-p="sepia">Sepia</button>
              </div></div>
              <div class="fm-row"><span>Text size</span><input id="fm-textScale" type="range" class="fm-range" min="90" max="120" step="1"></div>
              <div class="fm-row"><span>Line height</span><input id="fm-lineHeight" type="range" class="fm-range" min="145" max="170" step="1"></div>
              <div class="fm-row"><span>Accent</span><input id="fm-accent" type="color" class="fm-color"></div>
              <div class="fm-row"><span>Hide badges</span><input id="fm-hideBadges" type="checkbox" class="fm-toggle"></div>
              <div class="fm-row"><span>Options page</span><button class="fm-iconbtn" id="fm-open-options">Open</button></div>`;

            // initial values
            controls.querySelector('#fm-textScale').value = state.textScale;
            controls.querySelector('#fm-lineHeight').value = state.lineHeight;
            controls.querySelector('#fm-accent').value = state.accentColor || '#1a8917';
            controls.querySelector('#fm-hideBadges').checked = !!state.hideBadges;
            // events
            controls.querySelector('#fm-presets').addEventListener('click', async (e)=>{
              const btn = e.target.closest('button.fm-chip'); if(!btn) return;
              const p = btn.dataset.p; await chrome.storage.sync.set(Object.assign({preset:p}, presetOverrides(p))); const s = await chrome.storage.sync.get(DEFAULTS); applyPreview(Object.assign({}, DEFAULTS, s));
            });
            controls.querySelector('#fm-textScale').addEventListener('change', async (e)=>{ await chrome.storage.sync.set({textScale:parseInt(e.target.value,10)}); const s = await chrome.storage.sync.get(DEFAULTS); applyPreview(Object.assign({}, DEFAULTS, s)); });
            controls.querySelector('#fm-lineHeight').addEventListener('change', async (e)=>{ await chrome.storage.sync.set({lineHeight:parseInt(e.target.value,10)}); const s = await chrome.storage.sync.get(DEFAULTS); applyPreview(Object.assign({}, DEFAULTS, s)); });
            controls.querySelector('#fm-accent').addEventListener('change', async (e)=>{ await chrome.storage.sync.set({accentColor:e.target.value}); const s = await chrome.storage.sync.get(DEFAULTS); applyPreview(Object.assign({}, DEFAULTS, s)); });
            controls.querySelector('#fm-hideBadges').addEventListener('change', async (e)=>{ await chrome.storage.sync.set({hideBadges:e.target.checked}); });
            controls.querySelector('#fm-open-options').addEventListener('click', ()=>{
              const url = chrome.runtime.getURL('options.html'); if (cfg.openWhere === 'new') window.open(url, '_blank', 'noopener'); else window.location.href = url;
            });
          } else {
            controls.innerHTML = `
              <div class="fm-row"><span>Auto-unlock</span><input id="fm-autoUnlock" type="checkbox" class="fm-toggle"></div>
              <div class="fm-row"><span>Silent mode</span><input id="fm-silentMode" type="checkbox" class="fm-toggle"></div>
              <div class="fm-row"><span>Open where</span><div><label><input type="radio" name="fm-open" value="same"> Same</label> <label><input type="radio" name="fm-open" value="new"> New tab</label></div></div>
              <div class="fm-row"><span>Reader fallback</span><input id="fm-readerFallback" type="checkbox" class="fm-toggle"></div>
              <div class="fm-row"><span>Progress bar</span><input id="fm-progressBar" type="checkbox" class="fm-toggle"></div>
              <div class="fm-row"><span>Options page</span><button class="fm-iconbtn" id="fm-open-options">Open</button></div>`;
            // initial
            controls.querySelector('#fm-autoUnlock').checked = !!state.autoUnlock;
            controls.querySelector('#fm-silentMode').checked = !!state.silentMode;
            controls.querySelector(`#fm-controls input[name="fm-open"][value="${state.openWhere}"]`).checked = true;
            controls.querySelector('#fm-readerFallback').checked = !!state.readerFallback;
            controls.querySelector('#fm-progressBar').checked = !!state.progressBar;
            // events
            controls.querySelector('#fm-autoUnlock').addEventListener('change', (e)=>chrome.storage.sync.set({autoUnlock:e.target.checked}));
            controls.querySelector('#fm-silentMode').addEventListener('change', (e)=>chrome.storage.sync.set({silentMode:e.target.checked}));
            controls.querySelectorAll('input[name="fm-open"]').forEach(r=>r.addEventListener('change', ()=>chrome.storage.sync.set({openWhere: controls.querySelector('input[name="fm-open"]:checked').value})));
            controls.querySelector('#fm-readerFallback').addEventListener('change', (e)=>chrome.storage.sync.set({readerFallback:e.target.checked}));
            controls.querySelector('#fm-progressBar').addEventListener('change', (e)=>chrome.storage.sync.set({progressBar:e.target.checked}));
            controls.querySelector('#fm-open-options').addEventListener('click', ()=>{ const url = chrome.runtime.getURL('options.html'); if (cfg.openWhere === 'new') window.open(url, '_blank', 'noopener'); else window.location.href = url; });
          }
        };
        // Theme/Settings buttons removed from navbar per request
      }
    } catch(_) {}

    // Add robust hooks to the Freedium author card so CSS can target it reliably; hide badges is conditional
    try {
      const headerRow = document.querySelector('div.flex.items-center.p-4.space-x-4');
      if (headerRow) {
        const card = headerRow.parentElement; // wrapper with bg-gray/border
        if (card) {
          card.classList.add('freedium-byline');
          const metaRow = card.querySelector('div.px-4.pb-2 > div.flex');
          if (metaRow) {
            // Move meta row next to the header row for inline layout
            headerRow.after(metaRow);
            metaRow.classList.add('freedium-byline-meta');
            metaRow.style.marginLeft = '16px';
            metaRow.style.display = 'flex';
            metaRow.style.alignItems = 'center';
            metaRow.style.gap = '8px';
            // Toggle badges/social visibility
            Array.from(metaRow.querySelectorAll('a, span')).forEach((el) => {
              const text = (el.textContent || '').trim().toLowerCase();
              const isBadgeLink = el.matches('a') && el.querySelector('img');
              const isFreeLabel = /free\s*:\s*/.test(text);
              const isSocialTag = /androidstudio/.test(text);
              if (isBadgeLink || isFreeLabel || isSocialTag) {
                el.style.display = cfg.hideBadges ? 'none' : '';
              }
            });
          }
        }
      }
    } catch (_) {
      // Non-fatal if not found
    }

    // Optional hierarchy reordering (best-effort, only if elements share a parent)
    try {
      const container = document.querySelector('article') || document.querySelector('main') || document.body;
      const titleEl = container.querySelector('h1');
      const subtitleEl = container.querySelector('.subtitle, h1 + p');
      const bylineEl = container.querySelector('.freedium-byline');
      const elementsMap = { title: titleEl, subtitle: subtitleEl, byline: bylineEl };
      const order = Array.isArray(cfg.hierarchy) ? cfg.hierarchy : DEFAULTS.hierarchy;
      const existing = order.map(k => elementsMap[k]).filter(Boolean);
      if (existing.length >= 2) {
        const sameParent = existing.every(el => el.parentElement === existing[0].parentElement);
        if (sameParent) {
          const parent = existing[0].parentElement;
          order.forEach(k => {
            const el = elementsMap[k];
            if (el && el.parentElement === parent) parent.appendChild(el);
          });
        }
      }
    } catch(_) { /* ignore */ }
    // Optional reading progress bar
    const existingBar = document.getElementById('fm-progress');
    if (cfg.progressBar) {
      if (!existingBar) {
        const bar = document.createElement('div');
        bar.id = 'fm-progress';
        Object.assign(bar.style, {
          position: 'fixed', top: '0', left: '0', height: '2px', width: '0%',
          background: 'var(--fm-accent)', zIndex: '2147483647', transition: 'width 120ms linear'
        });
        document.body.appendChild(bar);
        const update = () => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
          bar.style.width = pct + '%';
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
      }
    } else if (existingBar) {
      existingBar.remove();
    }
  }

  function init() {
    if (isCloudflareInterstitial()) {
      // Do not interfere during Cloudflare checks; wait until page changes
      const observer = new MutationObserver(() => {
        if (!isCloudflareInterstitial()) {
          observer.disconnect();
          applyStyling();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      return;
    }

    const boot = () => {
      let currentCfg = DEFAULTS;
      const setAndListen = (cfg) => {
        currentCfg = Object.assign({}, DEFAULTS, cfg || {});
        applyStyling(currentCfg);
        try {
          chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== 'sync') return;
            for (const k in changes) {
              currentCfg[k] = changes[k].newValue;
            }
            applyStyling(currentCfg);
          });
        } catch (_) {}
      };
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(DEFAULTS).then(setAndListen).catch(() => setAndListen(DEFAULTS));
      } else {
        setAndListen(DEFAULTS);
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
      boot();
    }
  }

  init();
})();


