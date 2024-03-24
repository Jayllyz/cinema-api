import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database';
import {getUsers} from '../routes/users';

export const users = new OpenAPIHono();

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
