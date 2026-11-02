import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL }) });
const iniciar = async () => {
  const cuentas = [
    { nombre: 'Admin', apellido: 'Biblioteca', correo: 'admin@biblioteca.com', rol: 'ADMIN' as const, clave: 'Biblioteca2026!' },
    { nombre: 'Lector', apellido: 'Biblioteca', correo: 'usuario@biblioteca.com', rol: 'USER' as const, clave: 'Lectura2026!' },
  ];
  for (const cuenta of cuentas) {
    await prisma.usuarios.upsert({ where: { correo: cuenta.correo }, update: {}, create: { nombre: cuenta.nombre, apellido: cuenta.apellido, correo: cuenta.correo, rol: cuenta.rol, contrasenaHash: await hash(cuenta.clave, 12) } });
  }
  console.log('Cuentas de demostración creadas; las existentes se conservaron.');
};
 iniciar().catch(() => { console.error('No se pudo completar la carga inicial. Revisa la conexión.'); process.exitCode = 1; }).finally(() => prisma.$disconnect());
