import {z} from 'zod';

export const listUsersValidator = z.array(
  z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    money: z.number(),
  })
);
