import { createRoute, z } from '@hono/zod-openapi';
import { LogValidator } from '../validators/logs';

export const getLogs = createRoute({
  method: 'get',
  path: '/logs',
  summary: 'Get all logs',
  description: 'Get all logs',
  security: [{ Bearer: [] }],
  request: {
    query: z.object({
      user_id: z.number().positive().optional(),
      action: z.string().optional(),
      created_at: z.string().optional(),
    })
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.array(LogValidator),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['logs'],
});

export const getLogById = createRoute({
  method: 'get',
  path: '/logs/:id',
  summary: 'Get a log by id',
  description: 'Get a log by id',
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.number().positive() }),
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: LogValidator,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['logs'],
});
