import {useLoaderData, Link} from 'react-router';

/**
 * Password page for password-protected stores.
 * Displays a password form that submits to Shopify's password verification.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('return_to') || '/';
  
  return {
    storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    returnTo,
  };
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Enter Password | V☰RTEX'}];
};

export default function Password() {
  const {storeDomain, returnTo} = useLoaderData();

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
              Enter Store Password
            </h2>
            <p className="text-sm text-charcoal/70">
              This store is password protected
            </p>
          </div>

          {/* Password Form - submits to Shopify's password endpoint */}
          <form
            method="post"
            action={`https://${storeDomain}/password`}
            className="space-y-4"
          >
            <input type="hidden" name="return_to" value={returnTo} />
            
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-charcoal mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoFocus
                className="w-full px-4 py-3 border border-charcoal/20 rounded-md focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-transparent"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
            >
              ENTER
            </button>
          </form>

          {/* Back to shopping */}
          <div className="mt-8 pt-6 border-t border-charcoal/10 text-center">
            <Link
              to="/"
              className="text-sm text-charcoal/50 hover:text-charcoal transition-colors uppercase tracking-wider"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/password').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
