import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database';
import {sign} from 'hono/jwt';
import bcrypt from 'bcryptjs';
import {loginUser, signupUser} from '../routes/auth';
import {zodErrorHook} from '../lib/zodError.js';

export const auth = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

auth.openapi(loginUser, async (c) => {
  const {email, password} = c.req.valid('json');

  const user = await prisma.users.findUnique({where: {email}});
  if (!user) return c.json({error: 'email not found'}, 404);

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return c.json({error: 'password does not match'}, 400);

  const one_day = 60 * 60 * 24;
  const payload = {
    id: user.id,
    table: 'users',
    exp: new Date().getTime() + one_day,
  };
  const secret = process.env.SECRET_KEY || 'secret';

  const token = await sign(payload, secret);

  await prisma.users.update({
    where: {id: user.id},
    data: {token: token},
  });

  return c.json({token}, 200);
});

auth.openapi(signupUser, async (c) => {
  const {first_name, last_name, email, password} = c.req.valid('json');

  const used = await prisma.users.findUnique({where: {email}});
  if (used) return c.json({error: 'email already used'}, 400);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      first_name,
      last_name,
      email,
      password: hashedPassword,
    },
  });

  return c.json(user, 201);
});
