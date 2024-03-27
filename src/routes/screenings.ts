import {createRoute, z} from '@hono/zod-openapi';
import {insertScreeningValidator, listScreeningValidator} from '../validators/screenings';
import {insertRoomValidator} from '../validators/rooms';

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
          schema: listScreeningValidator,
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

export const insertScreening = createRoute({
  method: 'post',
  path: '/screenings',
  summary: 'Insert a screening',
  description: 'Insert a screening',
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertScreeningValidator,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Room created',
      content: {
        'application/json': {
          schema: insertScreeningValidator,
        },
      },
    },
    400: {
      description: 'Invalid body',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
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
