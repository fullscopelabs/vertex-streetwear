import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import {Layout as PageLayout} from './components/Layout';
import {ErrorPage, getErrorDetails} from './components/ErrorPage';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'preconnect', href: 'https://shop.app'},
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const criticalData = await loadCriticalData(args);
  const {storefront, env} = args.context;

  return {
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering the shell. Cart and footer are awaited here
 * (not deferred) to avoid Suspense boundaries in the shell, which prevents
 * "Suspense boundary received an update before it finished hydrating" when
 * the user refreshes or navigates quickly. Trade-off: TTFB may increase
 * slightly; stability under rapid refresh/navigation is preferred.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const {storefront, customerAccount, cart} = context;

  const footerPromise = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer',
      },
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  const [header, cartData, footerData, isLoggedIn] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu',
      },
    }),
    cart.get(),
    footerPromise,
    Promise.resolve(customerAccount.isLoggedIn()),
  ]);

  return {
    header,
    cart: cartData,
    footer: footerData,
    isLoggedIn: Boolean(isLoggedIn),
  };
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();

  return (
    <html lang="en" style={{backgroundColor: '#F2EFE9'}}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#F2EFE9" />
        <meta name="color-scheme" content="light" />
        {/* Hide body until app.css loads and sets opacity:1.
            The html background-color is set as an element attribute above
            so the page is bone from the very first byte — never white.
            Fallback: if app.css is slow or blocked, reveal body on DOMContentLoaded
            so content and fonts are never stuck invisible. */}
        <style
          nonce={nonce || undefined}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{__html: 'body{opacity:0}'}}
        />
        <script
          nonce={nonce || undefined}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener('DOMContentLoaded',function(){document.body.style.opacity='1';});`,
          }}
        />
        <Links />
        {/* Preload critical CSS so the browser starts fetching before parser reaches link rel=stylesheet (improves FCP/LCP). */}
        <link rel="preload" href={appStyles} as="style" />
        <link rel="preload" href={resetStyles} as="style" />
        <link rel="stylesheet" href={resetStyles} />
        <link rel="stylesheet" href={appStyles} />
        <Meta />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

/**
 * Error Boundary Component
 *
 * Industry Best Practices for Error Pages:
 * - NO full header with navigation (avoids distraction, keeps focus on error recovery)
 * - NO footer with links (simplifies decision-making for users)
 * - Minimal branding (logo only, clickable to home)
 * - Clear error status and message
 * - Obvious call-to-action buttons
 * - Dark, premium aesthetic to differentiate from normal pages
 *
 * References: Google, GitHub, Stripe, Airbnb all follow this pattern
 */
export function ErrorBoundary() {
  const error = useRouteError();
  const nonce = useNonce();

  let errorMessage = 'An unexpected error occurred';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error?.data?.message ?? error.data ?? error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Application error disclosure: never expose internal messages on 500 in production
  if (errorStatus === 500 && process.env.NODE_ENV !== 'development') {
    errorMessage = 'An unexpected error occurred';
  }

  const errorDetails = getErrorDetails(errorStatus);
  const showDeveloperInfo = process.env.NODE_ENV === 'development';

  return (
    <html lang="en" style={{backgroundColor: '#2D2D2D'}}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#2D2D2D" />
        <title>{errorStatus} - V☰RTEX</title>
        <Links />
        <link rel="stylesheet" href={resetStyles} />
        <link rel="stylesheet" href={appStyles} />
        <Meta />
      </head>
      <body>
        <ErrorPage
          status={errorStatus}
          title={errorDetails.title}
          description={errorDetails.description}
          showShopButton={errorDetails.showShopButton}
          showDeveloperInfo={showDeveloperInfo}
          errorMessage={errorMessage}
        />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('./+types/root').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
