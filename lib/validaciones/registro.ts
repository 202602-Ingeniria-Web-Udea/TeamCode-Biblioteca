import { crearUsuario } from "@/lib/validaciones/administracion";
import { z } from "zod";

// No se acepta un rol enviado desde el formulario publico.
export const datosRegistro = crearUsuario
  .omit({ rol: true })
  .extend({
    confirmacion: z.string().min(1).max(72),
  })
  .strict()
  .refine((datos) => datos.contrasena === datos.confirmacion, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmacion"],
  });
