import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requerirUsuario } from "@/lib/auth";
import { formatearFecha } from "@/utils/fecha";
import Tabla from "@/components/organisms/tabla";
import FormularioPrestamo from "@/components/organisms/formulario-prestamo";
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
  const registros = await prisma.prestamos.findMany({
    take: 100,
    where: esAdmin ? {} : { lectorId: usuario.id },
    orderBy: { fechaCreacion: "desc" },
    include: { libro: true, lector: true },
  });
  return (
    <>
      <p className="etiqueta">LECTURAS EN MARCHA</p>
      <div className="encabezado-pagina">
        <div>
          <h1>Préstamos</h1>
          <p className="texto-suave">
            {esAdmin
              ? "Últimos 100 registros de la biblioteca."
              : "Tus últimos 100 registros."}
          </p>
        </div>
        {libros.length > 0 && (
          <FormularioPrestamo
            libros={libros}
            lectores={lectores}
            esAdmin={esAdmin}
            usuarioId={usuario.id}
            fechaHoy={fechaHoy}
          />
        )}
      </div>
      <Tabla
        columnas={[
          "Libro",
          "Lector",
          "Cantidad",
          "Fecha límite",
          "Devolución",
          "Estado",
          "Acciones",
        ]}
        filas={registros.map((p) => [
          p.libro.titulo,
          p.lector.nombre,
          String(p.cantidad),
          formatearFecha(p.fechaLimite),
          p.fechaDevolucion ? formatearFecha(p.fechaDevolucion) : "Pendiente",
          p.fechaDevolucion
            ? "Devuelto"
            : p.fechaLimite < new Date()
              ? "Vencido"
              : "Activo",
          !p.fechaDevolucion ? (
            <AccionBiblioteca
              key={p.id}
              id={p.id}
              titulo={p.libro.titulo}
              tipo="DEVOLVER"
              fechaHoy={fechaHoy}
            />
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
