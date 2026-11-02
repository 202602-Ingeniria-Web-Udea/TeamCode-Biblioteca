import { z } from "zod";
export const datosReserva = z
  .object({
    libroId: z.uuid(),
    lectorId: z.uuid().optional(),
    cantidad: z.number().int().min(1).max(1000000),
  })
  .strict();
export const datosPrestamo = datosReserva.extend({ fechaLimite: z.iso.date() });
export const datosAccionReserva = z.discriminatedUnion("accion", [
  z.object({ accion: z.literal("CANCELAR") }).strict(),
  z
    .object({ accion: z.literal("ATENDER"), fechaLimite: z.iso.date() })
    .strict(),
]);
