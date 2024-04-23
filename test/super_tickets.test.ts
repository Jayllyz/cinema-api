import type { Categories, Movies, Rooms, Screenings, Tickets, Users } from '@prisma/client';
import { sign } from 'hono/jwt';
import app from '../src/app';
import { Role } from '../src/lib/token';

const secret = process.env.SECRET_KEY || 'secret';
const adminToken = await sign({ id: 1, role: Role.ADMIN }, secret);

let trackedMovie: number;
let trackedCategory: number;
let trackedRoom: number;
let trackedScreening: number;

let trackedTicket: number;
let trackedUser: number;
let userToken: string;

const mondayOfNextWeek = new Date();
mondayOfNextWeek.setDate(mondayOfNextWeek.getDate() + ((1 + 7 - mondayOfNextWeek.getDay()) % 7));
mondayOfNextWeek.setHours(12, 0, 0, 0);

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Super tickets', () => {
  test('Create a Category', async () => {
    const res = await app.request(`${path}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Test Category',
      }),
    });
    expect(res.status).toBe(201);
    const category: Categories = await res.json();
    trackedCategory = category.id;
  });

  test('Create a Movie', async () => {
    const res = await app.request(`${path}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'A movie',
        author: 'John Doe',
        release_date: '2021-01-01',
        description: 'A movie',
        duration: 120,
        status: 'available',
        category_id: trackedCategory,
      }),
    });
    expect(res.status).toBe(201);
    const movie: Movies = await res.json();
    trackedMovie = movie.id;
  });

  test('Create a Room', async () => {
    const res = await app.request(`${path}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'testing ticket room',
        description: 'Test room',
        capacity: 25,
        type: 'room',
        open: true,
        handicap_access: false,
      }),
    });
    expect(res.status).toBe(201);
    const room: Rooms = await res.json();
    trackedRoom = room.id;
  });

  test('Create a Screening', async () => {
    const res = await app.request(`${path}/screenings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        start_time: mondayOfNextWeek.toISOString(),
        movie_id: trackedMovie,
        room_id: trackedRoom,
        ticket_price: 10,
      }),
    });
    expect(res.status).toBe(201);
    const screening: Screenings = await res.json();
    trackedScreening = screening.id;
  });

  test('Create a user', async () => {
    const res = await app.request(`${path}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@gmail.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(201);
    const user: Users = await res.json();
    trackedUser = user.id;
  });

  test('Login as a user', async () => {
    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john@gmail.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(200);
    const token = (await res.json()) as { token: string };
    userToken = token.token;
  });

  test('Add money to user', async () => {
    const res = await app.request(`${path}/users/${trackedUser}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        money: 50,
      }),
    });
    expect(res.status).toBe(200);
    const user: Users = await res.json();
    expect(user).toMatchObject({ money: 50 });
  });

  test('POST /super_tickets', async () => {
    const res = await app.request(`${path}/super_tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 100,
        uses: 10,
      }),
    });
    expect(res.status).toBe(201);
    const ticket: Tickets = await res.json();
    trackedTicket = ticket.id;
    expect(ticket).toMatchObject({ price: 100, uses: 10 });
  });

  test('GET /super_tickets', async () => {
    const res = await app.request(`${path}/super_tickets`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const tickets: Tickets[] = await res.json();
    expect(tickets).toBeInstanceOf(Array);
    expect(tickets.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /super_tickets/{id}', async () => {
    const res = await app.request(`${path}/super_tickets/${trackedTicket}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const ticket: Tickets = await res.json();
    expect(ticket).toMatchObject({ price: 100, uses: 10 });
  });

  test('PATCH /super_tickets/{id}', async () => {
    const res = await app.request(`${path}/super_tickets/${trackedTicket}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 50,
        uses: 5,
      }),
    });
    expect(res.status).toBe(200);
    const ticket: Tickets = await res.json();
    expect(ticket).toMatchObject({ price: 50, uses: 5 });
  });

  test('POST /super_tickets/buy/{id}', async () => {
    const res = await app.request(`${path}/super_tickets/buy/${trackedTicket}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(200);
    const ticket: Tickets = await res.json();
    expect(ticket).toMatchObject({ price: 50 });
  });

  test('PATCH /super_tickets/book/{id}', async () => {
    const res = await app.request(`${path}/super_tickets/book/${trackedTicket}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        screening_id: trackedScreening,
        seat: 1,
      }),
    });
    expect(res.status).toBe(200);
    const ticket: Tickets = await res.json();
    expect(ticket).toMatchObject({ uses: 4 });
  });

  test('DELETE /super_tickets/cancel/{id}', async () => {
    const res = await app.request(`${path}/super_tickets/cancel/${trackedTicket}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        screening_id: trackedScreening,
        seat: 1,
      }),
    });
    expect(res.status).toBe(200);
    const ticket = (await res.json()) as { uses: number };
    expect(ticket).toMatchObject({ uses: 5 });
  });

  test('DELETE /super_tickets/{id}', async () => {
    const res = await app.request(`${path}/super_tickets/${trackedTicket}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });

  test('Clean up', async () => {
    const res = await app.request(`${path}/users/${trackedUser}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);

    const res2 = await app.request(`${path}/screenings/${trackedScreening}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res2.status).toBe(200);

    const res3 = await app.request(`${path}/rooms/${trackedRoom}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res3.status).toBe(200);

    const res4 = await app.request(`${path}/movies/${trackedMovie}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res4.status).toBe(200);

    const res5 = await app.request(`${path}/categories/${trackedCategory}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res5.status).toBe(200);
  });
});
