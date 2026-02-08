# Remediation Plan — Lighthouse Run 2026-02-08T17:44:27Z

**Report:** `performance/reports/vertex.sites.fullscopelabs.com-20260208T174427.json`

## Baseline Scores

| Category       | Score |
| -------------- | ----- |
| Performance    | 87    |
| Accessibility  | 100   |
| Best Practices | 100   |
| SEO            | 92    |

### Key Metrics

- **FCP:** 2.8 s (score 0.57)
- **LCP:** 3.3 s (score 0.69) — LCP element is the "V☰RTEX" text span, not an image
- **TBT:** 60 ms
- **CLS:** 0
- **Speed Index:** 3.6 s (score 0.86)

## Resolved in Prior Runs

- React error #421 (hydration) — **fixed** (no console errors).
- Image delivery warning — **fixed** (score 1, no flagged images).

## Remaining Issues

### 1. Reduce Unused JavaScript — Est savings of 24 KiB (0 ms)

`chunk-EPOLDU6W-DDHwtID0.js` (43 KiB gzip) is a shared vendor chunk
containing React + React Router used by all 30+ routes. Lighthouse
reports 57 % unused on the homepage but estimates **0 ms** of time savings.

**Investigation:** Attempted `manualChunks` in `vite.config.js` to split
React from React Router. Build succeeded, but total gzip unchanged
(89 KiB → 89 KiB) and added an extra HTTP request. Reverted — the
default chunking strategy is already optimal for a multi-route SPA.

**Status:** Accepted (diagnostic only, no real-world impact).

### 2. Cache Lifetimes — Est savings of 3 KiB

Cloudflare `beacon.min.js` has a 1-day cache TTL. This is a third-party
script injected by the hosting platform; cache headers are not
controllable from the application.

**Status:** Known limitation — not actionable.

### 3. Forced Reflow — 33 ms ([unattributed])

Minimal reflow caused by the Cormorant Garamond font swap on the large
hero text. Self-hosting the font and preloading the critical woff2
should reduce or eliminate this.

**Status:** Addressed by the self-hosting change below.

### 4. robots.txt Not Valid — "Unknown directive" (SEO)

Line 29: `Content-Signal: search=yes,ai-train=no`. This directive is
**not in the application code** (`app/routes/[robots.txt].jsx`); it is
injected by the Shopify/Oxygen hosting platform after the response.

**Status:** Known platform limitation — not actionable from app code.

## Optimizations Applied

### Self-Host Cormorant Garamond (FCP/LCP improvement)

The Google Fonts `<link rel="stylesheet">` was a render-blocking request
to a third-party origin, creating a two-hop waterfall:

```
HTML → Google Fonts CSS (274 ms) → woff2 discovery → woff2 download (270 ms)
```

**Changes:**

1. Downloaded Latin and Latin-ext woff2 variable-font files (4 files)
   to `app/assets/fonts/`.
2. Added `@font-face` declarations directly in `app/styles/app.css`
   with `font-display: swap` and `unicode-range`.
3. Added `<link rel="preload">` for the hero-critical woff2 (weight 300)
   early in the `<head>` of `app/root.jsx`.
4. Removed all Google Fonts `<link>` tags, preconnects, and preloads
   from `root.jsx` (including ErrorBoundary).
5. Removed `styleSrc`, `fontSrc`, and `connectSrc` CSP entries for
   `googleapis.com` and `gstatic.com` in `app/entry.server.jsx`.

**Expected impact:** Eliminates the render-blocking third-party CSS
request and the CSS→woff2 discovery waterfall. The font loads in
parallel with app CSS from the same origin, reducing FCP/LCP.
