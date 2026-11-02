import { obtenerUsuario } from "@/lib/auth";
import { procesarReserva } from "@/lib/circulacion";
import { identificador } from "@/lib/validaciones/administracion";
import { datosAccionReserva } from "@/lib/validaciones/circulacion";
import { responderError } from "@/lib/respuestas";
export const PATCH = async (
  request: Request,
  contexto: { params: Promise<{ id: string }> },
) => {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  try {
    const usuario = await obtenerUsuario();
    if (!usuario)
      return Response.json(
        { error: "Inicia sesión nuevamente." },
        { status: 401 },
      );
    const { id } = await contexto.params;
    const datos = datosAccionReserva.safeParse(await request.json());
    if (!identificador.safeParse(id).success || !datos.success)
      return Response.json(
        { error: "Revisa la reserva y la fecha límite." },
        { status: 400 },
      );
    await procesarReserva(
      id,
      datos.data.accion,
      datos.data.accion === "ATENDER" ? datos.data.fechaLimite : undefined,
      usuario,
    );
    return Response.json({
      mensaje:
        datos.data.accion === "ATENDER"
          ? "Reserva atendida y préstamo creado."
          : "Reserva cancelada.",
    });
  } catch (error) {
    return responderError(error);
  }
};
