# Performance Documentation

## Overview

Performance audits, Lighthouse reports, and score history for Vertex Streetwear application.

---

## 📊 Latest Status

| Metric | Status |
|--------|--------|
| **Performance** | — |
| **Accessibility** | — |
| **Best Practices** | — |
| **SEO** | — |
| **Last Run** | — |
| **Next Run** | As needed / before releases |

---

## 📁 Folder Structure

```text
performance/
├── README.md                                           # This file
│
├── plans/                                               # Remediation plans per report
│   └── YYYY-MM-DDTHH-MM-SSZ-*-remediation.md            # e.g. 2026-02-08T16-19-36Z-vertex-live-remediation.md
│
├── reports/                                             # Lighthouse JSON & HTML
│   └── [hostname]-YYYYMMDDTHHMMSS.json                 # Full report artifacts
│
└── scores/                                              # Extracted scores & summaries
    └── YYYY-MM-DDTHH-MM-SSZ-scores.json                # Optional score-only snapshot
```

---

## 📝 File Naming Convention

All files use **ISO 8601** timestamps (UTC).

### Plans

Remediation plans for specific Lighthouse runs live in `plans/`. Name format: `YYYY-MM-DDTHH-MM-SSZ-{context}-remediation.md` (ISO 8601 timestamp + context; e.g. `2026-02-08T16-19-36Z-vertex-live-remediation.md`).

### Reports

**Format:** `[hostname]-YYYYMMDDTHHMMSS.json` or `YYYY-MM-DDTHH-MM-SSZ-lighthouse.[json|html]`

- Example: `2026-02-08T20-00-00Z-lighthouse.json`
- Example: `2026-02-08T20-00-00Z-lighthouse.html`

### Scores

**Format:** `YYYY-MM-DDTHH-MM-SSZ-scores.json`

- Example: `2026-02-08T20-00-00Z-scores.json` (optional; for trend tracking)

---

## 🔄 Running Lighthouse

**Run context:** A Lighthouse run against the **local dev server** is not representative of production (unminified bundles, HMR). For meaningful performance scores, run against a **production build** (e.g. `npm run build && npm run preview`) or the **live/staging** URL.

### Option 1: Chrome DevTools

1. Open the site in Chrome.
2. **DevTools** → **Lighthouse** tab.
3. Select categories (Performance, Accessibility, Best Practices, SEO).
4. Run and **Save report** (HTML) or use **Export**; move to `performance/reports/` with the naming convention above.

### Option 2: Node CLI (recommended for saving to this folder)

```bash
# Install Lighthouse (global or npx)
npx lighthouse https://localhost:3000 --output=json --output=html \
  --output-path=./performance/reports/$(date -u +%Y-%m-%dT%H-%M-%SZ)-lighthouse \
  --chrome-flags="--headless" --no-enable-error-reporting
```

Ensure the app is running (`npm run dev`) when targeting localhost.

### Option 3: Lighthouse CI (optional)

For CI/CD, use [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) and configure `lighthouserc.js` to write artifacts into `performance/reports/`.

---

## 📦 Version Control

### Committed to Git

✅ `performance/README.md`  
✅ `performance/plans/*.md` (remediation plans)  
✅ `performance/reports/*.json` (compact; good for diffing)  
✅ `performance/scores/*.json` (if used)

### Optional: Ignore in .gitignore

❌ `performance/reports/*.html` (large; add to `.gitignore` if you prefer not to commit HTML)

---

## ⚠️ Known issues (live / platform)

- **robots.txt invalid (SEO):** On the live site, `robots.txt` may contain a platform-injected line (e.g. `Content-Signal: search=yes,ai-train=no`) that Lighthouse flags as an "Unknown directive." The app does not emit this; remediation is with the platform team.
- **Render-blocking:** App and reset CSS contribute to render-blocking time (~350 ms in recent runs). Reducing this further would require critical-CSS or deferral with FOUC/hydration testing.

---

## 🎯 Quick Links

- **Lighthouse docs:** [web.dev/lighthouse](https://web.dev/lighthouse/)
- **Lighthouse CI:** [GitHub](https://github.com/GoogleChrome/lighthouse-ci)

---

**Last Updated:** 2026-02-08  
**Maintained By:** Dev Team
