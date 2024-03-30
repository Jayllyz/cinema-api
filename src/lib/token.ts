import {prisma} from './database';
import {HTTPException} from 'hono/http-exception';

export interface PayloadValidator {
  id: number;
  table: string;
  exp: number;
}

export async function checkToken(
  payload: PayloadValidator,
  authorization: string[],
  token: string | undefined
): Promise<void> {
  if (!token) throw new HTTPException(401, {message: 'Unauthorized', cause: 'Token not provided'});

  if (payload.table === 'users') {
    const user = await prisma.users.findUnique({
      where: {id: payload.id, token},
      select: {role: true, token: true},
    });

    if (!user) throw new HTTPException(401, {message: 'Unauthorized', cause: 'Invalid token'});

    if (authorization.includes(user.role)) return;

    throw new HTTPException(403, {message: 'Permission denied', cause: 'Invalid permissions'});
  }
}
