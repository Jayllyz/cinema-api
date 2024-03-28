import {serve} from '@hono/node-server';
import {prettyJSON} from 'hono/pretty-json';
import {OpenAPIHono, createRoute} from '@hono/zod-openapi';
import {swaggerUI} from '@hono/swagger-ui';
import {rooms} from './handlers/rooms.js';
import {users} from './handlers/users';
import {auth} from './handlers/auth';
import {categories} from './handlers/categories.js';
import {movies} from './handlers/movies.js';
import {jwt} from 'hono/jwt';
import {fromZodError} from 'zod-validation-error';

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (result.success) return;
    console.error(result);
    return c.json({error: fromZodError(result.error).message}, 400);
  },
});

app.use(prettyJSON());
app.use('/users/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: process.env.SECRET_KEY || 'secret',
  });

  return jwtMiddleware(c, next);
});

const healthCheck = createRoute({
  method: 'get',
  path: '/health',
  summary: 'Health check',
  description: 'Health check',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: {type: 'string'},
        },
      },
    },
  },
  tags: ['health'],
});

app.get('/', (c) => c.text('Welcome to the API!'));
app.openapi(healthCheck, (c) => c.json('OK', 200));
app.notFound((c) => c.json({error: 'Path not found'}, 404));
app.onError((err, c) => c.text(err.message, 500));

app.route('/', rooms);
app.route('/', users);
app.route('/auth/', auth);
app.route('/', movies);
app.route('/', categories);

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

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

app.get('/ui', swaggerUI({url: '/doc'}));

const port = Number(process.env.PORT || 3000);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
