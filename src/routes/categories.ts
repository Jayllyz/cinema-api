import {createRoute, z} from '@hono/zod-openapi';
import {categoryValidator, listCategoriesValidator} from '../validators/categories.js';
import {idValidator} from '../validators/rooms.js';

export const getCategories = createRoute({
  method: 'get',
  path: '/categories',
  summary: 'Get all categories',
  description: 'Get all categories',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listCategoriesValidator,
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
  tags: ['categories'],
});

export const getCategoryById = createRoute({
  method: 'get',
  path: '/categories/:id',
  summary: 'Get a category by id',
  description: 'Get a category by id',
  request: {
    params: idValidator,
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
    404: {
      description: 'Category not found',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['categories'],
});

export const insertCategory = createRoute({
  method: 'post',
  path: '/categories',
  summary: 'Insert a category',
  description: 'Insert a category',
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
    400: {
      description: 'Invalid request',
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
  tags: ['categories'],
});

export const deleteCategory = createRoute({
  method: 'delete',
  path: '/categories/:id',
  summary: 'Delete a category',
  description: 'Delete a category',
  request: {
    params: idValidator,
  },
  responses: {
    200: {
      description: 'Category deleted',
      content: {
        'application/json': {
          schema: z.object({message: z.string()}),
        },
      },
    },
    404: {
      description: 'Category not found',
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
  tags: ['categories'],
});
