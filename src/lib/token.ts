import {HTTPException} from 'hono/http-exception';
import {prisma} from './database';

export enum Role {
  USER = 1,
  STAFF = 2,
  ADMIN = 3,
  SUPERADMIN = 4,
}

export interface PayloadValidator {
  id: number;
  role: number;
  exp: number;
}

export async function checkToken(
  payload: PayloadValidator,
  authorization: string[],
  token: string | undefined
): Promise<void> {
  if (!token) throw new HTTPException(401, {message: 'Unauthorized', cause: 'Token not provided'});

  if (payload.role === Role.USER) {
    const user = await prisma.users.findUnique({
      where: {id: payload.id, token},
      select: {role: true},
    });

    if (!user) throw new HTTPException(401, {message: 'Unauthorized', cause: 'Invalid token'});

    if (authorization.includes(user.role)) return;

    throw new HTTPException(403, {message: 'Permission denied', cause: 'Invalid permissions'});
  }
}
