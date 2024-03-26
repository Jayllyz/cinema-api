import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {getScreenings} from '../routes/screenings.js';
import {number} from 'zod';
import {log} from 'console';

export const screenings = new OpenAPIHono();

screenings.openapi(getScreenings, async (c) => {
  try {
    const screenings = await prisma.screenings.findMany({
      select: {
        id: true,
        start_time: true,
        end_time: true,
        movie: true,
        room: true,
      },
    });

    log(screenings);

    return c.json(screenings, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
