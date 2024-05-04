import type { Categories } from '@prisma/client';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';
import { randomString } from './utils.js';

let createdCategoryId = 1;
const randomCategory = randomString(5);
let adminToken: string;

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Categories', () => {
  beforeAll(async () => {
    await prisma.employees.create({
      data: {
        first_name: 'Admin',
        last_name: 'Admin',
        email: 'admin@email.com',
        password: await bcrypt.hash('password', 10),
        role: Role.ADMIN,
        phone_number: '1234567890',
      },
    });

    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@email.com',
        password: 'password',
      }),
    });
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
        name: randomCategory,
      }),
    });
    expect(res.status).toBe(201);
    const category: Categories = (await res.json()) as Categories;
    createdCategoryId = category.id;
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
    expect(category).toMatchObject({ name: randomCategory });
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
