import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import EditarLibro from "@/components/organisms/formulario-editar-libro";
import EstadoLibro from "@/components/organisms/estado-libro";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requerirUsuario } from "@/lib/auth";
import Tabla from "@/components/organisms/tabla";
import FormularioLibro from "@/components/organisms/formulario-libro";
const Contenido = async ({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) => {
  const usuario = await requerirUsuario();
  const parametros = await searchParams;
  const archivados =
    usuario.rol === "ADMIN" && parametros.estado === "inactivos";
  const libros = await prisma.libros.findMany({
    where: {
      activo: !archivados,
      ...(parametros.q?.trim()
        ? {
            OR: [
              {
                titulo: {
                  contains: parametros.q.trim().slice(0, 180),
                  mode: "insensitive" as const,
                },
              },
              {
                autor: {
                  contains: parametros.q.trim().slice(0, 180),
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    },
    include: { creadoPor: { select: { nombre: true } } },
    orderBy: { titulo: "asc" },
  });
  return (
    <>
      <p className="etiqueta">CATÁLOGO · MAESTROS</p>
      <div className="encabezado-pagina">
        <div>
          <h1>Libros</h1>
          <p className="texto-suave">Un lugar para cada historia.</p>
        </div>
        {usuario.rol === "ADMIN" && <FormularioLibro />}
      </div>
      {usuario.rol === "ADMIN" && (
        <div className="acciones-catalogo">
          <Link
            className={!archivados ? "filtro activo" : "filtro"}
            href="/libros"
          >
            Libros activos
          </Link>
          <Link
            className={archivados ? "filtro activo" : "filtro"}
            href="/libros?estado=inactivos"
          >
            Libros desactivados
          </Link>
        </div>
      )}
      <form action="/libros" className="busqueda">
        <Label className="sr-only" htmlFor="buscar-libro">
          Buscar por título o autor
        </Label>
        <Input
          id="buscar-libro"
          name="q"
          placeholder="Buscar por título o autor"
          defaultValue={parametros.q ?? ""}
          maxLength={180}
        />
        {archivados && <input type="hidden" name="estado" value="inactivos" />}
        <Button type="submit">Buscar</Button>
      </form>
      <Tabla
        columnas={[
          "ID",
          "Título",
          "Autor",
          "Categoría",
          "Existencias",
          "Creado por",
          ...(usuario.rol === "ADMIN" ? ["Acciones"] : []),
        ]}
        filas={libros.map((libro) => [
          libro.id,
          libro.titulo,
          libro.autor,
          libro.categoria,
          String(libro.existencias),
          libro.creadoPor.nombre,
          ...(usuario.rol === "ADMIN"
            ? [
                <div className="acciones-fila" key={libro.id}>
                  <EditarLibro
                    id={libro.id}
                    titulo={libro.titulo}
                    autor={libro.autor}
                    categoria={libro.categoria}
                    isbn={libro.isbn}
                  />
                  <EstadoLibro
                    id={libro.id}
                    titulo={libro.titulo}
                    activo={libro.activo}
                  />
                </div>,
              ]
            : []),
        ])}
        mensaje="Todavía no hay libros en el catálogo."
      />
    </>
  );
};
const index = ({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) => (
  <Suspense
    fallback={
      <p role="status" className="texto-suave">
        Cargando tu biblioteca…
      </p>
    }
  >
    <Contenido searchParams={searchParams} />
  </Suspense>
);
export default index;
