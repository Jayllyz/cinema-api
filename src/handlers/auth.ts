import { OpenAPIHono } from '@hono/zod-openapi';
import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { prisma } from '../lib/database.js';
import { type PayloadValidator, Role, checkToken } from '../lib/token.js';
import { zodErrorHook } from '../lib/zodError.js';
import { loginUser, logout, signupUser } from '../routes/auth.js';

export const auth = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

auth.openapi(loginUser, async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    const staff = await prisma.employees.findUnique({ where: { email } });

    if (!user && !staff) return c.json({ error: 'email not found' }, 404);

    if (user) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return c.json({ error: 'invalid password' }, 401);
    } else if (staff) {
      const valid = await bcrypt.compare(password, staff.password);
      if (!valid) return c.json({ error: 'invalid password' }, 401);
    }

    const one_day = 60 * 60 * 24;
    const one_week = one_day * 7;
    const time_exp = user ? one_day : one_week;
    const payload = {
      id: user ? user?.id : staff?.id,
      role: user ? Number(user?.role) : Number(staff?.role),
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

auth.openapi(logout, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.USER, token);

  try {
    if (payload.role === Role.USER) {
      await prisma.users.update({
        where: { id: payload.id },
        data: { token: null },
      });
    } else {
      await prisma.employees.update({
        where: { id: payload.id },
        data: { token: null },
      });
    }

    return c.json({ message: 'logout successfully' }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});
