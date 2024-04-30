import { z } from 'zod';
import { limitedUserValidator } from './users.js';

export const superTicketValidator = z.object({
  id: z.number().min(1),
  uses: z.number().min(1),
  price: z.number().min(0),
  user: limitedUserValidator.nullable(),
});

export const listSuperTicketValidator = z.array(superTicketValidator);

export const insertSuperTicketValidator = z.object({
  price: z.number().min(0),
  uses: z.number().min(1),
});

export const updateSuperTicketValidator = z.object({
  uses: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  user_id: z.number().min(1).optional(),
});
