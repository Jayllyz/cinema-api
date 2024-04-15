import type { Context } from 'hono';
import type { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

interface Result<T> {
  success: boolean;
  error?: ZodError<unknown>;
  data?: T;
}

export const zodErrorHook = <T>(result: Result<T>, c: Context) => {
  if (result.success) return;
  if (result.error) return c.json({ error: fromZodError(result.error).message }, 400);
  return c.json({ error: 'Internal server error' }, 500);
};
