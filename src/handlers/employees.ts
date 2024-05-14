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
  const { skip, take, search, all } = c.req.valid('query');

  const where = search ? { email: { contains: search } } : {};

  try {
    if (all) {
      const employees = await prisma.employees.findMany({
        select: { id: true, first_name: true, last_name: true, email: true, phone_number: true, role: true },
        where,
        orderBy: { id: 'asc' },
      });
      return c.json(employees, 200);
    }

    const employees = await prisma.employees.findMany({
      select: { id: true, first_name: true, last_name: true, email: true, phone_number: true, role: true },
      where,
      skip,
      take,
      orderBy: { id: 'asc' },
    });
    return c.json(employees, 200);
  } catch (error) {
    return c.json({ error }, 500);
  }
});

employees.openapi(changeEmployeePassword, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  const { id } = payload;
  const { password } = c.req.valid('json');

  try {
    const staff = await prisma.employees.findUnique({ where: { id } });
    if (!staff) return c.json({ error: `Employee with id ${payload.id} not found` }, 404);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.employees.update({ where: { id }, data: { password: hashedPassword } });

    return c.json({ message: 'Password updated' }, 200);
  } catch (error) {
    return c.json({ error }, 500);
  }
});

employees.openapi(insertEmployee, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { first_name, last_name, phone_number, email, password } = c.req.valid('json');
  try {
    const userExist = await prisma.users.findUnique({ where: { email } });
    if (userExist) return c.json({ error: 'email already used' }, 400);

    const employeeFound = await prisma.employees.findUnique({ where: { email } });
    if (employeeFound) return c.json({ error: 'email already used' }, 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await prisma.employees.create({
      data: { first_name, last_name, phone_number, email, password: hashedPassword },
      select: { id: true, first_name: true, last_name: true, email: true, phone_number: true, role: true },
    });
    return c.json(employee, 201);
  } catch (error) {
    return c.json({ error }, 500);
  }
});

employees.openapi(getEmployeeById, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  const { id } = c.req.valid('param');
  try {
    const employee = await prisma.employees.findUnique({
      select: { id: true, first_name: true, last_name: true, email: true, phone_number: true, role: true },
      where: { id },
    });
    if (!employee) return c.json({ error: `Employee with id ${id} not found` }, 404);

    return c.json(employee, 200);
  } catch (error) {
    return c.json({ error }, 500);
  }
});

employees.openapi(updateEmployee, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  const { first_name, last_name, phone_number, email, role } = c.req.valid('json');
  try {
    const employee = await prisma.employees.findUnique({ where: { id } });
    if (!employee) return c.json({ error: `Employee with id ${id} not found` }, 404);

    const res = await prisma.employees.update({
      where: { id: Number(id) },
      data: { first_name, last_name, phone_number, email, role },
      select: { id: true, first_name: true, last_name: true, email: true, phone_number: true, role: true },
    });

    if (role) {
      // If role is updated, remove token
      await prisma.employees.update({ where: { id: Number(id) }, data: { token: null } });
    }

    return c.json(res, 200);
  } catch (error) {
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
    return c.json({ error }, 500);
  }
});
