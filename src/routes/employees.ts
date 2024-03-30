import {createRoute, z} from '@hono/zod-openapi';
import {employeeResponseSchema, insertEmployeeValidator} from '../validators/employees';

export const insertEmployee = createRoute({
  method: 'post',
  path: '/employees',
  summary: 'Insert an employee',
  description: 'Insert an employee',
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
          schema: z.object({error: z.string()}),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['employees'],
});
