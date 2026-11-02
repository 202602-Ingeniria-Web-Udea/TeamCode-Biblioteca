import { z } from 'zod';
export const datosLibro = z.object({
  titulo: z.string().trim().min(1).max(180), autor: z.string().trim().min(1).max(150),
  categoria: z.string().trim().min(1).max(80), isbn: z.string().trim().max(30).optional(),
  existencias: z.number().int().min(0).max(1000000),
});
export const datosMovimiento = z.object({
  libroId: z.uuid(), tipo: z.enum(['ENTRADA', 'SALIDA']),
  cantidad: z.number().int().min(1).max(1000000), observaciones: z.string().trim().max(500).optional(),
});
