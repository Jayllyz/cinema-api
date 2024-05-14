import type { Users } from '@prisma/client';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';

let trackedUser: number;
let userToken: string;
let adminToken: string;

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Auth tests', () => {
  beforeAll(async () => {
    await prisma.employees.create({
      data: {
        first_name: 'Admin',
        last_name: 'Admin',
        email: 'admin@email.com',
        password: await bcrypt.hash('password', 10),
        role: Role.ADMIN,
        phone_number: '1234567890',
      },
    });

    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@email.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(200);
    const token = (await res.json()) as { token: string };
    adminToken = token.token;
  });

  test('POST /auth/signup user', async () => {
    const res = await app.request(`${path}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@gmail.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(201);
    const users: Users = (await res.json()) as Users;
    trackedUser = users.id;
    expect(users).toMatchObject({ first_name: 'John' });
  });

  test('POST /auth/login user', async () => {
    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@gmail.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(200);
    const token: { token: string } = (await res.json()) as { token: string };
    expect(token).toHaveProperty('token');
    userToken = token.token;
  });

  test('POST /auth/login user with wrong password', async () => {
    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@gmail.com',
        password: 'password2',
      }),
    });

    expect(res.status).toBe(401);
  });

  test('GET /users/me', async () => {
    const res = await app.request(`${path}/users/me`, {
      method: 'get',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.status).toBe(200);
    const user: Users = (await res.json()) as Users;
    expect(user).toMatchObject({ first_name: 'John' });
  });

  test('Logout user', async () => {
    const res = await app.request(`${path}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });
    expect(res.status).toBe(200);
  });

  test('Clean up', async () => {
    const res = await app.request(`${path}/users/${trackedUser}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });
    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    await prisma.employees.deleteMany();
  });
});
