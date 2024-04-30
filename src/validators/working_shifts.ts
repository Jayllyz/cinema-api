import { z } from 'zod';
import { employeeValidator } from './employees.js';

export const workingShiftsResponseSchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
  position: z.string(),
  employee: employeeValidator,
});

export const insertWorkingShiftsValidator = z
  .object({
    start_time: z.coerce.date().min(new Date(), { message: 'You cannot create a working shift in the past' }),
    end_time: z.coerce.date().min(new Date(), { message: 'You cannot create a working shift in the past' }),
    position: z.enum(['reception', 'confectionery', 'projection']),
    employee_id: z.coerce.number().min(1),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: 'Start time must be before end time',
    path: ['start_time', 'end_time'],
  });

export const updateWorkingShiftsValidator = z.object({
  start_time: z.coerce.date().min(new Date(), { message: 'You cannot create a working shift in the past' }).optional(),
  end_time: z.coerce.date().min(new Date(), { message: 'You cannot create a working shift in the past' }).optional(),
  position: z.enum(['reception', 'confectionery', 'projection']).optional(),
  employee_id: z.coerce.number().min(1).optional(),
});

export const listworkingShiftsValidator = z.array(workingShiftsResponseSchema);
