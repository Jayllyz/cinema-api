import {z} from 'zod';

export const idValidator = z.object({
  id: z.coerce.number().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
  }),
});

export const insertRoomValidator = z.object({
  number: z.number().min(1),
  capacity: z.number().min(10),
  type: z.string(),
  status: z.string(),
});

export const updateRoomValidator = z.object({
  number: z.number().min(1).optional(),
  capacity: z.number().min(10).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
});
export const RoomValidator = z.object({
  id: z.number().positive(),
  number: z.number(),
  capacity: z.number(),
  type: z.string(),
  status: z.string(),
});

export const listRoomsValidator = z.array(RoomValidator);
