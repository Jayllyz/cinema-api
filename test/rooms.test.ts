import type { Rooms } from '@prisma/client';
import { sign } from 'hono/jwt';
import app from '../src/app.js';
import { Role } from '../src/lib/token.js';

const numRooms = 10;
let firstRoomId: number;

const secret = process.env.SECRET_KEY || 'secret';
const adminToken = await sign({ id: 1, role: Role.ADMIN }, secret);

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Rooms tests', () => {
  for (let i = 0; i < numRooms; i++) {
    test('creates a new room', async () => {
      const res = await app.request(`${path}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: `Room ${i}`,
          description: 'Test room',
          capacity: 25,
          type: 'room',
          open: true,
          handicap_access: false,
        }),
      });
      expect(res.status).toBe(201);
      const room: Rooms = await res.json();
      expect(room).toMatchObject({
        name: `Room ${i}`,
        description: 'Test room',
        capacity: 25,
        type: 'room',
        open: true,
        handicap_access: false,
      });
      if (i === 0) firstRoomId = room.id;
    });

    test('fails with existing room number', async () => {
      const res = await app.request(`${path}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: `Room ${i}`,
          description: 'Test room',
          capacity: 20,
          type: 'room',
          open: true,
          handicap_access: false,
        }),
      });
      expect(res.status).toBe(400);
    });
  }

  test('returns a list of rooms', async () => {
    const res = await app.request(`${path}/rooms`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const rooms: Rooms[] = await res.json();
    expect(rooms).toBeInstanceOf(Array);
    expect(rooms.length).toBeGreaterThanOrEqual(numRooms);
  });

  test('returns a room', async () => {
    const res = await app.request(`${path}/rooms/${firstRoomId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const room: Rooms = await res.json();
    expect(room).toMatchObject({ name: 'Room 0' });
  });

  test('updates a room', async () => {
    const res = await app.request(`${path}/rooms/${firstRoomId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Room 0',
        description: 'Test room',
        capacity: 25,
        type: 'patched',
        open: true,
        handicap_access: false,
      }),
    });
    expect(res.status).toBe(200);
    const room: Rooms = await res.json();
    expect(room).toMatchObject({
      name: 'Room 0',
      description: 'Test room',
      capacity: 25,
      type: 'patched',
      open: true,
      handicap_access: false,
    });
  });

  test('fails with non-existing room id', async () => {
    const wrongRoomId = firstRoomId + numRooms + 10;
    const res = await app.request(`${path}/rooms/${wrongRoomId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Room ${wrongRoomId}`,
        description: 'Test room 2',
        capacity: 20,
        type: 'room',
        open: true,
        handicap_access: false,
      }),
    });
    expect(res.status).toBe(404);
  });

  const lastRoomId = firstRoomId + numRooms - 1;
  for (let i = firstRoomId; i < lastRoomId; i++) {
    test('deletes a room', async () => {
      const res = await app.request(`${path}/rooms/${i}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      expect(res.status).toBe(200);
    });

    test('fails with non-existing room id', async () => {
      const res = await app.request(`${path}/rooms/${i}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      expect(res.status).toBe(404);
    });
  }
});
