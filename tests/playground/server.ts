import { bundle } from '@deno/emit';

const mimeTypes: Record<string, string> = {
  default: 'application/octet-stream',
  html: 'text/html',
  js: 'text/javascript',
  css: 'text/css',
};

function send(body: BodyInit, contentType: string): Response {
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
}

Deno.serve({ port: 3000, hostname: '0.0.0.0' }, async (request) => {
  const path = new URL(request.url).pathname;

  if (path === '/main.bundle.js') {
    const result = await bundle('./main.ts');
    return send(result.code, mimeTypes.js);
  }

  if (path !== '/') {
    try {
      const content = await Deno.readFile(`.${path}`);
      const ext = path.split('.').pop() ?? '';
      return send(content, mimeTypes[ext] ?? mimeTypes.default);
    } catch {
      void 0;
    }
  }

  const content = await Deno.readFile('./index.html');
  return send(content, mimeTypes.html);
});
