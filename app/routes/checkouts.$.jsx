/**
 * Catch-all redirect for Shopify checkout URLs.
 * This handles any checkout URLs that match /checkouts/* pattern
 * and redirects them to the configured checkout domain.
 *
 * Sets a cookie with the checkout path so the password page can redirect
 * users back to checkout after authentication.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({request, params, context}) {
  const url = new URL(request.url);
  
  // Get the checkout domain from environment
  const checkoutDomain = context.env.PUBLIC_CHECKOUT_DOMAIN || 
                         context.env.PUBLIC_STORE_DOMAIN;
  
  if (!checkoutDomain) {
    throw new Response('Checkout domain not configured', {status: 500});
  }
  
  // Rebuild the checkout URL on the proper domain
  const checkoutUrl = new URL(url.pathname + url.search, `https://${checkoutDomain}`);
  const checkoutPath = url.pathname + url.search;
  
  // Store checkout path in cookie so password page can resume checkout after auth
  // HttpOnly: prevents XSS from reading the cookie via document.cookie
  // Secure: only sent over HTTPS
  // SameSite=Lax: prevents CSRF while allowing top-level navigations
  // Max-Age=600: expires after 10 minutes (checkout session window)
  return new Response(null, {
    status: 307,
    headers: {
      Location: checkoutUrl.toString(),
      'Set-Cookie': `checkout_return_to=${encodeURIComponent(checkoutPath)}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

export default function Component() {
  return null;
}

/** @typedef {import('./+types/checkouts.$').Route} Route */
