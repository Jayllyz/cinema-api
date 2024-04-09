import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database';
import {
  getSuperTickets,
  getSuperTicketById,
  insertSuperTicket,
  buySuperTicket,
  bookSeatSuperTicket,
  updateSuperTicket,
  useSuperTicket,
  deleteSuperTicket,
  cancelBookingSuperTicket,
} from '../routes/super_tickets';
import {checkToken, PayloadValidator, Role} from '../lib/token';
import {zodErrorHook} from '../lib/zodError';

export const superTickets = new OpenAPIHono({
  defaultHook: zodErrorHook,
});

const superTicketSelectOptions = {
  select: {
    id: true,
    price: true,
    uses: true,
    user: {
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    },
  },
};

// GET
superTickets.openapi(getSuperTickets, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.USER, token);

    const superTickets = await prisma.superTickets.findMany(superTicketSelectOptions);
    return c.json(superTickets);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

superTickets.openapi(getSuperTicketById, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.USER, token);

    const {id} = c.req.valid('param');

    const superTicket = await prisma.superTickets.findUnique({
      where: {
        id: id,
      },
      ...superTicketSelectOptions,
    });

    if (!superTicket) {
      return c.json({error: 'Super ticket not found'}, 404);
    }

    return c.json(superTicket);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

// POST
superTickets.openapi(insertSuperTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.ADMIN, token);

    const {price, uses} = c.req.valid('json');

    const superTicket = await prisma.superTickets.create({
      data: {
        price: price,
        uses: uses,
      },
      ...superTicketSelectOptions,
    });

    return c.json(superTicket, 201);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

