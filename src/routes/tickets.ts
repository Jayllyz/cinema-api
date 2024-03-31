import {createRoute, z} from '@hono/zod-openapi';
import {
  listTicketValidator,
  ticketValidator,
  insertTicketValidator,
  updateTicketValidator,
} from '../validators/tickets';

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
  security: [{Bearer: []}],
  request: {
    query: z.object({
      used: z.coerce.boolean().optional(),
      price_lesser: z.coerce.number().min(0).optional(),
      price_higher: z.coerce.number().min(0).optional(),
      user_id: z.coerce.number().min(1).optional(),
      screening_id: z.coerce.number().min(1).optional(),
      category: z.string().optional(),
      room: z.coerce.number().min(1).optional(),
    }),
  },
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
  security: [{Bearer: []}],
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

export const insertTicket = createRoute({
  method: 'post',
  path: '/tickets',
  summary: 'Insert a ticket',
  description: 'Insert a ticket',
  security: [{Bearer: []}],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertTicketValidator,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: ticketValidator,
        },
      },
    },
    400: {
      description: 'Bad request',
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

export const buyTicket = createRoute({
  method: 'post',
  path: '/tickets/buy/{id}',
  summary: 'Buy a ticket',
  description: 'Buy a ticket',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
  },
  responses: {
    201: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: ticketValidator,
        },
      },
    },
    400: {
      description: 'Bad request',
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

export const updateTicket = createRoute({
  method: 'patch',
  path: '/tickets/{id}',
  summary: 'Update a ticket',
  description: 'Update a ticket',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
    body: {
      content: {
        'application/json': {
          schema: updateTicketValidator,
        },
      },
    },
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
    400: {
      description: 'Bad request',
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

export const useTicket = createRoute({
  method: 'patch',
  path: '/tickets/use/{id}',
  summary: 'Use a ticket',
  description: 'Use a ticket',
  security: [{Bearer: []}],
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
    400: {
      description: 'Bad request',
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

export const deleteTicket = createRoute({
  method: 'delete',
  path: '/tickets/{id}',
  summary: 'Delete a ticket',
  description: 'Delete a ticket',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
  },
  responses: {
    204: {
      description: 'Successful response',
    },
    500: serverErrorSchema,
  },
  tags: ['tickets'],
});
