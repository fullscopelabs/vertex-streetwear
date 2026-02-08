# Remediation: PageSpeed / Lighthouse 2026-02-08 17:30:43 UTC (vertex live)

**Report:** `performance/reports/vertex.sites.fullscopelabs.com-20260208T173043.json`  
**Context:** Mobile (Moto G Power), Slow 4G, Lighthouse 13.0.1

## Scores (baseline)

| Category       | Score |
|----------------|-------|
| Performance    | 84    |
| Accessibility  | 100   |
| Best Practices | 96    |
| SEO            | 92    |

**Core metrics:** FCP 2.7s, LCP 3.6s, TBT 0 ms, CLS 0, Speed Index 4.4s

---

## Issue 1: React error #421 (Suspense hydration crash)

**Symptom:** `Uncaught Error: Minified React error #421` in production console.

**Root cause:** The `React.lazy()` + `<Suspense>` boundary around `HomeBelowFold` created a Suspense boundary that hadn't finished hydrating when external state updates (Shopify analytics, consent tracking, React Router state) fired during page load. The previous `startTransition` fix in `useScrollReveal.ts` only addressed one trigger (IntersectionObserver); any other state update during hydration could still cause #421.

**Fix:** Removed `React.lazy` and the `<Suspense>` boundary entirely. BrandStory and MarqueeBand are now rendered inline in `_index.jsx` (as they were originally). The `HomeBelowFold.jsx` file was deleted. The `startTransition` in `useScrollReveal.ts` is kept as a defensive practice.

**Why this is correct:** The lazy chunk was only ~2.4 KiB gzipped. The "Reduce unused JavaScript" finding refers to `chunk-EPOLDU6W` (42.4 KiB), a shared/vendor chunk unrelated to HomeBelowFold. Code-splitting these small sections created a hydration problem with no meaningful performance benefit.

---

## Issue 2: Image still "too big" (740x925 for 235x294)

**Symptom:** PageSpeed reports "This image file is larger than it needs to be (740x925) for its displayed dimensions (235x294)."

**Root cause:** The EditorialHero image had `sizes="(min-width: 768px) 60vw, 100vw"`. On mobile (412px < 768px), `100vw` = 412px. With DPR 1.75: 412 × 1.75 = 721px → browser picks 740. But the actual rendered image is only ~235px wide because the `flex-col` mobile layout and the image's aspect ratio (1639/2048) constrain the image to less than full viewport width. The `sizes` attribute was telling the browser the image would be 412px wide when it was actually ~235px.

**Fix:** Changed `sizes` to `(min-width: 768px) 60vw, 50vw`. On mobile: 412 × 0.5 = 206px. With DPR 1.75: 206 × 1.75 = ~361px → browser picks 340 from srcset. This is much closer to the actual 235px display width.

**Key insight for future reference:** The `sizes` attribute must reflect the *actual CSS layout width* of the image, not the container width. When images are constrained by aspect ratio or flex layout, `100vw` overstates the true width.

---

## Files modified / deleted

- `app/routes/_index.jsx` — Removed lazy/Suspense; inlined BrandStory + MarqueeBand; changed EditorialHero `sizes` from `100vw` to `50vw` on mobile.
- `app/components/HomeBelowFold.jsx` — Deleted.

Report artifact: `performance/reports/vertex.sites.fullscopelabs.com-20260208T173043.json`.
