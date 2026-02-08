# Remediation: PageSpeed / Lighthouse 2026-02-08 16:52:02 UTC (vertex live)

**Report:** `performance/reports/vertex.sites.fullscopelabs.com-20260208T165202.json`  
**Context:** Mobile (Moto G Power), Slow 4G, Lighthouse 13.0.1

## Scores (baseline)

| Category       | Score |
|----------------|-------|
| Performance    | 86    |
| Accessibility  | 100   |
| Best Practices | 96    |
| SEO            | 92    |

**Core metrics:** FCP 2.6s, LCP 3.6s, TBT 0 ms, CLS 0, Speed Index 2.9s

---

## Fixes Applied

### 1. Improve image delivery (Est. savings ~23–51 KiB)

- **Issue:** Hero and editorial hero images were requested at 880×1100 for displayed dimensions 412×515 (and 235×294 in some viewports), causing unnecessary transfer.
- **Change:** Refined `srcSetOptions` on both LCP-relevant images in `app/routes/_index.jsx` to use **finer width steps** so the browser can choose a closer match:
  - **Before:** `startingWidth: 240, incrementSize: 160, intervals: 7` → 240, 400, 560, 720, 880, 1040, 1200.
  - **After:** `startingWidth: 240, incrementSize: 120, intervals: 9` → 240, 360, 480, 600, 720, 840, 960, 1080, 1200.
- **Rationale:** For a 412px display width, the browser can now select 480 (1x) or 840 (2x) instead of 880, reducing payload while preserving quality. Aligns with responsive images best practice: provide widths that match common display sizes and densities.

### 2. Reduce unused JavaScript (Est. savings ~24 KiB)

- **Issue:** Chunk `chunk-EPOLDU6W-*.js` (42.4 KiB transfer, ~24.5 KiB estimated unused) was loaded on initial page load and contributed to LCP.
- **Change:** **Code-split below-the-fold content** so it loads in a separate chunk after initial paint:
  - Added `app/components/HomeBelowFold.jsx` containing Brand Story and Marquee sections (and their ScrollReveal usage).
  - In `app/routes/_index.jsx`, these sections are now rendered via `React.lazy(() => import('~/components/HomeBelowFold'))` inside `<Suspense fallback={null}>`.
- **Rationale:** Industry standard for reducing initial JS is to defer non-critical, below-the-fold UI into lazily loaded chunks. The main route bundle no longer includes BrandStory/MarqueeBand/ScrollReveal for those sections; they load when the lazy chunk is requested. SSR still renders full content (React 18 waits for the lazy component on the server).

### 3. Other insights (no app change)

- **Use efficient cache lifetimes:** Cloudflare beacon (`beacon.min.js`) is third-party; cache TTL not controlled by the app.
- **Layout shift culprits / 3rd parties:** Informational; no structural or dependency changes in this pass.

---

## Files Modified / Added

- `app/routes/_index.jsx` — Refined `srcSetOptions` (120px steps, 9 intervals); lazy-load below-fold via `HomeBelowFold` and Suspense; removed inlined BrandStory, MarqueeBand, MARQUEE_TEXT.
- `app/components/HomeBelowFold.jsx` — **New.** Default export renders BrandStory + MarqueeBand for lazy loading.

---

## Verification

- `npm run build` succeeds; `HomeBelowFold-*.js` appears as a separate client chunk.
- Re-run Lighthouse on the deployed URL to confirm improved image delivery and reduced unused JS on the initial load.
