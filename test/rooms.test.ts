import app from '../src/app.js';

const testRoomNumber = 1000;
const numRooms = 10;

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
      const room = await res.json();
      expect(room).toMatchObject({number: testRoomNumber + i});
    });

    test('fails with existing room number', async () => {
      const res = await app.request('/rooms', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          number: testRoomNumber,
          capacity: 10,
          type: 'classroom',
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
    const rooms = await res.json();
    expect(rooms).toBeInstanceOf(Array);
    expect(rooms.length).toBeGreaterThanOrEqual(numRooms);
  });
});

describe('GET /rooms/{id}', () => {
  test('returns a room', async () => {
    const res = await app.request(`/rooms/1`);
    expect(res.status).toBe(200);
    const room = await res.json();
    expect(room).toMatchObject({number: testRoomNumber});
  });
});

describe('PATCH /rooms/{id}', () => {
  test('updates a room', async () => {
    const res = await app.request(`/rooms/1`, {
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
    const room = await res.json();
    expect(room).toMatchObject({
      number: testRoomNumber,
      capacity: 500,
      type: 'patched',
      status: 'unavailable',
    });
  });

  test('fails with non-existing room id', async () => {
    const res = await app.request(`/rooms/${testRoomNumber}`, {
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
  for (let i = 1; i < numRooms; i++) {
    test('deletes a room', async () => {
      const res = await app.request(`/rooms/${i}`, {
        method: 'DELETE',
      });
      expect(res.status).toBe(200);
    });

    test('fails with non-existing room number', async () => {
      const res = await app.request(`/rooms/${i}`, {
        method: 'DELETE',
      });
      expect(res.status).toBe(404);
    });
  }
});
