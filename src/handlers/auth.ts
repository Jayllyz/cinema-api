import { OpenAPIHono } from '@hono/zod-openapi';
import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { prisma } from '../lib/database.js';
import { Role } from '../lib/token.js';
import { zodErrorHook } from '../lib/zodError.js';
import { loginUser, signupUser } from '../routes/auth.js';

export const auth = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

auth.openapi(loginUser, async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    const staff = await prisma.employees.findUnique({ where: { email } });

    if (!user && !staff) return c.json({ error: 'email not found' }, 404);

    const checkPassword = user?.password || staff?.password;
    const passwordMatch = bcrypt.compare(password, checkPassword || '');
    if (!passwordMatch) return c.json({ error: 'password does not match' }, 400);

    const one_day = 60 * 60 * 24;
    const one_week = one_day * 7;
    const time_exp = user ? one_day : one_week;
    const payload = {
      id: user?.id || staff?.id,
      role: user ? Role.USER : Role.STAFF,
      exp: new Date().getTime() + time_exp,
    };
    const secret = process.env.SECRET_KEY || 'secret';

    const token = await sign(payload, secret);

    if (user) {
      await prisma.users.update({
        where: { id: user?.id },
        data: { token },
      });
    } else {
      await prisma.employees.update({
        where: { id: staff?.id },
        data: { token },
      });
    }

    return c.json({ token }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

auth.openapi(signupUser, async (c) => {
  const { first_name, last_name, email, password } = c.req.valid('json');

  try {
    const used = await prisma.users.findUnique({ where: { email } });
    if (used) return c.json({ error: 'email already used' }, 400);

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
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});
