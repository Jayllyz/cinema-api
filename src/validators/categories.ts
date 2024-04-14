import { z } from 'zod';

export const categoryValidator = z.object({
  name: z.string(),
});

export const listCategoriesValidator = z.array(
  z.object({
    id: z.number().positive(),
    name: z.string(),
  }),
);
