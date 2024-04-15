import { z } from 'zod';

export const LogValidator = z.object({
  id: z.number().positive(),
  user_id: z.number().positive(),
  action: z.string(),
  description: z.string(),
  created_at: z.coerce.date().transform((date) => date.toISOString()),
});
