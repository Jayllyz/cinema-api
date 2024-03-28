import {PrismaClient, Screenings} from '@prisma/client';

const prisma = new PrismaClient();

export {prisma};

export async function getOverlapingScreenings(
  room_id: number,
  start_time: Date,
  end_time: Date
): Promise<any | undefined> {
  await prisma.screenings.findFirst({
    where: {
      room_id: room_id,
      OR: [
        {
          AND: [{start_time: {gte: start_time}}, {end_time: {lte: end_time}}],
        },
        {
          AND: [{start_time: {lte: start_time}}, {end_time: {gt: start_time}}],
        },
        {
          AND: [{start_time: {lt: end_time}}, {end_time: {gte: end_time}}],
        },
      ],
    },
  });
}
