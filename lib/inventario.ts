import { prisma } from '@/lib/prisma';
import { datosLibro, datosMovimiento } from '@/lib/validaciones/inventario';
import { z } from 'zod';

export const crearLibro = async (datos: z.infer<typeof datosLibro>, responsableId: string) => prisma.$transaction(async tx => {
  const libro = await tx.libros.create({ data: { titulo: datos.titulo, autor: datos.autor, categoria: datos.categoria, isbn: datos.isbn || null, existencias: datos.existencias, creadoPorId: responsableId } });
  if (datos.existencias > 0) await tx.movimientos.create({ data: { libroId: libro.id, responsableId, tipo: 'ENTRADA', motivo: 'INICIAL', cantidad: datos.existencias, fechaCreacion: libro.fechaCreacion } });
  return libro;
});

export const registrarMovimiento = async (datos: z.infer<typeof datosMovimiento>, responsableId: string) => prisma.$transaction(async tx => {
  // La actualizacion condicional bloquea la fila y vuelve a comprobar el saldo.
  // Dos salidas simultaneas no pueden consumir los mismos ejemplares.
  const resultado = await tx.libros.updateMany({
    where: { id: datos.libroId, activo: true, existencias: datos.tipo === 'SALIDA' ? { gte: datos.cantidad } : { lte: 2147483647 - datos.cantidad } },
    data: { existencias: { increment: datos.tipo === 'ENTRADA' ? datos.cantidad : -datos.cantidad } },
  });
  if (!resultado.count) throw new Error('SALDO_NO_DISPONIBLE');
  return tx.movimientos.create({ data: { libroId: datos.libroId, responsableId, tipo: datos.tipo, motivo: 'AJUSTE', cantidad: datos.cantidad, observaciones: datos.observaciones || null } });
});
