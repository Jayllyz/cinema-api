import {Hono} from 'hono';
import {prisma} from '../lib/database.js';
import {zValidator} from '@hono/zod-validator';
import {idValidator, insertRoomValidator, updateRoomValidator} from '../validators/rooms.js';

export const rooms = new Hono();

rooms.get('/rooms', async (c) => {
  try {
    const rooms = await prisma.rooms.findMany();
    return c.json(rooms, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

rooms.get(
  '/rooms/:id',
  zValidator('param', idValidator, (result, c) => {
    if (!result.success) {
      return c.json({error: 'Invalid parameter'}, 400);
    }
  }),
  async (c) => {
    const {id} = c.req.valid('param');
    try {
      const room = await prisma.rooms.findUnique({where: {id}});
      if (!room) return c.json({error: `Room with id ${id} not found`}, 404);

      return c.json(room, 200);
    } catch (error) {
      console.error(error);
      return c.json({error: error}, 500);
    }
  }
);

rooms.post(
  '/rooms',
  zValidator('json', insertRoomValidator, (result, c) => {
    if (!result.success) {
      return c.json({error: 'Invalid body'}, 400);
    }
  }),
  async (c) => {
    const {number, capacity, type, status} = c.req.valid('json');
    try {
      const room = await prisma.rooms.create({
        data: {number, capacity, type, status},
      });
      return c.json(room, 201);
    } catch (error) {
      console.error(error);
      return c.json({error: error}, 500);
    }
  }
);

rooms.delete(
  '/rooms/:id',
  zValidator('param', idValidator, (result, c) => {
    if (!result.success) {
      return c.json({error: 'Invalid parameter'}, 400);
    }
  }),
  async (c) => {
    const {id} = c.req.valid('param');
    try {
      const room = await prisma.rooms.findUnique({where: {id}});
      if (!room) return c.json({error: `Room with id ${id} not found`}, 404);

      await prisma.rooms.delete({where: {id: Number(id)}});

      return c.json({message: `Room with id ${id} deleted`}, 200);
    } catch (error) {
      console.error(error);
      return c.json({error: error}, 500);
    }
  }
);

rooms.patch(
  '/rooms/:id',
  zValidator('param', idValidator, (result, c) => {
    if (!result.success) {
      return c.json({error: 'Invalid parameter'}, 400);
    }
  }),
  zValidator('json', updateRoomValidator, (result, c) => {
    if (!result.success) {
      return c.json({error: 'Invalid body'}, 400);
    }
  }),
  async (c) => {
    const {id} = c.req.valid('param');
    const {number, capacity, type, status} = c.req.valid('json');
    try {
      const room = await prisma.rooms.findUnique({where: {id}});
      if (!room) return c.json({error: `Room with id ${id} not found`}, 404);

      const res = await prisma.rooms.update({
        where: {id: Number(id)},
        data: {number, capacity, type, status},
      });

      return c.json(res, 200);
    } catch (error) {
      console.error(error);
      return c.json({error: error}, 500);
    }
  }
);
