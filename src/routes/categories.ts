import { createRoute, z } from '@hono/zod-openapi';
import authMiddleware from '../middlewares/token.js';
import { categoryValidator, listCategoriesValidator } from '../validators/categories.js';
import {
  badRequestSchema,
  idParamValidator,
  notFoundSchema,
  queryAllSchema,
  serverErrorSchema,
} from '../validators/general.js';

export const getCategories = createRoute({
  method: 'get',
  path: '/categories',
  summary: 'Get all categories',
  middleware: authMiddleware,
  description: 'Get all categories',
  security: [{ Bearer: [] }],
  request: {
    query: queryAllSchema,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listCategoriesValidator,
        },
      },
    },
    500: serverErrorSchema,
  },
  tags: ['categories'],
});

export const getCategoryById = createRoute({
  method: 'get',
  path: '/categories/{id}',
  summary: 'Get a category by id',
  description: 'Get a category by id',
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
          schema: categoryValidator,
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['categories'],
});

export const insertCategory = createRoute({
  method: 'post',
  path: '/categories',
  summary: 'Insert a category',
  description: 'Insert a category',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: categoryValidator,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Category created',
      content: {
        'application/json': {
          schema: categoryValidator,
        },
      },
    },
    400: badRequestSchema,
    500: serverErrorSchema,
  },
  tags: ['categories'],
});

export const deleteCategory = createRoute({
  method: 'delete',
  path: '/categories/{id}',
  summary: 'Delete a category',
  description: 'Delete a category',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
  },
  responses: {
    200: {
      description: 'Category deleted',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['categories'],
});
