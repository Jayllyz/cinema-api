import { createRoute, z } from '@hono/zod-openapi';
import authMiddleware from '../middlewares/token.js';
import { loginValidator, signupValidator } from '../validators/auth.js';
import { badRequestSchema, notFoundSchema, serverErrorSchema } from '../validators/general.js';
import { userValidator } from '../validators/users.js';

export const loginUser = createRoute({
  method: 'post',
  path: '/login',
  summary: 'Login route',
  description: 'Login as employee or user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginValidator,
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
    404: notFoundSchema,
    500: serverErrorSchema,
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
  tags: ['auth'],
});

export const signupUser = createRoute({
  method: 'post',
  path: '/signup',
  summary: 'Signup a user',
  description: 'Signup a user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: signupValidator,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: userValidator,
        },
      },
    },
    400: badRequestSchema,
    500: serverErrorSchema,
  },
  tags: ['auth'],
});

export const logout = createRoute({
  method: 'post',
  path: '/logout',
  summary: 'Logout route',
  description: 'Logout as employee or user',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: 'Successful response',
    },
    500: serverErrorSchema,
  },
  tags: ['auth'],
});
