import app from '../src/app.js';

let createdEmployeeId: number;
let createdWorkingShiftId: number;

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
tomorrow.setHours(14, 0, 0, 0);
if (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
  tomorrow.setDate(tomorrow.getDate() + (8 - tomorrow.getDay()));
}

describe('Employees', () => {
  test('POST /employees', async () => {
    const res = await app.request('/employees', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+33674752046',
      }),
    });
    expect(res.status).toBe(201);
    const employee = await res.json();
    createdEmployeeId = employee.id;
  });

  test('GET /employees', async () => {
    const res = await app.request('/movies');
    expect(res.status).toBe(200);
    const employees = await res.json();
    expect(employees).toBeInstanceOf(Array);
  });

  test('GET /employees/{id}', async () => {
    const res = await app.request(`/employees/${createdEmployeeId}`);
    expect(res.status).toBe(200);
    const employee = await res.json();
    expect(employee).toMatchObject({last_name: 'Doe', first_name: 'John'});
  });

  test('PATCH /employees/{id}', async () => {
    const updateEmployee = 'johnny';
    const res = await app.request(`/employees/${createdEmployeeId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        first_name: updateEmployee,
      }),
    });
    expect(res.status).toBe(200);
    const employee = await res.json();
    expect(employee).toMatchObject({first_name: updateEmployee});
  });

  test('POST /working_shifts', async () => {
    const end_time: Date = new Date(tomorrow);

    end_time.setUTCHours(tomorrow.getUTCHours() + 2);

    console.log(end_time);

    const res = await app.request('/working_shifts', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        start_time: tomorrow.toISOString(),
        end_time: end_time.toISOString(),
        position: 'confectionery',
        employee_id: createdEmployeeId,
      }),
    });
    expect(res.status).toBe(201);
    const workingShift = await res.json();
    createdWorkingShiftId = workingShift.id;
  });

  test('GET /working_shifts', async () => {
    const res = await app.request('/working_shifts');
    expect(res.status).toBe(200);
    const workingShifts = await res.json();
    expect(workingShifts).toBeInstanceOf(Array);
  });

  test('GET /working_shifts/{id}', async () => {
    const res = await app.request(`/working_shifts/${createdWorkingShiftId}`);
    expect(res.status).toBe(200);
    const workingShift = await res.json();
    expect(workingShift).toMatchObject({id: createdWorkingShiftId});
  });

  test('PATCH /working_shifts/{id}', async () => {
    const updateWorkingShift = 'reception';
    const res = await app.request(`/working_shifts/${createdWorkingShiftId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        position: updateWorkingShift,
      }),
    });
    expect(res.status).toBe(200);
    const workingShift = await res.json();
    expect(workingShift).toMatchObject({position: 'reception'});
  });

  test('DELETE /working_shifts/{id}', async () => {
    const res = await app.request(`/working_shifts/${createdWorkingShiftId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(200);
  });

  test('DELETE /employees/{id}', async () => {
    const res = await app.request(`/employees/${createdEmployeeId}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(200);
  });
});
