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
    <div className="min-h-screen texture-canvas page-fade-in">
      <div className="flex flex-col items-center justify-center min-h-screen section-padding">
        <div className="max-w-md w-full">
          {/* Brand */}
          <div className="text-center mb-16">
            <Link to="/" className="inline-block group">
              <span
                className="text-4xl md:text-5xl font-serif font-light text-charcoal group-hover:text-rust transition-colors duration-300"
                style={{letterSpacing: '0.15em'}}
              >
                V<span className="trigram">☰</span>RTEX
              </span>
            </Link>
          </div>

          {/* Divider */}
          <div className="divider-lux mx-auto mb-12" />

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-light text-charcoal mb-4">
              {isCheckout ? 'Continue to Checkout' : 'Store Access'}
            </h1>
            <p className="text-sm text-charcoal/50 leading-relaxed max-w-xs mx-auto">
              {isCheckout
                ? <>Enter the store password provided by <span style={{letterSpacing: '0.2em'}}>V<span className="trigram">☰</span>RTEX</span> to complete your purchase.</>
                : <>This <span style={{letterSpacing: '0.2em'}}>V<span className="trigram">☰</span>RTEX</span> store is password protected. Enter the store password to browse and shop.</>}
            </p>
          </div>

          {/* Password Form */}
          <form
            method="post"
            action={`https://${storeDomain}/password`}
            className="space-y-8"
          >
            {/* Required Shopify form fields */}
            <input type="hidden" name="form_type" value="storefront_password" />
            <input type="hidden" name="utf8" value="✓" />
            <input type="hidden" name="return_to" value={returnTo} />

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] uppercase tracking-[0.2em] text-charcoal/35 mb-3"
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
                className="w-full py-3 border-b border-charcoal/15 bg-transparent text-charcoal text-base placeholder:text-charcoal/25 focus:outline-none focus:border-charcoal/40 transition-colors duration-300"
                placeholder="Enter store password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
            >
              {isCheckout ? 'Proceed to Checkout' : 'Enter Store'}
            </button>
          </form>

          {/* Checkout note */}
          {isCheckout && (
            <p className="mt-6 text-[11px] text-charcoal/35 text-center leading-relaxed tracking-wide">
              Your cart is saved. You&apos;ll proceed directly to checkout once verified.
            </p>
          )}

          {/* Divider */}
          <div className="divider-lux mx-auto mt-12 mb-8" />

          {/* Back link */}
          <div className="text-center">
            <Link
              to="/"
              className="text-[11px] uppercase tracking-[0.15em] text-charcoal/40 hover:text-charcoal transition-colors duration-300"
            >
              &larr; Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/password').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
