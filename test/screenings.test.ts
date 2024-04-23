import type { Categories, Movies, Rooms, Screenings } from '@prisma/client';
import { sign } from 'hono/jwt';
import app from '../src/app.js';
import { Role } from '../src/lib/token.js';
import { randomString } from './utils.js';

let createScreeningId = 1;
let createdRoomId = 1;
let createdMovieId = 1;
let createdCategoryId = 1;
const randomMovie = randomString(5);

const secret = process.env.SECRET_KEY || 'secret';
const adminToken = await sign({ id: 1, role: Role.ADMIN }, secret);

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
tomorrow.setHours(14, 0, 0, 0);
if (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
  tomorrow.setDate(tomorrow.getDate() + (8 - tomorrow.getDay()));
}

describe('Screenings', () => {
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

  test('POST /rooms', async () => {
    const res = await app.request(`${path}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
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
    const room: Rooms = await res.json();
    expect(room).toMatchObject({ name: 'Room Screenings' });
    createdRoomId = room.id;
  });

  test('POST /screenings', async () => {
    const res = await app.request(`${path}/screenings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        start_time: tomorrow.toISOString(),
        movie_id: createdMovieId,
        room_id: createdRoomId,
        ticket_price: 10,
      }),
    });
    expect(res.status).toBe(201);
    const screening: Screenings = await res.json();
    expect(screening).toBeInstanceOf(Object);
    createScreeningId = screening.id;
  });

  test('GET /screenings', async () => {
    const res = await app.request(`${path}/rooms`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const screenings: Screenings[] = await res.json();
    expect(screenings).toBeInstanceOf(Array);
    expect(screenings.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /screenings/{id}', async () => {
    const res = await app.request(`${path}/screenings/${createScreeningId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const screening: Screenings = await res.json();
    expect(screening).toMatchObject({ id: createScreeningId });
  });

  const patchedDate: Date = tomorrow;
  patchedDate.setMinutes(15);

  test('PATCH /screenings/{id}', async () => {
    const res = await app.request(`${path}/screenings/${createScreeningId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        start_time: patchedDate,
      }),
    });
    expect(res.status).toBe(200);
    const screening: Screenings = await res.json();
    expect(screening).toHaveProperty('start_time', patchedDate.toISOString());
  });

  test('DELETE /screenings/{id}', async () => {
    const res = await app.request(`${path}/screenings/${createScreeningId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
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

  test('DELETE /rooms/{id}', async () => {
    const res = await app.request(`${path}/rooms/${createdRoomId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });
});
