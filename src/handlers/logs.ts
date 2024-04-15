import { OpenAPIHono } from '@hono/zod-openapi';
import { prisma } from '../lib/database.js';
import { type PayloadValidator, Role, checkToken } from '../lib/token.js';
import { zodErrorHook } from '../lib/zodError.js';
import { getLogById, getLogs } from '../routes/logs.js';

export const logs = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

logs.openapi(getLogs, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  try {
    const { user_id, action, created_at } = c.req.valid('query');
    const logs = await prisma.logs.findMany({
      where: {
        user_id: user_id,
        action: { equals: action },
        created_at: { equals: created_at},
      },
      select: {
        id: true,
        user_id: true,
        action: true,
        description: true,
        created_at: true,
      },
    });
    return c.json(logs, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: error }, 500);
  }
});

logs.openapi(getLogById, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  const { id } = c.req.valid('param');
  try {
    const log = await prisma.logs.findUnique({
      where: { id },
    });

    if (!log) return c.json({ error: `Log with id ${id} not found` }, 404);

    return c.json(log, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: error }, 500);
  }
});
