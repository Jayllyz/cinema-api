import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {getRooms, getRoomById, insertRoom, deleteRoom, updateRoom} from '../routes/rooms.js';
import {zodErrorHook} from '../lib/zodError.js';

export const rooms = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

rooms.openapi(getRooms, async (c) => {
  try {
    const rooms = await prisma.rooms.findMany();
    return c.json(rooms, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

rooms.openapi(getRoomById, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const room = await prisma.rooms.findUnique({where: {id}});
    if (!room) return c.json({error: `Room with id ${id} not found`}, 404);

    return c.json(room, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

rooms.openapi(insertRoom, async (c) => {
  const {name, description, capacity, type, open, handicap_access} = c.req.valid('json');
  console.log({name, description, capacity, type, open, handicap_access});
  try {
    const exist = await prisma.rooms.findUnique({where: {name}});
    if (exist) return c.json({error: 'Room name already exists'}, 400);

    const room = await prisma.rooms.create({
      data: {name, description, capacity, type, open, handicap_access},
    });
    return c.json(room, 201);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

rooms.openapi(deleteRoom, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const room = await prisma.rooms.findUnique({where: {id}});
    if (!room) return c.json({error: `Room with id ${id} not found`}, 404);

    await prisma.rooms.delete({where: {id}});

    return c.json({message: `Room with id ${id} deleted`}, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

rooms.openapi(updateRoom, async (c) => {
  const {id} = c.req.valid('param');
  const {name, description, capacity, type, open, handicap_access} = c.req.valid('json');
  try {
    const room = await prisma.rooms.findUnique({where: {id}});
    if (!room) return c.json({error: `Room with id ${id} not found`}, 404);

    const res = await prisma.rooms.update({
      where: {id},
      data: {name, description, capacity, type, open, handicap_access},
    });

    return c.json(res, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
