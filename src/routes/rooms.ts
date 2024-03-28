import {createRoute, z} from '@hono/zod-openapi';
import {
  insertRoomValidator,
  updateRoomValidator,
  idValidator,
  listRoomsValidator,
} from '../validators/rooms.js';

export const getRooms = createRoute({
  method: 'get',
  path: '/rooms',
  summary: 'Get all rooms',
  description: 'Get all rooms',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listRoomsValidator,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['rooms'],
});

export const getRoomById = createRoute({
  method: 'get',
  path: '/rooms/{id}',
  summary: 'Get a room by id',
  description: 'Get a room by id',
  request: {
    params: idValidator,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number(),
            number: z.number(),
            capacity: z.number(),
            type: z.string(),
            status: z.string(),
          }),
        },
      },
    },
    404: {
      description: 'Room not found',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['rooms'],
});

export const insertRoom = createRoute({
  method: 'post',
  path: '/rooms',
  summary: 'Insert a room',
  description: 'Insert a room',
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
    400: {
      description: 'Invalid body',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['rooms'],
});

export const deleteRoom = createRoute({
  method: 'delete',
  path: '/rooms/{id}',
  summary: 'Delete a room',
  description: 'Delete a room',
  request: {
    params: idValidator,
  },
  responses: {
    200: {
      description: 'Room deleted',
      content: {
        'application/json': {
          schema: z.object({message: z.string()}),
        },
      },
    },
    404: {
      description: 'Room not found',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['rooms'],
});

export const updateRoom = createRoute({
  method: 'patch',
  path: '/rooms/{id}',
  summary: 'Update a room',
  description: 'Update a room',
  request: {
    params: idValidator,
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
    400: {
      description: 'Invalid body',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['rooms'],
});
