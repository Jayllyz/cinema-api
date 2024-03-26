import {z} from 'zod';
import {MovieValidator} from './movies';
import {RoomValidator} from './rooms';

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

export const listScreeningValidator = z.array(
  z.object({
    id: z.number(),
    start_time: z.coerce.date(),
    end_time: z.coerce.date(),
    movie: MovieValidator,
    room: RoomValidator,
  })
);
