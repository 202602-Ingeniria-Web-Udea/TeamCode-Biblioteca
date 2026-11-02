import { Prisma } from "@/app/generated/prisma/client";
export const responderError = (error: unknown) => {
  if (error instanceof SyntaxError)
    return Response.json(
      { error: "Los datos no son válidos." },
      { status: 400 },
    );
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002")
      return Response.json(
        { error: "Ya existe un registro con ese correo o ISBN." },
        { status: 409 },
      );
    if (error.code === "P2025")
      return Response.json(
        { error: "No se encontró el registro." },
        { status: 404 },
      );
    if (error.code === "P2034")
      return Response.json(
        {
          error:
            "Otra operación modificó estos datos. Actualiza e intenta nuevamente.",
        },
        { status: 409 },
      );
  }
  const mensajes: Record<string, string> = {
    FECHA_INVALIDA: "La fecha límite debe ser hoy o una fecha posterior.",
    LIBRO_OCUPADO:
      "No puedes desactivar un libro con préstamos activos o reservas pendientes.",
    PROPIO_ROL:
      "No puedes cambiar tu propio rol. Pídele el cambio a otro administrador.",
    ULTIMO_ADMIN: "Debe quedar al menos un administrador activo.",
    SIN_PERMISO: "Tu cuenta ya no tiene permisos para esta operación.",
    NO_DISPONIBLE: "El libro no está activo o no tiene suficientes ejemplares.",
    YA_PROCESADO:
      "Este registro ya fue atendido o cancelado. Actualiza la página.",
    LECTOR_INACTIVO: "El lector no existe o su cuenta está desactivada.",
  };
  if (error instanceof Error && mensajes[error.message])
    return Response.json(
      { error: mensajes[error.message] },
      { status: error.message === "SIN_PERMISO" ? 403 : 409 },
    );
  return Response.json(
    { error: "No se pudo completar la operación. Intenta nuevamente." },
    { status: 500 },
  );
};
