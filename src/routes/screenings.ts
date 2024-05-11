import { createRoute, z } from '@hono/zod-openapi';
import authMiddleware from '../middlewares/token.js';
import { badRequestSchema, idParamValidator, notFoundSchema, serverErrorSchema } from '../validators/general.js';
import {
  insertScreeningValidator,
  listScreeningValidator,
  responseScreeningValidator,
  screeningValidator,
  updateScreeningValidator,
} from '../validators/screenings.js';

export const getScreenings = createRoute({
  method: 'get',
  path: '/screenings',
  summary: 'Get all screenings',
  description: 'Get all screenings',
  security: [{ Bearer: [] }],
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
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
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
    400: badRequestSchema,
    500: serverErrorSchema,
  },
  tags: ['screenings'],
});

export const updateScreening = createRoute({
  method: 'patch',
  path: '/screenings/{id}',
  summary: 'Update a screening',
  description: 'Update a screening',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
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
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['screenings'],
});

export const getScreeningById = createRoute({
  method: 'get',
  path: '/screenings/{id}',
  summary: 'Get a screening by id',
  description: 'Get a screening by id',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
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
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['screenings'],
});

export const deleteScreening = createRoute({
  method: 'delete',
  path: '/screenings/{id}',
  summary: 'Delete a screening',
  description: 'Delete a screening',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
  },
  responses: {
    200: {
      description: 'Screening deleted',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['screenings'],
});
