import {Hono} from 'hono';
import {prisma} from '../lib/database.js';

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
