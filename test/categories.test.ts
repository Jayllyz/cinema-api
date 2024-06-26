import type { Categories } from '@prisma/client';
import app from '../src/app.js';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';
import { createStaff } from './utils.js';

let createdCategoryId: number;
let adminToken: string;

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Categories', () => {
  beforeAll(async () => {
    await createStaff('Admin', 'admin@email.com', 'password', Role.ADMIN);

    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@email.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(200);
    const token = (await res.json()) as { token: string };
    adminToken = token.token;
  });

  test('POST /categories', async () => {
    const res = await app.request(`${path}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Random Category Name',
      }),
    });
    expect(res.status).toBe(201);
    const category: Categories = (await res.json()) as Categories;
    createdCategoryId = category.id;
  });

  test('Should not create a category with an empty name', async () => {
    const res = await app.request(`${path}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  test('Should not create the same category twice', async () => {
    const res = await app.request(`${path}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Random Category Name',
      }),
    });
    expect(res.status).toBe(400);
  });

  test('GET /categories', async () => {
    const res = await app.request(`${path}/categories`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const categories: Categories[] = (await res.json()) as Categories[];
    expect(categories).toBeInstanceOf(Array);
  });

  test('GET /categories/{id}', async () => {
    const res = await app.request(`${path}/categories/${createdCategoryId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const category: Categories = (await res.json()) as Categories;
    expect(category).toMatchObject({ name: 'Random Category Name' });
  });

  test('DELETE /categories/{id}', async () => {
    const res = await app.request(`${path}/categories/${createdCategoryId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    await prisma.employees.deleteMany();
  });
});
