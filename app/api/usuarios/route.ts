import { hash } from "bcryptjs";
import { obtenerUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { crearUsuario } from "@/lib/validaciones/administracion";
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
    if (usuario.rol !== "ADMIN")
      return Response.json(
        { error: "Solo un administrador puede crear usuarios." },
        { status: 403 },
      );
    const datos = crearUsuario.safeParse(await request.json());
    if (!datos.success)
      return Response.json(
        {
          error:
            "Completa los datos. Usa un correo válido y una contraseña de 8 a 72 caracteres (máximo 72 bytes).",
        },
        { status: 400 },
      );
    const nuevo = await prisma.usuarios.create({
      data: {
        nombre: datos.data.nombre,
        apellido: datos.data.apellido,
        correo: datos.data.correo,
        rol: datos.data.rol,
        contrasenaHash: await hash(datos.data.contrasena, 12),
      },
      select: { id: true },
    });
    return Response.json(
      { mensaje: "Usuario creado correctamente.", id: nuevo.id },
      { status: 201 },
    );
  } catch (error) {
    return responderError(error);
  }
};
