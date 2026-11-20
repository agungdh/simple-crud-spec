import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import swaggerUiDist from 'swagger-ui-dist';

const PORT = Number(process.env.PORT) || 8090;
const swaggerAssets = swaggerUiDist.getAbsoluteFSPath();

const app = new Hono();

app.get('/docs', serveStatic({ path: './public/docs.html' }));

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
