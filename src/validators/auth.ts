import {z} from 'zod';

export const loginValidator = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signupValidator = z.object({
  first_name: z.string().min(2).max(30),
  last_name: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(30),
});
