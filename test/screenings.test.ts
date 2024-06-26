import type { Categories, Movies, Rooms, Screenings } from '@prisma/client';
import app from '../src/app.js';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';
import { createStaff } from './utils.js';

let createScreeningId = 1;
let createdRoomId = 1;
let createdMovieId = 1;
let createdCategoryId = 1;
let adminToken: string;

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
  beforeAll(async () => {
    await createStaff('Screenings', 'screenings@email.com', 'password', Role.ADMIN);

    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'screenings@email.com',
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
        name: 'Screenings Category',
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
        title: 'Screenings Movie',
        author: 'John Doe',
        release_date: '2021-01-01',
        description: 'A movie',
        duration: 120,
        status: 'projection',
        category_id: createdCategoryId,
      }),
    });
    expect(res.status).toBe(201);
    const movie = (await res.json()) as Movies;
    expect(movie).toMatchObject({ title: 'Screenings Movie' });
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
    const room = (await res.json()) as Rooms;
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
    const screening = (await res.json()) as Screenings;
    expect(screening).toBeInstanceOf(Object);
    createScreeningId = screening.id;
  });

  test('Cannot create a screening with the same room and start_time', async () => {
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
    expect(res.status).toBe(400);
  });

  test('Cannot create a screening with a past start_time', async () => {
    const res = await app.request(`${path}/screenings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        start_time: today.toISOString(),
        movie_id: createdMovieId,
        room_id: createdRoomId,
        ticket_price: 10,
      }),
    });
    expect(res.status).toBe(400);
  });

  test('Cannot create a screening with a non-existing movie_id', async () => {
    const res = await app.request(`${path}/screenings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        start_time: tomorrow.toISOString(),
        movie_id: 999,
        room_id: createdRoomId,
        ticket_price: 10,
      }),
    });
    expect(res.status).toBe(404);
  });

  test('Cannot create a screening with a non-existing room_id', async () => {
    const res = await app.request(`${path}/screenings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        start_time: tomorrow.toISOString(),
        movie_id: createdMovieId,
        room_id: 999,
        ticket_price: 10,
      }),
    });
    expect(res.status).toBe(404);
  });

  test('Cannot create a screening if the room is not open', async () => {
    const res = await app.request(`${path}/rooms/${createdRoomId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        open: false,
      }),
    });
    expect(res.status).toBe(200);

    const res2 = await app.request(`${path}/screenings`, {
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

    expect(res2.status).toBe(404);

    const res3 = await app.request(`${path}/rooms/${createdRoomId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        open: true,
      }),
    });
    expect(res3.status).toBe(200);
  });

  test('GET /screenings', async () => {
    const res = await app.request(`${path}/rooms`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const screenings = (await res.json()) as Screenings[];
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
    const screening = (await res.json()) as Screenings;
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
    const screening = (await res.json()) as Screenings;
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

  afterAll(async () => {
    await prisma.employees.deleteMany();
  });
});
