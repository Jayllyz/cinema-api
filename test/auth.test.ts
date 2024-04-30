import type { Users } from '@prisma/client';
import { sign } from 'hono/jwt';
import app from '../src/app.js';
import { Role } from '../src/lib/token.js';

const secret = process.env.SECRET_KEY || 'secret';
const adminToken = await sign({ id: 1, role: Role.ADMIN }, secret);
let trackedUser: number;

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Auth', () => {
  test('POST /auth/signup', async () => {
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

  test('POST /auth/login', async () => {
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
  });

  test('Clean up', async () => {
    const res = await app.request(`${path}/users/${trackedUser}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });
});
