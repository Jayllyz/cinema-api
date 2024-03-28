import app from '../src/app.js';
import {randomInt} from 'crypto';

let createdRoomId = 1;
const randomRoom = randomInt(500, 9999);

describe('Rooms', () => {
  test('POST /rooms', async () => {
    const res = await app.request('http://localhost/rooms', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        number: randomRoom,
        capacity: 10,
        type: 'classroom',
        status: 'available',
      }),
    });
    expect(res.status).toBe(201);
    const room = await res.json();
    expect(room).toMatchObject({number: randomRoom});
    createdRoomId = room.id;
  });

  test('GET /rooms', async () => {
    const res = await app.request('/rooms');
    expect(res.status).toBe(200);
    const rooms = await res.json();
    expect(rooms).toBeInstanceOf(Array);
  });

  test('GET /rooms/{id}', async () => {
    const res = await app.request(`/rooms/${createdRoomId}`);
    expect(res.status).toBe(200);
    const room = await res.json();
    expect(room).toMatchObject({number: randomRoom});
  });

  test('PATCH /rooms/{id}', async () => {
    const res = await app.request(`/rooms/${createdRoomId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        number: randomRoom,
        capacity: 500,
        type: 'patched',
        status: 'unavailable',
      }),
    });
    expect(res.status).toBe(200);
    const room = await res.json();
    expect(room).toMatchObject({
      number: randomRoom,
      capacity: 500,
      type: 'patched',
      status: 'unavailable',
    });
  });

  test('DELETE /rooms/{id}', async () => {
    const res = await app.request(`/rooms/${createdRoomId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(200);
  });
});
