import type { Rooms } from '@prisma/client';
import { sign } from 'hono/jwt';
import app from '../src/app.js';
import { Role } from '../src/lib/token.js';

let room_id = 1;

const secret = process.env.SECRET_KEY || 'secret';
const adminToken = await sign({ id: 1, role: Role.ADMIN }, secret);

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Rooms tests', () => {
  test('creates a new room', async () => {
    const res = await app.request(`${path}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Test room',
        description: 'Test room',
        capacity: 25,
        type: 'room',
        open: true,
        handicap_access: false,
      }),
    });
    expect(res.status).toBe(201);
    const room = (await res.json()) as Rooms;
    expect(room).toMatchObject({
      name: 'Test room',
      description: 'Test room',
      capacity: 25,
      type: 'room',
      open: true,
      handicap_access: false,
    });
    room_id = room.id;
  });

  test('fails with existing room name', async () => {
    const res = await app.request(`${path}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Test room',
        description: 'Test room',
        capacity: 20,
        type: 'room',
        open: true,
        handicap_access: false,
      }),
    });
    expect(res.status).toBe(400);
  });

  test('returns a list of rooms', async () => {
    const res = await app.request(`${path}/rooms`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const rooms = (await res.json()) as Rooms[];
    expect(rooms).toBeInstanceOf(Array);
    expect(rooms.length).toBeGreaterThanOrEqual(1);
  });

  test('returns a room', async () => {
    const res = await app.request(`${path}/rooms/${room_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const room = (await res.json()) as Rooms;
    expect(room).toMatchObject({ name: 'Test room' });
  });

  test('updates a room', async () => {
    const res = await app.request(`${path}/rooms/${room_id}`, {
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
    const room = (await res.json()) as Rooms;
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
    const wrongRoomId = room_id + 100;
    const res = await app.request(`${path}/rooms/${wrongRoomId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Room 0',
        description: 'Test room 2',
        capacity: 20,
        type: 'room',
        open: true,
        handicap_access: false,
      }),
    });
    expect(res.status).toBe(404);
  });

  test('delete the room', async () => {
    const res = await app.request(`${path}/rooms/${room_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ message: `Room with id ${room_id} deleted` });
  });

  test('fails with non-existing room id', async () => {
    const res = await app.request(`${path}/rooms/${room_id + 100}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(404);
  });
});
