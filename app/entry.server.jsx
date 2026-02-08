import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} reactRouterContext
 * @param {HydrogenRouterContextProvider} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Fonts are now self-hosted (woff2 files in app/assets/fonts/),
    // so no external styleSrc / fontSrc / connectSrc for Google Fonts needed.
    // Allow Cloudflare Insights beacon when injected by hosting (avoids console CSP error).
    // CSP requires 'self' (quoted); include app scripts, Shopify (e.g. consent-tracking), and Cloudflare.
    scriptSrc: ["'self'", 'https://cdn.shopify.com', 'https://static.cloudflareinsights.com'],
    // Allow data: URIs for inline SVG textures (grain, texture-canvas, body bg).
    // Added to defaultSrc (not imgSrc) so it extends the existing directive
    // without creating a separate img-src that would override the fallback.
    defaultSrc: ['data:'],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  // Additional security headers (addresses StackHawk findings)
  // Note: X-Content-Type-Options and other headers are set globally in server.js
  // CSP is already configured via Hydrogen's createContentSecurityPolicy above

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/hydrogen').HydrogenRouterContextProvider} HydrogenRouterContextProvider */
/** @typedef {import('react-router').EntryContext} EntryContext */
