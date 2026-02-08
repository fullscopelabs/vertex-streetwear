# Performance Report Remediation Plan

**Report:** `vertex.sites.fullscopelabs.com-20260208T161936.json`  
**Date:** 2026-02-08  
**Scope:** Live site (vertex.sites.fullscopelabs.com). Safe, non-breaking fixes only; aligned with project commit history to avoid past issues.

---

## 1. Report summary

| Category         | Score  | Notes |
|------------------|--------|--------|
| Performance      | 0.75   | FCP/LCP ~4.3 s; TBT 0 ms, CLS 0 (good) |
| Accessibility    | 0.96   | One failing audit: color-contrast |
| Best Practices   | 1      | No failures (CSP/console fixed in prior commits) |
| SEO              | 0.92   | One failing audit: robots.txt (platform-injected) |

**Core metrics (this run):** FCP 4.3 s, LCP 4.3 s, Speed Index 4.3 s, TBT 0 ms, CLS 0, TTI 4.3 s.

**Failing audits (score 0):**

- **color-contrast** (accessibility) – fix in app
- **robots-txt** (SEO) – platform-injected; document only
- **network-dependency-tree-insight** (performance) – informational; document / optional
- **render-blocking-insight** (performance) – ~350 ms opportunity; no change that risks FOUC/fonts

---

## 2. Commit-history constraints

Relevant history to respect:

- **Do not re-introduce async font loading** (e.g. `media="print"` + `onLoad` on the Google Fonts `<link>`). It was reverted because it prevented some fonts from loading (empty text). Current font preload + blocking stylesheet in [app/root.jsx](../../app/root.jsx) should stay.
- **CSP** is already fixed (commit 84c54c7): `scriptSrc` includes `'self'`, `https://cdn.shopify.com`, `https://static.cloudflareinsights.com`. Do not override without preserving these.
- **Contrast fix** was implemented in the earlier performance plan then reverted with "undo those changes." The same contrast fix is safe to re-apply; it does not affect fonts or layout.
- **Font preconnect, font-display swap, body visibility fallback** (f568106, c826ce4) – keep as-is.

---

## 3. Remediation items

### 3.1 Accessibility – color contrast (implement)

**Audit:** Background and foreground colors do not have a sufficient contrast ratio.

**Cause:** Text uses `text-bone/50` on `bg-charcoal` (#2d2d2d). Contrast 4.35; WCAG AA requires 4.5:1 for normal text.

**Failing elements (from report):**

- `div.max-w-7xl > div.grid > div.text-center > p.text-[9px]` – VALUES grid labels (e.g. "COLLECTION", "SHIPPING OVER $200", "PREMIUM FABRICS", "CUSTOMER SUPPORT") – 4 instances.
- `main > section.bg-charcoal > div.animate-marquee > span.text-bone/50` – marquee band (11px).

**File:** [app/routes/_index.jsx](../../app/routes/_index.jsx)

**Change:**

- For the VALUES grid labels (BrandValues section): change the `<p>` class from `text-bone/50` to `text-bone/60` (line ~291).
- For the MarqueeBand spans: change both `<span>` classes from `text-bone/50` to `text-bone/60` (lines ~189, ~192).

**Risk:** Low. Slight lightening of text; no layout or font loading impact.

**Do not change:** Other `text-bone/50` in the same file (e.g. line 149 hero label, line 327 BrandStory paragraph) unless they sit on `bg-charcoal` and fail contrast in a future run. The report only flagged the grid and marquee on charcoal.

---

### 3.2 SEO – robots.txt invalid (document only)

**Audit:** robots.txt is not valid – "Unknown directive" on line 29: `Content-Signal: search=yes,ai-train=no`.

**Cause:** The app's [app/routes/[robots.txt].jsx](../../app/routes/[robots.txt].jsx) does not emit this line. It is injected by the hosting/edge layer (e.g. Cloudflare or platform).

**Action:** No app code change. Document in [performance/README.md](../README.md) under a short "Known issues" or "Live / platform" section:

- On live, `robots.txt` may contain a platform-injected line (e.g. `Content-Signal: ...`) that Lighthouse flags as an unknown directive. Remediation is with the platform team (remove or move to a valid mechanism such as an HTTP header).

**Risk:** N/A.

---

### 3.3 Performance – render-blocking (do not change; optional doc)

**Audit:** Render blocking requests – est. savings ~350 ms (FCP/LCP). Blocking resources: `app-*.css`, `reset-*.css`.

**Constraint:** A previous attempt to make font loading non-blocking caused "some fonts from loading, just empty." Deferring or inlining app/reset CSS can cause FOUC or hydration issues if not tested carefully.

**Action:**

- **Do not** change how the main app or reset stylesheets are loaded (no async font link trick, no unconditional defer of app/reset CSS).
- **Optional:** In performance README, add one line under "Latest Status" or "Known opportunities": e.g. "Render-blocking: app and reset CSS contribute ~350 ms; reducing this would require critical-CSS or deferral with FOUC/hydration testing."

**Risk:** Any change to CSS loading without thorough testing: high (FOUC, empty fonts, hydration mismatch).

---

### 3.4 Performance – network dependency tree (informational)

**Audit:** network-dependency-tree-insight (score 0). Longest chain: document → app CSS (1128 ms) and document → reset CSS (922 ms). Preconnects for cdn.shopify.com, shop.app, fonts are present.

**Action:** No code change. Optional: in README, note that the main critical chain is HTML → app/reset CSS; improving it would tie into the same render-blocking/critical-CSS work above.

---

### 3.5 Documentation – performance README

**Add:**

1. **Run context:** One sentence that Lighthouse against the local dev server is not representative of production; for meaningful scores, run against a production build or the live/staging URL.
2. **Known issues (live/platform):** Short note on robots.txt platform-injected directive (see 3.2).
3. **Optional:** One line on render-blocking / dependency tree as a known opportunity (see 3.3, 3.4).

**Risk:** None.

---

## 4. Implementation order

1. **Accessibility:** In [app/routes/_index.jsx](../../app/routes/_index.jsx), change `text-bone/50` to `text-bone/60` for the VALUES grid label (one `<p>`) and for both MarqueeBand `<span>`s.
2. **Docs:** Update [performance/README.md](../README.md) with run context, robots.txt known issue, and optionally the render-blocking note.
3. **No code change** for robots.txt, render-blocking, or font loading.

---

## 5. Out of scope / explicit no-ops

- **Async font loading** – Do not re-add. Caused empty fonts; reverted.
- **CSP** – Already correct; do not change scriptSrc.
- **robots.txt app route** – Do not add or parse "Content-Signal"; it is not emitted by the app.
- **Defer/inline app or reset CSS** – Do not do without dedicated FOUC and hydration testing.

---

## 6. Verification

After implementing 4.1 and 4.2:

- Re-run Lighthouse on the live URL (or production build) and confirm color-contrast passes and accessibility score improves.
- Confirm no new console errors, no missing fonts, and no layout shift from the contrast change.
