import { z } from '@hono/zod-openapi';

export const insertRoomValidator = z.object({
  name: z.string(),
  description: z.string(),
  capacity: z.number().min(15).max(30),
  type: z.string(),
  open: z.boolean(),
  handicap_access: z.boolean(),
});

export const updateRoomValidator = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  capacity: z.number().min(15).max(30).optional(),
  type: z.string().optional(),
  open: z.boolean().optional(),
  handicap_access: z.boolean().optional(),
});

export const RoomValidator = z.object({
  id: z.number().min(1),
  name: z.string(),
  description: z.string(),
  capacity: z.number().min(15).max(30),
  type: z.string(),
  open: z.boolean(),
  handicap_access: z.boolean(),
  images: z
    .array(
      z.object({
        id: z.number().min(1),
        url: z.string(),
        alt: z.string(),
      }),
    )
    .optional(),
});

export const listRoomsValidator = z.array(RoomValidator);
