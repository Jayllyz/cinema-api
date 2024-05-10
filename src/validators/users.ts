import { z } from 'zod';

export const userValidator = z.object({
  id: z.number().min(1),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  money: z.number(),
  role: z.number().min(1).max(4),
});

export const limitedUserValidator = z.object({
  id: z.number().min(1),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
});

export const listUsersValidator = z.array(userValidator);

export const insertUserValidator = z.object({
  first_name: z.string().min(2).max(30),
  last_name: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(8),
});

export const idValidator = z.object({
  id: z.coerce.number().int({ message: 'Invalid id' }).min(1, { message: 'Invalid id' }),
});

export const updateUserValidator = z.object({
  first_name: z.string().min(2).max(30).optional(),
  last_name: z.string().min(2).max(30).optional(),
  email: z.string().email().optional(),
});

export const updateUserMoneyValidator = z.object({
  deposit: z.coerce.number().min(0).optional(),
  withdraw: z.coerce.number().min(0).optional(),
});
