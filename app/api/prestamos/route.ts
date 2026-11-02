import { obtenerUsuario } from "@/lib/auth";
import { datosPrestamo } from "@/lib/validaciones/circulacion";
import { crearPrestamo } from "@/lib/circulacion";
import { responderError } from "@/lib/respuestas";
export const POST = async (request: Request) => {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  try {
    const usuario = await obtenerUsuario();
    if (!usuario)
      return Response.json(
        { error: "Inicia sesión nuevamente." },
        { status: 401 },
      );
    const datos = datosPrestamo.safeParse(await request.json());
    if (!datos.success)
      return Response.json(
        { error: "Revisa el libro, la cantidad y los campos del formulario." },
        { status: 400 },
      );
    const registro = await crearPrestamo(datos.data, usuario);
    return Response.json(
      { mensaje: "Préstamo registrado.", id: registro.id },
      { status: 201 },
    );
  } catch (error) {
    return responderError(error);
  }
};
