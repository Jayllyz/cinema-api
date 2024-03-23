import {z} from 'zod';

export const idValidator = z.object({
  id: z
    .string()
    .transform((v) => parseInt(v))
    .refine((v) => !isNaN(v), {message: 'not a number'}),
});

export const insertRoomValidator = z.object({
  number: z.number().min(1),
  capacity: z.number().min(10),
  type: z.string(),
  status: z.string(),
});

export const updateRoomValidator = z.object({
  number: z.number().min(1).optional(),
  capacity: z.number().min(10).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
});
