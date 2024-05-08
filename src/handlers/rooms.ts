import { OpenAPIHono } from '@hono/zod-openapi';
import { prisma } from '../lib/database.js';
import { type PayloadValidator, Role, checkToken } from '../lib/token.js';
import { zodErrorHook } from '../lib/zodError.js';
import { deleteRoom, getRoomById, getRooms, insertRoom, updateRoom } from '../routes/rooms.js';

export const rooms = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

rooms.openapi(getRooms, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);
  const { skip, take, search, all } = c.req.valid('query');
  
  const where = search ? { name: { contains: search } } : {};

  try {
    if (all) {
      const rooms = await prisma.rooms.findMany({ where, orderBy: { id: 'asc' } });
      return c.json(rooms, 200);
    }
    
    const rooms = await prisma.rooms.findMany({ where, skip, take, orderBy: { id: 'asc' } });
    return c.json(rooms, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

rooms.openapi(getRoomById, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  const { id } = c.req.valid('param');
  try {
    const room = await prisma.rooms.findUnique({ where: { id } });
    if (!room) return c.json({ error: `Room with id ${id} not found` }, 404);

    return c.json(room, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

rooms.openapi(insertRoom, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { name, description, capacity, type, open, handicap_access } = c.req.valid('json');
  try {
    const exist = await prisma.rooms.findUnique({ where: { name } });
    if (exist) return c.json({ error: 'Room name already exists' }, 400);

    const room = await prisma.rooms.create({
      data: { name, description, capacity, type, open, handicap_access },
    });
    return c.json(room, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

rooms.openapi(deleteRoom, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  try {
    const room = await prisma.rooms.findUnique({ where: { id } });
    if (!room) return c.json({ error: `Room with id ${id} not found` }, 404);

    await prisma.rooms.delete({ where: { id } });

    return c.json({ message: `Room with id ${id} deleted` }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

rooms.openapi(updateRoom, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  const { name, description, capacity, type, open, handicap_access } = c.req.valid('json');
  try {
    const room = await prisma.rooms.findUnique({ where: { id } });
    if (!room) return c.json({ error: `Room with id ${id} not found` }, 404);

    const res = await prisma.rooms.update({
      where: { id },
      data: { name, description, capacity, type, open, handicap_access },
    });

    return c.json(res, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});
