import { prisma } from './database';

export async function refundTicketsScreening(screeningId: number): Promise<void> {
  const tickets = await prisma.tickets.findMany({
    where: {
      screening_id: screeningId,
      user_id: {
        not: null,
      },
    },
    select: {
      id: true,
      price: true,
      user_id: true,
    },
  });

  if (!tickets.length) return;

  for (const ticket of tickets) {
    if (!ticket.user_id) continue;

    await prisma.users.update({
      where: { id: ticket.user_id },
      data: {
        money: {
          increment: ticket.price,
        },
      },
    });
  }
}

export async function refundTicketsMovie(movieId: number): Promise<void> {
  const screenings = await prisma.screenings.findMany({
    where: {
      movie_id: movieId,
    },
    select: {
      id: true,
    },
  });

  for (const screening of screenings) {
    await refundTicketsScreening(screening.id);
  }
}
