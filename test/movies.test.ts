import type { Categories, Movies } from '@prisma/client';
import { sign } from 'hono/jwt';
import app from '../src/app.js';
import { Role } from '../src/lib/token.js';
import { randomString } from './utils.js';

let createdMovieId = 1;
let createdCategoryId = 1;
const randomMovie = randomString(5);

const secret = process.env.SECRET_KEY || 'secret';
const adminToken = await sign({ id: 1, role: Role.ADMIN }, secret);

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Movies', () => {
  test('POST /categories', async () => {
    const res = await app.request(`${path}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: randomString(5),
      }),
    });
    expect(res.status).toBe(201);
    const category: Categories = await res.json();
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
        category_id: createdCategoryId,
      }),
    });
    expect(res.status).toBe(201);
    const movie: Movies = await res.json();
    expect(movie).toMatchObject({ title: randomMovie });
    createdMovieId = movie.id;
  });

  test('GET /movies', async () => {
    const res = await app.request(`${path}/movies`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const movies: Movies[] = await res.json();
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
    const movie: Movies = await res.json();
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
    const movie: Movies = await res.json();
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
});
