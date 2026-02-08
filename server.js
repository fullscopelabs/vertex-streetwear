import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';
import {sanitizeFormatString} from '~/lib/sanitize';

const MAX_QUERY_PARAM_LENGTH = 2048;

/**
 * Apply security headers to a Response (SSR, redirect, or asset).
 * @param {Response} response
 * @returns {void}
 */
function applySecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin',
  );
}

/**
 * Sanitize URL query params to prevent format-string and injection issues
 * (StackHawk Format String findings). Builds a new Request with sanitized URL.
 * @param {Request} request
 * @returns {Request}
 */
function sanitizeRequestUrl(request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  if (params.toString().length === 0) {
    return request;
  }
  const sanitized = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    const cleanKey = sanitizeFormatString(key).slice(0, MAX_QUERY_PARAM_LENGTH);
    const cleanValue = sanitizeFormatString(value).slice(
      0,
      MAX_QUERY_PARAM_LENGTH,
    );
    if (cleanKey) sanitized.set(cleanKey, cleanValue);
  }
  url.search = sanitized.toString();
  return new Request(url, request);
}

/**
 * Export a fetch handler in module format.
 */
export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} executionContext
   * @return {Promise<Response>}
   */
  async fetch(request, env, executionContext) {
    try {
      const sanitizedRequest = sanitizeRequestUrl(request);

      const hydrogenContext = await createHydrogenRouterContext(
        sanitizedRequest,
        env,
        executionContext,
      );

      /**
       * Create a Hydrogen request handler that internally
       * delegates to React Router for routing and rendering.
       */
      const handleRequest = createRequestHandler({
        build: serverBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      const response = await handleRequest(sanitizedRequest);

      applySecurityHeaders(response);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        const redirectResponse = storefrontRedirect({
          request: sanitizedRequest,
          response,
          storefront: hydrogenContext.storefront,
        });
        applySecurityHeaders(redirectResponse);
        return redirectResponse;
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
