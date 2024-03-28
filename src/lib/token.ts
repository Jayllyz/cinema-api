import {StatusCode} from 'hono/utils/http-status';

export interface payloadValidator {
  id: number;
  role: string;
  expiration: number;
}

export function checkToken(
  payload: payloadValidator,
  authorization: string[]
): {error: {error: string}; status: StatusCode} | null {
  if (!payload) {
    return {error: {error: 'Unauthorized'}, status: 401};
  }
  if (payload.expiration < Math.floor(Date.now() / 1000)) {
    return {error: {error: 'Token expired'}, status: 401};
  }
  if (!authorization.includes(payload.role)) {
    return {error: {error: 'Permission denied'}, status: 403};
  }

  return null;
}
