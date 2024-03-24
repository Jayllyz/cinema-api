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
  first_name: z
    .string()
    .min(2, {message: 'The first name must be atlest 2 letters'})
    .max(30, {message: 'The first name must be at most 30 letters'}),
  last_name: z
    .string()
    .min(2, {message: 'The last name must be atlest 2 letters'})
    .max(30, {message: 'The last name must be at most 30 letters'}),
  email: z.string().email({message: 'Invalid email'}),
  password: z
    .string()
    .min(8, {message: 'The password must be at least 8 characters'})
    .max(30, {message: 'The password must be at most 30 characters'}),
});

export const idValidator = z.object({
  id: z.coerce.number().int({message: 'Invalid id'}).positive({message: 'Invalid id'}),
});
