import {useLoaderData, Link} from 'react-router';

/**
 * Allowed path prefixes for return_to values.
 * Only these paths are considered valid redirect targets after authentication.
 * This prevents open redirect attacks via cookie or query param manipulation.
 */
const ALLOWED_RETURN_PATHS = [
  '/checkouts/',
  '/cart/c/',
  '/collections/',
  '/products/',
  '/account',
];

/**
 * Validates and sanitizes a return URL to prevent open redirect attacks.
 * Only allows relative paths matching known safe prefixes.
 *
 * @param {string|null} value - The raw return URL value
 * @returns {string|null} - Sanitized relative path or null if invalid
 */
function sanitizeReturnTo(value) {
  if (!value || typeof value !== 'string') return null;

  let decoded;
  try {
    decoded = decodeURIComponent(value.trim());
  } catch {
    return null;
  }

  // Block absolute URLs, protocol-relative URLs, and data URIs
  if (
    decoded.includes('://') ||
    decoded.startsWith('//') ||
    decoded.startsWith('data:') ||
    decoded.startsWith('javascript:') ||
    decoded.includes('\\')
  ) {
    return null;
  }

  // Must start with /
  if (!decoded.startsWith('/')) return null;

  // Must match an allowed path prefix
  const isAllowed = ALLOWED_RETURN_PATHS.some((prefix) =>
    decoded.startsWith(prefix),
  );

  return isAllowed ? decoded : null;
}

/**
 * Password page for password-protected stores.
 * Reads checkout URL from cookie (set by checkout redirect routes) so users
 * are sent directly to checkout after successful authentication.
 *
 * Security measures:
 * - Cookie is HttpOnly + Secure + SameSite=Lax (set by checkout routes)
 * - return_to values are validated against an allowlist of safe path prefixes
 * - Absolute URLs, protocol-relative URLs, and data URIs are blocked
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);

  // Read checkout return URL from cookie (set by checkout redirect routes)
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookieMatch = cookieHeader.match(/checkout_return_to=([^;]*)/);
  const rawCookieValue = cookieMatch ? cookieMatch[1] : null;

  // Validate all potential return_to sources against allowlist
  const returnTo =
    sanitizeReturnTo(rawCookieValue) ||
    sanitizeReturnTo(url.searchParams.get('return_to')) ||
    sanitizeReturnTo(url.searchParams.get('checkout_url')) ||
    '/';

  const isCheckout =
    returnTo.startsWith('/checkouts/') || returnTo.startsWith('/cart/c/');

  return {
    storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    returnTo,
    isCheckout,
  };
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Enter Password | V☰RTEX'}];
};

export default function Password() {
  const {storeDomain, returnTo, isCheckout} = useLoaderData();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90 px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block group">
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight group-hover:opacity-80 transition-opacity">
              V☰RTEX
            </h1>
          </Link>
          <p className="text-sm uppercase tracking-widest text-white/50 font-medium">
            Contemporary Streetwear
          </p>
        </div>

        {/* Password Card */}
        <div className="bg-white/95 backdrop-blur-sm p-10 shadow-2xl border border-white/20">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-charcoal/5 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-charcoal"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">
              {isCheckout ? 'Complete Your Purchase' : 'Enter Store'}
            </h2>
            <p className="text-sm text-charcoal/60">
              {isCheckout
                ? 'Enter password to proceed to secure checkout'
                : 'This store is password protected'}
            </p>
          </div>

          {/* Password Form - submits to Shopify's password endpoint */}
          <form
            method="post"
            action={`https://${storeDomain}/password`}
            className="space-y-6"
          >
            {/* Required Shopify form fields */}
            <input type="hidden" name="form_type" value="storefront_password" />
            <input type="hidden" name="utf8" value="✓" />
            <input type="hidden" name="return_to" value={returnTo} />

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-charcoal mb-3 uppercase tracking-wider"
              >
                Store Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoFocus
                autoComplete="current-password"
                className="w-full px-5 py-4 text-lg border-2 border-charcoal/20 rounded-sm focus:outline-none focus:ring-0 focus:border-charcoal transition-colors bg-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-lg py-4 hover:bg-charcoal/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isCheckout ? 'PROCEED TO CHECKOUT' : 'UNLOCK STORE'}
            </button>
          </form>

          {/* Info message for checkout */}
          {isCheckout && (
            <div className="mt-6 p-4 bg-charcoal/5 rounded-md">
              <p className="text-xs text-charcoal/60 text-center leading-relaxed">
                Your cart is secure. After authentication, you'll be directed
                straight to checkout to complete your order.
              </p>
            </div>
          )}

          {/* Back to shopping */}
          <div className="mt-8 pt-6 border-t border-charcoal/10 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-charcoal/60 hover:text-charcoal transition-colors uppercase tracking-wider font-medium"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Store
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/40 uppercase tracking-widest">
            Secured by Shopify
          </p>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/password').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
