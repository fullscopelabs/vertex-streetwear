# Security Documentation

## Overview

This document outlines the security measures implemented in the Vertex Streetwear storefront application, following OWASP Top 10 guidelines and industry best practices.

---

## 🔐 Authentication & Authorization

### Implementation
- **OAuth 2.0 + PKCE** via Shopify Customer Account API
- Session-based authentication with signed, HTTPOnly cookies
- All account routes protected with `customerAccount.handleAuthStatus()`
- Server-side authentication checks before any data access
- Explicit `isLoggedIn()` verification before mutations

### Session Security
- **HTTPOnly**: `true` (prevents XSS cookie theft)
- **SameSite**: `lax` (CSRF protection)
- **Secure**: `true` in production (HTTPS-only)
- **Signed cookies**: Uses `SESSION_SECRET` for tamper detection
- **Short-lived tokens**: Shopify handles token refresh automatically

### Preview Mode
- Mock data only available in `NODE_ENV=development`
- Never bypasses authentication in production
- Warning banner displayed when active

---

## 🛡️ Input Validation & Sanitization

### Defense-in-Depth Approach
All user input passes through **three layers** of validation:

#### Layer 1: Client-Side (HTML5)
- `required`, `minLength`, `maxLength` attributes
- `pattern` validation with browser-compatible regex
- `title` attributes with user-friendly error messages
- Visual feedback with `invalid:border-rust/40` styling
- `autocomplete` attributes for autofill security

#### Layer 2: Server-Side Sanitization
**Module**: `app/lib/validation.js`

All inputs sanitized via `sanitizeText()`:
- Strips HTML tags (`<script>`, `<img>`, etc.)
- Removes HTML entities (`&amp;`, `&#123;`)
- Removes control characters (0x00–0x1F, 0x7F)
- Trims whitespace
- Collapses consecutive whitespace
- Enforces maximum length per field

#### Layer 3: Server-Side Validation
Field-specific validators:
- **Names**: 1–50 chars, letters + spaces/hyphens/apostrophes/periods, no excessive consecutive special chars
- **Company**: 0–100 chars, business-safe punctuation
- **Address lines**: 1–200 chars, all printable characters
- **City**: 1–100 chars, letters + spaces/hyphens/periods
- **State/Province**: 1–10 alphanumeric
- **Zip/Postal**: 2–12 chars, alphanumeric + spaces/hyphens
- **Country**: Exactly 2 letters, ISO 3166-1 alpha-2, auto-uppercased
- **Phone**: 7–15 digits, E.164 normalization, optional field

### Whitespace Protection
All required fields reject whitespace-only input (e.g., "   ").

---

## 🚫 Injection Attack Prevention

### GraphQL Injection
- ✅ **Parameterized queries only** — never string concatenation
- ✅ All variables passed via GraphQL `variables` object
- ✅ Shopify API provides additional query sanitization
- ✅ Order search: `sanitizeFilterValue()` strips unsafe characters

**Example (SECURE):**
```javascript
await customerAccount.mutate(UPDATE_ADDRESS_MUTATION, {
  variables: { address }  // ✅ Parameterized
});
```

**Anti-pattern (NOT USED):**
```javascript
`mutation { update(name: "${userInput}") }`  // ❌ Never do this
```

### XSS Prevention
- ✅ React Router auto-escapes all dynamic content
- ✅ No `dangerouslySetInnerHTML` anywhere
- ✅ HTML tag stripping in `sanitizeText()`
- ✅ All error messages rendered via React (auto-escaped)
- ✅ User input is string-only (no object injection)

---

## 🛡️ CSRF Protection

### Built-in Protections
- ✅ React Router same-origin policy enforcement
- ✅ Session cookies with `SameSite=lax`
- ✅ All mutations use POST/PUT/DELETE (never GET)
- ✅ Forms require valid session tokens

### Form Security
- All forms use React Router `<Form>` component
- Automatic CSRF token injection by framework
- Server validates session before processing mutations

---

## 🔒 Secure Session Management

### Cookie Configuration
```javascript
{
  name: 'session',
  httpOnly: true,      // Prevents JavaScript access
  path: '/',
  sameSite: 'lax',     // CSRF protection
  secrets: [SECRET],   // Cookie signing (tamper detection)
  secure: true,        // HTTPS-only in production
}
```

### Session Lifecycle
- Short-lived sessions (managed by Shopify)
- Automatic token refresh on expiry
- Secure logout with session destruction
- No sensitive data stored in cookies (only session ID)

