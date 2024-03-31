import {OpenAPIHono} from '@hono/zod-openapi';
import {getOverlapingScreenings, prisma} from '../lib/database.js';
import {
  deleteScreening,
  getScreeningById,
  getScreenings,
  insertScreening,
  updateScreening,
} from '../routes/screenings.js';
import {isAfterHour, isBeforeHour} from '../lib/date.js';
import {zodErrorHook} from '../lib/zodError.js';

export const screenings = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

screenings.openapi(getScreenings, async (c) => {
  try {
    const screenings = await prisma.screenings.findMany({
      select: {
        id: true,
        start_time: true,
        end_time: true,
        screening_duration_minutes: true,
        movie: {
          select: {
            id: true,
            title: true,
            description: true,
            author: true,
            release_date: true,
            duration: true,
            status: true,
            category: true,
          },
        },
        room: true,
      },
    });

    return c.json(screenings, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

screenings.openapi(insertScreening, async (c) => {
  const {start_time, movie_id, room_id, ticket_price} = c.req.valid('json');

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

    const screeningAtSameTime = await getOverlapingScreenings(
      room_id,
      new Date(start_time),
      end_time
    );

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
        end_time,
        screening_duration_minutes,
        movie_id,
        room_id,
      },
    });

    for (let i = 0; i < roomExist.capacity; i++) {
      await prisma.tickets.create({
        data: {
          price: ticket_price,
          screening_id: screening.id,
        },
      });
    }

    return c.json(screening, 201);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

screenings.openapi(updateScreening, async (c) => {
  const {id} = c.req.valid('param');
  const {movie_id, start_time, room_id} = c.req.valid('json');

  try {
    const screening = await prisma.screenings.findUnique({where: {id}});
    if (!screening) return c.json({error: `Screening with id ${id} not found`}, 404);

    if (movie_id) screening.movie_id = movie_id;

    const movie = await prisma.movies.findUnique({
      where: {
        id: screening.movie_id,
      },
    });

    if (!movie) return c.json({error: `Movie with id ${movie_id} not found`}, 404);

    if (room_id) screening.room_id = room_id;

    const room = await prisma.rooms.findUnique({
      where: {
        id: screening.room_id,
      },
    });

    if (!room) return c.json({error: `Room with id ${room_id} not found`}, 404);

    if (start_time) screening.start_time = new Date(start_time);

    const screening_duration_minutes = movie.duration + 30;
    const end_time = screening.start_time;
    end_time.setMinutes(end_time.getMinutes() + screening_duration_minutes);

    if (isBeforeHour(screening.start_time, 9)) {
      return c.json({error: 'The screening cannot start before 9 am'});
    }

    if (isAfterHour(end_time, 20)) {
      return c.json({error: 'The screening cannot end after 8 pm'});
    }

    const screeningAtSameTime = await prisma.screenings.findFirst({
      where: {
        room_id: screening.room_id,
        NOT: {
          id: id,
        },
        OR: [
          {
            AND: [{start_time: {gte: screening.start_time}}, {end_time: {lte: end_time}}],
          },
          {
            AND: [
              {start_time: {lte: screening.start_time}},
              {end_time: {gt: screening.start_time}},
            ],
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

    const res = await prisma.screenings.update({
      where: {id: id},
      data: {movie_id, start_time, room_id},
    });

    return c.json(res, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

screenings.openapi(deleteScreening, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const screening = await prisma.screenings.findUnique({where: {id}});
    if (!screening) return c.json({error: `screening with id ${id} not found`}, 404);

    await prisma.screenings.delete({where: {id: Number(id)}});

    return c.json({message: `screening with id ${id} deleted`}, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

screenings.openapi(getScreeningById, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const screening = await prisma.screenings.findUnique({
      where: {id},
      select: {
        id: true,
        start_time: true,
        end_time: true,
        screening_duration_minutes: true,
        movie: {
          select: {
            id: true,
            title: true,
            description: true,
            author: true,
            release_date: true,
            duration: true,
            status: true,
            category: true,
          },
        },
        room: true,
      },
    });
    if (!screening) return c.json({error: `Screening with id ${id} not found`}, 404);

    return c.json(screening, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
