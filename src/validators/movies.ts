import { z } from '@hono/zod-openapi';

export const MovieValidator = z.object({
  id: z.number().min(1),
  title: z.string(),
  description: z.string(),
  author: z.string(),
  release_date: z.string().date(),
  duration: z.number().positive(),
  status: z.string().toLowerCase(),
  images: z
    .array(
      z.object({
        id: z.number().min(1),
        url: z.string(),
        alt: z.string(),
      }),
    )
    .optional(),
});

export const insertMovieValidator = z.object({
  title: z.string(),
  description: z.string(),
  author: z.string(),
  release_date: z.coerce.date(),
  duration: z.number().positive(),
  status: z.enum(['projection', 'closed']),
  categories: z.array(z.number().min(1)).optional(),
});

export const updateMovieValidator = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  release_date: z.coerce.date().optional(),
  description: z.string().optional(),
  duration: z.number().positive().optional(),
  status: z.enum(['projection', 'closed']).optional(),
  categories: z.array(z.number().min(1)).optional(),
});

export const listMoviesValidator = z.array(MovieValidator);
