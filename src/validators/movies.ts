import {z} from 'zod';

export const movieValidator = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  author: z.string(),
  release_date: z.date(),
  duration: z.number().positive(),
  status: z.string(),
  category_id: z.number().positive(),
});

export const insertMovieValidator = z.object({
  title: z.string(),
  description: z.string(),
  author: z.string(),
  release_date: z.date(),
  duration: z.number().positive(),
  status: z.string(),
  category_id: z.number().positive(),
});

export const updateMovieValidator = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  release_date: z.date().optional(),
  description: z.string().optional(),
  duration: z.number().positive().optional(),
  status: z.string().optional(),
  category_id: z.number().positive().optional(),
});

export const listMoviesValidator = z.array(
  z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    author: z.string(),
    release_date: z.date(),
    duration: z.number().positive(),
    status: z.string(),
    category_id: z.number().positive(),
  })
);
