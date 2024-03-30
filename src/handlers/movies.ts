import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {getMovies, getMovieById, insertMovie, deleteMovie, updateMovie} from '../routes/movies.js';
import {zodErrorHook} from '../lib/zodError.js';

export const movies = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

movies.openapi(getMovies, async (c) => {
  const {title, author, lt, gt, status, category_id} = c.req.valid('query');
  try {
    const movies = await prisma.movies.findMany({
      where: {
        title: {contains: title},
        author: {contains: author},
        release_date: {gte: gt, lte: lt},
        status: {equals: status},
        category_id: category_id,
      },
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
    });
    return c.json(movies, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

movies.openapi(getMovieById, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const movie = await prisma.movies.findUnique({
      where: {id},
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
    });
    if (!movie) return c.json({error: `Movie with id ${id} not found`}, 404);

    return c.json(movie, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

movies.openapi(insertMovie, async (c) => {
  const {title, author, description, release_date, duration, status, category_id} =
    c.req.valid('json');
  try {
    const category = await prisma.categories.findUnique({where: {id: category_id}});
    if (!category) return c.json({error: `Category with id ${category_id} not found`}, 404);

    const movieExists = await prisma.movies.findUnique({where: {title}});
    if (movieExists) return c.json({error: `Movie with title ${title} already exists`}, 400);

    const movie = await prisma.movies.create({
      data: {title, description, author, release_date, duration, status, category_id},
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
    });
    return c.json(movie, 201);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

movies.openapi(deleteMovie, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const movie = await prisma.movies.findUnique({where: {id}});
    if (!movie) return c.json({error: `Movie with id ${id} not found`}, 404);

    await prisma.movies.delete({where: {id}});
    return c.json({message: 'Movie deleted'}, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

movies.openapi(updateMovie, async (c) => {
  const {id} = c.req.valid('param');
  const {title, description, duration, status, category_id, author, release_date} =
    c.req.valid('json');
  try {
    if (category_id) {
      const category = await prisma.categories.findUnique({where: {id: category_id}});
      if (!category) return c.json({error: `Category with id ${category_id} not found`}, 404);
    }

    const movie = await prisma.movies.update({
      where: {id},
      data: {title, description, duration, status, category_id, author, release_date},
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
    });
    return c.json(movie, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
