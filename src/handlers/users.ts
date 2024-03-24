import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database';
import {getUserById, getUsers, insertUser} from '../routes/users';
import {ErrorHandler} from '../handlers/error';

export const users = new OpenAPIHono();

// GET ROUTES
users.openapi(getUsers, async (c) => {
  try {
    const users = await prisma.uSERS.findMany();
    const responseJson = users.map((user) => ({
      id: Number(user.id),
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      money: Number(user.money),
    }));
    return c.json(responseJson, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

users.openapi(
  getUserById,
  async (c) => {
    const {id} = c.req.valid('param');
    try {
      const user = await prisma.uSERS.findUnique({where: {id}});
      if (!user) return c.json({error: `User with id ${id} not found`}, 404);

      return c.json(
        {
          id: Number(user.id),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          money: Number(user.money),
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json({error: error}, 500);
    }
  },
  (result, c) => {
    if (!result.success) {
      return c.json({error: 'Invalid parameter'}, 400);
    }
  }
);

// POST ROUTES
users.openapi(
  insertUser,
  async (c) => {
    const {first_name, last_name, email, password} = c.req.valid('json');

    const emailUsed = await prisma.uSERS.findFirst({where: {email}});
    if (emailUsed) {
      return c.json({error: 'email already used'}, 400);
    }

    try {
      const user = await prisma.uSERS.create({
        data: {first_name, last_name, email, password, money: '0', token: ''},
      });
      return c.json(user, 201);
    } catch (error) {
      console.error(error);
      return c.json({error: error}, 500);
    }
  },
  (result, c) => {
    if (!result.success) {
      return c.json(ErrorHandler(result.error), 400);
    }
  }
);
