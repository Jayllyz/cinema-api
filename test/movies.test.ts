import app from '../src/app.js';
import {randomString} from './utils.js';

let createdMovieId = 1;
let createdCategoryId = 1;
const randomMovie = randomString(5);

describe('Movies', () => {
  test('POST /categories', async () => {
    const res = await app.request('/categories', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: randomString(5),
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
        title: randomMovie,
        description: 'A movie',
        duration: 120,
        status: 'available',
        category_id: createdCategoryId,
      }),
    });
    expect(res.status).toBe(201);
    const movie = await res.json();
    expect(movie).toMatchObject({title: randomMovie});
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
    expect(movie).toMatchObject({title: randomMovie});
  });

  test('PATCH /movies/:id', async () => {
    const updatedMovie = randomString(5);
    const res = await app.request(`/movies/${createdMovieId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        title: updatedMovie,
        duration: 130,
        status: 'unavailable',
        category_id: createdCategoryId,
      }),
    });
    expect(res.status).toBe(200);
    const movie = await res.json();
    expect(movie).toMatchObject({title: updatedMovie, status: 'unavailable'});
  });

  test('DELETE /movies/:id', async () => {
    const res = await app.request(`/movies/${createdMovieId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(200);
  });
});
