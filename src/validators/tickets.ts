import {z} from 'zod';
import {limitedUserValidator} from './users';
import {screeningValidator} from './screenings';

export const ticketValidator = z.object({
  id: z.number().min(1),
  used: z.boolean(),
  price: z.number().min(0),
  user: limitedUserValidator.nullable(),
  screening: screeningValidator,
});

export const listTicketValidator = z.array(ticketValidator);

export const insertTicketValidator = z.object({
  price: z.number().min(0),
  user_id: z.number().min(1),
  screening_id: z.number().min(1),
});

export const updateTicketValidator = z.object({
  used: z.boolean().optional(),
  price: z.number().min(0).optional(),
  user_id: z.number().min(1).optional(),
  screening_id: z.number().min(1).optional(),
});
