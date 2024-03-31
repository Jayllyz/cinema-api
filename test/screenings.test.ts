import app from '../src/app.js';
import {randomString} from './utils.js';

let createScreeningId = 1;
let createdRoomId = 1;
let createdMovieId = 1;
let createdCategoryId = 1;
const randomMovie = randomString(5);

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
tomorrow.setHours(14, 0, 0, 0);
if (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
  tomorrow.setDate(tomorrow.getDate() + (8 - tomorrow.getDay()));
}

describe('Screenings', () => {
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
        author: 'John Doe',
        release_date: '2021-01-01',
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

  test('POST /rooms', async () => {
    const res = await app.request('/rooms', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'Room Screenings',
        description: 'Test room',
        capacity: 20,
        type: 'room',
        open: true,
        handicap_access: true,
      }),
    });
    expect(res.status).toBe(201);
    const room = await res.json();
    expect(room).toMatchObject({name: 'Room Screenings'});
    createdRoomId = room.id;
  });

  test('POST /screenings', async () => {
    console.log(
      JSON.stringify({
        start_time: tomorrow.toISOString(),
        movie_id: createdMovieId,
        room_id: createdRoomId,
      })
    );

    const res = await app.request('/screenings', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        start_time: tomorrow.toISOString(),
        movie_id: createdMovieId,
        room_id: createdRoomId,
        ticket_price: 10,
      }),
    });
    expect(res.status).toBe(201);
    const screening = await res.json();
    expect(screening).toBeInstanceOf(Object);
    createScreeningId = screening.id;
  });

  test('GET /screenings', async () => {
    const res = await app.request('/rooms');
    expect(res.status).toBe(200);
    const screenings = await res.json();
    expect(screenings).toBeInstanceOf(Array);
  });

  test('GET /screenings/{id}', async () => {
    const res = await app.request(`/screenings/${createScreeningId}`);
    expect(res.status).toBe(200);
    const screening = await res.json();
    expect(screening).toMatchObject({id: createScreeningId});
  });

  const patchedDate: Date = tomorrow;
  patchedDate.setMinutes(15);

  test('PATCH /screenings/{id}', async () => {
    const res = await app.request(`/screenings/${createScreeningId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        start_time: patchedDate,
      }),
    });
    expect(res.status).toBe(200);
    const screening = await res.json();
    expect(screening).toHaveProperty('start_time', patchedDate.toISOString());
  });

  test('DELETE /screenings/{id}', async () => {
    const res = await app.request(`/screenings/${createScreeningId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(200);
  });

  test('DELETE /movies/{id}', async () => {
    const res = await app.request(`/movies/${createdMovieId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(200);
  });

  test('DELETE /rooms/{id}', async () => {
    const res = await app.request(`/rooms/${createdRoomId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(200);
  });
});
