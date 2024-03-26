import {createRoute, z} from '@hono/zod-openapi';

export const getScreenings = createRoute({
  method: 'get',
  path: '/screenings',
  summary: 'Get all screenings',
  description: 'Get all screenings',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: {test: 'ok'},
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['screenings'],
});
