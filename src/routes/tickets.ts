import { createRoute, z } from '@hono/zod-openapi';
import authMiddleware from '../middlewares/token.js';
import { badRequestSchema, idParamValidator, notFoundSchema, serverErrorSchema } from '../validators/general.js';
import {
  insertTicketValidator,
  listTicketValidator,
  ticketValidator,
  updateTicketValidator,
} from '../validators/tickets.js';

export const getTickets = createRoute({
  method: 'get',
  path: '/tickets',
  summary: 'Get all tickets',
  description: 'Get all tickets',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    query: z.object({
      used: z.coerce.boolean().optional(),
      price_lesser: z.coerce.number().min(0).optional(),
      price_higher: z.coerce.number().min(0).optional(),
      user_id: z.coerce.number().min(1).optional().nullable(),
      screening_id: z.coerce.number().min(1).optional(),
      category: z.coerce.number().optional(),
      room: z.string().optional(),
      available: z.coerce.boolean().optional(),
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
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
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
          schema: z.object({ error: z.string() }),
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
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
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
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['tickets'],
});

export const buyTicket = createRoute({
  method: 'post',
  path: '/tickets/buy/{id}',
  summary: 'Buy a ticket',
  description: 'Buy a ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
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
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['tickets'],
});

export const refundTicket = createRoute({
  method: 'post',
  path: '/tickets/refund/{id}',
  summary: 'Refund a ticket',
  description: 'Refund a ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
  },
  responses: {
    200: {
      description: 'Successful response',
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['tickets'],
});

export const updateTicket = createRoute({
  method: 'patch',
  path: '/tickets/{id}',
  summary: 'Update a ticket',
  description: 'Update a ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
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
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['tickets'],
});

export const useTicket = createRoute({
  method: 'patch',
  path: '/tickets/use/{id}',
  summary: 'Use a ticket',
  description: 'Use a ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
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
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['tickets'],
});

export const deleteTicket = createRoute({
  method: 'delete',
  path: '/tickets/{id}',
  summary: 'Delete a ticket',
  description: 'Delete a ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
  },
  responses: {
    204: {
      description: 'Successful response',
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['tickets'],
});
