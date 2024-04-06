import app from '../src/app.js';
import {randomString} from './utils.js';
import {sign} from 'hono/jwt';
import {Role} from '../src/lib/token';

let createdCategoryId = 1;
const randomCategory = randomString(5);
const secret = process.env.SECRET_KEY || 'secret';
const adminToken = await sign({id: 1, role: Role.ADMIN}, secret);

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Categories', () => {
  test('POST /categories', async () => {
    const res = await app.request(path + '/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: randomCategory,
      }),
    });
    expect(res.status).toBe(201);
    const category = await res.json();
    createdCategoryId = category.id;
  });

  test('GET /categories', async () => {
    const res = await app.request(path + '/categories', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const categories = await res.json();
    expect(categories).toBeInstanceOf(Array);
  });

  test('GET /categories/{id}', async () => {
    const res = await app.request(path + `/categories/${createdCategoryId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const category = await res.json();
    expect(category).toMatchObject({name: randomCategory});
  });

  test('DELETE /categories/{id}', async () => {
    const res = await app.request(path + `/categories/${createdCategoryId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });
});
