import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database.js';
import {
  getCategories,
  getCategoryById,
  insertCategory,
  deleteCategory,
} from '../routes/categories.js';
import {zodErrorHook} from '../lib/zodError.js';

export const categories = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

categories.openapi(getCategories, async (c) => {
  try {
    const categories = await prisma.categories.findMany();
    return c.json(categories, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

categories.openapi(getCategoryById, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const category = await prisma.categories.findUnique({where: {id}});
    if (!category) return c.json({error: `Category with id ${id} not found`}, 404);

    return c.json(category, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

categories.openapi(insertCategory, async (c) => {
  const {name} = c.req.valid('json');
  try {
    const exist = await prisma.categories.findUnique({where: {name}});
    if (exist) return c.json({error: 'Category name already exists'}, 400);

    const category = await prisma.categories.create({data: {name}});
    if (!category) return c.json({error: 'Category name already exists'}, 400);
    return c.json(category, 201);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

categories.openapi(deleteCategory, async (c) => {
  const {id} = c.req.valid('param');
  try {
    const category = await prisma.categories.findUnique({where: {id}});
    if (!category) return c.json({error: `Category with id ${id} not found`}, 404);

    await prisma.categories.delete({where: {id}});
    return c.json({message: 'Category deleted successfully'}, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
