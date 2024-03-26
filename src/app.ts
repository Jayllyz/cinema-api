import {serve} from '@hono/node-server';
import {prettyJSON} from 'hono/pretty-json';
import {OpenAPIHono} from '@hono/zod-openapi';
import {swaggerUI} from '@hono/swagger-ui';
import {rooms} from './handlers/rooms.js';
import {categories} from './handlers/categories.js';
import {movies} from './handlers/movies.js';
import {screenings} from './handlers/screenings.js';

const app = new OpenAPIHono();
app.use(prettyJSON());
app.get('/', (c) => c.text('Welcome to the API!'));
app.get('/health', (c) => c.json({status: 'ok'}, 200));
app.notFound((c) => c.json({error: 'Path not found'}, 404));

app.route('/', rooms);
app.route('/', movies);
app.route('/', categories);
app.route('/', screenings);

app.doc('/doc', (c) => ({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Cinema API',
  },
  servers: [
    {
      url: new URL(c.req.url).origin,
      description: 'Current environment',
    },
  ],
}));

app.get('/ui', swaggerUI({url: '/doc'}));

const port = Number(process.env.PORT || 3000);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
