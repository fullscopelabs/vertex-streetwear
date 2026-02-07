/**
 * Post-build script for Cloudflare Pages deployment.
 *
 * Cloudflare Pages "advanced mode" (_worker.js) routes ALL requests through
 * the worker — including static assets like CSS and JS. This script creates
 * a wrapper _worker.js that:
 *   1. Tries to serve the request as a static asset via env.ASSETS
 *   2. Falls back to the Hydrogen SSR server for page requests
 */

import {copyFileSync, writeFileSync} from 'node:fs';

// Copy the Hydrogen server bundle into the client output directory
// so that _worker.js can import it as a sibling module.
copyFileSync('dist/server/index.js', 'dist/client/_server.js');

// Create the wrapper _worker.js
writeFileSync(
  'dist/client/_worker.js',
  `import server from './_server.js';

export default {
  async fetch(request, env, ctx) {
    // Serve static assets (CSS, JS, images, etc.) from the Pages asset store
    try {
      const assetUrl = new URL(request.url);
      const assetResponse = await env.ASSETS.fetch(assetUrl);
      if (assetResponse.ok || assetResponse.status === 304) {
        return assetResponse;
      }
    } catch {
      // ASSETS binding unavailable or error — fall through to SSR
    }

    // Delegate to the Hydrogen SSR server
    return server.fetch(request, env, ctx);
  },
};
`,
);

console.log('✓ Created _worker.js with static asset serving for Cloudflare Pages');
