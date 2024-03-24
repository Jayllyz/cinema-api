import app from '../src/app.js';

let createdRoomId = 1;

describe('Rooms', () => {
  test('POST /rooms', async () => {
    const res = await app.request('http://localhost/rooms', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        number: 101,
        capacity: 10,
        type: 'classroom',
        status: 'available',
      }),
    });
    expect(res.status).toBe(201);
    const room = await res.json();
    expect(room).toMatchObject({number: 101});
    createdRoomId = room.id;
  });

  test('GET /rooms', async () => {
    const res = await app.request('/rooms');
    expect(res.status).toBe(200);
    const rooms = await res.json();
    expect(rooms).toBeInstanceOf(Array);
  });

  test('GET /rooms/:id', async () => {
    const res = await app.request(`/rooms/${createdRoomId}`);
    expect(res.status).toBe(200);
    const room = await res.json();
    expect(room).toMatchObject({number: 101});
  });

  test('PATCH /rooms/:id', async () => {
    const res = await app.request(`/rooms/${createdRoomId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        number: 120,
        capacity: 46,
        type: 'testing',
        status: 'unavailable',
      }),
    });
    expect(res.status).toBe(200);
    const room = await res.json();
    expect(room).toMatchObject({status: 'unavailable'});
  });

  test('DELETE /rooms/:id', async () => {
    const res = await app.request(`/rooms/${createdRoomId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(204);
  });
});
