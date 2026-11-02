import { obtenerUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cambiarRol, identificador } from "@/lib/validaciones/administracion";
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
        { error: "Solo un administrador puede cambiar roles." },
        { status: 403 },
      );
    const { id } = await contexto.params;
    const datos = cambiarRol.safeParse(await request.json());
    if (!identificador.safeParse(id).success || !datos.success)
      return Response.json(
        { error: "Usuario o rol no válido." },
        { status: 400 },
      );
    await prisma.$transaction(
      async (tx) => {
        const responsable = await tx.usuarios.findUniqueOrThrow({
          where: { id: usuario.id },
        });
        if (responsable.rol !== "ADMIN" || !responsable.activo)
          throw new Error("SIN_PERMISO");
        const actual = await tx.usuarios.findUniqueOrThrow({ where: { id } });
        if (actual.rol === datos.data.rol) return;
        if (id === usuario.id) throw new Error("PROPIO_ROL");
        if (
          actual.activo &&
          actual.rol === "ADMIN" &&
          datos.data.rol === "USER" &&
          (await tx.usuarios.count({
            where: { rol: "ADMIN", activo: true },
          })) <= 1
        )
          throw new Error("ULTIMO_ADMIN");
        await tx.usuarios.update({
          where: { id },
          data: { rol: datos.data.rol },
        });
      },
      { isolationLevel: "Serializable" },
    );
    return Response.json({ mensaje: "Rol actualizado correctamente." });
  } catch (error) {
    return responderError(error);
  }
};
