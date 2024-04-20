import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { compress } from 'hono/compress';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { auth } from './handlers/auth';
import { categories } from './handlers/categories.js';
import { employees } from './handlers/employees.js';
import { movies } from './handlers/movies.js';
import { rooms } from './handlers/rooms.js';
import { screenings } from './handlers/screenings.js';
import { superTickets } from './handlers/super_tickets';
import { tickets } from './handlers/tickets';
import { users } from './handlers/users';
import { workingShift } from './handlers/working_shift.js';

const port = Number(process.env.PORT || 3000);
const app = new OpenAPIHono();

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use('*', logger());
}
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use('*', compress());
app.get('/', (c) => c.text('Welcome to the API!'));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json({ error: 'Internal server error' }, 500);
});

app.use(async (c, next) => {
  if (c.req.method === 'POST' || c.req.method === 'PUT' || c.req.method === 'PATCH') {
    const contentType = c.req.header('content-type');
    const baseUrl = c.req.url.split(`http://localhost:${port}`)[1];

    if (
      !baseUrl.startsWith('/tickets/buy/') &&
      !baseUrl.startsWith('/tickets/use/') &&
      !baseUrl.startsWith('/tickets/refund') &&
      !baseUrl.startsWith('/super_tickets/buy/') &&
      (!contentType || !contentType.includes('application/json'))
    ) {
      return c.json({ error: 'A json body is required' }, 400);
    }
  }
  return next();
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
          schema: { type: 'string' },
        },
      },
    },
  },
  tags: ['health'],
});
app.openapi(healthCheck, (c) => c.json('OK', 200));
app.notFound((c) => c.json({ error: 'Path not found' }, 404));
app.route('/auth/', auth);

app.route('/', rooms);
app.route('/', users);
app.route('/', movies);
app.route('/', categories);
app.route('/', screenings);
app.route('/', tickets);
app.route('/', superTickets);
app.route('/', employees);
app.route('/', workingShift);

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

app.get('/ui', swaggerUI({ url: '/doc' }));

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
