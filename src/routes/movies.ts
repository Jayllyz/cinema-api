import { createRoute, z } from '@hono/zod-openapi';
import {
  MovieValidator,
  insertMovieValidator,
  listMoviesValidator,
  updateMovieValidator,
} from '../validators/movies.js';
import { idValidator } from '../validators/rooms.js';
import authMiddleware from '../middlewares/token.js';

export const getMovies = createRoute({
  method: 'get',
  path: '/movies',
  summary: 'Get all movies',
  description: 'Get all movies',
  middleware: authMiddleware,
  security:  [{ Bearer: [] }],
  request: {
    query: z.object({
      title: z.string().optional(),
      author: z.string().optional(),
      lt: z.date().optional(),
      gt: z.date().optional(),
      status: z.string().optional(),
      category_id: z.number().positive().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: listMoviesValidator,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['movies'],
});

export const getMovieById = createRoute({
  method: 'get',
  path: '/movies/{id}',
  summary: 'Get a movie by id',
  description: 'Get a movie by id',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idValidator,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: MovieValidator,
        },
      },
    },
    404: {
      description: 'Movie not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['movies'],
});

export const insertMovie = createRoute({
  method: 'post',
  path: '/movies',
  summary: 'Insert a movie',
  description: 'Insert a movie',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertMovieValidator,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: MovieValidator,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['movies'],
});

export const updateMovie = createRoute({
  method: 'patch',
  path: '/movies/{id}',
  summary: 'Update a movie',
  description: 'Update a movie',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idValidator,
    body: {
      content: {
        'application/json': {
          schema: updateMovieValidator,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: MovieValidator,
        },
      },
    },
    404: {
      description: 'Movie not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['movies'],
});

export const deleteMovie = createRoute({
  method: 'delete',
  path: '/movies/{id}',
  summary: 'Delete a movie',
  description: 'Delete a movie',
  middleware: authMiddleware,
  security: [{ Bearer: [] }],
  request: {
    params: idValidator,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: 'Movie not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
  tags: ['movies'],
});
