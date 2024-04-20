import { createRoute, z } from '@hono/zod-openapi';
import {
  employeeResponseSchema,
  employeeValidator,
  insertEmployeeValidator,
  listEmployeesValidator,
  updateEmployeeValidator,
} from '../validators/employees';
import authMiddleware from '../middlewares/token';

export const insertEmployee = createRoute({
  method: 'post',
  path: '/employees',
  summary: 'Insert an employee',
  description: 'Insert an employee',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertEmployeeValidator,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Employee created',
      content: {
        'application/json': {
          schema: employeeResponseSchema,
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
  tags: ['employees'],
});

export const getEmployees = createRoute({
  method: 'get',
  path: '/employees',
  summary: 'Get all employee',
  description: 'Get all employee',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listEmployeesValidator,
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
  tags: ['employees'],
});

export const getEmployeeById = createRoute({
  method: 'get',
  path: '/employees/{id}',
  summary: 'Get an employee by id',
  description: 'Get an employee by id',
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
          schema: employeeValidator,
        },
      },
    },
    404: {
      description: 'Employee not found',
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
  tags: ['employees'],
});

export const deleteEmployee = createRoute({
  method: 'delete',
  path: '/employees/{id}',
  summary: 'Delete an employee',
  description: 'Delete an employee',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.coerce.number().min(1) }),
  },
  responses: {
    200: {
      description: 'employee deleted',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: 'Employee not found',
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
  tags: ['employees'],
});

export const updateEmployee = createRoute({
  method: 'patch',
  path: '/employees/{id}',
  summary: 'Update a employee',
  description: 'Update a employee',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.coerce.number().min(1) }),
    body: {
      content: {
        'application/json': {
          schema: updateEmployeeValidator,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Employee updated',
      content: {
        'application/json': {
          schema: employeeValidator,
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
  tags: ['employees'],
});
