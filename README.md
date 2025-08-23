# ReadMirror for Medium.com (Unofficial)

Redirects Medium URLs to Freedium and applies optional styling on `https://freedium.cfd/medium.com/*` pages. Avoids interfering with Cloudflare interstitials.

Privacy: This extension does not collect, transmit, or sell any personal data. Settings are stored locally via `chrome.storage.sync`. No telemetry or analytics are collected.

## What it does

- Redirects `http(s)://medium.com/...` → `https://freedium.cfd/medium.com/...` using Declarative Net Request for speed and simplicity.
- On `https://freedium.cfd/medium.com/...`, injects a safe, no-op CSS hook. It detects Cloudflare interstitials ("Just a moment...") and waits them out before applying tweaks.

## Install (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`.
2. Toggle on Developer mode (top-right).
3. Click "Load unpacked" and select this `freedium-redirector` folder.
4. Open any Medium article to verify it redirects to Freedium.

## Files

- `manifest.json`: MV3 manifest with redirect rules and content script (MV3, no remote code).
- `rules.json`: Network redirect rule from Medium → Freedium.
- `content.js`: Styling hook on Freedium pages; no interference during Cloudflare checks.

## Permissions

- Required: `declarativeNetRequest`, `storage`.
- Host access: `https://medium.com/*` only.

## Legal & attribution

- All article content is served by `freedium.cfd`. This extension is only a link converter with optional client-side style customizations. It does not host, cache, or modify the source content beyond presentation tweaks in your browser.
- `medium.com` and Medium marks are trademarks of A Medium Corporation. This project is an independent, unofficial tool and is not affiliated with, endorsed by, or associated with Medium or freedium.cfd.

Report a legal concern: open an issue on the repository or email the developer (add preferred contact in the Web Store “Support contact”).

## Customize styling later

Edit the placeholder style block inside `content.js` (scoped to `html.freedium-tweaks`).
