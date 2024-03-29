import type {Rooms} from '@prisma/client';
import app from '../src/app.js';

const testRoomNumber = 1000;
const numRooms = 10;
let firstRoomId: number;

describe('Rooms tests', () => {
  for (let i = 0; i < numRooms; i++) {
    test('creates a new room', async () => {
      const res = await app.request('/rooms', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          number: testRoomNumber + i,
          capacity: 10,
          type: 'room',
          status: 'available',
        }),
      });
      expect(res.status).toBe(201);
      const room: Rooms = await res.json();
      expect(room).toMatchObject({number: testRoomNumber + i});
      if (i === 0) firstRoomId = room.id;
    });

    test('fails with existing room number', async () => {
      const res = await app.request('/rooms', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          number: testRoomNumber,
          capacity: 20,
          type: 'room',
          status: 'available',
        }),
      });
      expect(res.status).toBe(400);
    });
  }

  test('returns a list of rooms', async () => {
    const res = await app.request('/rooms');
    expect(res.status).toBe(200);
    const rooms: Rooms[] = await res.json();
    expect(rooms).toBeInstanceOf(Array);
    expect(rooms.length).toBeGreaterThanOrEqual(numRooms);
  });

  test('returns a room', async () => {
    const res = await app.request(`/rooms/${firstRoomId}`);
    expect(res.status).toBe(200);
    const room: Rooms = await res.json();
    expect(room).toMatchObject({number: testRoomNumber});
  });

  test('updates a room', async () => {
    const res = await app.request(`/rooms/${firstRoomId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        number: testRoomNumber,
        capacity: 25,
        type: 'patched',
        status: 'unavailable',
      }),
    });
    expect(res.status).toBe(200);
    const room: Rooms = await res.json();
    expect(room).toMatchObject({
      number: testRoomNumber,
      capacity: 500,
      type: 'patched',
      status: 'unavailable',
    });
  });

  test('fails with non-existing room id', async () => {
    const wrongRoomId = firstRoomId + numRooms + 10;
    const res = await app.request(`/rooms/${wrongRoomId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        number: testRoomNumber,
        capacity: 26,
        type: 'patched',
        status: 'unavailable',
      }),
    });
    expect(res.status).toBe(404);
  });

  const lastRoomId = firstRoomId + numRooms - 1;
  for (let i = firstRoomId; i < lastRoomId; i++) {
    test('deletes a room', async () => {
      const res = await app.request(`/rooms/${i}`, {
        method: 'DELETE',
      });
      expect(res.status).toBe(200);
    });

    test('fails with non-existing room id', async () => {
      const res = await app.request(`/rooms/${i}`, {
        method: 'DELETE',
      });
      expect(res.status).toBe(404);
    });
  }
});
