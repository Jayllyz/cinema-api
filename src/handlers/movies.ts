import { OpenAPIHono } from '@hono/zod-openapi';
import { prisma } from '../lib/database.js';
import { refundTicketsMovie } from '../lib/refund.js';
import { type PayloadValidator, Role, checkToken } from '../lib/token.js';
import { zodErrorHook } from '../lib/zodError.js';
import { deleteMovie, getMovieById, getMovies, insertMovie, updateMovie } from '../routes/movies.js';

export const movies = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

movies.openapi(getMovies, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.USER, token);
  const { title, author, lt, gt, status, category } = c.req.valid('query');

  try {
    const movies = await prisma.movies.findMany({
      where: {
        title: { contains: title },
        author: { contains: author },
        release_date: { gte: gt, lte: lt },
        status: { equals: status },
        CategoriesMovies: { some: { category_id: category } },
      },
      include: { images: true, CategoriesMovies: { include: { category: true } } },
      orderBy: { release_date: 'asc' },
    });

    const data = movies.map(({ CategoriesMovies, ...movie }) => {
      const categories = CategoriesMovies.map((category) => category.category);
      return { ...movie, categories: categories };
    });

    return c.json(data, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

movies.openapi(getMovieById, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.USER, token);

  const { id } = c.req.valid('param');
  try {
    const movie = await prisma.movies.findUnique({
      where: { id },
      include: { images: true, CategoriesMovies: { include: { category: true } } },
    });
    if (!movie) return c.json({ error: `Movie with id ${id} not found` }, 404);

    const format = {
      ...movie,
      categories: movie.CategoriesMovies.map((category) => category.category),
      CategoriesMovies: undefined,
    };

    return c.json(format, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

movies.openapi(insertMovie, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { title, author, description, release_date, duration, status, categories } = c.req.valid('json');
  try {
    const movieExists = await prisma.movies.findUnique({ where: { title } });
    if (movieExists) return c.json({ error: `Movie with title ${title} already exists` }, 400);

    if (categories) {
      for (const id of categories) {
        const category = await prisma.categories.findUnique({ where: { id } });
        if (!category) return c.json({ error: `Category with id ${id} not found` }, 404);
      }
    }

    const movie = await prisma.movies.create({
      data: { title, description, author, release_date, duration, status },
    });

    if (categories) {
      for (const id of categories) {
        await prisma.categoriesMovies.create({ data: { movie_id: movie.id, category_id: id } });
      }
    }

    const data = { ...movie, categories };

    return c.json(data, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

movies.openapi(updateMovie, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  const { title, description, duration, status, categories, author, release_date } = c.req.valid('json');
  try {
    if (categories) {
      for (const id of categories) {
        const category = await prisma.categories.findUnique({ where: { id } });
        if (!category) return c.json({ error: `Category with id ${id} not found` }, 404);
      }
    }

    const movie = await prisma.movies.update({
      where: { id },
      data: { title, description, duration, status, author, release_date },
      include: { images: true },
    });

    if (categories) {
      await prisma.categoriesMovies.deleteMany({ where: { movie_id: id } });
      for (const id of categories) {
        await prisma.categoriesMovies.create({ data: { movie_id: movie.id, category_id: id } });
      }
    }

    const data = { ...movie, categories: categories };

    return c.json(data, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

movies.openapi(deleteMovie, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  try {
    const movie = await prisma.movies.findUnique({ where: { id } });
    if (!movie) return c.json({ error: `Movie with id ${id} not found` }, 404);

    await refundTicketsMovie(id);
    await prisma.movies.delete({ where: { id } });
    return c.json({ message: 'Movie deleted' }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});
