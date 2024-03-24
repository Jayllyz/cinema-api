import {randomUUID} from 'crypto';
import app from '../src/app.js';

let createdMovieId = 1;
let createdCategoryId = 1;

const randomName = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * 10));
  }
  return result;
};

describe('Movies', () => {
  test('POST /categories', async () => {
    const res = await app.request('/categories', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: randomName(),
      }),
    });
    expect(res.status).toBe(201);
    const category = await res.json();
    createdCategoryId = category.id;
  });

  test('POST /movies', async () => {
    const res = await app.request('/movies', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        title: 'The Matrix',
        description: 'A computer hacker learns about the true nature of reality',
        duration: 120,
        status: 'available',
        category_id: createdCategoryId,
      }),
    });
    expect(res.status).toBe(201);
    const movie = await res.json();
    expect(movie).toMatchObject({title: 'The Matrix'});
    createdMovieId = movie.id;
  });

  test('GET /movies', async () => {
    const res = await app.request('/movies');
    expect(res.status).toBe(200);
    const movies = await res.json();
    expect(movies).toBeInstanceOf(Array);
  });

  test('GET /movies/:id', async () => {
    const res = await app.request(`/movies/${createdMovieId}`);
    expect(res.status).toBe(200);
    const movie = await res.json();
    expect(movie).toMatchObject({title: 'The Matrix'});
  });

  test('PATCH /movies/:id', async () => {
    const res = await app.request(`/movies/${createdMovieId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        title: 'The Matrix Reloaded',
        duration: 130,
        status: 'unavailable',
        category_id: createdCategoryId,
      }),
    });
    expect(res.status).toBe(200);
    const movie = await res.json();
    expect(movie).toMatchObject({title: 'The Matrix Reloaded'});
  });

  test('DELETE /movies/:id', async () => {
    const res = await app.request(`/movies/${createdMovieId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(204);
  });
});
