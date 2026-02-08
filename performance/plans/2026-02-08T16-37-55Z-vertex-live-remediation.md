# Remediation: PageSpeed / Lighthouse 2026-02-08 16:37:55 UTC (vertex live)

**Report:** `performance/reports/vertex.sites.fullscopelabs.com-20260208T163755.json`  
**Context:** Mobile (Moto G Power), Slow 4G, Lighthouse 13.0.1

## Scores (baseline)

| Category       | Score |
|----------------|-------|
| Performance    | 84    |
| Accessibility  | 100   |
| Best Practices | 96    |
| SEO            | 92    |

**Core Web Vitals (emulated):** FCP 2.7s, LCP 3.6s, TBT 0ms, CLS 0, SI 4.5s

---

## Insights Addressed

### 1. Improve image delivery (Est. savings ~46 KiB)

- **Issue:** Hero and editorial hero images were requested at 800×1000 (or 501×1000) while displayed at ~235×294 and ~376×470 on mobile, causing unnecessary transfer.
- **Change:** Added or tightened `srcSetOptions` on both above-the-fold images in `app/routes/_index.jsx`:
  - **HeroSection (full-bleed hero):** Added `srcSetOptions={{ startingWidth: 240, incrementSize: 160, intervals: 7 }}` so the browser can choose 240–1200px widths (e.g. 240, 400 for mobile).
  - **EditorialHero (product block):** Updated from `startingWidth: 400, incrementSize: 200, intervals: 5` to `startingWidth: 240, incrementSize: 160, intervals: 7` for better mobile fit.
- **Result:** Smaller image variants (e.g. 240px, 400px) are available in the srcset; the browser can select appropriately sized assets and reduce LCP payload.

### 2. Other insights (no code change)

- **Use efficient cache lifetimes:** Cloudflare beacon (`beacon.min.js`) is third-party; TTL not controlled by the app. Documented only.
- **Reduce unused JavaScript:** Chunk `chunk-EPOLDU6W-DDHwtID0.js` (~24 KiB estimated savings). Addressed by build/code-splitting in future if needed; no change in this pass.
- **Optimize DOM size:** Left for future iteration; no structural change in this pass.

---

## Files Modified

- `app/routes/_index.jsx` — Hero and EditorialHero `Image` `srcSetOptions` tuned for mobile display widths.
