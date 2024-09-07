const mimeTypes: Record<string, string> = {
  default: 'application/octet-stream',
  html: 'text/html',
  js: 'text/javascript',
  css: 'text/css',
};

Deno.serve({ port: 3000, hostname: '0.0.0.0' }, async (request) => {
  const path = new URL(request.url).pathname;

  let body = null;
  let contentType = '';

  if (path !== '/') {
    try {
      body = await Deno.readFile(`.${path}`);
      const ext = path.split('.').pop() ?? '';
      contentType = mimeTypes[ext] ?? mimeTypes.default;
    } catch {
      void 0;
    }
  }

  if (!body) {
    body = await Deno.readFile('./index.html');
    contentType = mimeTypes.html;
  }

  return new Response(
    body,
    {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
      },
    },
  );
});
