import { obtenerUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { editarLibro, identificador } from "@/lib/validaciones/administracion";
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
    if (usuario.rol !== "ADMIN")
      return Response.json(
        { error: "Solo un administrador puede editar libros." },
        { status: 403 },
      );
    const { id } = await contexto.params;
    if (!identificador.safeParse(id).success)
      return Response.json({ error: "Libro no válido." }, { status: 400 });
    const entrada = await request.json();
    if (entrada && typeof entrada === "object" && entrada.accion === "ACTIVAR") {
      await prisma.libros.update({ where: { id }, data: { activo: true } });
      return Response.json({ mensaje: "Libro reactivado." });
    }
    const datos = editarLibro.safeParse(entrada);
    if (!datos.success)
      return Response.json(
        {
          error:
            "Revisa título, autor, categoría e ISBN. Las existencias se cambian desde Movimientos.",
        },
        { status: 400 },
      );
    await prisma.libros.update({
      where: { id },
      data: {
        titulo: datos.data.titulo,
        autor: datos.data.autor,
        categoria: datos.data.categoria,
        isbn: datos.data.isbn || null,
      },
    });
    return Response.json({ mensaje: "Libro actualizado correctamente." });
  } catch (error) {
    return responderError(error);
  }
};

// La eliminacion es logica: se conserva el historial y se puede reactivar.
export const DELETE = async (
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
    if (usuario.rol !== "ADMIN")
      return Response.json(
        { error: "Solo un administrador puede desactivar libros." },
        { status: 403 },
      );
    const { id } = await contexto.params;
    if (!identificador.safeParse(id).success)
      return Response.json({ error: "Libro no válido." }, { status: 400 });
    await prisma.$transaction(
      async (tx) => {
        const libro = await tx.libros.findUniqueOrThrow({ where: { id } });
        if (!libro.activo) return;
        const pendientes = await tx.prestamos.count({
          where: { libroId: id, fechaDevolucion: null },
        });
        const reservas = await tx.reservas.count({
          where: { libroId: id, estado: "PENDIENTE" },
        });
        if (pendientes || reservas) throw new Error("LIBRO_OCUPADO");
        await tx.libros.update({ where: { id }, data: { activo: false } });
      },
      { isolationLevel: "Serializable" },
    );
    return Response.json({
      mensaje: "Libro desactivado. Su historial se conserva.",
    });
  } catch (error) {
    return responderError(error);
  }
};
