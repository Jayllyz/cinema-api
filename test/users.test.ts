import type { Users } from '@prisma/client';
import { sign } from 'hono/jwt';
import app from '../src/app';
import { Role } from '../src/lib/token';
import { randomString } from './utils';

const randomUser = randomString(10);
const secret = process.env.SECRET_KEY || 'secret';
let adminToken = await sign({ id: 1, role: Role.ADMIN }, secret);

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

let toDelete: number;
let trackedMoney: number;

describe('Users', () => {
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
    const user: Users = await res.json();
    toDelete = user.id;
    adminToken = await sign({ id: user.id, role: Role.ADMIN }, secret);
    expect(user).toMatchObject({ first_name: randomUser });
  });

  test('GET /users', async () => {
    const res = await app.request(`${path}/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const users: Users[] = await res.json();
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
    const user: Users = await res.json();
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
    const user: Users = await res.json();
    trackedMoney = user.money;
    expect(user).toMatchObject({ first_name: 'modified' });
  });

  test('PATCH /users/money', async () => {
    const res = await app.request(`${path}/users/money?deposit=50`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const user: Users = await res.json();
    expect(user).toMatchObject({ money: trackedMoney + 50 });
    trackedMoney += 50;
  });

  test('PATCH /users/money', async () => {
    const res = await app.request(`${path}/users/money?withdraw=50`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const user: Users = await res.json();
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
});
