import { OpenAPIHono } from '@hono/zod-openapi';
import { prisma } from '../lib/database.js';
import { type PayloadValidator, Role, checkToken } from '../lib/token.js';
import { zodErrorHook } from '../lib/zodError.js';
import { createImage, deleteImage, getImage, listImages, updateImage } from '../routes/images.js';

export const img = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

img.openapi(listImages, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.USER, token);

  const { all, skip, take, search } = c.req.valid('query');
  const where = search ? { alt: { contains: search } } : {};

  try {
    if (all) {
      const images = await prisma.images.findMany({ where, orderBy: { id: 'asc' } });
      return c.json(images, 200);
    }

    const images = await prisma.images.findMany({ where, skip, take, orderBy: { id: 'asc' } });
    return c.json(images, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

img.openapi(getImage, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.USER, token);

  const { id } = c.req.valid('param');

  try {
    const image = await prisma.images.findUnique({ where: { id } });
    if (!image) return c.json({ error: 'Image not found' }, 404);
    return c.json(image, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

img.openapi(createImage, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { alt, url, movieId, roomId } = c.req.valid('json');

  try {
    if (movieId) {
      const movie = await prisma.movies.findUnique({ where: { id: movieId } });
      if (!movie) return c.json({ error: 'Movie not found' }, 404);
    }
    if (roomId) {
      const room = await prisma.rooms.findUnique({ where: { id: roomId } });
      if (!room) return c.json({ error: 'Room not found' }, 404);
    }

    const image = await prisma.images.create({
      data: { alt, url, movieId: movieId ? movieId : null, roomId: roomId ? roomId : null },
    });
    return c.json(image, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

img.openapi(updateImage, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  const { alt, url, movieId, roomId } = c.req.valid('json');

  try {
    if (movieId) {
      const movie = await prisma.movies.findUnique({ where: { id: movieId } });
      if (!movie) return c.json({ error: 'Movie not found' }, 404);
    }
    if (roomId) {
      const room = await prisma.rooms.findUnique({ where: { id: roomId } });
      if (!room) return c.json({ error: 'Room not found' }, 404);
    }

    const image = await prisma.images.update({
      where: { id },
      data: { alt, url, movieId: movieId ? movieId : null, roomId: roomId ? roomId : null },
    });
    return c.json(image, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

img.openapi(deleteImage, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');

  try {
    const exists = await prisma.images.findUnique({ where: { id } });
    if (!exists) return c.json({ error: 'Image not found' }, 404);

    await prisma.images.delete({ where: { id } });
    return c.json({ message: 'Image deleted' }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});
