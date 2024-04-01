import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {zodErrorHook} from '../lib/zodError.js';
import {
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  insertEmployee,
  updateEmployee,
} from '../routes/employees.js';

export const employees = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

employees.openapi(getEmployees, async (c) => {
  try {
    const employees = await prisma.employees.findMany();
    return c.json(employees, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

employees.openapi(getEmployeeById, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const employee = await prisma.employees.findUnique({where: {id}});
    if (!employee) return c.json({error: `Employee with id ${id} not found`}, 404);

    return c.json(employee, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
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

employees.openapi(deleteEmployee, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const employees = await prisma.employees.findUnique({where: {id}});
    if (!employees) return c.json({error: `Employee with id ${id} not found`}, 404);

    await prisma.employees.delete({where: {id: Number(id)}});

    return c.json({message: `Employee with id ${id} deleted`}, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

employees.openapi(updateEmployee, async (c) => {
  const {id} = c.req.valid('param');
  const {first_name, last_name, phone_number} = c.req.valid('json');
  try {
    const employee = await prisma.employees.findUnique({where: {id}});
    if (!employee) return c.json({error: `Employee with id ${id} not found`}, 404);

    const res = await prisma.employees.update({
      where: {id: Number(id)},
      data: {first_name, last_name, phone_number},
    });

    return c.json(res, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
