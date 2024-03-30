import {createRoute, z} from '@hono/zod-openapi';
import {listTicketValidator} from '../validators/tickets';

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
