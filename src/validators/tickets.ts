import {z} from 'zod';
import {limitedUserValidator} from './users';
import {screeningValidator} from './screenings';

export const ticketValidator = z.object({
  id: z.number().min(1),
  used: z.boolean(),
  price: z.number().min(0),
  user: limitedUserValidator,
  screening: screeningValidator,
});

export const listTicketValidator = z.array(ticketValidator);
