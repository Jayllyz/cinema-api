import { createRoute, z } from '@hono/zod-openapi';
import authMiddleware from '../middlewares/token.js';
import { badRequestSchema, idParamValidator, notFoundSchema, serverErrorSchema } from '../validators/general.js';
import {
  insertSuperTicketValidator,
  listSuperTicketValidator,
  superTicketValidator,
  updateSuperTicketValidator,
} from '../validators/super_tickets.js';

export const getSuperTickets = createRoute({
  method: 'get',
  path: '/super_tickets',
  summary: 'Get all super tickets',
  description: 'Get all super tickets',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listSuperTicketValidator,
        },
      },
    },
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});

export const getSuperTicketById = createRoute({
  method: 'get',
  path: '/super_tickets/{id}',
  summary: 'Get super ticket by id',
  description: 'Get super ticket by id',
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
          schema: superTicketValidator,
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});

export const insertSuperTicket = createRoute({
  method: 'post',
  path: '/super_tickets',
  summary: 'Insert super ticket',
  description: 'Insert super ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertSuperTicketValidator,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: superTicketValidator,
        },
      },
    },
    400: badRequestSchema,
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});

export const buySuperTicket = createRoute({
  method: 'post',
  path: '/super_tickets/buy/{id}',
  summary: 'Buy super ticket',
  description: 'Buy super ticket',
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
          schema: superTicketValidator,
        },
      },
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});

export const bookSeatSuperTicket = createRoute({
  method: 'patch',
  path: '/super_tickets/book/{id}',
  summary: 'Use super ticket',
  description: 'Use super ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
    body: {
      content: {
        'application/json': {
          schema: z.object({
            seat: z.number().min(1),
            screening_id: z.coerce.number().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.object({
            uses: z.number().min(0),
          }),
        },
      },
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});

export const updateSuperTicket = createRoute({
  method: 'patch',
  path: '/super_tickets/{id}',
  summary: 'Update super ticket',
  description: 'Update super ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
    body: {
      content: {
        'application/json': {
          schema: updateSuperTicketValidator,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: superTicketValidator,
        },
      },
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});

export const useSuperTicket = createRoute({
  method: 'patch',
  path: '/super_tickets/use/{id}',
  summary: 'Use super ticket',
  description: 'Use super ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
    body: {
      content: {
        'application/json': {
          schema: z.object({
            seat: z.number().min(1),
            screening_id: z.coerce.number().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response',
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});

export const deleteSuperTicket = createRoute({
  method: 'delete',
  path: '/super_tickets/{id}',
  summary: 'Delete super ticket',
  description: 'Delete super ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
  },
  responses: {
    200: {
      description: 'Successful response',
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});

export const cancelBookingSuperTicket = createRoute({
  method: 'delete',
  path: '/super_tickets/cancel/{id}',
  summary: 'Cancel a seat booking with a super ticket',
  description: 'Cancel a seat booking with a super ticket',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
    body: {
      content: {
        'application/json': {
          schema: z.object({
            seat: z.number().min(1),
            screening_id: z.coerce.number().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.object({
            uses: z.number().min(0),
          }),
        },
      },
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});
