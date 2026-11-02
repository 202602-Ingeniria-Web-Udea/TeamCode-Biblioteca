-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateEnum
CREATE TYPE "MotivoMovimiento" AS ENUM ('INICIAL', 'PRESTAMO', 'DEVOLUCION', 'AJUSTE');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'ATENDIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Usuarios" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasenaHash" TEXT NOT NULL,
    "foto" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'USER',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Libros" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "isbn" TEXT,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT,
    "portada" TEXT,
    "existencias" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPorId" UUID NOT NULL,
    "fechaCreacion" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Libros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimientos" (
    "id" UUID NOT NULL,
    "libroId" UUID NOT NULL,
    "responsableId" UUID NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "motivo" "MotivoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "prestamoId" UUID,
    "observaciones" TEXT,
    "fechaCreacion" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestamos" (
    "id" UUID NOT NULL,
    "libroId" UUID NOT NULL,
    "lectorId" UUID NOT NULL,
    "responsableId" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fechaLimite" TIMESTAMPTZ(3) NOT NULL,
    "fechaDevolucion" TIMESTAMPTZ(3),
    "fechaCreacion" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prestamos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservas" (
    "id" UUID NOT NULL,
    "libroId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "prestamoId" UUID,
    "fechaCreacion" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_correo_key" ON "Usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Libros_isbn_key" ON "Libros"("isbn");

-- CreateIndex
CREATE INDEX "Libros_creadoPorId_idx" ON "Libros"("creadoPorId");

-- CreateIndex
CREATE INDEX "Movimientos_libroId_fechaCreacion_idx" ON "Movimientos"("libroId", "fechaCreacion");

-- CreateIndex
CREATE INDEX "Movimientos_responsableId_idx" ON "Movimientos"("responsableId");

-- CreateIndex
CREATE INDEX "Movimientos_prestamoId_idx" ON "Movimientos"("prestamoId");

-- CreateIndex
CREATE INDEX "Prestamos_libroId_idx" ON "Prestamos"("libroId");

-- CreateIndex
CREATE INDEX "Prestamos_lectorId_idx" ON "Prestamos"("lectorId");

-- CreateIndex
CREATE INDEX "Prestamos_responsableId_idx" ON "Prestamos"("responsableId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservas_prestamoId_key" ON "Reservas"("prestamoId");

-- CreateIndex
CREATE INDEX "Reservas_libroId_idx" ON "Reservas"("libroId");

-- CreateIndex
CREATE INDEX "Reservas_usuarioId_estado_idx" ON "Reservas"("usuarioId", "estado");

-- AddForeignKey
ALTER TABLE "Libros" ADD CONSTRAINT "Libros_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimientos" ADD CONSTRAINT "Movimientos_libroId_fkey" FOREIGN KEY ("libroId") REFERENCES "Libros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimientos" ADD CONSTRAINT "Movimientos_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimientos" ADD CONSTRAINT "Movimientos_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "Prestamos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamos" ADD CONSTRAINT "Prestamos_libroId_fkey" FOREIGN KEY ("libroId") REFERENCES "Libros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamos" ADD CONSTRAINT "Prestamos_lectorId_fkey" FOREIGN KEY ("lectorId") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamos" ADD CONSTRAINT "Prestamos_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservas" ADD CONSTRAINT "Reservas_libroId_fkey" FOREIGN KEY ("libroId") REFERENCES "Libros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservas" ADD CONSTRAINT "Reservas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservas" ADD CONSTRAINT "Reservas_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "Prestamos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Reglas de cantidades y fechas para proteger la integridad del inventario.
ALTER TABLE "Libros" ADD CONSTRAINT "Libros_existencias_no_negativas" CHECK ("existencias" >= 0);
ALTER TABLE "Movimientos" ADD CONSTRAINT "Movimientos_cantidad_positiva" CHECK ("cantidad" > 0);
ALTER TABLE "Prestamos" ADD CONSTRAINT "Prestamos_cantidad_positiva" CHECK ("cantidad" > 0);
ALTER TABLE "Reservas" ADD CONSTRAINT "Reservas_cantidad_positiva" CHECK ("cantidad" > 0);
ALTER TABLE "Prestamos" ADD CONSTRAINT "Prestamos_fechas_validas" CHECK ("fechaLimite" >= "fechaCreacion" AND ("fechaDevolucion" IS NULL OR "fechaDevolucion" >= "fechaCreacion"));
