import type { Categories, Movies, Rooms, Screenings, Tickets, Users } from '@prisma/client';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';

let adminToken: string;

let trackedMovie: number;
let trackedCategory: number;
let trackedRoom: number;
let trackedScreening: number;

let trackedTicket: number;
let trackedUser: number;
let userToken: string;

let deleteTest: Tickets;

const mondayOfNextWeek = new Date();
mondayOfNextWeek.setDate(mondayOfNextWeek.getDate() + ((1 + 7 - mondayOfNextWeek.getDay()) % 7));
mondayOfNextWeek.setHours(12, 0, 0, 0);

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Tickets', () => {
  beforeAll(async () => {
    await prisma.employees.create({
      data: {
        first_name: 'Admin',
        last_name: 'Admin',
        email: 'adminstaff@email.com',
        password: await bcrypt.hash('password', 10),
        role: Role.ADMIN,
        phone_number: '1234567890',
      },
    });

    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'adminstaff@email.com',
        password: 'password',
      }),
    });
    const token = (await res.json()) as { token: string };
    adminToken = token.token;
  });

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
    const category: Categories = (await res.json()) as Categories;
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
    const movie: Movies = (await res.json()) as Movies;
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
    const room: Rooms = (await res.json()) as Rooms;
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
    const screening: Screenings = (await res.json()) as Screenings;
    trackedScreening = screening.id;
  });

  test('GET /tickets/', async () => {
    const res = await app.request(`${path}/tickets`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const tickets: Tickets[] = (await res.json()) as Tickets[];
    expect(tickets).toBeInstanceOf(Array);
    if (tickets[0]) deleteTest = tickets[0];
  });

  test('DELETE /tickets/{id}', async () => {
    const res = await app.request(`${path}/tickets/${deleteTest.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });

  test('POST /tickets/', async () => {
    const res = await app.request(`${path}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 10,
        seat: deleteTest.seat,
        user_id: null,
        screening_id: trackedScreening,
      }),
    });
    expect(res.status).toBe(201);
    const ticket = (await res.json()) as Tickets;
    trackedTicket = ticket.id;
    expect(ticket).toMatchObject({ price: 10 });
  });

  test('GET /tickets/{id}', async () => {
    const res = await app.request(`${path}/tickets/${trackedTicket}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const ticket: Tickets = (await res.json()) as Tickets;
    expect(ticket).toMatchObject({ id: trackedTicket });
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
    const user: Users = (await res.json()) as Users;
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
    const token: { token: string } = (await res.json()) as { token: string };
    userToken = token.token;
  });

  test('Add money to user', async () => {
    const res = await app.request(`${path}/users/money?deposit=100`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(200);
    const user: Users = (await res.json()) as Users;
    expect(user).toMatchObject({ money: 100 });
  });

  test('POST /tickets/buy/{id}', async () => {
    const res = await app.request(`${path}/tickets/buy/${trackedTicket}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(200);

    const user = await app.request(`${path}/users/${trackedUser}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const updatedUser: { money: number } = (await user.json()) as { money: number };
    expect(updatedUser).toMatchObject({ money: 90 });
  });

  test('PATCH /tickets/{id}', async () => {
    const res = await app.request(`${path}/tickets/${trackedTicket}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 5,
      }),
    });
    expect(res.status).toBe(200);
    const ticket: Tickets = (await res.json()) as Tickets;
    expect(ticket).toMatchObject({ price: 5 });
  });

  test('POST /tickets/refund/{id}', async () => {
    const res = await app.request(`${path}/tickets/refund/${trackedTicket}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(200);

    const user = await app.request(`${path}/users/${trackedUser}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const updatedUser: { money: number } = (await user.json()) as { money: number };
    expect(updatedUser).toMatchObject({ money: 95 });
  });

  test('rebuy ticket', async () => {
    const res = await app.request(`${path}/tickets/buy/${trackedTicket}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(200);

    const user = await app.request(`${path}/users/${trackedUser}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const updatedUser: { money: number } = (await user.json()) as { money: number };
    expect(updatedUser).toMatchObject({ money: 90 });
  });

  test('PATCH /tickets/use/{id}', async () => {
    const res = await app.request(`${path}/tickets/use/${trackedTicket}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(200);

    const ticket = await app.request(`${path}/tickets/${trackedTicket}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const updatedTicket: Tickets = (await ticket.json()) as Tickets;
    expect(updatedTicket).toMatchObject({ used: true });
  });

  test('Clean up', async () => {
    const res = await app.request(`${path}/tickets/${trackedTicket}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);

    const res2 = await app.request(`${path}/users/${trackedUser}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res2.status).toBe(200);

    const res3 = await app.request(`${path}/screenings/${trackedScreening}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res3.status).toBe(200);

    const res4 = await app.request(`${path}/rooms/${trackedRoom}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res4.status).toBe(200);

    const res5 = await app.request(`${path}/movies/${trackedMovie}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res5.status).toBe(200);

    const res6 = await app.request(`${path}/categories/${trackedCategory}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res6.status).toBe(200);
  });

  afterAll(async () => {
    await prisma.employees.deleteMany();
  });
});
