import type { Users } from '@prisma/client';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';
import { randomString } from './utils.js';

const randomUser = randomString(10);
let adminToken: string;
let userToken: string;

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

let toDelete: number;
let trackedMoney: number;

describe('Users', () => {
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

  test('POST /users', async () => {
    const res = await app.request(`${path}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        first_name: randomUser,
        last_name: randomUser,
        email: 'random@gmail.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(201);
    const user = (await res.json()) as Users;
    toDelete = user.id;
    expect(user).toMatchObject({ first_name: randomUser });
  });

  test('GET /users', async () => {
    const res = await app.request(`${path}/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const users = (await res.json()) as Users[];
    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /users/{id}', async () => {
    const res = await app.request(`${path}/users/${toDelete}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const user = (await res.json()) as Users;
    expect(user).toMatchObject({ id: toDelete });
  });

  test('PATCH /users/{id}', async () => {
    const res = await app.request(`${path}/users/${toDelete}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        first_name: 'modified',
        money: 100,
      }),
    });
    expect(res.status).toBe(200);
    const user = (await res.json()) as Users;
    trackedMoney = user.money;
    expect(user).toMatchObject({ first_name: 'modified' });
  });

  test('Login as user', async () => {
    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'random@gmail.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(200);
    const token = (await res.json()) as { token: string };
    userToken = token.token;
  });

  test('User can change password', async () => {
    const res = await app.request(`${path}/users/${toDelete}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        password: 'password123',
      }),
    });
    expect(res.status).toBe(200);
  });

  test('PATCH /users/money deposit 50', async () => {
    const res = await app.request(`${path}/users/money?deposit=50`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(200);
    const user = (await res.json()) as Users;
    expect(user).toMatchObject({ money: trackedMoney + 50 });
    trackedMoney += 50;
  });

  test('PATCH /users/money withdraw 50', async () => {
    const res = await app.request(`${path}/users/money?withdraw=50`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(200);
    const user = (await res.json()) as Users;
    expect(user).toMatchObject({ money: trackedMoney - 50 });
    trackedMoney -= 50;
  });

  test('DELETE /users/{id}', async () => {
    const res = await app.request(`${path}/users/${toDelete}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    await prisma.users.deleteMany();
    await prisma.employees.deleteMany();
  });
});
