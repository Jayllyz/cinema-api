import { z } from 'zod';
import { categoryValidator } from './categories.js';

export const MovieValidator = z.object({
  id: z.number().positive(),
  title: z.string(),
  description: z.string(),
  author: z.string(),
  release_date: z.string().datetime(),
  duration: z.number().positive(),
  status: z.string(),
  category: categoryValidator,
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

export const listMoviesValidator = z.array(MovieValidator);
