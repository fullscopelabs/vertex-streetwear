# Security Documentation

## Overview
Security audits, scan results, and remediation reports for Vertex Streetwear application.

---

## 📊 Latest Status

| Metric | Status |
|--------|--------|
| **Security Grade** | A (Excellent) |
| **Critical Issues** | 0 |
| **High Issues** | 0 |
| **Medium Issues** | 0 |
| **Low Issues** | 4 (accepted) |
| **Last Audit** | 2026-02-07T23:38:44Z |
| **Next Audit** | 2026-02-21 (recommended) |

---

## 📁 Folder Structure

```
security/
├── README.md                                        # This file
│
├── audits/                                          # Security audit reports
│   └── 2026-02-07T23-38-44Z-stackhawk-audit.md     # StackHawk DAST audit
│
├── reports/                                         # Remediation & compliance
│   └── 2026-02-08T00-46-00Z-remediation-report.md  # Fix documentation
│
└── scans/                                           # Raw scan outputs
    ├── 2026-02-07T23-38-44Z-stackhawk-scan-1.log   # First scan (gitignored)
    └── 2026-02-08T00-39-59Z-stackhawk.sarif        # Latest SARIF
```

---

## 🔍 Recent Audits

### 2026-02-07T23:38:44Z - StackHawk DAST Audit
- **Tool:** StackHawk v5.2.0
- **Type:** Dynamic Application Security Testing
- **Coverage:** 212 URLs, OWASP Top 10
- **Duration:** ~21 minutes
- **Result:** All critical/high/medium issues resolved
- **Files:**
  - Audit: `audits/2026-02-07T23-38-44Z-stackhawk-audit.md`
  - Remediation: `reports/2026-02-08T00-46-00Z-remediation-report.md`
  - SARIF: `scans/2026-02-08T00-39-59Z-stackhawk.sarif`

---

## 📈 Scan History

| Date | Tool | URLs | Findings | Status |
|------|------|------|----------|--------|
| 2026-02-08T00:39:59Z | StackHawk | 212 | 59 → 4 | ✅ Fixed |
| 2026-02-07T23:38:44Z | StackHawk | 144 | 71 | ✅ Fixed |

---

## 📝 File Naming Convention

All files follow **ISO 8601** format with timestamps:

### Audits
**Format:** `YYYY-MM-DDTHH-MM-SSZ-[tool]-audit.md`
- Example: `2026-02-07T23-38-44Z-stackhawk-audit.md`

### Reports
**Format:** `YYYY-MM-DDTHH-MM-SSZ-[type]-report.md`
- Example: `2026-02-08T00-46-00Z-remediation-report.md`

### Scans
**Format:** `YYYY-MM-DDTHH-MM-SSZ-[tool]-[type].[ext]`
- Example: `2026-02-08T00-39-59Z-stackhawk.sarif`
- Logs: `.log` files (gitignored, 3.8 MB each)
- SARIF: `.sarif` files (committed, 69 KB)

---

## 🔄 Running Scans

### StackHawk DAST
```bash
# Ensure app is running on localhost:3000
npm run dev

# Run scan (separate terminal)
hawk scan stackhawk.yml --sarif-artifact
```

### Results Location
- Logs: `security/scans/YYYY-MM-DDTHH-MM-SSZ-stackhawk-scan-N.log`
- SARIF: `security/scans/YYYY-MM-DDTHH-MM-SSZ-stackhawk.sarif`

---

## 📦 Version Control

### Committed to Git
✅ `security/README.md`  
✅ `security/audits/*.md`  
✅ `security/reports/*.md`  
✅ `security/scans/*.sarif`

### Ignored (via .gitignore)
❌ `security/scans/*.log` (large scan logs)  
❌ `security/scans/*summary.txt` (redundant)

### Storage Size
- **Total:** 3.9 MB (mostly logs)
- **In Git:** ~100 KB (docs + SARIF only)

---

## 🎯 Quick Links

- **Configuration:** `../stackhawk.yml`
- **Latest Scan:** [StackHawk Platform](https://app.stackhawk.com/scans/dee5c01a-e117-454e-b229-1abed47be5c8)
- **Security Policy:** `../SECURITY.md`

---

**Last Updated:** 2026-02-08T00:46:00Z  
**Maintained By:** Security Team
