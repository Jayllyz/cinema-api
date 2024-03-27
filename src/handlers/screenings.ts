import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {getScreenings, insertScreening, udpateScreening} from '../routes/screenings.js';
import {isAfterHour, isBeforeHour} from '../lib/date.js';
import {} from '../validators/screenings.js';
import {ErrorHandler} from './error.js';
import {endTime} from 'hono/timing';

export const screenings = new OpenAPIHono();

screenings.openapi(getScreenings, async (c) => {
  try {
    const screenings = await prisma.screenings.findMany({
      select: {
        id: true,
        start_time: true,
        end_time: true,
        screening_duration_minutes: true,
        movie: true,
        room: true,
      },
    });

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

      if (isBeforeHour(new Date(start_time), 9)) {
        return c.json({error: 'The screening cannot start before 9 am'});
      }

      if (isAfterHour(end_time, 20)) {
        return c.json({error: 'The screening cannot end after 8 pm'});
      }

      const roomExist = await prisma.rooms.findUnique({
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
        data: {
          start_time,
          end_time: end_time.toISOString(),
          screening_duration_minutes,
          movie_id,
          room_id,
        },
      });

      return c.json(screening, 200);
    } catch (error) {
      console.error(error);
      return c.json({error: error}, 500);
    }
  },
  (result, c) => {
    if (!result.success) {
      return c.json(ErrorHandler(result.error), 400);
    }
  }
);

screenings.openapi(
  udpateScreening,
  async (c) => {
    const {id} = c.req.valid('param');
    const {movie_id, start_time, room_id} = c.req.valid('json');

    try {
      const screening = await prisma.screenings.findUnique({where: {id}});
      if (!screening) return c.json({error: `Screening with id ${id} not found`}, 404);

      const movie = await prisma.movies.findUnique({
        where: {
          id: screening.movie_id,
        },
      });

      if (!movie) {
        return c.json({error: `Movie with id ${movie_id}`}, 400);
      }

      const room = await prisma.rooms.findUnique({
        where: {
          id: screening.room_id,
        },
      });

      if (!room) {
        return c.json({error: `Room with id ${room_id}`}, 400);
      }

      if (room_id) {
        screening.room_id = room_id;
      }

      if (start_time) {
        const start_date = new Date(start_time);

        const screening_duration_minutes = movie.duration + 30;
        const end_time = new Date(start_time);
        end_time.setMinutes(end_time.getMinutes() + screening_duration_minutes);

        if (isBeforeHour(start_date, 9)) {
          return c.json({error: 'The screening cannot start before 9 am'});
        }

        if (isAfterHour(end_time, 20)) {
          return c.json({error: 'The screening cannot end after 8 pm'});
        }

        const roomExist = await prisma.screenings.findUnique({
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
      }
      const res = await prisma.screenings.update({
        where: {id: id},
        data: {movie_id, start_time, room_id},
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
