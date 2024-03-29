import {StatusCode} from 'hono/utils/http-status';
import {sign} from 'hono/jwt';
import {prisma} from './database';
import {HTTPException} from 'hono/http-exception';

export interface payloadValidator {
  id: number;
  table: string;
  expiration: number;
}

function createErrorResponse<T extends string>(
  errorMessage: T,
  statusCode: number = 401
): Response {
  return new Response(errorMessage, {
    status: statusCode,
    headers: {
      Authenticate: `error="${errorMessage}"`,
    },
  });
}

export async function checkToken(
  payload: payloadValidator,
  authorization: string[]
): Promise<{
  error: {
    error: string;
  };
  status: StatusCode;
} | null> {
  if (!payload) {
    throw new HTTPException(401, {res: createErrorResponse('Unauthorized')});
    // return {error: {error: 'Unauthorized'}, status: 401};
  }
  if (payload.expiration < Math.floor(Date.now() / 1000)) {
    throw new HTTPException(401, {res: createErrorResponse('Token expired')});
    // return {error: {error: 'Token expired'}, status: 401};
  }

  try {
    if (payload.table === 'users') {
      const user = await prisma.users.findUnique({where: {id: payload.id}});
      if (!user) {
        throw new HTTPException(401, {res: createErrorResponse('Invalid token')});
        // return {error: {error: 'Invalid token'}, status: 401};
      }

      const secret = process.env.SECRET_KEY || 'secret';
      if (user.token !== (await sign(payload, secret))) {
        throw new HTTPException(401, {res: createErrorResponse('Invalid token')});
        // return {error: {error: 'Token expired'}, status: 401};
      }

      if (authorization.includes(user.role)) {
        return null;
      }

      // return {error: {error: 'Unauthorized'}, status: 401};
      throw new HTTPException(403, {res: createErrorResponse('Permission denied', 403)});
    }
  } catch (error) {
    console.error(error);
    // return {error: {error: 'Internal Server Error'}, status: 500};
    throw new HTTPException(500, {res: createErrorResponse('Internal Server Error', 500)});
  }

  return null;
}
