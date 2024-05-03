import { z } from 'zod';
const phoneE164regex = /^\+[1-9]\d{1,14}$/;

export const employeeResponseSchema = z.object({
  first_name: z.string().max(50),
  last_name: z.string().max(50),
  phone_number: z.string().regex(phoneE164regex, 'The phone number need to be in international format (e164)'),
});

export const insertEmployeeValidator = z.object({
  first_name: z.string().max(50),
  last_name: z.string().max(50),
  phone_number: z.string().regex(phoneE164regex, 'The phone number need to be in international format (e164)'),
});

export const updateEmployeeValidator = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().regex(phoneE164regex, 'The phone number need to be in international format (e164)').optional(),
});

export const employeeValidator = z.object({
  id: z.number().min(1),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string().regex(phoneE164regex, 'The phone number need to be in international format (e164)'),
});

export const listEmployeesValidator = z.array(employeeValidator);
