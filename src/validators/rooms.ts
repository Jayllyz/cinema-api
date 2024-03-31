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
  name: z.string(),
  description: z.string(),
  capacity: z.number().min(15).max(30),
  type: z.string(),
  open: z.boolean(),
  handicap_access: z.boolean(),
});

export const updateRoomValidator = z.object({
  name: z.string(),
  description: z.string(),
  capacity: z.number().min(15).max(30).optional(),
  type: z.string().optional(),
  open: z.boolean().optional(),
  handicap_access: z.boolean().optional(),
});

export const RoomValidator = z.object({
  id: z.number().positive(),
  name: z.string(),
  description: z.string(),
  capacity: z.number().min(15).max(30),
  type: z.string(),
  open: z.boolean(),
  handicap_access: z.boolean(),
});

export const listRoomsValidator = z.array(RoomValidator);
