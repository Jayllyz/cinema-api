import {createRoute, z} from '@hono/zod-openapi';
import {loginValidator, signupValidator} from '../validators/auth';

export const loginUser = createRoute({
  method: 'post',
  path: '/login',
  summary: 'Login a user',
  description: 'Login a user',
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
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            first_name: z.string(),
            last_name: z.string(),
            email: z.string(),
            money: z.number(),
            role: z.string(),
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
  tags: ['auth'],
});