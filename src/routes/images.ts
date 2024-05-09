import { createRoute, z } from '@hono/zod-openapi';
import authMiddleware from '../middlewares/token.js';
import { badRequestSchema, notFoundSchema, queryAllSchema, serverErrorSchema } from '../validators/general.js';
import { idParamValidator } from '../validators/general.js';
import { images } from '../validators/images.js';

export const listImages = createRoute({
  method: 'get',
  path: '/images',
  summary: 'List images',
  description: 'List images',
  request: {
    query: queryAllSchema,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.array(images),
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['images'],
});

export const getImage = createRoute({
  method: 'get',
  path: '/images/{id}',
  summary: 'Get an image',
  description: 'Get an image',
  request: {
    params: idParamValidator,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: images,
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['images'],
});

export const createImage = createRoute({
  method: 'post',
  path: '/images',
  summary: 'Create an image',
  description: 'Create an image',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: images.omit({ id: true }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: images,
        },
      },
    },
    400: badRequestSchema,
    500: serverErrorSchema,
  },
  tags: ['images'],
});

export const updateImage = createRoute({
  method: 'patch',
  path: '/images/{id}',
  summary: 'Update an image',
  description: 'Update an image',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
    body: {
      content: {
        'application/json': {
          schema: images.omit({ id: true }).partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            url: z.string(),
          }),
        },
      },
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['images'],
});

export const deleteImage = createRoute({
  method: 'delete',
  path: '/images/{id}',
  summary: 'Delete an image',
  description: 'Delete an image',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
  },
  responses: {
    200: {
      description: 'Image deleted',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['images'],
});
