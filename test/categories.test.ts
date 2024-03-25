import app from '../src/app.js';
import {randomString} from './utils.js';

let createdCategoryId = 1;
const randomCategory = randomString(5);

describe('Categories', () => {
  test('POST /categories', async () => {
    const res = await app.request('/categories', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: randomCategory,
      }),
    });
    expect(res.status).toBe(201);
    const category = await res.json();
    expect(category).toMatchObject({name: randomCategory});
    createdCategoryId = category.id;
  });

  test('GET /categories', async () => {
    const res = await app.request('/categories');
    expect(res.status).toBe(200);
    const categories = await res.json();
    expect(categories).toBeInstanceOf(Array);
  });

  test('GET /categories/:id', async () => {
    const res = await app.request(`/categories/${createdCategoryId}`);
    expect(res.status).toBe(200);
    const category = await res.json();
    expect(category).toMatchObject({name: randomCategory});
  });

  test('DELETE /categories/:id', async () => {
    const res = await app.request(`/categories/${createdCategoryId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(200);
  });
});
