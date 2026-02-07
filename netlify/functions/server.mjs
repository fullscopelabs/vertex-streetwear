export const handler = async (event, context) => {
  try {
    // Import the server build dynamically
    const {default: serverExports} = await import('../../dist/server/index.js');
    
    // Create a Web API Request from the Netlify event
    const url = new URL(event.rawUrl);
    const request = new Request(url, {
      method: event.httpMethod,
      headers: new Headers(event.headers),
      body: event.body && event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD'
        ? event.body
        : undefined,
    });

    // Set up environment
    const env = {
      SESSION_SECRET: process.env.SESSION_SECRET,
      PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN,
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN,
    };

    // Call the Hydrogen server fetch handler
    const response = await serverExports.fetch(request, env, context);

    // Convert Response to Netlify format
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await response.text();

    return {
      statusCode: response.status,
      headers,
      body,
    };
  } catch (error) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      headers: {'Content-Type': 'text/html'},
      body: `<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
<h1>Server Error</h1>
<pre>${error.message}\n${error.stack}</pre>
</body>
</html>`,
    };
  }
};
