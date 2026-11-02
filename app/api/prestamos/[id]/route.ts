import { obtenerUsuario } from "@/lib/auth";
import { devolverPrestamo } from "@/lib/circulacion";
import { identificador } from "@/lib/validaciones/administracion";
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
    if (!identificador.safeParse(id).success)
      return Response.json({ error: "Préstamo no válido." }, { status: 400 });
    await devolverPrestamo(id, usuario);
    return Response.json({
      mensaje: "Devolución registrada. Los ejemplares volvieron al inventario.",
    });
  } catch (error) {
    return responderError(error);
  }
};
