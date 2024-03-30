import {createRoute, z} from '@hono/zod-openapi';
import {listTicketValidator, ticketValidator} from '../validators/tickets';

const serverErrorSchema = {
  description: 'Internal server error',
  content: {
    'application/json': {
      schema: z.object({error: z.string()}),
    },
  },
};

export const getTickets = createRoute({
  method: 'get',
  path: '/tickets',
  summary: 'Get all tickets',
  description: 'Get all tickets',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listTicketValidator,
        },
      },
    },
    500: serverErrorSchema,
  },
  tags: ['tickets'],
});

export const getTicketById = createRoute({
  method: 'get',
  path: '/tickets/{id}',
  summary: 'Get ticket by id',
  description: 'Get ticket by id',
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: ticketValidator,
        },
      },
    },
    404: {
      description: 'Ticket not found',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
    500: serverErrorSchema,
  },
  tags: ['tickets'],
});
