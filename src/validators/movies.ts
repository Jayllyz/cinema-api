import {z} from 'zod';

export const movieValidator = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  author: z.string(),
  release_date: z.string().datetime(),
  duration: z.number().positive(),
  status: z.string(),
  category_id: z.number().positive(),
});

export const insertMovieValidator = z.object({
  title: z.string(),
  description: z.string(),
  author: z.string(),
  release_date: z.coerce.date(),
  duration: z.number().positive(),
  status: z.string(),
  category_id: z.number().positive(),
});

export const updateMovieValidator = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  release_date: z.coerce.date().optional(),
  description: z.string().optional(),
  duration: z.number().positive().optional(),
  status: z.string().optional(),
  category_id: z.number().positive().optional(),
});

export const MovieValidator = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  duration: z.number(),
  status: z.string(),
  category_id: z.number(),
});

export const listMoviesValidator = z.array(MovieValidator);
