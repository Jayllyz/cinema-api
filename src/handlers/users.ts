import { OpenAPIHono } from '@hono/zod-openapi';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/database.js';
import { type PayloadValidator, Role, checkToken } from '../lib/token.js';
import { zodErrorHook } from '../lib/zodError.js';
import {
  changeUserPassword,
  deleteUser,
  getMe,
  getUserById,
  getUsers,
  insertUser,
  updateUser,
  updateUserMoney,
} from '../routes/users.js';

export const users = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

// GET ROUTES
users.openapi(getUsers, async (c) => {
  const token = c.req.header('authorization')?.split(' ')[1];
  const payload: PayloadValidator = c.get('jwtPayload');
  await checkToken(payload, Role.STAFF, token);
  const { skip, take, search, all } = c.req.valid('query');

  const where = search ? { email: { contains: search } } : {};

  if (all) {
    const users = await prisma.users.findMany({
      select: { id: true, first_name: true, last_name: true, email: true, money: true, role: true },
      where,
      orderBy: { id: 'asc' },
    });
    return c.json(users, 200);
  }

  const users = await prisma.users.findMany({ where, skip, take, orderBy: { id: 'asc' } });
  return c.json(users, 200);
});

users.openapi(getMe, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.USER, token);

  const user = await prisma.users.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      money: true,
      role: true,
    },
  });

  if (!user) return c.json({ error: `User with id ${payload.id} not found` }, 404);

  return c.json(user, 200);
});

users.openapi(changeUserPassword, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.USER, token);

  const id = payload.id;
  const { password } = c.req.valid('json');

  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) return c.json({ error: `User with id ${id} not found` }, 404);

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.users.update({ where: { id }, data: { password: hashedPassword } });

  return c.json({ message: 'Password updated' }, 200);
});

users.openapi(getUserById, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  const { id } = c.req.valid('param');

  const user = await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      money: true,
      role: true,
    },
  });

  if (!user) return c.json({ error: `User with id ${id} not found` }, 404);

  return c.json(user, 200);
});

// POST ROUTES
users.openapi(insertUser, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { first_name, last_name, email, password } = c.req.valid('json');

  const emailUsed = await prisma.users.findUnique({ where: { email } });
  if (emailUsed) return c.json({ error: 'email already used' }, 400);

  const employeeFound = await prisma.employees.findUnique({ where: { email } });
  if (employeeFound) return c.json({ error: 'email already used' }, 400);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: { first_name, last_name, email, password: hashedPassword },
  });

  return c.json(user, 201);
});

// PATCH ROUTES
users.openapi(updateUserMoney, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.USER, token);

  const { deposit, withdraw } = c.req.valid('query');
  if (!deposit && !withdraw) {
    return c.json({ error: 'One of deposit or withdraw is required' }, 400);
  }

  if (deposit && withdraw) {
    return c.json({ error: 'You can only deposit or withdraw at a time' }, 400);
  }

  const id = payload.id;

  const userExists = await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      money: true,
      role: true,
    },
  });
  if (!userExists) return c.json({ error: `User with id ${id} not found` }, 404);

  let user = userExists;

  if (deposit) {
    user = await prisma.users.update({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        money: true,
        role: true,
      },
      data: { money: { increment: deposit } },
    });
  }
  if (withdraw) {
    if (userExists.money < withdraw) {
      return c.json({ error: 'Not enough money to withdraw' }, 400);
    }

    user = await prisma.users.update({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        money: true,
        role: true,
      },
      data: { money: { decrement: withdraw } },
    });
  }

  return c.json(user, 200);
});

users.openapi(updateUser, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  const { first_name, last_name, email } = c.req.valid('json');

  const userExists = await prisma.users.findUnique({ where: { id } });
  if (!userExists) return c.json({ error: `User with id ${id} not found` }, 404);

  const user = await prisma.users.update({
    where: { id },
    data: { first_name, last_name, email },
  });
  return c.json(user, 200);
});

// DELETE ROUTES
users.openapi(deleteUser, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');

  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) return c.json({ error: `User with id ${id} not found` }, 404);

  await prisma.users.delete({ where: { id } });

  return c.json({ message: `User with id ${id} deleted` }, 200);
});
