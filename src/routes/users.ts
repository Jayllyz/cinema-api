import { createRoute, z } from '@hono/zod-openapi';
import authMiddleware from '../middlewares/token.js';
import {
  badRequestSchema,
  idParamValidator,
  notFoundSchema,
  queryAllSchema,
  serverErrorSchema,
} from '../validators/general.js';
import {
  insertUserValidator,
  listUsersValidator,
  updateUserMoneyValidator,
  updateUserValidator,
  userValidator,
} from '../validators/users.js';

// GET ROUTES
export const getUsers = createRoute({
  method: 'get',
  path: '/users',
  summary: 'Get all users',
  description: 'Get all users',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    query: queryAllSchema,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listUsersValidator,
        },
      },
    },
    500: serverErrorSchema,
  },
  tags: ['users'],
});

export const getUserById = createRoute({
  method: 'get',
  path: '/users/{id}',
  summary: 'Get a user by id',
  description: 'Get a user by id',
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
          schema: userValidator,
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['users'],
});

export const getMe = createRoute({
  method: 'get',
  path: '/users/me',
  summary: 'Get my info',
  description: 'Get my informations',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: userValidator,
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['users'],
});

// POST ROUTES
export const insertUser = createRoute({
  method: 'post',
  path: '/users',
  summary: 'Insert a user',
  description: 'Insert a user',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertUserValidator,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: insertUserValidator,
        },
      },
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['users'],
});

// PATCH ROUTES
export const updateUser = createRoute({
  method: 'patch',
  path: '/users/{id}',
  summary: 'Update a user',
  description: 'Update a user',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
    body: {
      content: {
        'application/json': {
          schema: updateUserValidator,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: updateUserValidator,
        },
      },
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['users'],
});

export const updateUserMoney = createRoute({
  method: 'patch',
  path: '/users/money',
  summary: 'Update user money',
  description: 'Update user money',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    query: updateUserMoneyValidator,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: userValidator,
        },
      },
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['users'],
});

// DELETE ROUTES
export const deleteUser = createRoute({
  method: 'delete',
  path: '/users/{id}',
  summary: 'Delete a user',
  description: 'Delete a user',
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
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['users'],
});

export const changeUserPassword = createRoute({
  method: 'patch',
  path: '/users/password',
  summary: 'Change user password',
  description: 'Change user password',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            password: z.string().min(8),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['users'],
});
