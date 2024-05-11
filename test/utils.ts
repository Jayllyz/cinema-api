import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/database.js';
import { Role } from '../src/lib/token.js';

export async function createStaff(name: string, email: string, password: string, role: Role = Role.ADMIN) {
  return await prisma.employees.create({
    data: {
      first_name: name,
      last_name: name,
      email: email,
      password: await bcrypt.hash('password', 10),
      role: role,
      phone_number: '1234567890',
    },
  });
}
