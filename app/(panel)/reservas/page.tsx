import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requerirUsuario } from "@/lib/auth";
import { formatearFecha } from "@/utils/fecha";
import Tabla from "@/components/organisms/tabla";
import FormularioReserva from "@/components/organisms/formulario-reserva";
import AccionBiblioteca from "@/components/organisms/accion-biblioteca";
const Contenido = async () => {
  const usuario = await requerirUsuario();
  const esAdmin = usuario.rol === "ADMIN";
  const fechaHoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const libros = await prisma.libros.findMany({
    where: { activo: true },
    select: { id: true, titulo: true, existencias: true },
    orderBy: { titulo: "asc" },
  });
  const personas = esAdmin
    ? await prisma.usuarios.findMany({
        where: { activo: true },
        select: { id: true, nombre: true, apellido: true },
        orderBy: { nombre: "asc" },
      })
    : [];
  const lectores = personas.map((persona) => ({
    id: persona.id,
    nombre: persona.nombre + " " + persona.apellido,
  }));
  const registros = await prisma.reservas.findMany({
    take: 100,
    where: esAdmin ? {} : { usuarioId: usuario.id },
    orderBy: { fechaCreacion: "desc" },
    include: { libro: true, usuario: true },
  });
  return (
    <>
      <p className="etiqueta">PRÓXIMAS LECTURAS</p>
      <div className="encabezado-pagina">
        <div>
          <h1>Reservas</h1>
          <p className="texto-suave">
            {esAdmin
              ? "Últimos 100 registros de la biblioteca."
              : "Tus últimos 100 registros."}
          </p>
        </div>
        {libros.length > 0 && (
          <FormularioReserva
            libros={libros}
            lectores={lectores}
            esAdmin={esAdmin}
            usuarioId={usuario.id}
          />
        )}
      </div>
      <Tabla
        columnas={[
          "Fecha",
          "Libro",
          "Lector",
          "Cantidad",
          "Estado",
          "Acciones",
        ]}
        filas={registros.map((r) => [
          formatearFecha(r.fechaCreacion),
          r.libro.titulo,
          r.usuario.nombre,
          String(r.cantidad),
          r.estado === "PENDIENTE"
            ? "Pendiente"
            : r.estado === "ATENDIDA"
              ? "Atendida"
              : "Cancelada",
          r.estado === "PENDIENTE" ? (
            <div className="acciones-fila" key={r.id}>
              {esAdmin && (
                <AccionBiblioteca
                  id={r.id}
                  titulo={r.libro.titulo}
                  tipo="ATENDER"
                  fechaHoy={fechaHoy}
                />
              )}
              <AccionBiblioteca
                id={r.id}
                titulo={r.libro.titulo}
                tipo="CANCELAR"
                fechaHoy={fechaHoy}
              />
            </div>
          ) : (
            "Completado"
          ),
        ])}
        mensaje="Todavía no hay registros."
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
