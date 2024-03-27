import {coerce, z} from 'zod';
import {MovieValidator} from './movies';
import {RoomValidator} from './rooms';
import {validateDay} from '../lib/date';

export const idValidator = z.object({
  id: z
    .string()
    .openapi({
      param: {
        name: 'id',
        in: 'path',
      },
    })
    .transform((v) => parseInt(v))
    .refine((v) => !isNaN(v), {message: 'not a number'}),
});

export const insertScreeningValidator = z.object({
  start_time: z.coerce
    .date()
    .min(new Date(), {message: 'Date must be after today.'})
    .refine((date) => validateDay(date), {message: 'The screening cannot be during the week-end'}),
  movie_id: z.number().min(1),
  room_id: z.number().min(1),
});

export const listScreeningValidator = z.array(
  z.object({
    id: z.number(),
    start_time: z.coerce.date(),
    end_time: z.coerce.date(),
    screening_duration_minutes: z.number().int().min(1),
    movie: MovieValidator,
    room: RoomValidator,
  })
);
