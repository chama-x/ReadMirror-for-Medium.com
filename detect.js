(function(){
  'use strict';

  // Fast path bail for non-main window
  if (window.top !== window) return;

  // Check auto setting once quickly
  const DEFAULTS = { autoUnlock: false, excludes: [] };
  try {
    chrome.storage.sync.get(DEFAULTS).then((cfg)=>{
      if(!cfg.autoUnlock) return;
      const url = location.href;

      // Respect excludes (simple substring or regex literal starting/ending with /)
      if (Array.isArray(cfg.excludes)) {
        try {
          for (const pat of cfg.excludes) {
            if (!pat) continue;
            if (pat.startsWith('/') && pat.endsWith('/')) {
              const re = new RegExp(pat.slice(1, -1));
              if (re.test(url)) return;
            } else if (url.includes(pat)) {
              return;
            }
          }
        } catch(_) {}
      }

      // Detect article-like paths robustly
      // 1) /p/{hex12}
      // 2) slug paths ending with -{hex12}
      // 3) publication subpaths with the same endings
      const u = new URL(url);
      const hostOk = /(^|\.)medium\.com$/i.test(u.hostname);
      if (!hostOk) return;
      const path = u.pathname;
      const isArticle = (/^\/p\/[0-9a-f]{12}(?:\/)?$/i.test(path)) || (/\-[0-9a-f]{12}(?:\/)?$/i.test(path));
      if (!isArticle) return;

      // Redirect early to reduce flicker
      const dest = `https://freedium.cfd/medium.com${path}${u.search}${u.hash}`;
      location.replace(dest);
    }).catch(()=>{});
  } catch(_) {}
})();

