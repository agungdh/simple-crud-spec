import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import swaggerUiDist from 'swagger-ui-dist';

const PORT = Number(process.env.PORT) || 8090;
const swaggerAssets = swaggerUiDist.getAbsoluteFSPath();

const app = new Hono();

app.get('/docs', (c) =>
  c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Docs</title>
    <link rel="stylesheet" href="/docs/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/swagger-ui-bundle.js" crossorigin></script>
    <script src="/docs/swagger-ui-standalone-preset.js" crossorigin></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: 'StandaloneLayout',
      });
    </script>
  </body>
</html>`),
);

app.get('/', (c) => c.redirect('/docs'));

app.use(
  '/docs/*',
  serveStatic({
    root: swaggerAssets,
    rewriteRequestPath: (path) => path.replace(/^\/docs/, ''),
  }),
);
app.get('/openapi.yaml', serveStatic({ path: './openapi.yaml' }));
app.use('/paths/*', serveStatic({ root: './' }));
app.use('/components/*', serveStatic({ root: './' }));
app.use('/examples/*', serveStatic({ root: './' }));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Swagger UI: http://localhost:${info.port}/docs`);
  console.log(`Raw spec   : http://localhost:${info.port}/openapi.yaml`);
});
