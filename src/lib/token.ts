import { HTTPException } from 'hono/http-exception';
import { prisma } from './database.js';

export enum Role {
  USER = 1,
  STAFF = 2,
  ADMIN = 3,
  SUPERADMIN = 4,
}

export interface PayloadValidator {
  id: number;
  role: Role;
  exp: number;
}

export async function checkToken(
  payload: PayloadValidator,
  authorization: Role,
  token: string | undefined,
): Promise<void> {
  if (!token) throw new HTTPException(401, { message: 'Unauthorized', cause: 'Token not provided' });

  if (payload.role === Role.USER) {
    const user = await prisma.users.findUnique({
      where: { id: Number(payload.id), token },
      select: { role: true },
    });

    if (!user) throw new HTTPException(401, { message: 'Unauthorized', cause: 'Invalid token' });

    if (user.role >= authorization) return;

    throw new HTTPException(403, { message: 'Permission denied', cause: 'Invalid permissions' });
  }

  if (payload.role >= Role.STAFF) {
    const staff = await prisma.employees.findUnique({
      where: { id: Number(payload.id), token },
      select: { role: true },
    });

    if (!staff) throw new HTTPException(401, { message: 'Unauthorized', cause: 'Invalid token' });

    if (staff.role >= authorization) return;

    throw new HTTPException(403, { message: 'Permission denied', cause: 'Invalid permissions' });
  }
}
