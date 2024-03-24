import {z} from 'zod';

export const insertMovieValidator = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.number(),
  status: z.string(),
  category_id: z.number(),
});

export const updateMovieValidator = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  duration: z.number().optional(),
  status: z.string().optional(),
  category_id: z.number().optional(),
});

export const listMoviesValidator = z.array(
  z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    duration: z.number(),
    status: z.string(),
    category_id: z.number(),
  })
);
