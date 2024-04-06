import app from '../src/app';
import {sign} from 'hono/jwt';
import {Role} from '../src/lib/token';

const secret = process.env.SECRET_KEY || 'secret';
const adminToken = await sign({id: 1, role: Role.ADMIN}, secret);
let trackedUser: number;

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Auth', () => {
  test('POST /auth/signup', async () => {
    const res = await app.request(path + '/auth/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@gmail.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(201);
    const users = await res.json();
    trackedUser = users.id;
    expect(users).toMatchObject({first_name: 'John'});
  });

  test('POST /auth/login', async () => {
    const res = await app.request(path + '/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'john@gmail.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(200);
    const token = await res.json();
    expect(token).toHaveProperty('token');
  });

  test('Clean up', async () => {
    const res = await app.request(path + `/users/${trackedUser}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });
});
