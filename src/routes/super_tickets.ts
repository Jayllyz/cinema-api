import {createRoute, z} from '@hono/zod-openapi';
import {
  listSuperTicketValidator,
  superTicketValidator,
  insertSuperTicketValidator,
  updateSuperTicketValidator,
} from '../validators/super_tickets';

const serverErrorSchema = {
  description: 'Internal server error',
  content: {
    'application/json': {
      schema: z.object({error: z.string()}),
    },
  },
};

export const getSuperTickets = createRoute({
  method: 'get',
  path: '/super_tickets',
  summary: 'Get all super tickets',
  description: 'Get all super tickets',
  security: [{Bearer: []}],
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
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
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
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});

export const insertSuperTicket = createRoute({
  method: 'post',
  path: '/super_tickets',
  summary: 'Insert super ticket',
  description: 'Insert super ticket',
  security: [{Bearer: []}],
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
  tags: ['super_tickets'],
});

export const buySuperTicket = createRoute({
  method: 'post',
  path: '/super_tickets/buy/{id}',
  summary: 'Buy super ticket',
  description: 'Buy super ticket',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
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
  tags: ['super_tickets'],
});

export const bookSeatSuperTicket = createRoute({
  method: 'patch',
  path: '/super_tickets/book/{id}',
  summary: 'Use super ticket',
  description: 'Use super ticket',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
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
  tags: ['super_tickets'],
});

export const updateSuperTicket = createRoute({
  method: 'patch',
  path: '/super_tickets/{id}',
  summary: 'Update super ticket',
  description: 'Update super ticket',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
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
  tags: ['super_tickets'],
});

export const useSuperTicket = createRoute({
  method: 'patch',
  path: '/super_tickets/use/{id}',
  summary: 'Use super ticket',
  description: 'Use super ticket',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
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
  tags: ['super_tickets'],
});

export const deleteSuperTicket = createRoute({
  method: 'delete',
  path: '/super_tickets/{id}',
  summary: 'Delete super ticket',
  description: 'Delete super ticket',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
  },
  responses: {
    200: {
      description: 'Successful response',
    },
    500: serverErrorSchema,
  },
  tags: ['super_tickets'],
});

export const cancelBookingSuperTicket = createRoute({
  method: 'delete',
  path: '/super_tickets/cancel/{id}',
  summary: 'Cancel a seat booking with a super ticket',
  description: 'Cancel a seat booking with a super ticket',
  security: [{Bearer: []}],
  request: {
    params: z.object({id: z.coerce.number().min(1)}),
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
  tags: ['super_tickets'],
});