---

## 🚨 Error Handling & Information Disclosure

### Production Hardening
- Generic error messages returned to client in production
- Detailed errors logged server-side only
- No stack traces exposed to users
- Shopify API errors wrapped in generic messages
- Development mode: detailed errors for debugging

**Example:**
```javascript
// Production: "Unable to update profile. Please try again or contact support."
// Development: "Customer not found (error code: UNAUTHORIZED)"
```

### Logging
All errors logged with context:
```javascript
console.error('[account.profile] Action error:', error);
```

---

## ⚡ DoS & Abuse Prevention

### Request Throttling
- **Order search**: 300ms debounce prevents rapid-fire submissions
- **FormData size limits**: Max 10–15 fields per form (prevents memory exhaustion)
- **Field length caps**: All inputs capped at reasonable limits

### Cloudflare Protection (Edge-Level)
Your deployment on Cloudflare Pages provides additional protections:
- DDoS mitigation at the edge
- Rate limiting (configurable)
- Bot detection
- IP reputation filtering
- WAF (Web Application Firewall)

### Recommendations
1. **Enable Cloudflare rate limiting rules**:
   - Limit `/account/*` routes to 30 requests/minute per IP
   - Limit mutations to 10/minute per session
2. **Add CAPTCHA** for repeated failed login attempts (Shopify handles this)

---

## 🌐 Transport Security

### HTTPS Enforcement
- ✅ Production cookies set with `secure: true` flag
- ✅ Shopify Customer Account API requires HTTPS
- ✅ OAuth callbacks require HTTPS
- ✅ Development bypasses for local testing only

### Content Security Policy
Configured in `app/root.jsx` via Hydrogen's `createContentSecurityPolicy`:
- Restricts script sources
- Prevents inline scripts (nonce-based)
- Blocks mixed content (HTTP on HTTPS pages)

---

## 📋 Security Checklist

### ✅ Implemented
- [x] OAuth 2.0 + PKCE authentication
- [x] Session-based auth with HTTPOnly, Secure, SameSite cookies
- [x] Comprehensive input validation (client + server)
- [x] HTML/entity/control character stripping
- [x] XSS prevention via React auto-escaping
- [x] GraphQL parameterized queries (injection prevention)
- [x] CSRF protection via SameSite cookies
- [x] Generic error messages in production
- [x] Server-side error logging
- [x] Request debouncing (search forms)
- [x] FormData size limits
- [x] Field length caps
- [x] Whitespace-only input rejection
- [x] Pattern validation (names, emails, phones, addresses)
- [x] E.164 phone normalization
- [x] ISO 3166-1 country code validation

### 🔄 Recommended (Cloudflare Configuration)
- [ ] Enable rate limiting (30 req/min per IP for `/account/*`)
- [ ] Configure WAF rules for common attack patterns
- [ ] Enable Bot Fight Mode
- [ ] Set up security headers (HSTS, X-Frame-Options, etc.)

### 🔄 Future Enhancements
- [ ] Add CAPTCHA for sensitive operations
- [ ] Implement IP-based rate limiting in application layer
- [ ] Add audit logging for security events
- [ ] Consider 2FA for high-value accounts

---

## 🔍 Testing

### Manual Security Testing
1. **XSS**: Try submitting `<script>alert('xss')</script>` in all form fields → Should be stripped
2. **SQL Injection**: Try `'; DROP TABLE--` → Should be sanitized
3. **CSRF**: Try form submission from different origin → Should be blocked
4. **Auth bypass**: Try accessing `/account/*` without login → Should redirect
5. **Input overflow**: Try 1000-character strings → Should be capped
6. **Whitespace**: Try "   " in required fields → Should be rejected

### Automated Testing
- Use OWASP ZAP or Burp Suite for comprehensive scanning
- Run `npm audit` regularly for dependency vulnerabilities
- Monitor Shopify security advisories

---

## 📞 Security Contacts

**Report Security Issues:**
- **Internal**: Contact your security team
- **Shopify API**: https://shopify.com/security
- **Dependencies**: Use `npm audit` or Dependabot

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Shopify Customer Account API Security](https://shopify.dev/docs/api/customer)
- [React Security Best Practices](https://react.dev/learn/react-developer-tools)
- [Cloudflare Security](https://developers.cloudflare.com/fundamentals/security/)

---

**Last Updated:** 2026-02-07  
**Version:** 1.0.0  
**Status:** Production-Ready ✅
