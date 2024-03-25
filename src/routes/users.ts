import {createRoute, z} from '@hono/zod-openapi';
import {
  listUsersValidator,
  insertUserValidator,
  userValidator,
  idValidator,
  updateUserValidator,
  updateUserMoneyValidator,
} from '../validators/users';

// GET ROUTES
export const getUsers = createRoute({
  method: 'get',
  path: '/users',
  summary: 'Get all users',
  description: 'Get all users',
  security: [{Bearer: []}],
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listUsersValidator,
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
  tags: ['users'],
});

export const getUserById = createRoute({
  method: 'get',
  path: '/users/:id',
  summary: 'Get a user by id',
  description: 'Get a user by id',
  request: {
    params: idValidator,
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
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['users'],
});

// POST ROUTES
export const insertUser = createRoute({
  method: 'post',
  path: '/users',
  summary: 'Insert a user',
  description: 'Insert a user',
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
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: insertUserValidator,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
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
  tags: ['users'],
});

export const loginUser = createRoute({
  method: 'post',
  path: '/users/login',
  summary: 'Login a user',
  description: 'Login a user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string(),
            password: z.string(),
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
          schema: z.object({
            token: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
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
  tags: ['users'],
});

// PATCH ROUTES
export const updateUser = createRoute({
  method: 'patch',
  path: '/users/:id',
  summary: 'Update a user',
  description: 'Update a user',
  request: {
    params: idValidator,
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
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
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
  tags: ['users'],
});

export const updateUserMoney = createRoute({
  method: 'patch',
  path: '/users/money',
  summary: 'Update user money',
  description: 'Update user money',
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
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
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
  tags: ['users'],
});

// DELETE ROUTES
export const deleteUser = createRoute({
  method: 'delete',
  path: '/users/:id',
  summary: 'Delete a user',
  description: 'Delete a user',
  request: {
    params: idValidator,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.object({message: z.string()}),
        },
      },
    },
    404: {
      description: 'User not found',
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
  tags: ['users'],
});
