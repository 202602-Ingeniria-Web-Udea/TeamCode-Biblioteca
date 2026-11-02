import { z } from "zod";
export const editarLibro = z
  .object({
    titulo: z.string().trim().min(1).max(180),
    autor: z.string().trim().min(1).max(150),
    categoria: z.string().trim().min(1).max(80),
    isbn: z.string().trim().max(30).optional(),
  })
  .strict();
export const crearUsuario = z
  .object({
    nombre: z.string().trim().min(1).max(80),
    apellido: z.string().trim().min(1).max(80),
    correo: z.string().trim().toLowerCase().email().max(254),
    contrasena: z
      .string()
      .min(8)
      .max(72)
      .refine((valor) => Buffer.byteLength(valor, "utf8") <= 72),
    rol: z.enum(["ADMIN", "USER"]),
  })
  .strict();
export const cambiarRol = z.object({ rol: z.enum(["ADMIN", "USER"]) }).strict();
export const identificador = z.uuid();
