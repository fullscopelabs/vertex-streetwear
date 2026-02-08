# Remediation: PageSpeed / Lighthouse 2026-02-08 17:19:19 UTC (vertex live)

**Report:** `performance/reports/vertex.sites.fullscopelabs.com-20260208T171919.json`  
**Context:** Mobile (Moto G Power), Slow 4G, Lighthouse 13.0.1

## Scores (baseline)

| Category       | Score |
|----------------|-------|
| Performance    | 87    |
| Accessibility  | 100   |
| Best Practices | 96    |
| SEO            | 92    |

**Core metrics:** FCP 2.6s, LCP 3.5s, TBT 0 ms, CLS 0, Speed Index 2.9s

---

## Root cause: image still "too big" (840×1050 for 412×515)

Lighthouse runs with **device pixel ratio 1.75** (Moto G Power emulation). The browser picks the **smallest srcset width that is ≥ (layout width × DPR)**.

- **Display:** 412×515 px (layout)
- **Required pixel width:** 412 × 1.75 = **721** px
- **Previous srcset** (from `startingWidth: 240`, `incrementSize: 120`, `intervals: 9`): 240, 360, 480, 600, **720**, **840**, 960, 1080, 1200
- **720 < 721** → browser skipped 720 and selected **840**, so the image remained 840×1050 and PageSpeed reported ~21 KiB wasted.

The step grid never included a width ≥ 721; adding a step at **740** lets the browser choose 740 instead of 840.

---

## Fix applied

### 1. Adjust srcSetOptions so a step covers 721px (740)

**File:** `app/routes/_index.jsx`

**Change:** For both hero images (HeroSection and EditorialHero):

- `startingWidth: 240`
- `incrementSize: 100`
- `intervals: 10`

**Resulting widths:** 240, 340, 440, 540, 640, **740**, 840, 940, 1040, 1140.

For 412×1.75 = 721, the browser now chooses **740** instead of 840, reducing transfer (~21 KiB for the editorial hero; full-bleed hero benefits the same when in the critical path).

---

## Debugging and verification

- **Why 840 was chosen before:** Layout width 412 × deviceScaleFactor 1.75 = 721; previous srcset had 720 and 840; 720 < 721 → 840 selected.
- **How to verify after fix:**
  - DevTools → Network → filter by Img: confirm requested URL has `width=740` for the editorial/hero image at 412px viewport.
  - Or: Elements → select `<img>` → check `currentSrc` (or Network request) for `width=` parameter.
- **Formula for future runs:** `desiredWidth = layoutWidth * devicePixelRatio`; ensure srcset has a step ≥ that value for the emulated device (e.g. 412×1.75 → 721 → need step at 721+).

---

## Other insights (no app change)

- **Use efficient cache lifetimes:** Cloudflare `beacon.min.js` is third-party; cache TTL not controllable from the app.
- **Reduce unused JavaScript (chunk-EPO…):** Already mitigated by lazy-loading below-fold (HomeBelowFold). Remaining waste is likely shared/vendor code; optional later: analyze chunk with source map or bundle analyzer.

---

## Files modified

- `app/routes/_index.jsx` — both hero `Image` components: `srcSetOptions` set to `{ startingWidth: 240, incrementSize: 100, intervals: 10 }`.

Report artifact already present: `performance/reports/vertex.sites.fullscopelabs.com-20260208T171919.json`.
