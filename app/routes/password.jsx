import {useLoaderData, Link, useSearchParams} from 'react-router';

/**
 * Password page for password-protected stores.
 * Displays a password form that submits to Shopify's password verification.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  
  // Get return URL - preserve checkout URLs
  const returnTo = url.searchParams.get('return_to') || 
                   url.searchParams.get('checkout_url') || 
                   url.pathname.includes('checkout') ? url.pathname + url.search : '/';
  
  // Check if this is an error redirect (wrong password)
  const error = url.searchParams.get('error');
  
  return {
    storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    returnTo,
    error: error === 'password' ? 'Incorrect password. Please try again.' : null,
  };
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Enter Password | V☰RTEX'}];
};

export default function Password() {
  const {storeDomain, returnTo, error} = useLoaderData();
  const [searchParams] = useSearchParams();
  
  // Determine if user is trying to checkout
  const isCheckout = returnTo.includes('checkout') || returnTo.includes('cart');

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
              <svg className="w-8 h-8 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">
              {isCheckout ? 'Complete Your Purchase' : 'Enter Store'}
            </h2>
            <p className="text-sm text-charcoal/60">
              {isCheckout 
                ? 'Enter password to proceed to secure checkout'
                : 'This store is password protected'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Password Form - submits to Shopify's password endpoint */}
          <form
            method="post"
            action={`https://${storeDomain}/password`}
            className="space-y-6"
          >
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
                Your cart is secure. After authentication, you'll be directed straight to checkout to complete your order.
              </p>
            </div>
          )}

          {/* Back to shopping */}
          <div className="mt-8 pt-6 border-t border-charcoal/10 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-charcoal/60 hover:text-charcoal transition-colors uppercase tracking-wider font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
