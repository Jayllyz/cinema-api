import {ZodError} from 'zod';
import {fromZodError} from 'zod-validation-error';
import type {Context} from 'hono';

interface Result<T> {
  success: boolean;
  error?: ZodError<unknown>;
  data?: T;
}

export const zodErrorHook = <T>(result: Result<T>, c: Context) => {
  if (result.success) return;
  console.error(result);
  return c.json({error: fromZodError(result.error!).message}, 400);
};
