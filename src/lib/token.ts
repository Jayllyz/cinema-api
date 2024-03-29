import {StatusCode} from 'hono/utils/http-status';
import {sign} from 'hono/jwt';
import {prisma} from './database';

export interface PayloadValidator {
  id: number;
  table: string;
  expiration: number;
}

const secret = process.env.SECRET_KEY || 'secret';

export async function checkToken(
  payload: PayloadValidator,
  authorization: string[]
): Promise<{
  error: {
    error: string;
  };
  status: StatusCode;
} | null> {
  if (!payload) {
    return {error: {error: 'Unauthorized'}, status: 401};
  }

  if (payload.expiration < Math.floor(Date.now() / 1000)) {
    return {error: {error: 'Token expired'}, status: 401};
  }

  try {
    if (payload.table === 'users') {
      const user = await prisma.users.findUnique({
        where: {id: payload.id},
        select: {role: true, token: true},
      });

      if (!user || user.token !== (await sign(payload, secret))) {
        return {error: {error: 'Invalid token'}, status: 401};
      }

      if (authorization.includes(user.role)) {
        return null;
      }

      return {error: {error: 'Permission Denied'}, status: 403};
    }
  } catch (error) {
    console.error(error);
    return {error: {error: 'Internal Server Error'}, status: 500};
  }

  return null;
}
