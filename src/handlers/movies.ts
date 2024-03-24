import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {
  getMovies,
  getMovieById,
  getMoviesByCategory,
  insertMovie,
  deleteMovie,
  updateMovie,
} from '../routes/movies.js';

export const movies = new OpenAPIHono();

movies.openapi(getMovies, async (c) => {
  try {
    const movies = await prisma.movies.findMany();
    return c.json(movies, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

movies.openapi(
  getMovieById,
  async (c) => {
    const {id} = c.req.valid('param');
    try {
      const movie = await prisma.movies.findUnique({where: {id}});
      if (!movie) return c.json({error: `Movie with id ${id} not found`}, 404);

      return c.json(movie, 200);
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

movies.openapi(
  getMoviesByCategory,
  async (c) => {
    const {id} = c.req.valid('param');
    try {
      const category = await prisma.categories.findUnique({where: {id}});
      if (!category) return c.json({error: `Category with id ${id} not found`}, 404);

      const movies = await prisma.movies.findMany({where: {category_id: id}});
      return c.json(movies, 200);
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

movies.openapi(
  insertMovie,
  async (c) => {
    const {title, description, duration, status, category_id} = c.req.valid('json');
    try {
      const category = await prisma.categories.findUnique({where: {id: category_id}});
      if (!category) return c.json({error: `Category with id ${category_id} not found`}, 404);

      const movie = await prisma.movies.create({
        data: {title, description, duration, status, category_id},
      });
      return c.json(movie, 201);
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

movies.openapi(
  deleteMovie,
  async (c) => {
    const {id} = c.req.valid('param');
    try {
      await prisma.movies.delete({where: {id}});
      return c.json({message: 'Movie deleted'}, 200);
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

movies.openapi(
  updateMovie,
  async (c) => {
    const {id} = c.req.valid('param');
    const {title, description, duration, status, category_id} = c.req.valid('json');
    try {
      if (category_id) {
        const category = await prisma.categories.findUnique({where: {id: category_id}});
        if (!category) return c.json({error: `Category with id ${category_id} not found`}, 404);
      }

      const movie = await prisma.movies.update({
        where: {id},
        data: {title, description, duration, status, category_id},
      });
      return c.json(movie, 200);
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
