import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {insertEmployee} from '../routes/employees.js';
import {zodErrorHook} from '../lib/zodError.js';

export const employees = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

employees.openapi(insertEmployee, async (c) => {
  const {first_name, last_name, phone_number} = c.req.valid('json');
  try {
    const employee = await prisma.employees.create({
      data: {first_name, last_name, phone_number},
    });
    return c.json(employee, 201);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
