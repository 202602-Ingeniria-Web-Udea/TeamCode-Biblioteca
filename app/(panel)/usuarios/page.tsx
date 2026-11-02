import FormularioUsuario from "@/components/organisms/formulario-usuario";
import EditarRol from "@/components/organisms/editar-rol";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requerirUsuario } from "@/lib/auth";
import { formatearFecha } from "@/utils/fecha";
import Tabla from "@/components/organisms/tabla";
const Contenido = async () => {
  const usuario = await requerirUsuario();
  if (usuario.rol !== "ADMIN") redirect("/inicio");
  const usuarios = await prisma.usuarios.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      correo: true,
      rol: true,
      fechaCreacion: true,
    },
    orderBy: { fechaCreacion: "desc" },
  });
  return (
    <>
      <p className="etiqueta">ADMINISTRACIÓN</p>
      <div className="encabezado-pagina">
        <div>
          <h1>Usuarios</h1>
          <p className="texto-suave">
            Personas que forman parte de tu biblioteca.
          </p>
        </div>
        <FormularioUsuario />
      </div>
      <Tabla
        columnas={[
          "ID",
          "Nombre",
          "Correo",
          "Rol",
          "Fecha de creación",
          "Acciones",
        ]}
        filas={usuarios.map((u) => [
          u.id,
          u.nombre + " " + u.apellido,
          u.correo,
          u.rol,
          formatearFecha(u.fechaCreacion),
          u.id === usuario.id ? (
            "Tu cuenta"
          ) : (
            <EditarRol
              key={u.id + u.rol}
              id={u.id}
              correo={u.correo}
              rol={u.rol}
            />
          ),
        ])}
        mensaje="No hay usuarios registrados."
      />
    </>
  );
};
const index = () => (
  <Suspense
    fallback={
      <p role="status" className="texto-suave">
        Cargando tu biblioteca…
      </p>
    }
  >
    <Contenido />
  </Suspense>
);
export default index;
