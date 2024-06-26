import type { Employees, Working_shifts } from '@prisma/client';
import app from '../src/app.js';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';
import { createStaff } from './utils.js';

let createdEmployeeId: number;
let createdWorkingShiftId: number;
let adminToken: string;
let staffToken: string;

const port = Number(process.env.PORT || 3000);
const path = `http://localhost:${port}`;

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
tomorrow.setHours(14, 0, 0, 0);
if (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
  tomorrow.setDate(tomorrow.getDate() + (8 - tomorrow.getDay()));
}

describe('Employees', () => {
  beforeAll(async () => {
    await createStaff('Admin', 'adminstaff@email.com', 'password', Role.ADMIN);

    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'adminstaff@email.com',
        password: 'password',
      }),
    });
    expect(res.status).toBe(200);
    const token = (await res.json()) as { token: string };
    adminToken = token.token;
  });

  test('POST /employees', async () => {
    const res = await app.request(`${path}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        first_name: 'staff',
        last_name: 'staff',
        email: 'staff@email.com',
        password: 'password12345',
        phone_number: '+33674752046',
        role: Role.STAFF,
      }),
    });
    expect(res.status).toBe(201);
    const employee = (await res.json()) as Employees;
    createdEmployeeId = employee.id;
  });

  test('GET /employees', async () => {
    const res = await app.request(`${path}/employees`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const employees = (await res.json()) as Employees[];
    expect(employees).toBeInstanceOf(Array);
    expect(employees.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /employees/{id}', async () => {
    const res = await app.request(`${path}/employees/${createdEmployeeId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const employee = (await res.json()) as Employees;
    expect(employee).toMatchObject({ last_name: 'staff', first_name: 'staff' });
  });

  test('PATCH /employees/{id}', async () => {
    const updateEmployee = 'johnny';
    const res = await app.request(`${path}/employees/${createdEmployeeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        first_name: updateEmployee,
      }),
    });
    expect(res.status).toBe(200);
    const employee = (await res.json()) as Employees;
    expect(employee).toMatchObject({ first_name: updateEmployee });
  });

  test('POST /working_shifts', async () => {
    const end_time: Date = new Date(tomorrow);

    end_time.setUTCHours(tomorrow.getUTCHours() + 2);

    const res = await app.request(`${path}/working_shifts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        start_time: tomorrow.toISOString(),
        end_time: end_time.toISOString(),
        position: 'confectionery',
        employee_id: createdEmployeeId,
      }),
    });
    expect(res.status).toBe(201);
    const workingShift = (await res.json()) as Working_shifts;
    createdWorkingShiftId = workingShift.id;
  });

  test('GET /working_shifts', async () => {
    const res = await app.request(`${path}/working_shifts`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const workingShifts = (await res.json()) as Working_shifts[];
    expect(workingShifts).toBeInstanceOf(Array);
    expect(workingShifts.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /working_shifts/{id}', async () => {
    const res = await app.request(`${path}/working_shifts/${createdWorkingShiftId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const workingShift = (await res.json()) as Working_shifts;
    expect(workingShift).toMatchObject({ id: createdWorkingShiftId });
  });

  test('PATCH /working_shifts/{id}', async () => {
    const updateWorkingShift = 'reception';
    const res = await app.request(`${path}/working_shifts/${createdWorkingShiftId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        position: updateWorkingShift,
      }),
    });
    expect(res.status).toBe(200);
    const workingShift = (await res.json()) as Working_shifts;
    expect(workingShift).toMatchObject({ position: 'reception' });
  });

  test('Employee can login', async () => {
    const res = await app.request(`${path}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'staff@email.com',
        password: 'password12345',
      }),
    });
    expect(res.status).toBe(200);
    const token: { token: string } = (await res.json()) as { token: string };
    staffToken = token.token;
  });

  test('Employee can change password', async () => {
    const res = await app.request(`${path}/employees/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        password: 'password12345',
      }),
    });
    expect(res.status).toBe(200);
  });

  test('DELETE /working_shifts/{id}', async () => {
    const res = await app.request(`${path}/working_shifts/${createdWorkingShiftId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });

  test('DELETE /employees/{id}', async () => {
    const res = await app.request(`${path}/employees/${createdEmployeeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    await prisma.employees.deleteMany();
  });
});
