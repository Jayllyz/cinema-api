import app from '../src/app';
import {randomString} from './utils';
import {sign} from 'hono/jwt';

const createdUserId = 1;
const randomUser = randomString(10);
const secret = process.env.SECRET_KEY || 'secret';
const adminToken = await sign({id: createdUserId, role: 'admin'}, secret);
let toDelete: number;
let trackedMoney: number;

describe('Users', () => {
  test('GET /users', async () => {
    const res = await app.request('/users', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const users = await res.json();
    expect(users).toBeInstanceOf(Array);
  });

  test('GET /users/:id', async () => {
    const res = await app.request(`/users/${createdUserId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const user = await res.json();
    expect(user).toMatchObject({id: createdUserId});
  });

  test('POST /users', async () => {
    const res = await app.request('/users', {
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
    const user = await res.json();
    toDelete = user.id;
    expect(user).toMatchObject({first_name: randomUser});
  });

  test('PATCH /users/:id', async () => {
    const res = await app.request(`/users/${createdUserId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        first_name: 'modified',
      }),
    });
    expect(res.status).toBe(200);
    const user = await res.json();
    trackedMoney = user.money;
    expect(user).toMatchObject({first_name: 'modified'});
  });

  test('PATCH /users/money', async () => {
    const res = await app.request('/users/money?deposit=50', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const user = await res.json();
    expect(user).toMatchObject({money: trackedMoney + 50});
    trackedMoney += 50;
  });

  test('PATCH /users/money', async () => {
    const res = await app.request('/users/money?withdraw=50', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const user = await res.json();
    expect(user).toMatchObject({money: trackedMoney - 50});
    trackedMoney -= 50;
  });

  test('DELETE /users/:id', async () => {
    const res = await app.request(`/users/${toDelete}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });
});
