import {redirect} from 'react-router';

/**
 * Redirect Shopify checkout URLs to the configured checkout domain.
 * This handles URLs like /checkouts/cn/[cartId]/[locale]?... that are generated
 * by Shopify's managed checkout system.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({request, params, context}) {
  const {cartId, locale} = params;
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

/** @typedef {import('./+types/checkouts.cn.$cartId.$locale').Route} Route */
