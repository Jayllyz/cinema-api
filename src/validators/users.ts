import {z} from 'zod';

export const userValidator = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  money: z.number(),
});

export const listUsersValidator = z.array(userValidator);

export const insertUserValidator = z.object({
  first_name: z.string().min(2).max(30),
  last_name: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(30),
});

export const idValidator = z.object({
  id: z.coerce.number().int({message: 'Invalid id'}).positive({message: 'Invalid id'}),
});

export const updateUserValidator = z.object({
  first_name: z.string().min(2).max(30).optional(),
  last_name: z.string().min(2).max(30).optional(),
  email: z.string().email().optional(),
  money: z.number().min(0).optional(),
});
