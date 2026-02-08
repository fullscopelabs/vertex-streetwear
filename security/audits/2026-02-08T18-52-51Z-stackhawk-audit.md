# StackHawk Security Audit Report

**Date:** February 8, 2026  
**Application:** Vertex Streetwear (Hydrogen Storefront)  
**Scan ID:** 7d8eda7c-616e-4c52-8657-09bb32e6f138  
**Platform:** <https://app.stackhawk.com/scans/7d8eda7c-616e-4c52-8657-09bb32e6f138>

---

## 📊 Executive Summary

**Total Findings:** 59 security issues  
**SARIF:** `../scans/2026-02-08T18-52-51Z-stackhawk.sarif`

### Vulnerability Breakdown

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 **High** | 10 | ⚠️ SQL Injection – requires triage |
| 🟠 **Medium** | 11 | ⚠️ Format string (10) + CORS (1) |
| 🟡 **Low** | 38 | ℹ️ Headers, CSP, cookies, info leak |

---

## 🚨 HIGH RISK FINDINGS (10 Issues)

### 1. SQL Injection

**Risk Level:** High  
**CWE:** CWE-89  
**WASC:** WASC-19  
**Count:** 10 affected endpoints

**Description:**  
SQL injection may be possible on parameterized or dynamic queries. StackHawk reports potential injection points that require verification (many are false positives on GraphQL or non-SQL backends).

**Impact:**

- Unauthorized data access or modification
- Potential full database compromise

**Remediation Priority:** HIGH

**Recommended Fix:**

- Confirm all data access uses parameterized queries or ORM
- Ensure no raw SQL is built from user input
- Re-run scan after fixes and triage remaining findings

**Reference:** <https://owasp.org/www-community/attacks/SQL_Injection>

---

## 🟠 MEDIUM RISK FINDINGS (11 Issues)

### 2. Format String Error

**Risk Level:** Medium  
**CWE:** CWE-134  
**Count:** 10 affected endpoints

**Description:**  
Format string errors occur when submitted input is evaluated as a format command by the application (e.g. `%n`, `%s` in query params).

**Affected Paths (examples):**

- Query parameter injection on routes/data endpoints
- `blogs/news.data?_routes=...` and similar

**Recommended Fix:**

- Implement strict input validation
- Sanitize/escape format specifiers in user input

---

### 3. Cross-Domain Misconfiguration

**Risk Level:** Medium  
**CWE:** CWE-264  
**Count:** 1

**Description:**  
CORS may allow cross-origin data loading. Verify allowed origins and methods in production.

---

## 🟡 LOW RISK FINDINGS (38 Issues)

### 4. X-Content-Type-Options Header Missing

**Risk Level:** Low  
**CWE:** CWE-693  
**Count:** 18+ endpoints

**Description:**  
Missing `X-Content-Type-Options: nosniff` allows MIME-sniffing in older browsers.

**Recommended Fix:** Add header in server/middleware:

```javascript
response.headers.set('X-Content-Type-Options', 'nosniff');
```

---

### 5. CSP Notices

**Risk Level:** Low  
**CWE:** CWE-693  
**Count:** 14+ pages

**Description:**  
Content Security Policy could be strengthened to mitigate XSS and injection.

---

### 6. Information Leak – Email Address

**Risk Level:** Low  
**CWE:** CWE-311  
**Count:** 11 pages

**Description:**  
Email addresses appear in responses (e.g. contact/policy pages). Often acceptable for public contact info; ensure no private customer emails are exposed.

---

### 7. Information Leak – IBAN

**Risk Level:** Low  
**CWE:** CWE-200  
**Count:** 10 pages

**Description:**  
Potential IBAN-like patterns detected (often false positives – e.g. product codes or locale strings). Verify no real IBANs are exposed.

---

### 8. Application Error Disclosure

**Risk Level:** Low  
**CWE:** CWE-200  
**Count:** 9

**Description:**  
Pages may expose error/warning messages or file paths. Ensure production hides stack traces and sensitive error details.

---

### 9. Cookie No HttpOnly Flag

**Risk Level:** Low  
**CWE:** CWE-1004  
**Count:** 2

**Description:**  
Some cookies may be accessible to JavaScript. Session cookies should use `httpOnly: true`.

---

### 10. Cookie without SameSite Attribute

**Risk Level:** Low  
**CWE:** CWE-1275  
**Count:** 1

**Description:**  
Cookie set without SameSite (e.g. on cart). Use `sameSite: 'lax'` or `'strict'` where appropriate.

---

### 11. Cross-Domain JavaScript Source File Inclusion

**Risk Level:** Low  
**Count:** 1

**Description:**  
Third-party script inclusion (e.g. Google Fonts). Acceptable for trusted CDNs; monitor and review regularly.

---

## ✅ POSITIVE FINDINGS

- No **Critical** vulnerabilities reported
- Session and auth configuration generally sound
- Many findings are informational or false positives (IBAN, email on policy pages)

---

## 🔗 LINKS

- **Full Scan Results:** <https://app.stackhawk.com/scans/7d8eda7c-616e-4c52-8657-09bb32e6f138>
- **SARIF Report:** `../scans/2026-02-08T18-52-51Z-stackhawk.sarif`

---

## ✅ NEXT STEPS

1. **Triage:** Confirm SQL injection findings (likely false positives on GraphQL/Hydrogen).
2. **Remediate:** Add security headers (X-Content-Type-Options, CSP) and format-string validation where applicable.
3. **Re-scan:** Run StackHawk again after changes and update this audit or add a remediation report.

**Next Scan Recommended:** After triage and remediation (1–2 weeks)
