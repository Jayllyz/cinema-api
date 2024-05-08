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

export const queryAllSchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  all: z.coerce.boolean().optional().default(false),
});

export const getPagination = (page: number, size: number): { from: number; to: number } => {
  const from = size * page;
  const to = from + size - 1;

  return { from, to };
};
