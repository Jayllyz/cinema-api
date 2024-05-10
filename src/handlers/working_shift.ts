import { OpenAPIHono } from '@hono/zod-openapi';
import { getOverlapingShift, prisma } from '../lib/database.js';
import { isAfterHour, isBeforeHour, isSameDay } from '../lib/date.js';
import { type PayloadValidator, Role, checkToken } from '../lib/token.js';
import { zodErrorHook } from '../lib/zodError.js';
import {
  deleteWorkingShift,
  getWorkingShiftById,
  getWorkingShifts,
  insertWorkingShift,
  updateWorkingShift,
} from '../routes/working_shifts.js';

export const workingShift = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

const selectShiftWithEmployee = {
  id: true,
  start_time: true,
  end_time: true,
  position: true,
  employee: true,
};

workingShift.openapi(getWorkingShifts, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  try {
    const working_shift = await prisma.working_shifts.findMany({
      select: selectShiftWithEmployee,
      orderBy: { start_time: 'asc' },
    });
    return c.json(working_shift, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

workingShift.openapi(getWorkingShiftById, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.STAFF, token);

  const { id } = c.req.valid('param');
  try {
    const workingShift = await prisma.working_shifts.findUnique({
      where: { id },
      select: selectShiftWithEmployee,
    });
    if (!workingShift) return c.json({ error: `Working shift with id ${id} not found` }, 404);

    return c.json(workingShift, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

workingShift.openapi(insertWorkingShift, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { start_time, end_time, position, employee_id } = c.req.valid('json');
  try {
    try {
      validateShiftDates(start_time, end_time);
    } catch (error) {
      return c.json({ error }, 400);
    }

    const overlapingShift = await getOverlapingShift(start_time, end_time, position);

    if (overlapingShift) {
      return c.json(
        {
          error: 'A working shift with the same position is already attributed',
          working_shift: overlapingShift,
        },
        400,
      );
    }

    const workingShift = await prisma.working_shifts.create({
      data: { start_time, end_time, position, employee_id },
      select: selectShiftWithEmployee,
    });
    return c.json(workingShift, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

workingShift.openapi(deleteWorkingShift, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  try {
    const workingShift = await prisma.working_shifts.findUnique({ where: { id } });
    if (!workingShift) return c.json({ error: `Working shift with id ${id} not found` }, 404);

    await prisma.working_shifts.delete({ where: { id: Number(id) } });

    return c.json({ message: `Working shift with id ${id} deleted` }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

workingShift.openapi(updateWorkingShift, async (c) => {
  const payload: PayloadValidator = c.get('jwtPayload');
  const token = c.req.header('authorization')?.split(' ')[1];
  await checkToken(payload, Role.ADMIN, token);

  const { id } = c.req.valid('param');
  const { start_time, end_time, position, employee_id } = c.req.valid('json');
  try {
    const workingShift = await prisma.working_shifts.findUnique({ where: { id } });
    if (!workingShift) return c.json({ error: `Working shift with id ${id} not found` }, 404);

    if ((!start_time && end_time) || (start_time && !end_time)) {
      return c.json({ error: 'Working shift need the start time and the end time if patching the time' }, 400);
    }

    if ((start_time && end_time) || position) {
      try {
        if (start_time) workingShift.start_time = start_time;
        if (end_time) workingShift.end_time = end_time;
        validateShiftDates(workingShift.start_time, workingShift.end_time);

        if (position) {
          workingShift.position = position;
        }
        const overlapingShift = await getOverlapingShift(
          workingShift.start_time,
          workingShift.end_time,
          workingShift.position,
        );

        if (overlapingShift) {
          return c.json(
            {
              error: 'A working shift with the same position is already attributed',
              working_shift: overlapingShift,
            },
            400,
          );
        }
      } catch (error) {
        return c.json({ error });
      }
    }

    const res = await prisma.working_shifts.update({
      where: { id },
      data: { start_time, end_time, position, employee_id },
      select: selectShiftWithEmployee,
    });

    return c.json(res, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error }, 500);
  }
});

function validateShiftDates(start_time: Date, end_time: Date) {
  if (isBeforeHour(start_time, 9) || isAfterHour(start_time, 20)) {
    throw new Error('The working shift start time must be between 9 and 20 hours');
  }

  if (isBeforeHour(end_time, 9) || isAfterHour(end_time, 20)) {
    throw new Error('The working shift end time must be between 9 and 20 hours');
  }

  if (!isSameDay(start_time, end_time)) {
    throw new Error('The working shift must occur within one day');
  }
}
