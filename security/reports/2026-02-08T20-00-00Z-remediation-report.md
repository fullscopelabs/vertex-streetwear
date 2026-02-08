# StackHawk SARIF Remediation Report – February 8, 2026

## Overview

This report documents fixes and triage applied after the StackHawk scan and audit dated **2026-02-08T18-52-51Z** (59 findings). Implementation follows the plan derived from [security/scans/2026-02-08T18-52-51Z-stackhawk.sarif](../scans/2026-02-08T18-52-51Z-stackhawk.sarif) and [security/audits/2026-02-08T18-52-51Z-stackhawk-audit.md](../audits/2026-02-08T18-52-51Z-stackhawk-audit.md).

---

## Implemented Fixes

### 1. Security headers on every response path (LOW – X-Content-Type-Options, etc.)

**Issue:** X-Content-Type-Options (and related headers) missing on some responses.  
**Status:** Fixed

**Changes:**

- **server.js**
  - Introduced `applySecurityHeaders(response)` and call it for the main SSR response and for the response returned by `storefrontRedirect(...)` so 404/redirect responses also get the same four headers.
- **scripts/build-worker.js**
  - For Cloudflare Pages, static assets served via `env.ASSETS.fetch()` now get security headers: the asset response is cloned and `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy` are set on the clone before return.

**Impact:** All response paths (SSR, redirects, static assets in production) now send consistent security headers.

---

### 2. Request-level URL sanitization (MEDIUM – Format String)

**Issue:** Format string findings on URL query parameters (e.g. `_routes`, `q`, `__manifest`, address params).  
**Status:** Fixed

**Changes:**

- **server.js**
  - Added `sanitizeRequestUrl(request)` that parses the request URL, sanitizes each query parameter key and value with `sanitizeFormatString()` from `~/lib/sanitize`, applies a length cap, and builds a new `Request` with the sanitized URL.
  - The sanitized request is used for both `createHydrogenRouterContext` and `handleRequest`, so all routes (including `.data` and `__manifest`) receive sanitized query params.

**Impact:** Reduces format-string reflection and scanner findings; form/validation sanitization remains in place for defense in depth.

---

### 3. API proxy hardening (MEDIUM – CORS; LOW – Cookie)

**Issue:** Cross-Domain Misconfiguration at `api/unstable/graphql.json`; cookie/headers forwarded from Shopify.  
**Status:** Fixed

**Changes:**

- **app/routes/api.$version.[graphql.json].jsx**
  - Proxied response is no longer returned with Shopify headers as-is. A new `Headers` instance is built from the proxied response, then:
    - Security headers are set: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
    - CORS is restricted: `Access-Control-Allow-Origin` is set only to the request’s `Origin` when present (same-origin storefront).
    - `Set-Cookie` is not forwarded, avoiding cookie-attribute findings from the upstream response.

**Impact:** GraphQL proxy responses are locked down and no longer forward potentially insecure cookies.

---

### 4. Application error disclosure (LOW)

**Issue:** Error pages may expose internal error messages or details.  
**Status:** Fixed

**Changes:**

- **app/root.jsx**
  - In `ErrorBoundary`, after computing `errorStatus` and `errorMessage`, if `errorStatus === 500` and `process.env.NODE_ENV !== 'development'`, `errorMessage` is set to `'An unexpected error occurred'` so production 500 pages never show server-side error text.

**Impact:** Production 500 responses no longer expose internal messages.

---

## Triage only (no code change)

| Finding                      | Count | Action                                                                                                               |
| ---------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------- |
| **SQL Injection (CWE-89)**   | 10    | False positive. App uses Shopify GraphQL only; no raw SQL. Document in audit/report; optionally triage in StackHawk. |
| **Information Leak – Email** | 11    | Accepted. Public contact/policy emails; no change.                                                                   |
| **Information Leak – IBAN**  | 10    | False positive. Product codes/locale strings; no change.                                                             |
| **CSP Notices**              | 14    | No change. CSP already set in `app/entry.server.jsx` via Hydrogen.                                                   |
| **Cross-Domain JavaScript**  | 1     | Accepted. Trusted CDN (e.g. Google Fonts); no change.                                                                |
| **Cookie (session)**         | –     | Verified. `app/lib/session.js` already uses `httpOnly`, `sameSite: 'lax'`, `secure` in production.                   |

---

## Files modified

| File                                         | Change                                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `server.js`                                  | `applySecurityHeaders()`; `sanitizeRequestUrl()`; headers on redirect; use sanitized request for context and handler. |
| `scripts/build-worker.js`                    | Apply security headers to asset response clone before return.                                                         |
| `app/routes/api.$version.[graphql.json].jsx` | Security headers and CORS on proxied response; do not forward `Set-Cookie`.                                           |
| `app/root.jsx`                               | ErrorBoundary: generic `errorMessage` for 500 in production.                                                          |

---

## Verification

1. **Build and smoke:** Run production build and verify home, product, cart, account, and API proxy.
2. **Re-scan:** Run StackHawk against production (or production-like) build to confirm reduction in X-Content-Type-Options, Format String, CORS, Application Error Disclosure, and cookie findings.
3. **Code review:** Run kluster code verification on all modified files per workspace rules.

---

## References

- **SARIF:** `security/scans/2026-02-08T18-52-51Z-stackhawk.sarif`
- **Audit:** `security/audits/2026-02-08T18-52-51Z-stackhawk-audit.md`
- **Scan:** <https://app.stackhawk.com/scans/7d8eda7c-616e-4c52-8657-09bb32e6f138>

---

**Last updated:** February 8, 2026
