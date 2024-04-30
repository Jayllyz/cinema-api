import { createRoute, z } from '@hono/zod-openapi';
import authMiddleware from '../middlewares/token.js';
import {
  insertWorkingShiftsValidator,
  listworkingShiftsValidator,
  updateWorkingShiftsValidator,
  workingShiftsResponseSchema,
} from '../validators/working_shifts.js';

export const insertWorkingShift = createRoute({
  method: 'post',
  path: '/working_shifts',
  summary: 'Insert an working shift',
  description: 'Insert an working shift',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertWorkingShiftsValidator,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Working shift created',
      content: {
        'application/json': {
          schema: workingShiftsResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid body',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['working_shifts'],
});

export const getWorkingShifts = createRoute({
  method: 'get',
  path: '/working_shifts',
  summary: 'Get all working shift',
  description: 'Get all working shift',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listworkingShiftsValidator,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['working_shifts'],
});

export const getWorkingShiftById = createRoute({
  method: 'get',
  path: '/working_shifts/{id}',
  summary: 'Get a working shift by id',
  description: 'Get a working shift by id',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.coerce.number().min(1) }),
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: workingShiftsResponseSchema,
        },
      },
    },
    404: {
      description: 'Working shift not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['working_shifts'],
});

export const deleteWorkingShift = createRoute({
  method: 'delete',
  path: '/working_shifts/{id}',
  summary: 'Delete a working shift',
  description: 'Delete a working shift',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.coerce.number().min(1) }),
  },
  responses: {
    200: {
      description: 'working shift deleted',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: 'Working shift not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['working_shifts'],
});

export const updateWorkingShift = createRoute({
  method: 'patch',
  path: '/working_shifts/{id}',
  summary: 'Update a working shift',
  description: 'Update a working shift',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.coerce.number().min(1) }),
    body: {
      content: {
        'application/json': {
          schema: updateWorkingShiftsValidator,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Working shift updated',
      content: {
        'application/json': {
          schema: workingShiftsResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid body',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['working_shifts'],
});
