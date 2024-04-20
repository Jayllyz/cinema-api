import type { MiddlewareHandler } from 'hono';
import { jwt } from 'hono/jwt';

const authMiddleware: MiddlewareHandler = async (c, next) => {
    const jwtMiddleware = jwt({
        secret: process.env.SECRET_KEY || 'secret',
    });

    return jwtMiddleware(c, next);
};

export default authMiddleware;
