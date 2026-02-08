import {redirect} from 'react-router';

/**
 * Catch-all redirect for Shopify checkout URLs.
 * This handles any checkout URLs that match /checkouts/* pattern
 * and redirects them to the configured checkout domain.
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
  
  // Redirect to the Shopify checkout domain
  return redirect(checkoutUrl.toString(), {status: 307});
}

export default function Component() {
  return null;
}

/** @typedef {import('./+types/checkouts.$').Route} Route */
