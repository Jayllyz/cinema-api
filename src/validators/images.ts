import { z } from '@hono/zod-openapi';

export const images = z.object({
  id: z.number().min(1),
  alt: z.string(),
  url: z.string(),
  movieId: z.number().nullable(),
  roomId: z.number().nullable(),
});
