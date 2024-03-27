import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {getScreenings, insertScreening} from '../routes/screenings.js';
import {log} from 'console';
import {isAfterHour, isBeforeHour} from '../lib/date.js';

export const screenings = new OpenAPIHono();

screenings.openapi(getScreenings, async (c) => {
  try {
    const screenings = await prisma.screenings.findMany({
      select: {
        id: true,
        start_time: true,
        screening_duration_minutes: true,
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

screenings.openapi(
  insertScreening,
  async (c) => {
    const {start_time, movie_id, room_id} = c.req.valid('json');

    try {
      const movie = await prisma.movies.findUnique({
        where: {
          id: movie_id,
        },
        select: {
          duration: true,
        },
      });

      if (!movie) {
        return c.json({error: `movie with id ${movie_id} not found`}, 400);
      }

      const screening_duration_minutes = movie.duration + 30;
      const end_time = new Date(start_time);
      end_time.setMinutes(end_time.getMinutes() + screening_duration_minutes);

      if (isBeforeHour(start_time, 9)) {
        return c.json({error: 'The screening cannot start before 9 am'});
      }

      if (isAfterHour(end_time, 19)) {
        return c.json({error: 'The screening cannot end after 8 pm'});
      }

      const roomExist = await prisma.rooms.count({
        where: {
          id: room_id,
        },
      });

      if (!roomExist) {
        return c.json({error: `room with id ${room_id} not found`}, 400);
      }

      const screeningAtSameTime = await prisma.screenings.findFirst({
        where: {
          room_id: room_id,
          OR: [
            {
              AND: [{start_time: {gte: start_time}}, {end_time: {lte: end_time}}],
            },
            {
              AND: [{start_time: {lte: start_time}}, {end_time: {gt: start_time}}],
            },
            {
              AND: [{start_time: {lt: end_time}}, {end_time: {gte: end_time}}],
            },
          ],
        },
      });

      if (screeningAtSameTime) {
        return c.json(
          {
            error: 'A screening is already programmed at this time slot',
            screening: screeningAtSameTime,
          },
          400
        );
      }

      const screening = await prisma.screenings.create({
        data: {start_time, end_time, screening_duration_minutes, movie_id, room_id},
      });

      return c.json(screening, 200);
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
