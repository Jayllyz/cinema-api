import { OpenAPIHono } from '@hono/zod-openapi';
import { prisma } from '../lib/database.js';
import { type PayloadValidator, Role, checkToken } from '../lib/token.js';
import { zodErrorHook } from '../lib/zodError.js';
import { deleteCategory, getCategories, getCategoryById, insertCategory } from '../routes/categories.js';

export const categories = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

categories.openapi(getCategories, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.USER, token);
  const { skip, take, search, all } = c.req.valid('query');

  const where = search ? { name: { contains: search } } : {};

  if (all) {
    const categories = await prisma.categories.findMany({ where, orderBy: { id: 'asc' } });
    return c.json(categories, 200);
  }

  const categories = await prisma.categories.findMany({ where, skip, take, orderBy: { id: 'asc' } });

  return c.json(categories, 200);
});

categories.openapi(getCategoryById, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.USER, token);

  const { id } = c.req.valid('param');

  const category = await prisma.categories.findUnique({ where: { id } });
  if (!category) return c.json({ error: `Category with id ${id} not found` }, 404);

  return c.json(category, 200);
});

categories.openapi(insertCategory, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { name } = c.req.valid('json');

  const exist = await prisma.categories.findUnique({ where: { name } });
  if (exist) return c.json({ error: 'Category name already exists' }, 400);

  const category = await prisma.categories.create({ data: { name } });

  return c.json(category, 201);
});

categories.openapi(deleteCategory, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');

  const category = await prisma.categories.findUnique({ where: { id } });
  if (!category) return c.json({ error: `Category with id ${id} not found` }, 404);

  await prisma.categories.delete({ where: { id } });

  return c.json({ message: 'Category deleted successfully' }, 200);
});
