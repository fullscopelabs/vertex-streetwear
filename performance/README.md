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
├── reports/                                             # Lighthouse JSON & HTML
│   └── YYYY-MM-DDTHH-MM-SSZ-lighthouse.[json|html]     # Full report artifacts
│
└── scores/                                              # Extracted scores & summaries
    └── YYYY-MM-DDTHH-MM-SSZ-scores.json                # Optional score-only snapshot
```

---

## 📝 File Naming Convention

All files use **ISO 8601** timestamps (UTC).

### Reports

**Format:** `YYYY-MM-DDTHH-MM-SSZ-lighthouse.[json|html]`

- Example: `2026-02-08T20-00-00Z-lighthouse.json`
- Example: `2026-02-08T20-00-00Z-lighthouse.html`

### Scores

**Format:** `YYYY-MM-DDTHH-MM-SSZ-scores.json`

- Example: `2026-02-08T20-00-00Z-scores.json` (optional; for trend tracking)

---

## 🔄 Running Lighthouse

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
✅ `performance/reports/*.json` (compact; good for diffing)  
✅ `performance/scores/*.json` (if used)

### Optional: Ignore in .gitignore

❌ `performance/reports/*.html` (large; add to `.gitignore` if you prefer not to commit HTML)

---

## 🎯 Quick Links

- **Lighthouse docs:** [web.dev/lighthouse](https://web.dev/lighthouse/)
- **Lighthouse CI:** [GitHub](https://github.com/GoogleChrome/lighthouse-ci)

---

**Last Updated:** 2026-02-08  
**Maintained By:** Dev Team
