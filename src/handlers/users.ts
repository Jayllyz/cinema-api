import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database';
import {
  getUserById,
  getUsers,
  insertUser,
  updateUser,
  deleteUser,
  updateUserMoney,
} from '../routes/users';
import bcrypt from 'bcryptjs';
import {checkToken, payloadValidator} from '../lib/token';
import {zodErrorHook} from '../lib/zodError.js';

export const users = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

// GET ROUTES
users.openapi(getUsers, async (c) => {
  try {
    const payload: payloadValidator = c.get('jwtPayload');
    const tokenValidity = await checkToken(payload, ['admin']);
    if (tokenValidity) return c.json(tokenValidity.error, tokenValidity.status);

    const users = await prisma.users.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        money: true,
        role: true,
      },
    });
    return c.json(users, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

users.openapi(getUserById, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const payload: payloadValidator = c.get('jwtPayload');
    const tokenValidity = await checkToken(payload, ['admin']);
    if (tokenValidity) return c.json(tokenValidity.error, tokenValidity.status);

    const user = await prisma.users.findUnique({
      where: {id},
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        money: true,
        role: true,
      },
    });

    if (!user) return c.json({error: `User with id ${id} not found`}, 404);

    return c.json(user, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

// POST ROUTES
users.openapi(insertUser, async (c) => {
  const payload: payloadValidator = c.get('jwtPayload');
  const tokenValidity = await checkToken(payload, ['admin']);
  if (tokenValidity) return c.json(tokenValidity.error, tokenValidity.status);

  const {first_name, last_name, email, password} = c.req.valid('json');

  const emailUsed = await prisma.users.findUnique({where: {email}});
  if (emailUsed) {
    return c.json({error: 'email already used'}, 400);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {first_name, last_name, email, password: hashedPassword},
    });
    return c.json(user, 201);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

// PATCH ROUTES
users.openapi(updateUserMoney, async (c) => {
  const {deposit, withdraw} = c.req.valid('query');
  try {
    const payload: payloadValidator = c.get('jwtPayload');
    const tokenValidity = await checkToken(payload, ['admin']);
    if (tokenValidity) return c.json(tokenValidity.error, tokenValidity.status);

    if (!deposit && !withdraw) {
      return c.json({error: 'One of deposit or withdraw is required'}, 400);
    }

    if (deposit && withdraw) {
      return c.json({error: 'You can only deposit or withdraw at a time'}, 400);
    }

    const id = payload.id;

    const userExists = await prisma.users.findUnique({
      where: {id},
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        money: true,
        role: true,
      },
    });
    if (!userExists) return c.json({error: `User with id ${id} not found`}, 404);

    let user = userExists;

    if (deposit) {
      user = await prisma.users.update({
        where: {id},
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          money: true,
          role: true,
        },
        data: {money: {increment: deposit}},
      });
    }
    if (withdraw) {
      if (userExists.money < withdraw) {
        return c.json({error: 'Not enough money to withdraw'}, 400);
      }

      user = await prisma.users.update({
        where: {id},
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          money: true,
          role: true,
        },
        data: {money: {decrement: withdraw}},
      });
    }

    return c.json(user, 200);
  } catch (error) {
    console.log('test');
    console.error(error);
    return c.json({error: 'An error occurred while updating the user money value'}, 500);
  }
});

users.openapi(updateUser, async (c) => {
  const {id} = c.req.valid('param');
  const {first_name, last_name, email, money} = c.req.valid('json');

  try {
    const payload: payloadValidator = c.get('jwtPayload');
    const tokenValidity = await checkToken(payload, ['admin']);
    if (tokenValidity) return c.json(tokenValidity.error, tokenValidity.status);

    const userExists = await prisma.users.findUnique({where: {id}});
    if (!userExists) return c.json({error: `User with id ${id} not found`}, 404);

    const user = await prisma.users.update({
      where: {id},
      data: {first_name, last_name, email, money},
    });
    return c.json(user, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

users.openapi(updateUser, async (c) => {
  const {id} = c.req.valid('param');
  const {first_name, last_name, email, money} = c.req.valid('json');

  try {
    const payload: payloadValidator = c.get('jwtPayload');
    const tokenValidity = await checkToken(payload, ['admin']);
    if (tokenValidity) return c.json(tokenValidity.error, tokenValidity.status);

    const userExists = await prisma.users.findUnique({where: {id}});
    if (!userExists) return c.json({error: `User with id ${id} not found`}, 404);

    const user = await prisma.users.update({
      where: {id},
      data: {first_name, last_name, email, money},
    });
    return c.json(user, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

// DELETE ROUTES
users.openapi(deleteUser, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const payload: payloadValidator = c.get('jwtPayload');
    const tokenValidity = await checkToken(payload, ['admin']);
    if (tokenValidity) return c.json(tokenValidity.error, tokenValidity.status);

    const user = await prisma.users.findUnique({where: {id}});
    if (!user) return c.json({error: `User with id ${id} not found`}, 404);

    await prisma.users.delete({where: {id}});

    return c.json({message: `User with id ${id} deleted`}, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
