import {z} from 'zod';
const phoneE164regex = /^\+[1-9]\d{1,14}$/;

export const employeeResponseSchema = z.object({
  first_name: z.string().max(50),
  last_name: z.string().max(50),
  phone_number: z.string(),
});

export const insertEmployeeValidator = z.object({
  first_name: z.string().max(50),
  last_name: z.string().max(50),
  phone_number: z
    .string()
    .regex(phoneE164regex, 'The phone number need to be in internation (e164) format'),
});

export const updateEmployeeValidator = z.object({
  number: z.number().min(1).optional(),
  capacity: z.number().min(10).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
});
export const EmployeeValidator = z.object({
  id: z.number().positive(),
  number: z.number(),
  capacity: z.number(),
  type: z.string(),
  status: z.string(),
});

// export const listEmployeesValidator = z.array(RoomValidator);
