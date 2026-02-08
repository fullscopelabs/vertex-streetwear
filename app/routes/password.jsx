import {useLoaderData, Link} from 'react-router';

/**
 * Password page for password-protected stores.
 * Provides a seamless customer experience when checkout requires authentication.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const checkoutUrl = url.searchParams.get('checkout_url') || 
                      url.searchParams.get('return_to') ||
                      null;
  
  // Build direct checkout URL on Shopify domain if we have a checkout URL
  let directCheckoutUrl = null;
  if (checkoutUrl) {
    try {
      const checkoutUrlObj = new URL(checkoutUrl);
      directCheckoutUrl = `https://${context.env.PUBLIC_STORE_DOMAIN}${checkoutUrlObj.pathname}${checkoutUrlObj.search}`;
    } catch (e) {
      // Invalid URL, ignore
    }
  }
  
  return {
    storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    directCheckoutUrl,
  };
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Checkout | V☰RTEX'}];
};

export default function Password() {
  const {storeDomain, directCheckoutUrl} = useLoaderData();

  return (
    <div className="min-h-screen flex items-center justify-center texture-canvas px-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-charcoal mb-2">
              V☰RTEX
            </h1>
          </Link>
          <p className="text-sm uppercase tracking-widest text-charcoal/40">
            Contemporary Streetwear
          </p>
        </div>

        <div className="bg-white p-8 border border-charcoal/10">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-charcoal mb-3">
              Continue to Checkout
            </h2>
            <p className="text-sm text-charcoal/70">
              Complete your purchase securely on our checkout platform.
            </p>
          </div>

          {directCheckoutUrl ? (
            <div className="space-y-4">
              <a
                href={directCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full block text-center"
              >
                Proceed to Secure Checkout
              </a>
              
              <p className="text-xs text-charcoal/40 text-center">
                You'll be securely redirected to complete your order
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-charcoal/70 text-center">
                To complete your purchase, please visit our store directly:
              </p>
              
              <a
                href={`https://${storeDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full block text-center"
              >
                Visit Store
              </a>
            </div>
          )}

          {/* Back to shopping */}
          <div className="mt-8 pt-6 border-t border-charcoal/10 text-center">
            <Link
              to="/collections/all"
              className="text-sm text-charcoal/50 hover:text-charcoal transition-colors uppercase tracking-wider"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/password').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
