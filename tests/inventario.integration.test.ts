import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../lib/prisma';
import { crearLibro, registrarMovimiento } from '../lib/inventario';
test('inventario atomico, historial inicial y salidas concurrentes', { skip: process.env.RUN_DATABASE_TESTS !== '1' }, async () => {
 let libroId: string | undefined;
 try {
  const admin = await prisma.usuarios.findUniqueOrThrow({ where: { correo: 'admin@biblioteca.com' } });
  const libro = await crearLibro({ titulo: 'Prueba temporal ' + crypto.randomUUID(), autor: 'Verificacion', categoria: 'Prueba', existencias: 5 }, admin.id); libroId = libro.id;
  const inicial = await prisma.movimientos.findMany({ where: { libroId } });
  assert.equal(inicial.length, 1); assert.equal(inicial[0].motivo, 'INICIAL'); assert.equal(inicial[0].cantidad, 5); assert.equal(inicial[0].responsableId, admin.id);
  const resultados = await Promise.allSettled([registrarMovimiento({ libroId, tipo: 'SALIDA', cantidad: 4 }, admin.id), registrarMovimiento({ libroId, tipo: 'SALIDA', cantidad: 4 }, admin.id)]);
  assert.equal(resultados.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal((await prisma.libros.findUniqueOrThrow({ where: { id: libroId } })).existencias, 1);
  assert.equal(await prisma.movimientos.count({ where: { libroId } }), 2);
  await registrarMovimiento({ libroId, tipo: 'ENTRADA', cantidad: 2 }, admin.id);
  assert.equal((await prisma.libros.findUniqueOrThrow({ where: { id: libroId } })).existencias, 3);
  await assert.rejects(registrarMovimiento({ libroId, tipo: 'SALIDA', cantidad: 99 }, admin.id));
  assert.equal(await prisma.movimientos.count({ where: { libroId } }), 3);
 } finally {
  if (libroId) await prisma.$transaction([prisma.movimientos.deleteMany({ where: { libroId } }), prisma.libros.delete({ where: { id: libroId } })]);
  await prisma.$disconnect();
 }
});
