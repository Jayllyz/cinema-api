import {createRoute, z} from '@hono/zod-openapi';
import {
  insertScreeningValidator,
  listScreeningValidator,
  responseScreeningValidator,
  updateScreeningValidator,
} from '../validators/screenings';

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
      description: 'Screening created',
      content: {
        'application/json': {
          schema: responseScreeningValidator,
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

export const updateScreening = createRoute({
  method: 'patch',
  path: '/screenings/:id',
  summary: 'Update a screening',
  description: 'Update a screening',
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
    body: {
      content: {
        'application/json': {
          schema: updateScreeningValidator,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Screening updated',
      content: {
        'application/json': {
          schema: responseScreeningValidator,
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
