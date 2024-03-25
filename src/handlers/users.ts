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
import {ErrorHandler} from './error';
import bcrypt from 'bcryptjs';

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
      return c.json(ErrorHandler(result.error), 400);
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
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.uSERS.create({
        data: {first_name, last_name, email, password: hashedPassword, money: 0, token: ''},
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

// PATCH ROUTES
users.openapi(
  updateUser,
  async (c) => {
    const {id} = c.req.valid('param');
    const {first_name, last_name, email, money} = c.req.valid('json');

    try {
      const userExists = await prisma.uSERS.findUnique({where: {id}});
      if (!userExists) return c.json({error: `User with id ${id} not found`}, 404);

      const user = await prisma.uSERS.update({
        where: {id},
        data: {first_name, last_name, email, money},
      });
      return c.json(user, 200);
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

users.openapi(
  updateUserMoney,
  async (c) => {
    const {id} = c.req.valid('param');
    const {deposit, withdraw} = c.req.valid('query');
    try {
      const userExists = await prisma.uSERS.findUnique({where: {id}});
      if (!userExists) return c.json({error: `User with id ${id} not found`}, 404);

      if (!deposit && !withdraw) {
        return c.json({error: 'One of deposit or withdraw is required'}, 400);
      }

      if (deposit && withdraw) {
        return c.json({error: 'You can only deposit or withdraw at a time'}, 400);
      }

      let returnedJson: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        money: number;
      } = {
        id: userExists.id,
        first_name: userExists.first_name,
        last_name: userExists.last_name,
        email: userExists.email,
        money: userExists.money,
      };

      if (deposit) {
        const user = await prisma.uSERS.update({
          where: {id},
          data: {money: {increment: deposit}},
        });

        returnedJson = {
          id: Number(user.id),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          money: Number(user.money),
        };
      }
      if (withdraw) {
        if (userExists.money < withdraw) {
          return c.json({error: 'Not enough money to withdraw'}, 400);
        }

        const user = await prisma.uSERS.update({
          where: {id},
          data: {money: {decrement: withdraw}},
        });

        returnedJson = {
          id: Number(user.id),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          money: Number(user.money),
        };
      }

      return c.json(returnedJson, 200);
    } catch (error) {
      console.error(error);
      return c.json({error: 'An error occurred while updating the user money value'}, 500);
    }
  },
  (result, c) => {
    if (!result.success) {
      return c.json(ErrorHandler(result.error), 400);
    }
  }
);

// DELETE ROUTES
users.openapi(
  deleteUser,
  async (c) => {
    const {id} = c.req.valid('param');
    try {
      const user = await prisma.uSERS.findUnique({where: {id}});
      if (!user) return c.json({error: `User with id ${id} not found`}, 404);

      await prisma.uSERS.delete({where: {id}});

      return c.json({message: `User with id ${id} deleted`}, 200);
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
