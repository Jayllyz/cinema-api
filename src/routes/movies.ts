import {createRoute, z} from '@hono/zod-openapi';
import {
  insertMovieValidator,
  updateMovieValidator,
  listMoviesValidator,
} from '../validators/movies.js';
import {idValidator} from '../validators/rooms.js';

export const getMovies = createRoute({
  method: 'get',
  path: '/movies',
  summary: 'Get all movies',
  description: 'Get all movies',
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
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['movies'],
});

export const getMovieById = createRoute({
  method: 'get',
  path: '/movies/:id',
  summary: 'Get a movie by id',
  description: 'Get a movie by id',
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
            title: z.string(),
            description: z.string(),
            duration: z.number(),
            status: z.string(),
            category_id: z.number(),
          }),
        },
      },
    },
    404: {
      description: 'Movie not found',
      content: {
        'application/json': {
          schema: z.object({error: z.string()}),
        },
      },
    },
  },
  tags: ['movies'],
});

export const getMoviesByCategory = createRoute({
  method: 'get',
  path: '/movies/category/:id',
  summary: 'Get movies by category',
  description: 'Get movies by category',
  request: {
    params: idValidator,
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
    404: {
      description: 'Category not found',
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
  tags: ['movies'],
});

export const insertMovie = createRoute({
  method: 'post',
  path: '/movies',
  summary: 'Insert a movie',
  description: 'Insert a movie',
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
          schema: z.object({
            id: z.number(),
            title: z.string(),
            description: z.string(),
            duration: z.number(),
            status: z.string(),
            category_id: z.number(),
          }),
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
  tags: ['movies'],
});

export const updateMovie = createRoute({
  method: 'patch',
  path: '/movies/:id',
  summary: 'Update a movie',
  description: 'Update a movie',
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
          schema: z.object({
            id: z.number(),
            title: z.string(),
            description: z.string(),
            duration: z.number(),
            status: z.string(),
            category_id: z.number(),
          }),
        },
      },
    },
    404: {
      description: 'Movie not found',
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
  tags: ['movies'],
});

export const deleteMovie = createRoute({
  method: 'delete',
  path: '/movies/:id',
  summary: 'Delete a movie',
  description: 'Delete a movie',
  request: {
    params: idValidator,
  },
  responses: {
    204: {
      description: 'Successful response',
    },
    404: {
      description: 'Movie not found',
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
  tags: ['movies'],
});
