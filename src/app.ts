import {serve} from '@hono/node-server';
import {Hono} from 'hono';
import {rooms} from './handlers/rooms.js';
import {prettyJSON} from 'hono/pretty-json';

const app = new Hono();
app.use(prettyJSON());
app.get('/', (c) => c.text('Welcome to the API!'));
app.get('/health', (c) => c.json({status: 'ok'}, 200));
app.notFound((c) => c.json({error: 'Path not found'}, 404));

app.route('/', rooms);

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
