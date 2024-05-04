import { OpenAPIHono } from '@hono/zod-openapi';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/database.js';
import { type PayloadValidator, Role, checkToken } from '../lib/token.js';
import { zodErrorHook } from '../lib/zodError.js';
import {
  changeEmployeePassword,
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
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  try {
    const employees = await prisma.employees.findMany();
    return c.json(employees, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

employees.openapi(getEmployeeById, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  const { id } = c.req.valid('param');
  try {
    const employee = await prisma.employees.findUnique({ where: { id } });
    if (!employee) return c.json({ error: `Employee with id ${id} not found` }, 404);

    return c.json(employee, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

employees.openapi(insertEmployee, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { first_name, last_name, phone_number, email, password } = c.req.valid('json');
  try {
    const employee = await prisma.employees.create({
      data: { first_name, last_name, phone_number, email, password },
    });
    return c.json(employee, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

employees.openapi(deleteEmployee, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  try {
    const employees = await prisma.employees.findUnique({ where: { id } });
    if (!employees) return c.json({ error: `Employee with id ${id} not found` }, 404);

    await prisma.employees.delete({ where: { id: Number(id) } });

    return c.json({ message: `Employee with id ${id} deleted` }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

employees.openapi(updateEmployee, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  const { first_name, last_name, phone_number, email } = c.req.valid('json');
  try {
    const employee = await prisma.employees.findUnique({ where: { id } });
    if (!employee) return c.json({ error: `Employee with id ${id} not found` }, 404);

    const res = await prisma.employees.update({
      where: { id: Number(id) },
      data: { first_name, last_name, phone_number, email },
    });

    return c.json(res, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

employees.openapi(changeEmployeePassword, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  const { id } = payload;
  const { old_password, new_password } = c.req.valid('json');
  try {
    const user = await prisma.employees.findUnique({ where: { id } });
    if (!user) return c.json({ error: `Employee with id ${id} not found` }, 404);

    const passwordMatch = bcrypt.compare(old_password, user.password);
    if (!passwordMatch) return c.json({ error: 'Old password does not match' }, 400);

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prisma.employees.update({ where: { id }, data: { password: hashedPassword } });

    return c.json({ message: 'Password updated' }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});
