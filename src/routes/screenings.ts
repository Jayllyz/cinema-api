import {createRoute, z} from '@hono/zod-openapi';
import {
  insertScreeningValidator,
  listScreeningValidator,
  responseScreeningValidator,
  screeningValidator,
  updateScreeningValidator,
} from '../validators/screenings';

const serverErrorSchema = {
  description: 'Internal server error',
  content: {
    'application/json': {
      schema: z.object({error: z.string()}),
    },
  },
};

export const getScreenings = createRoute({
  method: 'get',
  path: '/screenings',
  summary: 'Get all screenings',
  description: 'Get all screenings',
  security: [{Bearer: []}],
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listScreeningValidator,
        },
      },
    },
    500: serverErrorSchema,
  },
  tags: ['screenings'],
});

export const insertScreening = createRoute({
  method: 'post',
  path: '/screenings',
  summary: 'Insert a screening',
  description: 'Insert a screening',
  security: [{Bearer: []}],
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
    500: serverErrorSchema,
  },
  tags: ['screenings'],
});

export const updateScreening = createRoute({
  method: 'patch',
  path: '/screenings/{id}',
  summary: 'Update a screening',
  description: 'Update a screening',
  security: [{Bearer: []}],
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
    500: serverErrorSchema,
  },
  tags: ['screenings'],
});

export const getScreeningById = createRoute({
  method: 'get',
  path: '/screenings/{id}',
  summary: 'Get a screening by id',
  description: 'Get a screening by id',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: screeningValidator,
        },
      },
    },
    404: {
      description: 'Room not found',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
    500: serverErrorSchema,
  },
  tags: ['screenings'],
});

export const deleteScreening = createRoute({
  method: 'delete',
  path: '/screenings/{id}',
  summary: 'Delete a screening',
  description: 'Delete a screening',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
  },
  responses: {
    200: {
      description: 'Screening deleted',
      content: {
        'application/json': {
          schema: z.object({message: z.string()}),
        },
      },
    },
    404: {
      description: 'Screening not found',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
    500: serverErrorSchema,
  },
  tags: ['screenings'],
});
