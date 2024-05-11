import type { Categories, Movies } from '@prisma/client';
import app from '../src/app.js';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';
import { createStaff } from './utils.js';

let createdMovieId = 1;
let createdCategoryId = 1;
let adminToken: string;

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Movies', () => {
  beforeAll(async () => {
    await createStaff('movies', 'movies@email.com', 'password', Role.ADMIN);

    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'movies@email.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(200);
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
        title: 'Random Movie Name',
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
    expect(movie).toMatchObject({ title: 'Random Movie Name' });
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
    expect(movie).toMatchObject({ title: 'Random Movie Name' });
  });

  test('PATCH /movies/{id}', async () => {
    const updatedMovie = 'Updated Movie Name';
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
