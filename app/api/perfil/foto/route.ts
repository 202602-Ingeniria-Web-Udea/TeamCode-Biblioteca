import { obtenerUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prepararFoto } from "@/lib/foto";
import { responderError } from "@/lib/respuestas";

export const POST = async (request: Request) => {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  try {
    const usuario = await obtenerUsuario();
    if (!usuario)
      return Response.json({ error: "Inicia sesión." }, { status: 401 });
    if (Number(request.headers.get("content-length")) > 2 * 1024 * 1024 + 16384)
      return Response.json(
        { error: "La foto debe pesar máximo 2 MB." },
        { status: 413 },
      );
    const datos = await request.formData();
    const archivo = datos.get("foto");
    if (!(archivo instanceof File))
      return Response.json({ error: "Selecciona una foto." }, { status: 400 });
    const foto = await prepararFoto(archivo);
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { foto },
      select: { id: true },
    });
    return Response.json({ mensaje: "Tu foto fue actualizada." });
  } catch (error) {
    if (error instanceof Error && error.message === "FOTO_INVALIDA")
      return Response.json(
        {
          error:
            "Selecciona una imagen JPG, PNG o WebP válida de máximo 2 MB y 16 megapíxeles.",
        },
        { status: 400 },
      );
    return responderError(error);
  }
};

export const DELETE = async (request: Request) => {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  try {
    const usuario = await obtenerUsuario();
    if (!usuario)
      return Response.json({ error: "Inicia sesión." }, { status: 401 });
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { foto: null },
      select: { id: true },
    });
    return Response.json({ mensaje: "Tu foto fue eliminada." });
  } catch (error) {
    return responderError(error);
  }
};
