import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requerirUsuario } from "@/lib/auth";
import { formatearFecha } from "@/utils/fecha";
import { calcularSaldos } from "@/utils/saldos";
import Tabla from "@/components/organisms/tabla";
import SelectorLibro from "@/components/molecules/selector-libro";
import FormularioMovimiento from "@/components/organisms/formulario-movimiento";
import GraficaSaldos from "@/components/organisms/grafica-saldos";
const Contenido = async ({
  searchParams,
}: {
  searchParams: Promise<{ libro?: string }>;
}) => {
  const usuario = await requerirUsuario();
  const parametros = await searchParams;
  const libros = await prisma.libros.findMany({
    where: usuario.rol === "ADMIN" ? {} : { activo: true },
    select: { id: true, titulo: true },
    orderBy: { titulo: "asc" },
  });
  const seleccionado =
    libros.find((libro) => libro.id === parametros.libro) ?? libros[0];
  if (!seleccionado)
    return (
      <>
        <h1>Movimientos</h1>
        <p className="vacio">
          Primero un administrador debe agregar un libro al catálogo.
        </p>
      </>
    );
  // La misma consulta entrega el saldo y todo su historial en una sola lectura.
  const libro = await prisma.libros.findUniqueOrThrow({
    where: { id: seleccionado.id },
    include: {
      movimientos: {
        orderBy: [{ fechaCreacion: "desc" }, { id: "desc" }],
        include: { responsable: { select: { nombre: true } } },
      },
    },
  });
  const datos = calcularSaldos(libro.movimientos);
  return (
    <>
      <p className="etiqueta">INVENTARIO · TRANSACCIONES</p>
      <div className="encabezado-pagina">
        <div>
          <h1>Movimientos</h1>
          <p className="texto-suave">
            Entradas, salidas y existencias de cada libro.
          </p>
        </div>
        {libro.activo && (
          <FormularioMovimiento
            key={libro.id}
            libroId={libro.id}
            titulo={libro.titulo}
            existencias={libro.existencias}
          />
        )}
      </div>
      <div className="filtros">
        <SelectorLibro libros={libros} seleccionado={libro.id} />
        <p className="saldo-actual">
          Disponibles <strong>{libro.existencias}</strong>
        </p>
      </div>
      <GraficaSaldos datos={datos} />
      <Tabla
        columnas={["ID", "Fecha", "Tipo", "Motivo", "Cantidad", "Responsable"]}
        filas={libro.movimientos.map((m) => [
          m.id,
          formatearFecha(m.fechaCreacion),
          m.tipo === "ENTRADA" ? "Entrada" : "Salida",
          m.motivo === "INICIAL"
            ? "Saldo inicial"
            : m.motivo === "AJUSTE"
              ? "Ajuste"
              : m.motivo === "PRESTAMO"
                ? "Préstamo"
                : "Devolución",
          String(m.cantidad),
          m.responsable.nombre,
        ])}
        mensaje="Todavía no se han registrado movimientos para este libro."
      />
    </>
  );
};
const index = ({
  searchParams,
}: {
  searchParams: Promise<{ libro?: string }>;
}) => (
  <Suspense
    fallback={
      <p role="status" className="texto-suave">
        Cargando movimientos…
      </p>
    }
  >
    <Contenido searchParams={searchParams} />
  </Suspense>
);
export default index;
