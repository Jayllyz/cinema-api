import { createRoute, z } from '@hono/zod-openapi';
import authMiddleware from '../middlewares/token.js';
import {
  badRequestSchema,
  idParamValidator,
  notFoundSchema,
  queryAllSchema,
  serverErrorSchema,
} from '../validators/general.js';
import { RoomValidator, insertRoomValidator, listRoomsValidator, updateRoomValidator } from '../validators/rooms.js';

export const getRooms = createRoute({
  method: 'get',
  path: '/rooms',
  summary: 'Get all rooms',
  description: 'Get all rooms',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    query: queryAllSchema,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listRoomsValidator,
        },
      },
    },
    500: serverErrorSchema,
  },
  tags: ['rooms'],
});

export const getRoomById = createRoute({
  method: 'get',
  path: '/rooms/{id}',
  summary: 'Get a room by id',
  description: 'Get a room by id',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: RoomValidator,
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['rooms'],
});

export const insertRoom = createRoute({
  method: 'post',
  path: '/rooms',
  summary: 'Insert a room',
  description: 'Insert a room',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertRoomValidator,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Room created',
      content: {
        'application/json': {
          schema: insertRoomValidator,
        },
      },
    },
    400: badRequestSchema,
    500: serverErrorSchema,
  },
  tags: ['rooms'],
});

export const deleteRoom = createRoute({
  method: 'delete',
  path: '/rooms/{id}',
  summary: 'Delete a room',
  description: 'Delete a room',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
  },
  responses: {
    200: {
      description: 'Room deleted',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['rooms'],
});

export const updateRoom = createRoute({
  method: 'patch',
  path: '/rooms/{id}',
  summary: 'Update a room',
  description: 'Update a room',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idParamValidator,
    body: {
      content: {
        'application/json': {
          schema: updateRoomValidator,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Room updated',
      content: {
        'application/json': {
          schema: updateRoomValidator,
        },
      },
    },
    400: badRequestSchema,
    404: notFoundSchema,
    500: serverErrorSchema,
  },
  tags: ['rooms'],
});
