import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database';
import {
  getTickets,
  getTicketById,
  insertTicket,
  buyTicket,
  updateTicket,
  useTicket,
  deleteTicket,
} from '../routes/tickets';
import {checkToken, PayloadValidator} from '../lib/token';
import {zodErrorHook} from '../lib/zodError';
import {Role} from '../lib/token';

export const tickets = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

const ticketSelectOptions = {
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
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        room: true,
      },
    },
  },
};

// GET
tickets.openapi(getTickets, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.ADMIN, token);

    const {used, price_higher, price_lesser, user_id, screening_id, category, room} =
      c.req.valid('query');

    const tickets = await prisma.tickets.findMany({
      where: {
        used: used,
        price: {gte: price_lesser, lte: price_higher},
        user_id: user_id,
        screening_id: screening_id,
        screening: {
          movie: {
            category: {
              name: category,
            },
          },
          room: {
            name: room,
          },
        },
      },
      ...ticketSelectOptions,
    });

    return c.json(tickets, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

tickets.openapi(getTicketById, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.ADMIN, token);

    const {id} = c.req.valid('param');

    const ticket = await prisma.tickets.findUnique({
      where: {
        id: id,
      },
      ...ticketSelectOptions,
    });

    if (!ticket) {
      return c.json({error: 'Ticket not found'}, 404);
    }

    return c.json(ticket, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

// POST
tickets.openapi(insertTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.ADMIN, token);

    const {price, user_id, screening_id} = c.req.valid('json');

    const capacity = await prisma.screenings.findUnique({
      where: {
        id: screening_id,
      },
      select: {
        room: {
          select: {
            capacity: true,
          },
        },
        tickets: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!capacity) {
      return c.json({error: 'Screening not found'}, 404);
    }

    if (capacity.tickets.length >= capacity.room.capacity) {
      return c.json({error: 'The session is complete'}, 400);
    }

    const ticket = await prisma.tickets.create({
      data: {
        price,
        user_id,
        screening_id,
      },
      ...ticketSelectOptions,
    });

    return c.json(ticket, 201);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

tickets.openapi(buyTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.ADMIN, token);

    const {id} = c.req.valid('param');

    const ticket = await prisma.tickets.findUnique({
      where: {
        id,
      },
      ...ticketSelectOptions,
    });

    if (!ticket) {
      return c.json({error: 'Ticket not found'}, 404);
    }

    if (ticket.user) {
      return c.json({error: 'Ticket already purchased'}, 400);
    }

    const user = await prisma.users.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        money: true,
      },
    });

    if (!user) {
      return c.json({error: 'User not found'}, 404);
    }

    if (user.money < ticket.price) {
      return c.json({error: 'Insufficient funds'}, 400);
    }

    await prisma.users.update({
      where: {
        id: payload.id,
      },
      data: {
        money: {
          decrement: ticket.price,
        },
      },
    });

    const updatedTicket = await prisma.tickets.update({
      where: {
        id,
      },
      data: {
        user_id: payload.id,
      },
      ...ticketSelectOptions,
    });

    return c.json(updatedTicket, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

// PATCH
tickets.openapi(updateTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.ADMIN, token);

    const {id} = c.req.valid('param');
    const {used, price, user_id, screening_id} = c.req.valid('json');

    const ticket = await prisma.tickets.findUnique({
      where: {
        id,
      },
      ...ticketSelectOptions,
    });

    if (!ticket) {
      return c.json({error: 'Ticket not found'}, 404);
    }

    const updatedTicket = await prisma.tickets.update({
      where: {
        id,
      },
      data: {
        used,
        price,
        user_id,
        screening_id,
      },
      ...ticketSelectOptions,
    });

    return c.json(updatedTicket, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

tickets.openapi(useTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.ADMIN, token);

    const {id} = c.req.valid('param');

    const ticket = await prisma.tickets.findUnique({
      where: {
        id,
      },
      ...ticketSelectOptions,
    });

    if (!ticket) {
      return c.json({error: 'Ticket not found'}, 404);
    }

    if (!ticket.user || ticket.user.id !== payload.id) {
      return c.json({error: 'Ticket does not belong to the user'}, 400);
    }

    if (ticket.used) {
      return c.json({error: 'Ticket already used'}, 400);
    }

    const updatedTicket = await prisma.tickets.update({
      where: {
        id,
      },
      data: {
        used: true,
      },
      ...ticketSelectOptions,
    });

    return c.json(updatedTicket, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

// DELETE
tickets.openapi(deleteTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.ADMIN, token);

    const {id} = c.req.valid('param');

    const ticket = await prisma.tickets.findUnique({
      where: {
        id,
      },
      ...ticketSelectOptions,
    });

    if (!ticket) {
      return c.json({error: 'Ticket not found'}, 404);
    }

    await prisma.tickets.delete({
      where: {
        id,
      },
    });

    return c.json({message: 'Ticket deleted'}, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
