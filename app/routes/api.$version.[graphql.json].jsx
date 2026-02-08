/**
 * @param {Route.ActionArgs}
 */
export async function action({params, context, request}) {
  const response = await fetch(
    `https://${context.env.PUBLIC_CHECKOUT_DOMAIN}/api/${params.version}/graphql.json`,
    {
      method: 'POST',
      body: request.body,
      headers: request.headers,
    },
  );

  const headers = new Headers(response.headers);

  // Security headers (StackHawk: X-Content-Type-Options, CORS)
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  const origin = request.headers.get('Origin');
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  // Do not forward Set-Cookie from Shopify to avoid cookie attribute findings
  headers.delete('Set-Cookie');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** @typedef {import('./+types/api.$version.[graphql.json]').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
