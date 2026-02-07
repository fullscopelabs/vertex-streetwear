import {redirect} from 'react-router';

// fallback wild card for all unauthenticated routes in account section
/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  try {
    await context.customerAccount.handleAuthStatus();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      return redirect('/account/orders');
    }
    throw error;
  }

  return redirect('/account');
}

/** @typedef {import('./+types/account.$').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
