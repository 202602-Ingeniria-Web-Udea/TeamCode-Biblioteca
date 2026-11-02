import { z } from 'zod';
export const datosLogin = z.object({ correo: z.string().trim().toLowerCase().email(), contrasena: z.string().min(1).max(128) });
