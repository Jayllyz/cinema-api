import type {Rooms} from '@prisma/client';
import app from '../src/app.js';

const testRoomNumber = 1000;
const numRooms = 10;
let firstRoomId: number = 1;

describe('POST /rooms', () => {
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
      if (i === 0 && room.id) firstRoomId = room.id;
    });

    test('fails with existing room number', async () => {
      const res = await app.request('/rooms', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          number: testRoomNumber,
          capacity: 10,
          type: 'room',
          status: 'available',
        }),
      });
      expect(res.status).toBe(400);
    });
  }
});

describe('GET /rooms', () => {
  test('returns a list of rooms', async () => {
    const res = await app.request('/rooms');
    expect(res.status).toBe(200);
    const rooms: Rooms[] = await res.json();
    expect(rooms).toBeInstanceOf(Array);
    expect(rooms.length).toBeGreaterThanOrEqual(numRooms);
  });
});

describe('GET /rooms/{id}', () => {
  test('returns a room', async () => {
    const res = await app.request(`/rooms/${firstRoomId}`);
    expect(res.status).toBe(200);
    const room: Rooms = await res.json();
    expect(room).toMatchObject({number: testRoomNumber});
  });
});

describe('PATCH /rooms/{id}', () => {
  test('updates a room', async () => {
    const res = await app.request(`/rooms/${firstRoomId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        number: testRoomNumber,
        capacity: 500,
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
        capacity: 5000,
        type: 'patched',
        status: 'unavailable',
      }),
    });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /rooms/{id}', () => {
  const lastRoomId = firstRoomId + numRooms;
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