superTickets.openapi(buySuperTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.USER, token);

    const {id} = c.req.valid('param');

    const superTicket = await prisma.superTickets.findUnique({
      where: {
        id,
      },
      ...superTicketSelectOptions,
    });

    if (!superTicket) {
      return c.json({error: 'Super ticket not found'}, 404);
    }

    if (superTicket.user) {
      return c.json({error: 'Super ticket already bought'}, 400);
    }

    const updatedSuperTicket = await prisma.superTickets.update({
      where: {
        id,
      },
      data: {
        user_id: payload.id,
      },
      ...superTicketSelectOptions,
    });

    return c.json(updatedSuperTicket, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

// PATCH
superTickets.openapi(updateSuperTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.ADMIN, token);

    const {id} = c.req.valid('param');
    const {uses, price, user_id} = c.req.valid('json');

    const superTicket = await prisma.superTickets.findUnique({
      where: {
        id,
      },
      ...superTicketSelectOptions,
    });

    if (!superTicket) {
      return c.json({error: 'Super ticket not found'}, 404);
    }

    const updatedSuperTicket = await prisma.superTickets.update({
      where: {
        id,
      },
      data: {
        uses,
        price,
        user_id,
      },
      ...superTicketSelectOptions,
    });

    return c.json(updatedSuperTicket, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

superTickets.openapi(bookSeatSuperTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.USER, token);

    const {id} = c.req.valid('param');
    const {seat, screening_id} = c.req.valid('json');

    const superTicket = await prisma.superTickets.findUnique({
      where: {
        id: id,
      },
      ...superTicketSelectOptions,
    });

    if (!superTicket) {
      return c.json({error: 'Super ticket not found'}, 404);
    }

    if (!superTicket.user || superTicket.user.id !== payload.id) {
      return c.json({error: 'Super ticket does not belong to the user'}, 400);
    }

    if (superTicket.uses <= 0) {
      return c.json({error: 'Super ticket has no uses left'}, 400);
    }

    const screening = await prisma.screenings.findUnique({
      where: {
        id: screening_id,
      },
    });

    if (!screening) {
      return c.json({error: 'Screening not found'}, 404);
    }

    const takenSeat = await prisma.tickets.findUnique({
      where: {
        seat,
        screening_id,
        user_id: null,
      },
    });

    if (!takenSeat) {
      return c.json({error: "Seat already taken or doesn't exist"}, 400);
    }

    await prisma.superTicketsSessions.create({
      data: {
        seat,
        original_price: takenSeat.price,
        screening_id,
        super_ticket_id: id,
      },
    });

    await prisma.tickets.delete({
      where: {
        seat,
        screening_id,
      },
    });

    const updatedSuperTicket = await prisma.superTickets.update({
      where: {
        id,
      },
      data: {
        uses: {
          decrement: 1,
        },
      },
      select: {
        uses: true,
      },
    });

    return c.json(updatedSuperTicket, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

superTickets.openapi(useSuperTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.USER, token);

    const {id} = c.req.valid('param');
    const {seat, screening_id} = c.req.valid('json');

    const superTicket = await prisma.superTickets.findUnique({
      where: {
        id: id,
      },
      ...superTicketSelectOptions,
    });

    if (!superTicket) {
      return c.json({error: 'Super ticket not found'}, 404);
    }

    if (!superTicket.user || superTicket.user.id !== payload.id) {
      return c.json({error: 'Super ticket does not belong to the user'}, 400);
    }

    const superTicketSession = await prisma.superTicketsSessions.findUnique({
      where: {
        seat,
        super_ticket_id_screening_id: {
          super_ticket_id: id,
          screening_id,
        },
      },
    });

    if (!superTicketSession) {
      return c.json(
        {
          error:
            "Super ticket screening was not found or the seat wasn't booked by this super ticket",
        },
        404
      );
    }

    if (superTicketSession.used) {
      return c.json({error: 'The ticket has already been used on this screening'}, 400);
    }

    await prisma.superTicketsSessions.update({
      where: {
        seat,
        super_ticket_id_screening_id: {
          super_ticket_id: id,
          screening_id,
        },
      },
      data: {
        used: true,
      },
    });

    return c.json({message: 'Super ticket used'}, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

// DELETE
superTickets.openapi(deleteSuperTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.ADMIN, token);

    const {id} = c.req.valid('param');

    const superTicket = await prisma.superTickets.findUnique({
      where: {
        id,
      },
      ...superTicketSelectOptions,
    });

    if (!superTicket) {
      return c.json({error: 'Super ticket not found'}, 404);
    }

    await prisma.superTicketsSessions.deleteMany({
      where: {
        super_ticket_id: id,
      },
    });

    await prisma.superTickets.delete({
      where: {
        id,
      },
    });

    return c.json({message: 'Super ticket deleted'}, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});

superTickets.openapi(cancelBookingSuperTicket, async (c) => {
  try {
    const token = c.req.header('authorization')?.split(' ')[1];
    const payload: PayloadValidator = c.get('jwtPayload');
    await checkToken(payload, Role.USER, token);

    const {id} = c.req.valid('param');
    const {seat, screening_id} = c.req.valid('json');

    const superTicket = await prisma.superTickets.findUnique({
      where: {
        id: id,
      },
      ...superTicketSelectOptions,
    });

    if (!superTicket) {
      return c.json({error: 'Super ticket not found'}, 404);
    }

    if (!superTicket.user || superTicket.user.id !== payload.id) {
      return c.json({error: 'Super ticket does not belong to the user'}, 400);
    }

    const superTicketSession = await prisma.superTicketsSessions.findUnique({
      where: {
        seat,
        super_ticket_id_screening_id: {
          super_ticket_id: id,
          screening_id,
        },
      },
    });

    if (!superTicketSession) {
      return c.json(
        {
          error:
            "Super ticket screening was not found or the seat wasn't booked by this super ticket",
        },
        404
      );
    }

    if (superTicketSession.used) {
      return c.json({error: 'The ticket has already been used on this screening'}, 400);
    }

    await prisma.superTicketsSessions.delete({
      where: {
        seat,
        super_ticket_id_screening_id: {
          super_ticket_id: id,
          screening_id,
        },
      },
    });

    await prisma.tickets.create({
      data: {
        seat,
        user_id: null,
        price: superTicketSession.original_price,
        screening_id,
      },
    });

    const updatedSuperTicket = await prisma.superTickets.update({
      where: {
        id: superTicket.id,
      },
      data: {
        uses: {
          increment: 1,
        },
      },
      select: {
        uses: true,
      },
    });

    return c.json(updatedSuperTicket, 200);
  } catch (error) {
    console.error(error);
    return c.json({error: error}, 500);
  }
});
