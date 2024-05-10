import type { Categories, Movies } from '@prisma/client';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';
import { randomString } from './utils.js';

let createdMovieId = 1;
let createdCategoryId = 1;
const randomMovie = randomString(5);
let adminToken: string;

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Movies', () => {
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

  test('Create a category', async () => {
    const res = await app.request(`${path}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'MovieTestCategory',
      }),
    });
    expect(res.status).toBe(201);
    const category = (await res.json()) as Categories;
    createdCategoryId = category.id;
  });

  test('POST /movies', async () => {
    const res = await app.request(`${path}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: randomMovie,
        author: 'John Doe',
        release_date: '2021-01-01',
        description: 'A movie',
        duration: 120,
        status: 'available',
        categories: [createdCategoryId],
      }),
    });
    expect(res.status).toBe(201);
    const movie = (await res.json()) as Movies;
    expect(movie).toMatchObject({ title: randomMovie });
    createdMovieId = movie.id;
  });

  test('Create an image', async () => {
    const res = await app.request(`${path}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        alt: 'Movie cover',
        url: 'https://example.com/cover.jpg',
        movieId: createdMovieId,
        roomId: null,
      }),
    });
    expect(res.status).toBe(201);
  });

  test('GET /movies', async () => {
    const res = await app.request(`${path}/movies`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const movies = (await res.json()) as Movies[];
    expect(movies).toBeInstanceOf(Array);
    expect(movies.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /movies/{id}', async () => {
    const res = await app.request(`${path}/movies/${createdMovieId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const movie = (await res.json()) as Movies;
    expect(movie).toMatchObject({ title: randomMovie });
  });

  test('PATCH /movies/{id}', async () => {
    const updatedMovie = randomString(5);
    const res = await app.request(`${path}/movies/${createdMovieId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: updatedMovie,
        duration: 130,
        status: 'unavailable',
        category_id: createdCategoryId,
      }),
    });
    expect(res.status).toBe(200);
    const movie = (await res.json()) as Movies;
    expect(movie).toMatchObject({ title: updatedMovie, status: 'unavailable' });
  });

  test('DELETE /movies/{id}', async () => {
    const res = await app.request(`${path}/movies/${createdMovieId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
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
