import type { Images } from '@prisma/client';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

describe('Images test', () => {
  let createdImageId = 1;
  let adminToken: string;

  beforeAll(async () => {
    await prisma.employees.create({
      data: {
        first_name: 'Admin',
        last_name: 'Admin',
        email: 'admin@email.com',
        password: await bcrypt.hash('password', 10),
        role: Role.ADMIN,
        phone_number: '1234567890',
      },
    });

    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@email.com',
        password: 'password',
      }),
    });
    const token = (await res.json()) as { token: string };
    adminToken = token.token;
  });

  test('POST /images', async () => {
    const res = await app.request(`${path}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        alt: 'Test image',
        url: 'https://example.com/image.jpg',
        movieId: null,
        roomId: null,
      }),
    });
    expect(res.status).toBe(201);
    const image: Images = (await res.json()) as Images;
    createdImageId = image.id;
  });

  test('GET /images', async () => {
    const res = await app.request(`${path}/images`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const images: Images[] = (await res.json()) as Images[];
    expect(images).toBeInstanceOf(Array);
  });

  test('GET /images/{id}', async () => {
    const res = await app.request(`${path}/images/${createdImageId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const image: Images = (await res.json()) as Images;
    expect(image).toMatchObject({ alt: 'Test image' });
  });

  test('DELETE image', async () => {
    const res = await app.request(`${path}/images/${createdImageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });
});
