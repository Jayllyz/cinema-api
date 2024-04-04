import {OpenAPIHono} from '@hono/zod-openapi';
import {prisma} from '../lib/database';
import {
  getSuperTickets,
  getSuperTicketById,
  insertSuperTicket,
  buySuperTicket,
  updateSuperTicket,
  deleteSuperTicket,
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
