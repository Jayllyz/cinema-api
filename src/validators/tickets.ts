import { z } from '@hono/zod-openapi';
import { screeningValidator } from './screenings.js';
import { limitedUserValidator } from './users.js';

export const ticketValidator = z.object({
  id: z.number().min(1),
  used: z.boolean(),
  seat: z.number().min(1),
  price: z.number().min(0),
  user: limitedUserValidator.nullable(),
  screening: screeningValidator,
});

export const listTicketValidator = z.array(ticketValidator);

export const insertTicketValidator = z.object({
  seat: z.number().min(1),
  price: z.number().min(0),
  user_id: z.number().min(1).nullable(),
  screening_id: z.number().min(1),
});

export const updateTicketValidator = z.object({
  used: z.boolean().optional(),
  seat: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  user_id: z.number().min(1).optional(),
  screening_id: z.number().min(1).optional(),
});
