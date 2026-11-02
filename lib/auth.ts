import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
const clave = () => {
  const valor = process.env.SESSION_SECRET;
  if (!valor || valor.length < 32) throw new Error('Configura SESSION_SECRET.');
  return new TextEncoder().encode(valor);
};
export const crearSesion = async (id: string) => {
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(id).setIssuedAt().setExpirationTime('8h').sign(clave());
  (await cookies()).set('biblioteca_sesion', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 28800 });
};
export const obtenerUsuario = async () => {
  const token = (await cookies()).get('biblioteca_sesion')?.value;
  if (!token) return null;
  let id: string | undefined;
  try { id = (await jwtVerify(token, clave(), { algorithms: ['HS256'] })).payload.sub; } catch { return null; }
  if (!id) return null;
  // Leer el rol de la base de datos evita conservar permisos antiguos.
  return prisma.usuarios.findFirst({ where: { id, activo: true }, select: { id: true, nombre: true, apellido: true, correo: true, foto: true, rol: true } });
};
export const requerirUsuario = async () => { const usuario = await obtenerUsuario(); if (!usuario) redirect('/login'); return usuario; };
