import app from '../src/app.js';
import {randomInt} from 'crypto';
import {randomString} from './utils.js';
import {responseScreeningValidator} from '../src/validators/screenings.js';

let createScreeningId = 1;
let createdRoomId = 1;
let createdMovieId = 1;
let createdCategoryId = 1;
const randomMovie = randomString(5);
const randomRoom = randomInt(500, 9999);

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
        number: randomRoom,
        capacity: 10,
        type: 'classroom',
        status: 'available',
      }),
    });
    expect(res.status).toBe(201);
    const room = await res.json();
    expect(room).toMatchObject({number: randomRoom});
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
      }),
    });
    expect(res.status).toBe(201);
    const screening = await res.json();
    expect(screening).toBeInstanceOf(Object);
    createScreeningId = screening.id;
  });

  test('GET /rooms', async () => {
    const res = await app.request('/rooms');
    expect(res.status).toBe(200);
    const rooms = await res.json();
    expect(rooms).toBeInstanceOf(Array);
  });
});
