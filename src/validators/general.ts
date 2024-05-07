import { z } from 'zod';

export const serverErrorSchema = {
  description: 'Internal server error',
  content: {
    'application/json': {
      schema: z.object({ error: z.string() }),
    },
  },
};

export const badRequestSchema = {
  description: 'Bad request',
  content: {
    'application/json': {
      schema: z.object({
        error: z.string(),
      }),
    },
  },
};

export const notFoundSchema = {
  description: 'Not found',
  content: {
    'application/json': {
      schema: z.object({
        error: z.string(),
      }),
    },
  },
};

export const idParamValidator = z.object({
  id: z.coerce.number().min(1),
});
