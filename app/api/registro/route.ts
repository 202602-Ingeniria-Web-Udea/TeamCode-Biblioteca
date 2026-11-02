import { hash } from "bcryptjs";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { datosRegistro } from "@/lib/validaciones/registro";
import { responderError } from "@/lib/respuestas";

export const POST = async (request: Request) => {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  try {
    const datos = datosRegistro.safeParse(await request.json());
    if (!datos.success) {
      const confirmacion = datos.error.issues.some(
        (error) => error.path[0] === "confirmacion",
      );
      return Response.json(
        {
          error: confirmacion
            ? "Las contraseñas no coinciden."
            : "Revisa tus datos. Usa un correo válido y una contraseña de 8 a 72 caracteres (máximo 72 bytes).",
        },
        { status: 400 },
      );
    }
    await prisma.usuarios.create({
      data: {
        nombre: datos.data.nombre,
        apellido: datos.data.apellido,
        correo: datos.data.correo,
        contrasenaHash: await hash(datos.data.contrasena, 12),
        rol: "USER",
      },
      select: { id: true },
    });
    return Response.json(
      { mensaje: "Tu cuenta fue creada. Ya puedes iniciar sesión." },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return Response.json(
        {
          error: "Ya existe una cuenta con este correo. Puedes iniciar sesión.",
        },
        { status: 409 },
      );
    return responderError(error);
  }
};
