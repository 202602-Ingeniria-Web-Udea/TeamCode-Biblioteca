import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
type Responsable = { id: string; rol: "ADMIN" | "USER" };
const autorizarLector = (responsable: Responsable, lectorId: string) => {
  if (responsable.rol !== "ADMIN" && responsable.id !== lectorId)
    throw new Error("SIN_PERMISO");
};
const fechaDeVencimiento = (fecha: string) => {
  const limite = new Date(fecha + "T23:59:59-05:00");
  if (Number.isNaN(limite.getTime()) || limite < new Date())
    throw new Error("FECHA_INVALIDA");
  return limite;
};
const prestar = async (
  tx: Prisma.TransactionClient,
  datos: {
    libroId: string;
    lectorId: string;
    cantidad: number;
    fechaLimite: Date;
  },
  responsableId: string,
) => {
  const lector = await tx.usuarios.findFirst({
    where: { id: datos.lectorId, activo: true },
  });
  if (!lector) throw new Error("LECTOR_INACTIVO");
  const stock = await tx.libros.updateMany({
    where: {
      id: datos.libroId,
      activo: true,
      existencias: { gte: datos.cantidad },
    },
    data: { existencias: { decrement: datos.cantidad } },
  });
  if (!stock.count) throw new Error("NO_DISPONIBLE");
  const prestamo = await tx.prestamos.create({
    data: {
      libroId: datos.libroId,
      lectorId: datos.lectorId,
      cantidad: datos.cantidad,
      fechaLimite: datos.fechaLimite,
      responsableId,
    },
  });
  await tx.movimientos.create({
    data: {
      libroId: datos.libroId,
      responsableId,
      tipo: "SALIDA",
      motivo: "PRESTAMO",
      cantidad: datos.cantidad,
      prestamoId: prestamo.id,
    },
  });
  return prestamo;
};
export const crearPrestamo = async (
  datos: {
    libroId: string;
    lectorId?: string;
    cantidad: number;
    fechaLimite: string;
  },
  responsable: Responsable,
) => {
  const lectorId = datos.lectorId ?? responsable.id;
  autorizarLector(responsable, lectorId);
  const fechaLimite = fechaDeVencimiento(datos.fechaLimite);
  return prisma.$transaction(
    (tx) =>
      prestar(
        tx,
        {
          libroId: datos.libroId,
          lectorId,
          cantidad: datos.cantidad,
          fechaLimite,
        },
        responsable.id,
      ),
    { isolationLevel: "Serializable" },
  );
};
export const devolverPrestamo = async (id: string, responsable: Responsable) =>
  prisma.$transaction(
    async (tx) => {
      const prestamo = await tx.prestamos.findUniqueOrThrow({ where: { id } });
      autorizarLector(responsable, prestamo.lectorId);
      const cambio = await tx.prestamos.updateMany({
        where: { id, fechaDevolucion: null },
        data: { fechaDevolucion: new Date() },
      });
      if (!cambio.count) throw new Error("YA_PROCESADO");
      const cambioStock = await tx.libros.updateMany({
        where: {
          id: prestamo.libroId,
          existencias: { lte: 2147483647 - prestamo.cantidad },
        },
        data: { existencias: { increment: prestamo.cantidad } },
      });
      if (!cambioStock.count) throw new Error("NO_DISPONIBLE");
      await tx.movimientos.create({
        data: {
          libroId: prestamo.libroId,
          responsableId: responsable.id,
          tipo: "ENTRADA",
          motivo: "DEVOLUCION",
          cantidad: prestamo.cantidad,
          prestamoId: id,
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
export const crearReserva = async (
  datos: { libroId: string; lectorId?: string; cantidad: number },
  responsable: Responsable,
) => {
  const lectorId = datos.lectorId ?? responsable.id;
  autorizarLector(responsable, lectorId);
  return prisma.$transaction(
    async (tx) => {
      const libro = await tx.libros.findFirst({
        where: { id: datos.libroId, activo: true },
      });
      if (!libro) throw new Error("NO_DISPONIBLE");
      const lector = await tx.usuarios.findFirst({
        where: { id: lectorId, activo: true },
      });
      if (!lector) throw new Error("LECTOR_INACTIVO");
      return tx.reservas.create({
        data: {
          libroId: datos.libroId,
          usuarioId: lectorId,
          cantidad: datos.cantidad,
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
};
export const procesarReserva = async (
  id: string,
  accion: "CANCELAR" | "ATENDER",
  fecha: string | undefined,
  responsable: Responsable,
) => {
  if (accion === "ATENDER" && responsable.rol !== "ADMIN")
    throw new Error("SIN_PERMISO");
  const limite =
    accion === "ATENDER" ? fechaDeVencimiento(fecha ?? "") : undefined;
  return prisma.$transaction(
    async (tx) => {
      const reserva = await tx.reservas.findUniqueOrThrow({ where: { id } });
      if (accion === "CANCELAR")
        autorizarLector(responsable, reserva.usuarioId);
      const cambio = await tx.reservas.updateMany({
        where: { id, estado: "PENDIENTE" },
        data: { estado: accion === "ATENDER" ? "ATENDIDA" : "CANCELADA" },
      });
      if (!cambio.count) throw new Error("YA_PROCESADO");
      if (accion === "ATENDER" && limite) {
        const prestamo = await prestar(
          tx,
          {
            libroId: reserva.libroId,
            lectorId: reserva.usuarioId,
            cantidad: reserva.cantidad,
            fechaLimite: limite,
          },
          responsable.id,
        );
        await tx.reservas.update({
          where: { id },
          data: { prestamoId: prestamo.id },
        });
      }
    },
    { isolationLevel: "Serializable" },
  );
};
