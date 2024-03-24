import app from '../src/app.js';

let createdCategoryId = 1;

describe('Categories', () => {
  test('POST /categories', async () => {
    const res = await app.request('/categories', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'Action',
      }),
    });
    expect(res.status).toBe(201);
    const category = await res.json();
    expect(category).toMatchObject({name: 'Action'});
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
    expect(category).toMatchObject({name: 'Action'});
  });

  test('DELETE /categories/:id', async () => {
    const res = await app.request(`/categories/${createdCategoryId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(204);
  });
});
