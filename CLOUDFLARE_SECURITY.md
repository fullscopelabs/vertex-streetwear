# Cloudflare Pages Security Configuration

This guide shows how to configure additional security features in Cloudflare Pages for your Vertex Streetwear deployment.

---

## 🔥 Cloudflare WAF (Web Application Firewall)

### Enable WAF Rules

1. Go to **Cloudflare Dashboard** → Your site → **Security** → **WAF**
2. Enable the **OWASP Core Ruleset** (protects against common attacks)
3. Enable these managed rulesets:
   - **Cloudflare OWASP Core Ruleset**
   - **Cloudflare Managed Ruleset**
   - **Cloudflare Exposed Credentials Check**

---

## ⚡ Rate Limiting

### Account Routes Protection

Create rate limiting rules to prevent abuse:

#### Rule 1: Account Mutations (High Protection)

```text
Path: /account/*
Methods: POST, PUT, DELETE
Rate: 10 requests per minute per IP
Action: Block for 10 minutes
```

#### Rule 2: Account Page Views (Medium Protection)

```text
Path: /account/*
Methods: GET
Rate: 30 requests per minute per IP
Action: Challenge (CAPTCHA)
```

#### Rule 3: Login Endpoint (Critical Protection)

```text
Path: /account/authorize
Rate: 5 requests per 5 minutes per IP
Action: Block for 30 minutes
```

### Configuration Steps

1. Dashboard → **Security** → **WAF** → **Rate limiting rules**
2. Click **Create rule**
3. Set matching criteria (path, method)
4. Set rate (requests / period / IP)
5. Choose action (Block, Challenge, JS Challenge)

---

## 🔒 Security Headers

### Recommended Headers

Add these via Cloudflare **Transform Rules** → **HTTP Response Headers**:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Note**: Your app already sets a strong Content-Security-Policy via Hydrogen.

---

## 🤖 Bot Protection

### Enable Bot Fight Mode

1. Dashboard → **Security** → **Bots**
2. Enable **Bot Fight Mode** (free tier) or **Super Bot Fight Mode** (paid)
3. Configure:
   - ✅ Definitely automated
   - ✅ Verified bots (allow)
   - ⚠️ Likely automated (challenge)

### Challenge Pages

- `/account/*` → Definitely challenge suspicious traffic
- `/checkout/*` → High protection
- `/cart` → Medium protection

---

## 🌐 DDoS Protection

Cloudflare provides automatic DDoS protection at L3/L4 (network layer) and L7 (application layer).

### Additional Configuration

1. Dashboard → **Security** → **DDoS**
2. Enable **HTTP DDoS Attack Protection** (on by default)
3. Set sensitivity: **High** for account routes

---

## 📊 Security Analytics

### Monitor Attacks

1. Dashboard → **Security** → **Events**
2. Review blocked requests, challenges, rate limits
3. Set up **Email Alerts** for:
   - High spike in blocked requests
   - New attack patterns detected
   - Rate limit triggers

### Log Analysis

- Export security events to **Logpush** (paid feature)
- Integrate with SIEM tools (Splunk, Datadog, etc.)

---

## 🔐 Access Control

### Protect Sensitive Routes

Use **Cloudflare Access** (Zero Trust) to add an authentication layer before your app:

1. Dashboard → **Zero Trust** → **Access** → **Applications**
2. Create application for `your-store.pages.dev/admin/*` (if you add admin routes)
3. Require authentication (email OTP, Google OAuth, etc.)

---

## 🛡️ Advanced Security Features

### Paid Features (Pro/Business/Enterprise)

#### 1. **Advanced Rate Limiting**

- Per-session limits (not just per-IP)
- Burst handling (10 req/sec, 100 req/min)
- Custom rules by user agent, country, API endpoint

#### 2. **Page Shield** (Pro+)

- Detects malicious third-party scripts
- Alerts on suspicious JavaScript behavior
- Monitors for Magecart/supply chain attacks

#### 3. **WAF Custom Rules** (Pro+)

- Block specific attack patterns
- GeoIP blocking (e.g., block traffic from certain countries)
- Custom regex matching on request body

#### 4. **Advanced DDoS** (Enterprise)

- Adaptive rate limiting
- Custom thresholds per endpoint
- Real-time attack mitigation

---

## ⚙️ Configuration Checklist

### Essential (Free Tier)

- [ ] Enable WAF OWASP Core Ruleset
- [ ] Enable Cloudflare Managed Ruleset
- [ ] Create rate limiting rule for `/account/*` (10 req/min)
- [ ] Enable Bot Fight Mode
- [ ] Add security headers via Transform Rules
- [ ] Set up email alerts for security events

### Recommended (Pro Tier)

- [ ] Enable Page Shield
- [ ] Create custom WAF rules for your API
- [ ] Advanced rate limiting with burst control
- [ ] Enable Argo Smart Routing (performance + security)

---

## 🧪 Testing Your Configuration

### 1. Rate Limiting Test

```bash
# Send 20 rapid requests to account endpoint
for i in {1..20}; do
  curl https://your-store.pages.dev/account/orders
done
# Expected: First 10 succeed, next 10 get rate limited
```

### 2. XSS Test

Try submitting `<script>alert('xss')</script>` in form fields → Should be stripped

### 3. CSRF Test

```bash
# Try POST from different origin
curl -X POST https://your-store.pages.dev/account/profile \
  -H "Origin: https://evil.com" \
  -d "firstName=Hacker"
# Expected: Blocked by CORS/SameSite
```

### 4. Bot Test

Use automated tools (Selenium, Puppeteer) → Should be challenged

---

## 📞 Support

**Cloudflare Support:**

- Free: Community forums
- Pro: Email support (24–48h)
- Business: Chat support (8h response)
- Enterprise: 24/7 phone support

**Documentation:**

- <https://developers.cloudflare.com/fundamentals/security/>
- <https://developers.cloudflare.com/waf/>
- <https://developers.cloudflare.com/ddos-protection/>

---

**Configuration Difficulty:** ⭐⭐ (Intermediate)  
**Estimated Time:** 30–60 minutes  
**Impact:** 🔥🔥🔥🔥🔥 Critical
