import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../lib/prisma';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const enviar = (ruta: string, datos: object, cookie = '') => fetch(base + ruta, { method: 'POST', headers: { origin: base, 'Content-Type': 'application/json', cookie }, body: JSON.stringify(datos) });
const login = async (correo: string, contrasena: string) => { const respuesta = await enviar('/api/login', { correo, contrasena }); assert.equal(respuesta.status, 200); return respuesta.headers.get('set-cookie')!.split(';')[0]; };
test('permisos HTTP, validaciones y actualizacion de libro e historial', { skip: process.env.RUN_HTTP_TESTS !== '1' }, async () => {
 let id: string | undefined;
 try {
  const admin = await login('admin@biblioteca.com', 'Biblioteca2026!');
  const user = await login('usuario@biblioteca.com', 'Lectura2026!');
  const datos = { titulo: 'Prueba HTTP ' + crypto.randomUUID(), autor: 'Verificacion', categoria: 'Prueba', existencias: 5, isbn: 'test-' + crypto.randomUUID().slice(0, 20) };
  assert.equal((await enviar('/api/libros', datos)).status, 401);
  assert.equal((await enviar('/api/libros', datos, user)).status, 403);
  assert.equal((await enviar('/api/libros', { ...datos, existencias: -1 }, admin)).status, 400);
  const creada = await enviar('/api/libros', datos, admin); assert.equal(creada.status, 201); id = (await creada.json()).id;
  assert.equal((await enviar('/api/libros', datos, admin)).status, 409);
  assert.equal((await enviar('/api/movimientos', { libroId: id, tipo: 'SALIDA', cantidad: 0 }, user)).status, 400);
  assert.equal((await enviar('/api/movimientos', { libroId: id, tipo: 'SALIDA', cantidad: 99 }, user)).status, 409);
  assert.equal((await enviar('/api/movimientos', { libroId: id, tipo: 'SALIDA', cantidad: 2 }, user)).status, 201);
  assert.equal((await enviar('/api/movimientos', { libroId: id, tipo: 'ENTRADA', cantidad: 1 }, user)).status, 201);
  assert.equal((await prisma.libros.findUniqueOrThrow({ where: { id } })).existencias, 4);
  const movimientos = await prisma.movimientos.findMany({ where: { libroId: id }, include: { responsable: true } });
  assert.equal(movimientos.length, 3);
  assert.ok(movimientos.filter(m => m.motivo === 'AJUSTE').every(m => m.responsable.correo === 'usuario@biblioteca.com'));
  const pagina = await fetch(base + '/movimientos?libro=' + id, { headers: { cookie: user } });
  const html = await pagina.text(); assert.equal(pagina.status, 200); assert.ok(html.includes('Evolución de existencias')); assert.ok(html.includes(datos.titulo));
 } finally {
  if (id) await prisma.$transaction([prisma.movimientos.deleteMany({ where: { libroId: id } }), prisma.libros.delete({ where: { id } })]);
  await prisma.$disconnect();
 }
});
