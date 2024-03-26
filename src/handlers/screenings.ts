import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {getScreenings} from '../routes/screenings.js';

export const screenings = new OpenAPIHono();

screenings.openapi(getScreenings, async (c) => {
  try {
    const screenings = await prisma.screenings.findMany({
      include: {
        movie: true, // Include movie data
        room: true, // Include room data
      },
    });

    console.log(screenings);

    return c.json({test: 'ok'}, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
