import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database';
import {getTickets} from '../routes/tickets';
import {zodErrorHook} from '../lib/zodError';

export const tickets = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

tickets.openapi(getTickets, async (c) => {
  try {
    const tickets = await prisma.tickets.findMany({
      select: {
        id: true,
        used: true,
        price: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        screening: {
          select: {
            id: true,
            start_time: true,
            end_time: true,
            screening_duration_minutes: true,
            movie: {
              select: {
                id: true,
                title: true,
                description: true,
                author: true,
                release_date: true,
                duration: true,
                status: true,
                category: true,
              },
            },
            room: true,
          },
        },
      },
    });

    return c.json(tickets, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
