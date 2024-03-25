import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {getRooms, getRoomById, insertRoom, deleteRoom, updateRoom} from '../routes/rooms.js';

export const rooms = new OpenAPIHono();

rooms.openapi(getRooms, async (c) => {
  try {
    const rooms = await prisma.rOOMS.findMany();
    return c.json(rooms, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

rooms.openapi(
  getRoomById,
  async (c) => {
    const {id} = c.req.valid('param');
    try {
      const room = await prisma.rOOMS.findUnique({where: {id}});
      if (!room) return c.json({error: `Room with id ${id} not found`}, 404);

      return c.json(room, 200);
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

rooms.openapi(
  insertRoom,
  async (c) => {
    const {number, capacity, type, status} = c.req.valid('json');
    try {
      const exist = await prisma.rOOMS.findUnique({where: {number}});
      if (exist) return c.json({error: 'Room number already exists'}, 400);

      const room = await prisma.rOOMS.create({
        data: {number, capacity, type, status},
      });
      return c.json(room, 201);
    } catch (error) {
      console.error(error);
      return c.json({error: error}, 500);
    }
  },
  (result, c) => {
    if (!result.success) {
      return c.json({error: 'Invalid body'}, 400);
    }
  }
);

rooms.openapi(
  deleteRoom,
  async (c) => {
    const {id} = c.req.valid('param');
    try {
      const room = await prisma.rOOMS.findUnique({where: {id}});
      if (!room) return c.json({error: `Room with id ${id} not found`}, 404);

      await prisma.rOOMS.delete({where: {id: Number(id)}});

      return c.json({message: `Room with id ${id} deleted`}, 200);
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

rooms.openapi(
  updateRoom,
  async (c) => {
    const {id} = c.req.valid('param');
    const {number, capacity, type, status} = c.req.valid('json');
    try {
      const room = await prisma.rOOMS.findUnique({where: {id}});
      if (!room) return c.json({error: `Room with id ${id} not found`}, 404);

      const res = await prisma.rOOMS.update({
        where: {id: Number(id)},
        data: {number, capacity, type, status},
      });

      return c.json(res, 200);
    } catch (error) {
      console.error(error);
      return c.json({error: error}, 500);
    }
  },
  (result, c) => {
    if (!result.success) {
      return c.json({error: 'Bad request'}, 400);
    }
  }
);
