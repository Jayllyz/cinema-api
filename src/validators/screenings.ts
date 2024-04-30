import { z } from 'zod';
import { validateDay } from '../lib/date.js';
import { MovieValidator } from './movies.js';
import { RoomValidator } from './rooms.js';

export const insertScreeningValidator = z.object({
  start_time: z.coerce
    .date()
    .min(new Date(), { message: 'start date cannot be in the past.' })
    .refine((date) => validateDay(date), { message: 'The screening cannot be during the week-end' })
    .transform((date) => date.toISOString()),
  movie_id: z.number().min(1),
  room_id: z.number().min(1),
  ticket_price: z.number().min(0),
});

export const updateScreeningValidator = z.object({
  start_time: z.coerce
    .date()
    .min(new Date(), { message: 'start date cannot be in the pastday.' })
    .refine((date) => validateDay(date), { message: 'The screening cannot be during the week-end' })
    .transform((date) => date.toISOString())
    .optional(),
  movie_id: z.number().min(1).optional(),
  room_id: z.number().min(1).optional(),
});

export const screeningValidator = z.object({
  id: z.number().positive(),
  start_time: z.coerce.date().transform((date) => date.toISOString()),
  end_time: z.coerce.date().transform((date) => date.toISOString()),
  screening_duration_minutes: z.number().int().min(1),
  movie: MovieValidator,
  room: RoomValidator,
});

export const responseScreeningValidator = z.object({
  id: z.number().positive(),
  start_time: z.coerce.date().transform((date) => date.toISOString()),
  end_time: z.coerce.date().transform((date) => date.toISOString()),
  screening_duration_minutes: z.number().int().min(1),
  movie_id: z.number(),
  room_id: z.number(),
});

export const listScreeningValidator = z.array(screeningValidator);
